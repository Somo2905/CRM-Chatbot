"""
Script to create/rebuild embeddings from documents in the data folder.
This will process all .txt and .md files (except README.md) and create
vector embeddings that can be used by the chatbot for RAG.
"""

import requests
import sys

def create_embeddings():
    """Trigger document reload to create embeddings."""
    url = "http://localhost:8000/api/v1/reload-documents"
    
    print("Creating embeddings from documents in data folder...")
    print("This will:")
    print("  1. Delete existing vector store")
    print("  2. Load all documents from data folder")
    print("  3. Split documents into chunks")
    print("  4. Create embeddings using HuggingFace model")
    print("  5. Store in ChromaDB vector store")
    print()
    
    try:
        response = requests.post(url)
        
        if response.status_code == 200:
            result = response.json()
            print("✓ Success!")
            print(f"  Status: {result.get('status')}")
            print(f"  Message: {result.get('message')}")
            print()
            print("Embeddings are now ready for use in the chatbot.")
            return 0
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  {response.text}")
            return 1
            
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to Python backend.")
        print("  Make sure the backend is running on port 8000")
        print("  Start it with: python main.py")
        return 1
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(create_embeddings())
