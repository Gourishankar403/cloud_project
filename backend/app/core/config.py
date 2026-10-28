from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgentFlow Cloud"
    POSTGRES_USER: str = "agentflow"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "agentflow"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5433"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    OPENWEATHER_API_KEY: str = "" # Provide in .env
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: str = "8000"

    # Cloud Object Storage (S3 Data Lake / Cold Storage)
    S3_BUCKET_NAME: str = "agentflow-cold-lake"
    S3_ENDPOINT_URL: str = ""  # Optional custom endpoint (MinIO / Cloudflare R2)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"

    class Config:
        env_file = ".env"

settings = Settings()

def get_database_url():
    return f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
