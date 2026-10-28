from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON
from app.core.database import Base
from datetime import datetime

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    anomaly_id = Column(Integer, ForeignKey("anomaly_events.id"))
    farm_id = Column(Integer, ForeignKey("farms.id"))
    status = Column(String, default="running")  # 'running', 'completed', 'failed'
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    agent_outputs = Column(JSON, nullable=True)  # Store outputs of sensing, weather, diagnostic agents
    s3_archive_uri = Column(String, nullable=True)  # S3 Cold Storage Data Lake URI


class SafetyDecision(Base):
    __tablename__ = "safety_decisions"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_executions.id"))
    proposed_action = Column(String)
    decision = Column(String)  # 'approved', 'rejected', 'requires_manual_review'
    reasons = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ActuationCommand(Base):
    __tablename__ = "actuation_commands"
    
    id = Column(Integer, primary_key=True, index=True)
    safety_decision_id = Column(Integer, ForeignKey("safety_decisions.id"))
    farm_id = Column(Integer, ForeignKey("farms.id"))
    zone_id = Column(Integer, ForeignKey("zones.id"))
    action_type = Column(String)
    duration_minutes = Column(Float, nullable=True)
    quantity = Column(Float, nullable=True)
    status = Column(String, default="pending")  # 'pending', 'simulating', 'completed', 'failed'
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
