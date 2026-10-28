from pydantic import BaseModel
from typing import Optional, List

class ZoneBase(BaseModel):
    name: str
    crop_type: str
    soil_type: Optional[str] = None
    target_moisture_min: Optional[float] = None
    target_moisture_max: Optional[float] = None
    irrigation_limits_mm: Optional[float] = None

class ZoneCreate(ZoneBase):
    pass

class ZoneResponse(ZoneBase):
    id: int
    farm_id: int

    class Config:
        orm_mode = True

class FarmBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    crop_type: str
    farm_area: Optional[float] = None
    soil_type: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmResponse(FarmBase):
    id: int
    zones: List[ZoneResponse] = []

    class Config:
        orm_mode = True
