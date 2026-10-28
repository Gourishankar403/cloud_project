from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.cold_storage import cold_storage
from app.models.telemetry import TelemetryReading
from app.models.workflow import WorkflowExecution

router = APIRouter()

@router.get("/status")
def get_lake_status():
    """
    Returns Cold Storage (S3 Data Lake) status, storage tiering metrics, and compliance info.
    """
    return cold_storage.get_status()

@router.post("/archive-telemetry")
def archive_telemetry_batch(limit: int = 50, db: Session = Depends(get_db)):
    """
    Archives a batch of telemetry from Hot Storage (PostgreSQL) to Cold Storage (S3 Data Lake).
    Demonstrates active data lifecycle tiering.
    """
    readings = db.query(TelemetryReading).order_by(TelemetryReading.timestamp.desc()).limit(limit).all()
    if not readings:
        return {"status": "NO_OP", "message": "No telemetry readings available to archive."}
    
    serialized_readings = [
        {
            "id": r.id,
            "device_id": r.device_id,
            "sensor_type": r.sensor_type,
            "value": r.value,
            "unit": r.unit,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "source_type": r.source_type,
            "provider": r.provider
        }
        for r in readings
    ]
    
    result = cold_storage.archive_telemetry_batch(serialized_readings, farm_id=readings[0].farm_id or 1)
    return {
        "status": "SUCCESS",
        "message": f"Successfully archived {len(readings)} records to S3 Cold Storage Lake",
        "archive_details": result
    }

@router.get("/inspect")
def inspect_archived_object(s3_key: str = Query(..., description="S3 object key to inspect")):
    """
    Retrieves and inspects a raw JSON object stored in the S3 Data Lake.
    """
    obj = cold_storage.read_archived_object(s3_key)
    if not obj:
        raise HTTPException(status_code=404, detail="S3 object not found in data lake.")
    return obj
