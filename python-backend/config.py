import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv

# ------------------------------------------------------------------
# Environment loading
# ------------------------------------------------------------------

load_dotenv()


# ------------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------------

def _get_str(name: str, default: str) -> str:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _get_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


# ------------------------------------------------------------------
# Settings
# ------------------------------------------------------------------

@dataclass(frozen=True)
class Settings:
    """
    Centralized application configuration.

    Designed for:
    - Hallucination-resistant RAG
    - Deterministic LLM behavior
    - Blue-team / SOC safe defaults
    """

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    app_name: str = _get_str("APP_NAME", "Tekion RAG Chatbot")
    app_version: str = _get_str("APP_VERSION", "1.0.0")
    api_prefix: str = _get_str("API_PREFIX", "/api/v1")
    environment: str = _get_str("ENVIRONMENT", "development")  # dev | prod
    openai_model: str = _get_str("OPENAI_MODEL", "gemini-1.5-flash")  # For backward compatibility with frontend

    # ------------------------------------------------------------------
    # LLM Configuration
    # ------------------------------------------------------------------
    llm_provider: str = _get_str("LLM_PROVIDER", "gemini")

    gemini_model: str = _get_str("GEMINI_MODEL", "gemini-1.5-flash")
    google_api_key: str = _get_str(
        "GOOGLE_API_KEY",
        ""
    )

    # Generation safety
    max_generation_tokens: int = _get_int("MAX_GENERATION_TOKENS", 512)
    temperature: float = _get_float("LLM_TEMPERATURE", 0.05)

    # ------------------------------------------------------------------
    # Embeddings
    # ------------------------------------------------------------------
    embedding_model: str = _get_str(
        "EMBEDDING_MODEL",
        "sentence-transformers/all-MiniLM-L6-v2"
    )

    embedding_device: str = _get_str("EMBEDDING_DEVICE", "cpu")

    # ------------------------------------------------------------------
    # Chunking (retrieval quality)
    # ------------------------------------------------------------------
    chunk_size: int = _get_int("CHUNK_SIZE", 1000)
    chunk_overlap: int = _get_int("CHUNK_OVERLAP", 200)

    # ------------------------------------------------------------------
    # Vector Store / Retrieval Safety
    # ------------------------------------------------------------------
    vector_store_path: str = _get_str("VECTOR_STORE_PATH", "./chroma_db")

    # Fewer, higher-quality chunks = fewer hallucinations
    top_k_results: int = _get_int("TOP_K_RESULTS", 2)

    # Minimum cosine similarity score required to use a chunk
    min_similarity_score: float = _get_float("MIN_SIMILARITY_SCORE", 0.3)

    # Hard cap on how much context the LLM can see
    max_context_chars: int = _get_int("MAX_CONTEXT_CHARS", 6000)

    # ------------------------------------------------------------------
    # RAG Safety Controls
    # ------------------------------------------------------------------
    strict_rag_mode: bool = _get_bool("STRICT_RAG_MODE", True)
    refuse_on_empty_context: bool = _get_bool("REFUSE_ON_EMPTY_CONTEXT", True)

    # ------------------------------------------------------------------
    # Security Controls
    # ------------------------------------------------------------------
    max_query_length: int = _get_int("MAX_QUERY_LENGTH", 500)
    enable_security_check: bool = _get_bool("ENABLE_SECURITY_CHECK", True)

    # ------------------------------------------------------------------
    # Paths
    # ------------------------------------------------------------------
    data_folder: str = _get_str("DATA_FOLDER", "./data")
    prompts_folder: str = _get_str("PROMPTS_FOLDER", "./prompts")


# ------------------------------------------------------------------
# Singleton
# ------------------------------------------------------------------

settings = Settings()
