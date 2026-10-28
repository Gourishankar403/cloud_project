import asyncio
import random
from datetime import datetime
from app.core.database import SessionLocal
from app.models.telemetry import TelemetryReading
from app.services.edge_processing import process_telemetry

class SimulationEngine:
    def __init__(self):
        self.active_simulations = {}
        self.states = {}

    async def run_simulation(self, farm_id: int, zone_id: int, scenario: str, interval: int):
        sim_id = f"{farm_id}_{zone_id}"
        self.active_simulations[sim_id] = True
        
        # Baseline values
        if sim_id not in self.states:
            self.states[sim_id] = {"moisture": 45.0, "temp": 25.0}
            
        print(f"[Simulator] Started simulation loop for farm {farm_id}, zone {zone_id} ({scenario})")
        
        while self.active_simulations.get(sim_id, False):
            if scenario == "gradually_decreasing_moisture":
                self.states[sim_id]["moisture"] -= random.uniform(0.5, 1.5)
                # Sawtooth pattern: Auto-irrigate when too low so graph looks great for presentations
                if self.states[sim_id]["moisture"] < 15.0:
                    self.states[sim_id]["moisture"] = 75.0
            elif scenario == "heavy_rainfall":
                self.states[sim_id]["moisture"] += random.uniform(5.0, 10.0)
            else:
                self.states[sim_id]["moisture"] += random.uniform(-1.0, 1.0)
                
            self.states[sim_id]["temp"] += random.uniform(-0.5, 0.5)
            
            # Clamp values
            self.states[sim_id]["moisture"] = max(0.0, min(100.0, self.states[sim_id]["moisture"]))
            self.states[sim_id]["temp"] = max(-10.0, min(50.0, self.states[sim_id]["temp"]))
            
            now_utc = datetime.utcnow()
            payloads = [
                {
                    "device_id": f"sim_device_{zone_id}_1",
                    "farm_id": farm_id,
                    "zone_id": zone_id,
                    "sensor_type": "soil_moisture",
                    "value": round(self.states[sim_id]["moisture"], 2),
                    "unit": "%",
                    "source_type": "SIMULATION",
                    "provider": "SIMULATOR",
                    "quality": "good",
                    "timestamp": now_utc
                },
                {
                    "device_id": f"sim_device_{zone_id}_2",
                    "farm_id": farm_id,
                    "zone_id": zone_id,
                    "sensor_type": "air_temperature",
                    "value": round(self.states[sim_id]["temp"], 2),
                    "unit": "Celsius",
                    "source_type": "SIMULATION",
                    "provider": "SIMULATOR",
                    "quality": "good",
                    "timestamp": now_utc
                }
            ]
            
            # Save directly via DB session & trigger edge rules (100% reliable, zero network dependency)
            db = SessionLocal()
            try:
                for p in payloads:
                    db_reading = TelemetryReading(**p)
                    db.add(db_reading)
                    db.commit()
                    db.refresh(db_reading)
                    process_telemetry(db, db_reading)
            except Exception as e:
                print(f"[Simulator] Error processing telemetry: {e}")
            finally:
                db.close()
                    
            await asyncio.sleep(interval)

    def stop_simulation(self, farm_id: int, zone_id: int):
        sim_id = f"{farm_id}_{zone_id}"
        if sim_id in self.active_simulations:
            self.active_simulations[sim_id] = False

simulator = SimulationEngine()
