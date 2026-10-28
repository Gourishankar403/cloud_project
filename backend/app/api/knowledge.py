from fastapi import APIRouter
from app.rag.chroma import add_documents, query_documents
from pydantic import BaseModel

router = APIRouter()

class DocumentUpload(BaseModel):
    id: str
    text: str
    source: str

class QueryRequest(BaseModel):
    query: str
    n_results: int = 3

@router.post("/documents")
def upload_document(doc: DocumentUpload):
    add_documents(
        documents=[doc.text],
        metadatas=[{"source": doc.source}],
        ids=[doc.id]
    )
    return {"status": "Document added"}

@router.post("/query")
def retrieve_documents(req: QueryRequest):
    results = query_documents(req.query, req.n_results)
    return results
