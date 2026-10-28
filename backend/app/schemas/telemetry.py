from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal

class TelemetryBase(BaseModel):
    device_id: str
    farm_id: int
    zone_id: int
    sensor_type: str
    value: float
    unit: str
    source_type: Literal['REAL_SENSOR', 'EXTERNAL_SOURCE', 'SIMULATION']
    provider: str
    quality: Optional[str] = None
    timestamp: Optional[datetime] = None

class TelemetryCreate(TelemetryBase):
    pass

class TelemetryResponse(TelemetryBase):
    id: int
    timestamp: datetime
    
    class Config:
        orm_mode = True

class SimulationControl(BaseModel):
    action: Literal['start', 'stop']
    farm_id: int
    zone_id: int
    scenario: str = "normal"
    interval_seconds: int = 5
