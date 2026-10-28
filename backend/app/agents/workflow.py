from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.sensing_agent import sensing_agent
from app.agents.weather_agent import weather_agent
from app.agents.diagnostic_agent import diagnostic_agent
from app.agents.action_agent import action_agent

def safety_gateway(state: AgentState):
    """Deterministic rule validation"""
    action = state.get("proposed_action", {})
    action_type = action.get("action_type", "")
    
    if action_type == "irrigation":
        if action.get("duration_minutes", 0) > 60:
            return {"safety_decision": "rejected", "safety_reasons": ["Duration exceeds 60 min limit"]}
        return {"safety_decision": "approved", "safety_reasons": ["Within safe limits"]}
    elif action_type == "manual_inspection":
        return {"safety_decision": "approved", "safety_reasons": ["Manual inspection is always safe"]}
    
    return {"safety_decision": "requires_manual_review", "safety_reasons": ["Unknown or unhandled action type"]}

# Build Graph
graph = StateGraph(AgentState)
graph.add_node("sensing", sensing_agent)
graph.add_node("weather", weather_agent)
graph.add_node("diagnostic", diagnostic_agent)
graph.add_node("action", action_agent)
graph.add_node("safety", safety_gateway)

graph.add_edge(START, "sensing")
graph.add_edge("sensing", "weather")
graph.add_edge("weather", "diagnostic")
graph.add_edge("diagnostic", "action")
graph.add_edge("action", "safety")
graph.add_edge("safety", END)

workflow_app = graph.compile()
