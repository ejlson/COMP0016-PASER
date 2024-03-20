__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

from langchain_community.embeddings import HuggingFaceEmbeddings
from llama_index.core.storage import StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, load_index_from_storage, Settings
import chromadb
import sqlite3
import os


class EmbeddingsChromaDB:
    def __init__(self, db_path="./chroma_db"):
        self.db_path = db_path
        self.db = chromadb.PersistentClient(path="./chroma_db")

        self.embed_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    
        Settings.embed_model = self.embed_model

        self.indices = {}
        self.init_all_indices()


    def get_collection_names(self):
        conn = sqlite3.connect("./chroma_db/chroma.sqlite3")
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT name FROM collections")
            
            collection_names = [row[0] for row in cursor.fetchall()]
            
            return collection_names
    
        except sqlite3.Error as e:
            print(f"Error retrieving collection names: {e}")

        
        finally:
            # Close the database connection
            conn.close()
        

    def init_all_indices(self):
        collections = self.get_collection_names()
        print(collections)
        for collection in collections:
            self.indices[collection] = self.init_vector_index(collection)


    def init_vector_index(self, index_id):
        chroma_collection = self.db.get_collection(name=f"{index_id}")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        storage_context = StorageContext.from_defaults(persist_dir=f"./chroma_db/{index_id}", vector_store=vector_store)
        index = VectorStoreIndex.from_vector_store(vector_store=vector_store, storage_context=storage_context)

        return index

    def add_docs_to_index(self, doc_paths, index):
        if not self.index:
            self.init_vector_index()

        docs = self.load_docs(doc_paths)

        for doc in docs:
            index.insert(doc)     

    def load_docs(self, doc_paths):
        docs = []
        for doc_path in doc_paths:
            # if path is a directory
            if os.path.isdir(doc_path):
                reader = SimpleDirectoryReader(input_dir=doc_path, recursive=True, required_exts=[".pdf", ".docx"])
                doc = reader.load_data()
                print(f'{len(doc)}\n\n {doc[500].get_content}')
                docs.extend(doc)
            else:
                # MUST BE TESTED
                docs.extend(SimpleDirectoryReader(input_files=[doc_path]).load_data())
        return docs

    def create_new_index(self, doc_path, title):
        docs = self.load_docs([doc_path])
        self.chroma_collection = self.db.create_collection(name=f"{title}")
        vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        index = VectorStoreIndex.from_documents(docs , vector_store=vector_store, storage_context=storage_context)
        index.set_index_id(title)
        storage_context.persist(persist_dir=f"./chroma_db/{title}")
        


if __name__ == '__main__':
    emb = EmbeddingsChromaDB()

    #emb.create_new_index('/Users/antonzhulkovskiy/Desktop/paser/COMP0016-PASER/paser_backend/app/LLM/Reports/Annual_Report_2015.pdf', '2015')
    
    #emb.init_vector_indices('2015')