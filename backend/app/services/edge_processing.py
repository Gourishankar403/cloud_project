from app.models.telemetry import TelemetryReading, AnomalyEvent
from app.models.farm import Zone
from sqlalchemy.orm import Session
from datetime import datetime

def process_telemetry(db: Session, telemetry: TelemetryReading):
    # Retrieve zone config for thresholds
    zone = db.query(Zone).filter(Zone.id == telemetry.zone_id).first()
    
    anomaly = None
    
    if telemetry.sensor_type == "soil_moisture":
        if zone and zone.target_moisture_min is not None and telemetry.value < zone.target_moisture_min:
            anomaly = AnomalyEvent(
                farm_id=telemetry.farm_id,
                zone_id=telemetry.zone_id,
                sensor_type=telemetry.sensor_type,
                value=telemetry.value,
                severity="high",
                detection_reason="Below minimum target moisture",
                processing_status="pending"
            )
        elif zone and zone.target_moisture_max is not None and telemetry.value > zone.target_moisture_max:
            anomaly = AnomalyEvent(
                farm_id=telemetry.farm_id,
                zone_id=telemetry.zone_id,
                sensor_type=telemetry.sensor_type,
                value=telemetry.value,
                severity="medium",
                detection_reason="Above maximum target moisture",
                processing_status="pending"
            )
    
    elif telemetry.sensor_type == "air_temperature":
        if telemetry.value > 35.0:
            anomaly = AnomalyEvent(
                farm_id=telemetry.farm_id,
                zone_id=telemetry.zone_id,
                sensor_type=telemetry.sensor_type,
                value=telemetry.value,
                severity="medium",
                detection_reason="High temperature detected",
                processing_status="pending"
            )
            
    if anomaly:
        db.add(anomaly)
        db.commit()
        db.refresh(anomaly)
        
        # Trigger the LangGraph Agent Workflow
        from app.agents.workflow import workflow_app
        from app.models.workflow import WorkflowExecution, SafetyDecision
        state = {
            "anomaly_event_id": anomaly.id,
            "farm_id": anomaly.farm_id,
            "zone_id": anomaly.zone_id,
            "sensor_data": {"type": anomaly.sensor_type, "value": anomaly.value},
            "weather_context": {},
            "retrieved_knowledge": "",
            "recommendation": "",
            "proposed_action": {},
            "safety_decision": "",
            "safety_reasons": [],
            "execution_status": "started"
        }
        try:
            result = workflow_app.invoke(state)
            
            # Save workflow execution
            wf = WorkflowExecution(
                anomaly_id=anomaly.id,
                farm_id=anomaly.farm_id,
                status="completed",
                agent_outputs=result
            )
            db.add(wf)
            db.commit()
            db.refresh(wf)
            
            # Save safety decision
            sd = SafetyDecision(
                workflow_id=wf.id,
                proposed_action=str(result.get("proposed_action")),
                decision=result.get("safety_decision"),
                reasons=result.get("safety_reasons")
            )
            db.add(sd)
            db.commit()
            
            # Archive to S3-Compatible Cold Storage Data Lake (Hot/Cold Tiering)
            try:
                from app.services.cold_storage import cold_storage
                archive_res = cold_storage.archive_workflow_decision(
                    workflow_id=wf.id,
                    anomaly_id=anomaly.id,
                    farm_id=anomaly.farm_id,
                    agent_outputs=result,
                    safety_decision=result.get("safety_decision"),
                    safety_reasons=result.get("safety_reasons")
                )
                wf.s3_archive_uri = archive_res.get("s3_uri")
                db.add(wf)
                db.commit()
            except Exception as archive_err:
                print(f"[ColdStorage] Archival warning: {archive_err}")
            
        except Exception as e:
            print(f"Workflow failed: {e}")
            
        return anomaly
    return None
