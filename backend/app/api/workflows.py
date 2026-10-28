from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agents.workflow import workflow_app
from app.models.workflow import WorkflowExecution

router = APIRouter()

@router.get("/")
def get_workflows(limit: int = 10, db: Session = Depends(get_db)):
    wfs = db.query(WorkflowExecution).order_by(WorkflowExecution.id.desc()).limit(limit).all()
    return wfs

@router.post("/trigger")
def trigger_workflow(anomaly_id: int, farm_id: int, zone_id: int, sensor_type: str, value: float):
    # This simulates triggering the LangGraph agent workflow
    state = {
        "anomaly_event_id": anomaly_id,
        "farm_id": farm_id,
        "zone_id": zone_id,
        "sensor_data": {"type": sensor_type, "value": value},
        "weather_context": {},
        "retrieved_knowledge": "",
        "recommendation": "",
        "proposed_action": {},
        "safety_decision": "",
        "safety_reasons": [],
        "execution_status": "started"
    }
    
    # Run graph
    result = workflow_app.invoke(state)
    return {"status": "Workflow completed", "result": result}
