import asyncio
import random
import httpx
from datetime import datetime

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
            
        async with httpx.AsyncClient() as client:
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
                
                # Send to our own API
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
                        "quality": "good"
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
                        "quality": "good"
                    }
                ]
                
                for p in payloads:
                    try:
                        await client.post("http://localhost:8003/api/v1/telemetry/", json=p)
                    except Exception as e:
                        print(f"Sim error: {e}")
                        
                await asyncio.sleep(interval)

    def stop_simulation(self, farm_id: int, zone_id: int):
        sim_id = f"{farm_id}_{zone_id}"
        if sim_id in self.active_simulations:
            self.active_simulations[sim_id] = False

simulator = SimulationEngine()
