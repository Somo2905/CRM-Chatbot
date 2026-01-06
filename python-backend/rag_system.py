"""
RAG (Retrieval Augmented Generation) system for document-based chat.
Updated for Google Gemini, HuggingFace embeddings (CPU-safe),
and conversational memory support.
"""

from pathlib import Path
from typing import List, Optional, Dict
import torch
import uuid

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.documents import Document
from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
)
from langchain_core.prompts import ChatPromptTemplate

from config import settings


class RAGSystem:
    """Retrieval Augmented Generation system with conversational memory."""

    def __init__(self):
        self.embeddings: HuggingFaceEmbeddings | None = None
        self.vector_store: Chroma | None = None
        self.llm: ChatGoogleGenerativeAI | None = None

        self.system_prompt: str = ""
        self.chat_prompt_template: ChatPromptTemplate | None = None

        # 🧠 Conversation memory (per-session history)
        self.sessions: Dict[str, List] = {}  # session_id -> message history
        self.max_memory_messages: int = 10  # configurable window

        self._initialize()

    # ------------------------------------------------------------------
    # Initialization
    # ------------------------------------------------------------------

    def _initialize(self) -> None:
        self._load_prompts()
        self._initialize_embeddings()
        self._initialize_llm()
        self._initialize_vector_store()

    def _initialize_embeddings(self) -> None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.embedding_model,
            model_kwargs={"device": device},
        )

    def _initialize_llm(self) -> None:
        print("Initializing Google Gemini LLM...")
        self.llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            api_key=settings.google_api_key,
            temperature=0.2,
        )
        print(f"LLM initialized: {self.llm}")

    # ------------------------------------------------------------------
    # Prompts
    # ------------------------------------------------------------------

    def _load_prompts(self) -> None:
        prompts_path = Path(settings.prompts_folder)

        system_prompt_path = prompts_path / "system_prompt.txt"
        if system_prompt_path.exists():
            self.system_prompt = system_prompt_path.read_text(
                encoding="utf-8"
            ).strip()

        chat_prompt_path = prompts_path / "chat_response_prompt.txt"
        if chat_prompt_path.exists():
            template = chat_prompt_path.read_text(encoding="utf-8").strip()
            self.chat_prompt_template = ChatPromptTemplate.from_template(
                template
            )
        else:
            self.chat_prompt_template = ChatPromptTemplate.from_template(
                "Context:\n{context}\n\nQuestion:\n{query}\n\nAnswer:"
            )

    # ------------------------------------------------------------------
    # Vector Store
    # ------------------------------------------------------------------

    def _initialize_vector_store(self) -> None:
        vector_store_path = Path(settings.vector_store_path)

        if vector_store_path.exists() and any(vector_store_path.iterdir()):
            print("Loading existing vector store...")
            self.vector_store = Chroma(
                persist_directory=settings.vector_store_path,
                embedding_function=self.embeddings,
                collection_name="default",
            )
        else:
            print("Creating new vector store from documents...")
            self._create_vector_store()

    def _create_vector_store(self) -> None:
        documents = self._load_documents()

        if not documents:
            print("Warning: No documents found.")
            self.vector_store = Chroma(
                persist_directory=settings.vector_store_path,
                embedding_function=self.embeddings,
            )
            return

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )

        split_docs = splitter.split_documents(documents)

        self.vector_store = Chroma.from_documents(
            documents=split_docs,
            embedding=self.embeddings,
            persist_directory=settings.vector_store_path,
        )
        self.vector_store.persist()

        print(f"Vector store created with {len(split_docs)} chunks")

    # ------------------------------------------------------------------
    # Document Loading
    # ------------------------------------------------------------------

    def _load_documents(self) -> List[Document]:
        documents: List[Document] = []
        data_path = Path(settings.data_folder)

        if not data_path.exists():
            return documents

        for file_path in data_path.glob("*"):
            if file_path.suffix not in {".txt", ".md"}:
                continue
            if file_path.name == "README.md":
                continue

            try:
                content = file_path.read_text(encoding="utf-8")
                documents.append(
                    Document(
                        page_content=content,
                        metadata={"source": file_path.name},
                    )
                )
                print(f"Loaded: {file_path.name}")
            except Exception as e:
                print(f"Failed to load {file_path.name}: {e}")

        return documents

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def get_relevant_context(
        self, query: str, top_k: Optional[int] = None
    ) -> List[str]:
        if not self.vector_store:
            return []

        k = top_k or settings.top_k_results

        try:
            results = self.vector_store.similarity_search(query, k=k)
            return [doc.page_content for doc in results]
        except Exception as e:
            print(f"Retrieval error: {e}")
            return []

    # ------------------------------------------------------------------
    # Session Management
    # ------------------------------------------------------------------

    def get_or_create_session(self, session_id: Optional[str] = None) -> str:
        """Get existing session or create a new one."""
        if session_id and session_id in self.sessions:
            return session_id
        new_id = session_id or str(uuid.uuid4())
        self.sessions[new_id] = []
        return new_id

    def get_session_history(self, session_id: str) -> List:
        """Get message history for a session."""
        return self.sessions.get(session_id, [])

    def _trim_memory(self, session_id: str) -> None:
        """Trim session memory to max size."""
        if len(self.sessions[session_id]) > self.max_memory_messages:
            self.sessions[session_id] = self.sessions[session_id][-self.max_memory_messages :]

    def generate_response(
        self,
        query: str,
        context: List[str],
        session_id: str,
        user_data: Optional[dict] = None,
    ) -> str:
        if not self.llm or not self.chat_prompt_template:
            return "LLM not configured."

        combined_context = "\n\n".join(context)

        messages = []

        # System prompt
        if self.system_prompt:
            messages.append(SystemMessage(content=self.system_prompt))

        # Previous conversation memory for this session
        messages.extend(self.sessions[session_id])

        # Current user input
        messages.append(
            HumanMessage(
                content=self.chat_prompt_template.format(
                    context=combined_context,
                    query=query,
                )
            )
        )

        try:
            response = self.llm.invoke(messages)

            # Extract content from the response (ChatGoogleGenerativeAI returns AIMessage)
            response_text = response.content if hasattr(response, 'content') else str(response)

            # Save to session memory
            self.sessions[session_id].append(HumanMessage(content=query))
            self.sessions[session_id].append(AIMessage(content=response_text))
            self._trim_memory(session_id)

            return response_text

        except Exception as e:
            print(f"Generation error: {e}")
            return "Unable to generate a response at this time."

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def query(
        self,
        user_query: str,
        session_id: Optional[str] = None,
        user_data: Optional[dict] = None,
        additional_context: Optional[str] = None,
    ) -> dict:
        session_id = self.get_or_create_session(session_id)
        context = self.get_relevant_context(user_query)

        if additional_context:
            context.insert(0, additional_context)

        response = self.generate_response(user_query, context, session_id, user_data)

        return {
            "response": response,
            "context_used": len(context),
            "session_id": session_id,
            "memory_size": len(self.sessions[session_id]),
            "status": "success",
        }

    def clear_session(self, session_id: str) -> None:
        """Clear message history for a specific session."""
        if session_id in self.sessions:
            self.sessions[session_id].clear()

    def clear_all_sessions(self) -> None:
        """Clear all session histories."""
        self.sessions.clear()

    def reload_documents(self) -> None:
        import shutil
        import gc

        print("Reloading documents...")
        
        # Close and release the vector store before deleting
        if self.vector_store is not None:
            try:
                # Delete the collection to release file handles
                self.vector_store.delete_collection()
                print("Vector store collection deleted")
            except:
                pass
            
            # Clear the reference
            self.vector_store = None
            
            # Force garbage collection to release file handles
            gc.collect()
        
        # Now safely delete the directory
        path = Path(settings.vector_store_path)
        if path.exists():
            try:
                shutil.rmtree(path)
                print("Vector store directory removed")
            except Exception as e:
                print(f"Warning: Could not remove directory: {e}")
                # Try to continue anyway

        # Recreate the vector store
        self._create_vector_store()
        print("Reload complete.")


# Singleton instance
rag_system = RAGSystem()
