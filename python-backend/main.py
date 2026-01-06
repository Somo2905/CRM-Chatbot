"""FastAPI application for RAG-based chatbot."""


from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from config import settings
from rag_system import rag_system
from security import security_validator



# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="RAG-based chatbot for automotive dealership customer support"
)

# Add CORS middleware
# IMPORTANT: Configure allow_origins for production to restrict access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:4000"],  # Frontend (Vite) and alternative ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Templates for simple UI
templates  = Jinja2Templates(directory="templates")


def _parse_chat_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Lightweight validation for the chat payload without pydantic."""
    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body must be a JSON object"
        )

    query = payload.get("query")
    if not isinstance(query, str) or not query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'query' is required and must be a non-empty string"
        )

    if len(query) > settings.max_query_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'query' exceeds maximum length of {settings.max_query_length} characters"
        )

    session_id = payload.get("session_id")
    if session_id is not None and not isinstance(session_id, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'session_id' must be a string if provided"
        )

    user_data = payload.get("user_data")
    if user_data is not None and not isinstance(user_data, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'user_data' must be an object if provided"
        )

    additional_context = payload.get("additional_context")
    if additional_context is not None and not isinstance(additional_context, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'additional_context' must be a string if provided"
        )

    return {
        "query": query.strip(),
        "session_id": session_id,
        "user_data": user_data,
        "additional_context": additional_context,
    }


# API Endpoints
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Tekion RAG Chatbot API",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version
    }


@app.post(
    f"{settings.api_prefix}/chat",
    tags=["Chat"],
    status_code=status.HTTP_200_OK
)
async def chat(request: Request):
    """
    Main chat endpoint that processes user queries using RAG system.
    
    - **query**: User's question or query (required)
    - **session_id**: Optional session ID for conversation history (auto-generated if not provided)
    - **user_data**: Optional user-specific information
    - **additional_context**: Optional additional context to include
    
    Returns:
    - **response**: Generated response from the chatbot
    - **session_id**: The session ID used
    - **context_used**: Number of context chunks retrieved and used
    - **memory_size**: Number of messages in the session history
    - **status**: Status of the request
    """
    try:
        try:
            payload = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload"
            )

        chat_request = _parse_chat_request(payload)

        # Validate input for security
        if settings.enable_security_check:
            is_valid, error_message = security_validator.validate_input(
                chat_request["query"],
                settings.max_query_length
            )
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_message
                )

        # Process query through RAG system
        result = rag_system.query(
            user_query=chat_request["query"],
            session_id=chat_request.get("session_id"),
            user_data=chat_request.get("user_data"),
            additional_context=chat_request.get("additional_context")
        )

        # Sanitize output
        if settings.enable_security_check:
            result["response"] = security_validator.sanitize_output(result["response"])

        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

@app.get(f"{settings.api_prefix}/ui", response_class=HTMLResponse, tags=["UI"]) 
async def ui(request: Request):
    """Serve a simple HTML UI to exercise the API endpoints."""
    return templates.TemplateResponse("index.html", {"request": request, "api_prefix": settings.api_prefix})


@app.post(f"{settings.api_prefix}/session/clear", tags=["Session"])
async def clear_session(request: Request):
    """Clear conversation history for a specific session."""
    try:
        payload = await request.json()
        session_id = payload.get("session_id")
        
        if not session_id or not isinstance(session_id, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="'session_id' is required and must be a string"
            )
        
        rag_system.clear_session(session_id)
        return {
            "status": "success",
            "message": f"Session {session_id} cleared"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing session: {str(e)}"
        )


@app.get(f"{settings.api_prefix}/session/{{session_id}}/history", tags=["Session"])
async def get_session_history(session_id: str):
    """Get conversation history for a specific session."""
    try:
        history = rag_system.get_session_history(session_id)
        # Convert message objects to dicts for JSON serialization
        history_dicts = []
        for msg in history:
            history_dicts.append({
                "role": msg.__class__.__name__,
                "content": msg.content
            })
        return {
            "session_id": session_id,
            "history": history_dicts,
            "message_count": len(history_dicts),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving session history: {str(e)}"
        )
@app.post(
    f"{settings.api_prefix}/reload-documents",
    tags=["Admin"],
    status_code=status.HTTP_200_OK
)
async def reload_documents():
    """
    Reload documents from the data folder and rebuild the vector store.
    
    This endpoint should be called after adding new documents to the data folder.
    """
    try:
        rag_system.reload_documents()
        return {
            "status": "success",
            "message": "Documents reloaded and vector store rebuilt successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reloading documents: {str(e)}"
        )


@app.get(f"{settings.api_prefix}/info", tags=["Info"])
async def get_info():
    """Get information about the RAG system configuration."""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "model": settings.openai_model,
        "embedding_model": settings.embedding_model,
        "top_k_results": settings.top_k_results,
        "security_enabled": settings.enable_security_check
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )