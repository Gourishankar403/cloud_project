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

def action_agent(state: AgentState):
    """Convert recommendation into structured action"""
    if not llm:
        return {"proposed_action": {"action_type": "irrigation", "duration_minutes": 30}}
        
    prompt = f"""
    Convert the following agricultural recommendation into a structured JSON action.
    Recommendation: {state.get('recommendation', '')}
    
    The JSON must have the following keys:
    - "action_type": string (e.g., "irrigation", "fertilizer", "pump", "monitor", "manual_inspection")
    - "duration_minutes": integer (MUST be greater than 0 if action_type is irrigation or pump. Default to 30 if unsure.)
    - "quantity": float (if applicable, else 0)
    
    Output ONLY valid JSON and nothing else. Do not wrap in markdown blocks.
    """
    try:
        response = llm.invoke(prompt)
        text = response.content.strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        action = json.loads(text.strip())
        
        # Fallback if duration is missing or 0 for irrigation
        if action.get("action_type") == "irrigation" and action.get("duration_minutes", 0) == 0:
            action["duration_minutes"] = 30
            
    except:
        action = {"action_type": "manual_inspection", "duration_minutes": 0, "quantity": 0}
        
    return {"proposed_action": action, "execution_status": "Action mapped"}
