from typing import TypedDict

class AgentState(TypedDict):
    anomaly_event_id: int
    farm_id: int
    zone_id: int
    sensor_data: dict
    weather_context: dict
    retrieved_knowledge: str
    recommendation: str
    proposed_action: dict
    safety_decision: str
    safety_reasons: list
    execution_status: str
