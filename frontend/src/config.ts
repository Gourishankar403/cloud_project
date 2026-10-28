// Centralized API configuration for AgentFlow Cloud
// In cloud deployment (Vercel), VITE_API_URL points to the Render backend URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003/api/v1';
