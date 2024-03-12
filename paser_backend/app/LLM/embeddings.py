
from langchain_community.embeddings import HuggingFaceEmbeddings
from llama_index.core.storage import StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

import chromadb
import os

class EmbeddingsChromaDB:
    def __init__(self, db_path="./chroma_db"):
        self.db_path = db_path
        self.embed_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        self.vector_store = None
        self.index = None
        # self.save_db_to_disk('/cs/student/projects1/2022/PASER/syseng_lab/Reports')
        self.init_vector_index()


    def save_db_to_disk(self, docs_path):
        db_client = chromadb.PersistentClient(path=self.db_path)
        chroma_collection = db_client.get_or_create_collection("quickstart")
        self.vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        documents = SimpleDirectoryReader(docs_path).load_data()
        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        self.index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=self.embed_model)

    def init_vector_index(self):
        db2 = chromadb.PersistentClient(path="./chroma_db")
        chroma_collection = db2.get_or_create_collection("quickstart")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        self.index = VectorStoreIndex.from_vector_store(
            vector_store,
            embed_model=self.embed_model,
        )
    
    def add_docs_to_db(self, doc_paths):
        if not self.index:
            self.init_vector_index()
        docs = []

        for doc_path in doc_paths:
            # if path is a directory
            if os.path.isdir(doc_path):
                docs.extend(SimpleDirectoryReader(doc_path).load_data())
            else:
                # MUST BE TESTED
                docs.extend(SimpleDirectoryReader(input_files=[doc_path]).load_data())
        for doc in docs:
            self.index.insert(doc)
    
