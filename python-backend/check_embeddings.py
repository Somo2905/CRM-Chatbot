"""
Script to verify embeddings and check what documents are in the vector store.
"""

import requests
from pathlib import Path

def check_embeddings():
    """Check the status of embeddings and documents."""
    
    print("=" * 60)
    print("EMBEDDINGS STATUS CHECK")
    print("=" * 60)
    print()
    
    # Check if backend is running
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✓ Python backend is running")
        else:
            print("✗ Python backend returned error")
            return
    except:
        print("✗ Python backend is not running")
        print("  Start it with: python main.py")
        return
    
    print()
    
    # Check data folder
    print("Documents in data folder:")
    print("-" * 60)
    data_path = Path("./data")
    if data_path.exists():
        files = list(data_path.glob("*.txt")) + list(data_path.glob("*.md"))
        files = [f for f in files if f.name != "README.md"]
        
        if files:
            for file in files:
                size = file.stat().st_size
                print(f"  ✓ {file.name} ({size:,} bytes)")
            print(f"\nTotal: {len(files)} documents")
        else:
            print("  ! No .txt or .md files found")
    else:
        print("  ✗ Data folder not found")
    
    print()
    
    # Check vector store
    print("Vector store status:")
    print("-" * 60)
    vector_store_path = Path("./chroma_db")
    if vector_store_path.exists() and any(vector_store_path.iterdir()):
        print("  ✓ Vector store exists")
        
        # Calculate size
        total_size = sum(f.stat().st_size for f in vector_store_path.rglob('*') if f.is_file())
        print(f"  ✓ Size: {total_size:,} bytes")
        
        # Test query
        try:
            response = requests.post(
                "http://localhost:8000/api/v1/chat",
                json={"query": "test query"}
            )
            if response.status_code == 200:
                result = response.json()
                print(f"  ✓ Embeddings are working")
                print(f"  ✓ Context chunks used: {result.get('context_used', 0)}")
            else:
                print("  ! Could not test embeddings")
        except:
            print("  ! Could not test embeddings")
    else:
        print("  ✗ Vector store does not exist")
        print("  Run: python create_embeddings.py")
    
    print()
    print("=" * 60)
    
    # Get system info
    try:
        response = requests.get("http://localhost:8000/api/v1/info")
        if response.status_code == 200:
            info = response.json()
            print("\nSystem Configuration:")
            print("-" * 60)
            print(f"  Model: {info.get('model')}")
            print(f"  Embedding Model: {info.get('embedding_model')}")
            print(f"  Top K Results: {info.get('top_k_results')}")
            print(f"  Security Enabled: {info.get('security_enabled')}")
    except:
        pass

if __name__ == "__main__":
    check_embeddings()
