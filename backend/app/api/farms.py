from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.farm import FarmCreate, FarmResponse, ZoneCreate, ZoneResponse
from app.models.farm import Farm, Zone
from app.services.weather import fetch_weather

router = APIRouter()

@router.post("/", response_model=FarmResponse)
def create_farm(farm_in: FarmCreate, db: Session = Depends(get_db)):
    db_farm = Farm(**farm_in.dict())
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    return db_farm

@router.get("/", response_model=list[FarmResponse])
def get_farms(db: Session = Depends(get_db)):
    return db.query(Farm).all()

@router.post("/{farm_id}/zones", response_model=ZoneResponse)
def create_zone(farm_id: int, zone_in: ZoneCreate, db: Session = Depends(get_db)):
    db_zone = Zone(**zone_in.dict(), farm_id=farm_id)
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@router.get("/{farm_id}/weather")
async def get_farm_weather(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        return {"error": "Farm not found"}
    return await fetch_weather(farm.latitude, farm.longitude)
