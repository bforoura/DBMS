import chromadb

# 1. Initialize the Chroma Client
# Using an EphemeralClient for in-memory testing, or PersistentClient for disk storage
client = chromadb.Client()

# 2. Create or Get a Collection
# A collection acts like a table in a relational database
collection = client.get_or_create_collection(
    name="cs_department_faq",
    metadata={"description": "FAQ database for computer science courses"}
)

# 3. Insert Documents with Metadata and Unique IDs
# Chroma automatically generates 384-dim embeddings using its default model (all-MiniLM-L6-v2)
collection.add(
    ids=["doc1", "doc2", "doc3", "doc4"],
    documents=[
        "Operating Systems covers process scheduling, virtual memory, and concurrency control using C and POSIX threads.",
        "Database Management Systems teaches relational algebra, SQL querying, indexing structures like B-Trees, and NoSQL fundamentals.",
        "Machine Learning explores supervised classification pipelines, decision trees, support vector machines, and neural networks.",
        "Introduction to Java programming focuses on object-oriented principles, classes, inheritance, and exception handling."
    ],
    metadatas=[
        {"course_code": "CSC 341", "category": "Systems"},
        {"course_code": "CSC 445", "category": "Data"},
        {"course_code": "CSC 480", "category": "AI"},
        {"course_code": "CSC 111", "category": "Programming"}
    ]
)

# 4. Perform a Semantic Similarity Query
# Chroma embeds the query text using the exact same model and performs an HNSW search
query_text = "Where can I learn about neural networks and classification?"

results = collection.query(
    query_texts=[query_text],
    n_results=2,  # Return the top 2 closest matches
    include=["documents", "metadatas", "distances"]
)

# 5. Display Results
print("Query:", query_text)
print("-" * 50)
for i in range(len(results["ids"][0])):
    print(f"Rank {i+1}:")
    print(f"  ID: {results['ids'][0][i]}")
    print(f"  Document: {results['documents'][0][i]}")
    print(f"  Metadata: {results['metadatas'][0][i]}")
    print(f"  Distance Score: {results['distances'][0][i]:.4f}")
    print()