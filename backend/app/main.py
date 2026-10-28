from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api import telemetry, farms, knowledge, workflows, cold_storage

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgentFlow Cloud API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetry.router, prefix="/api/v1/telemetry", tags=["Telemetry"])
app.include_router(farms.router, prefix="/api/v1/farms", tags=["Farms"])
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["Knowledge"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["Workflows"])
app.include_router(cold_storage.router, prefix="/api/v1/cold-storage", tags=["Cold Storage Data Lake"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AgentFlow Cloud API"}

@app.on_event("startup")
def seed_default_farm():
    from app.core.database import SessionLocal
    from app.models.farm import Farm, Zone
    db = SessionLocal()
    try:
        farm = db.query(Farm).filter(Farm.id == 1).first()
        if not farm:
            farm = Farm(id=1, name="Bengaluru Precision Farm", latitude=12.9716, longitude=77.5946, crop_type="Wheat", soil_type="Loam")
            db.add(farm)
            db.commit()
        zone = db.query(Zone).filter(Zone.id == 1).first()
        if not zone:
            zone = Zone(id=1, farm_id=1, name="Zone Alpha - North Field", crop_type="Wheat", soil_type="Loam", target_moisture_min=20.0, target_moisture_max=60.0, irrigation_limits_mm=50.0)
            db.add(zone)
            db.commit()
            
        # Automatically launch continuous edge simulation in background
        import asyncio
        from app.services.simulator import simulator
        asyncio.create_task(simulator.run_simulation(farm_id=1, zone_id=1, scenario="gradually_decreasing_moisture", interval=5))
    except Exception as e:
        print(f"[Seed] Startup note: {e}")
    finally:
        db.close()
