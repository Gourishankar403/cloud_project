from .state import AgentState
import json
from langchain_groq import ChatGroq
from app.core.config import settings
import os

os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
try:
    llm = ChatGroq(model="allam-2-7b")
except Exception as e:
    llm = None

def diagnostic_agent(state: AgentState):
    """
    Diagnostic Agent:
    Fuses edge sensor telemetry, Open-Meteo weather context, and ChromaDB RAG research documents
    to formulate a scientifically grounded agricultural recommendation.
    """
    if not llm:
        return {"recommendation": "LLM not configured. Default recommendation: Inspect field.", "execution_status": "Diagnosis complete"}
    
    rag_knowledge = state.get('retrieved_knowledge', 'Standard Agricultural Protocol.')
    
    prompt = f"""
    You are an expert agronomist providing a scientific diagnosis for an autonomous precision farm.
    
    Sensor Data: {json.dumps(state.get('sensor_data', {}))}
    Weather Context: {json.dumps(state.get('weather_context', {}))}
    
    Retrieved Agronomic Literature (RAG Context):
    {rag_knowledge}
    
    Instructions:
    1. Ground your diagnosis in the Retrieved Agronomic Literature guidelines.
    2. Reference the research source (e.g., FAO Paper 56 or USDA NRCS) if appropriate.
    3. Specify the exact recommended corrective action (e.g., irrigation duration or canopy cooling) based on the literature thresholds.
    Keep your recommendation concise and professional (2 to 4 sentences).
    """
    try:
        response = llm.invoke(prompt)
        rec = response.content.strip()
    except Exception as e:
        rec = f"Failed to generate recommendation: {str(e)}"
    return {"recommendation": rec, "execution_status": "Diagnosis complete"}
