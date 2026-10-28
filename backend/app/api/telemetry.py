from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.telemetry import TelemetryCreate, TelemetryResponse, SimulationControl
from app.models.telemetry import TelemetryReading
from app.services.edge_processing import process_telemetry
from app.services.simulator import simulator
import asyncio

router = APIRouter()

@router.post("/", response_model=TelemetryResponse)
def create_telemetry(telemetry_in: TelemetryCreate, db: Session = Depends(get_db)):
    db_telemetry = TelemetryReading(**telemetry_in.dict())
    db.add(db_telemetry)
    db.commit()
    db.refresh(db_telemetry)
    
    # Process edge rules
    process_telemetry(db, db_telemetry)
    
    return db_telemetry

@router.get("/", response_model=list[TelemetryResponse])
def get_telemetry(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(TelemetryReading).order_by(TelemetryReading.timestamp.desc()).offset(skip).limit(limit).all()

@router.post("/simulation/start")
async def start_simulation(control: SimulationControl, background_tasks: BackgroundTasks):
    background_tasks.add_task(simulator.run_simulation, control.farm_id, control.zone_id, control.scenario, control.interval_seconds)
    return {"status": "Simulation started", "farm_id": control.farm_id, "zone_id": control.zone_id}

@router.post("/simulation/stop")
def stop_simulation(control: SimulationControl):
    simulator.stop_simulation(control.farm_id, control.zone_id)
    return {"status": "Simulation stopped"}
