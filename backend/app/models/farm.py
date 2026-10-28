from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    crop_type = Column(String)
    farm_area = Column(Float, nullable=True)
    soil_type = Column(String, nullable=True)
    
    zones = relationship("Zone", back_populates="farm")


class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"))
    name = Column(String, index=True)
    crop_type = Column(String)
    soil_type = Column(String, nullable=True)
    target_moisture_min = Column(Float, nullable=True)
    target_moisture_max = Column(Float, nullable=True)
    irrigation_limits_mm = Column(Float, nullable=True)
    
    farm = relationship("Farm", back_populates="zones")
