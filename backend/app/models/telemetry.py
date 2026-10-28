from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from app.core.database import Base
from datetime import datetime

class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), index=True)
    sensor_type = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    value = Column(Float)
    unit = Column(String)
    source_type = Column(String)  # 'REAL_SENSOR', 'EXTERNAL_SOURCE', 'SIMULATION'
    provider = Column(String)     # 'ESP32', 'NASA_POWER', 'Open-Meteo'
    quality = Column(String, nullable=True)


class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    sensor_type = Column(String)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String)  # e.g., 'low', 'medium', 'high'
    detection_reason = Column(String)
    processing_status = Column(String, default="pending")  # 'pending', 'processed', 'ignored'
