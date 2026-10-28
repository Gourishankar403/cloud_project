import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

CHROMA_DATA_DIR = Path("data") / "chroma_db"
KNOWLEDGE_DOCS_DIR = Path("knowledge_docs")

def get_chroma_client():
    """
    Initializes ChromaDB client.
    Prefers embedded PersistentClient to eliminate external Docker dependencies for cloud hosting.
    """
    CHROMA_DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        # Check if remote Chroma host is configured and not default localhost
        if settings.CHROMA_HOST and settings.CHROMA_HOST != "localhost":
            return chromadb.HttpClient(host=settings.CHROMA_HOST, port=int(settings.CHROMA_PORT))
    except Exception:
        pass
    
    return chromadb.PersistentClient(path=str(CHROMA_DATA_DIR))

client = get_chroma_client()

def get_or_create_collection(name: str = "agriculture_knowledge"):
    collection = client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )
    # Check if empty, auto-seed with knowledge docs
    if collection.count() == 0:
        seed_knowledge_collection(collection)
    return collection

def seed_knowledge_collection(collection=None):
    """
    Scans knowledge_docs directory, chunks content by sections, and indexes into ChromaDB.
    """
    if collection is None:
        collection = client.get_or_create_collection(name="agriculture_knowledge", metadata={"hnsw:space": "cosine"})

    docs_to_add: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    ids: List[str] = []

    if not KNOWLEDGE_DOCS_DIR.exists():
        return

    doc_files = list(KNOWLEDGE_DOCS_DIR.glob("*.md")) + list(KNOWLEDGE_DOCS_DIR.glob("*.txt"))
    for file_path in doc_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            sections = content.split("## ")
            file_title = sections[0].strip().split("\n")[0].replace("# ", "")

            for idx, sec in enumerate(sections):
                chunk = sec.strip()
                if not chunk:
                    continue
                section_title = chunk.split("\n")[0] if "\n" in chunk else chunk[:40]
                doc_id = f"{file_path.stem}_sec_{idx}"

                docs_to_add.append(chunk)
                metadatas.append({
                    "source": file_path.name,
                    "title": file_title,
                    "section": section_title
                })
                ids.append(doc_id)
        except Exception as e:
            print(f"[RAG] Warning reading {file_path}: {e}")

    if docs_to_add:
        try:
            collection.add(
                documents=docs_to_add,
                metadatas=metadatas,
                ids=ids
            )
            print(f"[RAG] Successfully indexed {len(docs_to_add)} agronomic knowledge chunks into ChromaDB.")
        except Exception as e:
            print(f"[RAG] Ingestion error: {e}")

def add_documents(documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str], collection_name: str = "agriculture_knowledge"):
    collection = get_or_create_collection(collection_name)
    collection.add(documents=documents, metadatas=metadatas, ids=ids)

def query_documents(query: str, n_results: int = 2, collection_name: str = "agriculture_knowledge") -> Dict[str, Any]:
    collection = get_or_create_collection(collection_name)
    return collection.query(query_texts=[query], n_results=n_results)

def retrieve_agronomy_context(sensor_type: str, value: float, weather_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Formulates a targeted semantic query based on sensor anomaly and retrieves authoritative RAG context.
    """
    weather_summary = ""
    if weather_context:
        temp = weather_context.get("temperature")
        if temp:
            weather_summary = f" ambient temperature {temp}C"

    if sensor_type == "soil_moisture":
        if value < 25.0:
            query = f"Critical soil moisture depletion low drought stress under {value}% irrigation schedule{weather_summary}"
        else:
            query = f"High soil moisture saturation waterlogging over {value}% drainage safety"
    elif sensor_type == "air_temperature":
        query = f"Elevated ambient temperature heat stress over {value}C crop canopy protection"
    else:
        query = f"Agricultural environmental anomaly {sensor_type} reading {value}"

    try:
        results = query_documents(query=query, n_results=2)
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]

        formatted_chunks = []
        for doc, meta in zip(documents, metadatas):
            source = meta.get("source", "Agronomy Guidelines")
            title = meta.get("title", "Literature")
            formatted_chunks.append(f"[{title} - Source: {source}]\n{doc}")

        if formatted_chunks:
            return "\n\n---\n\n".join(formatted_chunks)
    except Exception as e:
        print(f"[RAG] Context retrieval error: {e}")

    return "Standard Agricultural Protocol: Monitor soil moisture levels closely and apply controlled irrigation within 20-40 minutes if moisture persists below 20%."

# Initialize collection upon load
try:
    get_or_create_collection()
except Exception as e:
    print(f"[RAG] Chroma initialization note: {e}")
