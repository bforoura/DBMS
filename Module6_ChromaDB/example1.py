import chromadb

# 1. Initialize client
client = chromadb.PersistentClient(path="./my_data")

# 2. Create or get a collection
collection = client.get_or_create_collection(name="support_docs")

# 3. Add data to the collection
collection.add(
    documents=[
        "Reset your password by clicking 'Forgot Password' on the login screen.",
        "Shipping usually takes 3 to 5 business days for standard domestic orders."
    ],
    metadatas=[{"category": "account"}, {"category": "shipping"}],
    ids=["doc1", "doc2"]
)

# 4. Query the collection using natural language
results = collection.query(
    query_texts=["How do I get a new password?"],
    n_results=1
)

print(results["documents"])