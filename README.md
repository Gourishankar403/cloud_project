# AgentFlow Cloud

> **Autonomous Precision Agriculture IoT Platform powered by Multi-Agent AI (LangGraph), ChromaDB RAG, and Cloud Tiered Storage.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/AI_Orchestration-LangGraph-FF4F00.svg)](https://langchain.com)
[![ChromaDB](https://img.shields.io/badge/Vector_DB-ChromaDB_RAG-orange.svg)](https://trychroma.com)
[![Storage](https://img.shields.io/badge/Storage-Hot_PostgreSQL_+_Cold_S3_Lake-blue.svg)](https://aws.amazon.com/s3/)

---

## Architecture Overview

AgentFlow Cloud demonstrates how autonomous AI agents can safely control physical IoT hardware in precision agriculture adhering to the **Cloud Well-Architected Framework**:

1. **Edge Ingestion Layer (Hardware-in-the-Loop):**
   - Telemetry ingestion from field edge devices (ESP32 microcontrollers) over REST.
   - Anomaly detection for acute drought stress (< 20% soil moisture) and high thermal stress (> 35°C).

2. **Multi-Agent AI Orchestration (LangGraph & Groq LLM):**
   - **Sensing Agent:** Validates telemetry and triggers semantic search.
   - **Weather Agent:** Queries Open-Meteo Cloud API for atmospheric evapotranspiration & precipitation context.
   - **RAG Retrieval Node:** Queries **ChromaDB** vector store indexing official FAO Paper 56 and USDA NRCS agronomic guidelines.
   - **Diagnostic Agent:** Groq LLM fuses sensor data, weather context, and scientific literature to generate an expert diagnosis.
   - **Action Agent:** Serializes recommendations into strict machine-readable JSON payloads.

3. **Deterministic Safety Gateway (Zero-Trust Security):**
   - Intercepts all AI-generated actions before hardware dispatch.
   - Enforces hard physical boundaries (e.g., maximum 60-minute continuous irrigation limit to prevent crop flooding).

4. **Tiered Cloud Storage Architecture:**
   - **Hot Storage Tier (PostgreSQL):** Sub-millisecond operational queries and live dashboard graphs.
   - **Cold Storage Tier (S3-Compatible Object Data Lake):** Immutable audit logs with SHA-256 cryptographic verification and historical telemetry archiving.

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── agents/          # LangGraph Multi-Agent Workflow
│   │   ├── api/             # FastAPI REST Routers
│   │   ├── core/            # Database & Configuration Settings
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── rag/             # ChromaDB Vector Store & Embeddings
│   │   └── services/        # S3 Cold Lake, Weather, and Simulator
│   ├── knowledge_docs/      # Authoritative FAO & USDA Agronomic Literature
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, S3 Cold Lake, Agent History
│   │   └── App.tsx          # Navigation and Routing
│   └── package.json
└── docker-compose.yml
```

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8003 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
