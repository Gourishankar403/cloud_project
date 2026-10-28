// Centralized API configuration for AgentFlow Cloud
// In cloud deployment (Vercel), defaults to the live Render backend
export const API_URL = import.meta.env.VITE_API_URL || 'https://cloud-project-09ve.onrender.com/api/v1';
