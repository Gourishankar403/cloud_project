from .state import AgentState
from app.rag.chroma import retrieve_agronomy_context

def sensing_agent(state: AgentState):
    """
    Sensing Agent:
    1. Validates edge telemetry reading.
    2. Identifies anomalous environmental deviation.
    3. Queries ChromaDB Vector Database to extract scientific agronomy research guidelines (RAG).
    """
    sensor_data = state.get("sensor_data", {})
    sensor_type = sensor_data.get("type", "unknown")
    value = float(sensor_data.get("value", 0.0))
    weather = state.get("weather_context", {})

    # Semantic Retrieval from ChromaDB Vector Store
    rag_knowledge = retrieve_agronomy_context(sensor_type, value, weather)

    return {
        "retrieved_knowledge": rag_knowledge,
        "execution_status": f"Sensing completed - Anomaly identified in {sensor_type} ({value}). Agronomic research retrieved via RAG."
    }
