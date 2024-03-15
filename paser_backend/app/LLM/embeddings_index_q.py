__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

from langchain_community.embeddings import HuggingFaceEmbeddings
from llama_index.core.storage import StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, load_indices_from_storage

import chromadb
import os




class EmbeddingsChromaDB:
    def __init__(self, db_path="./chroma_db"):
        self.db_path = db_path
        self.embed_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        self.indices = None
        self.storage_context = None
        self.chroma_collection = None
        self.init_vector_indices()



    def init_vector_indices(self):
        db2 = chromadb.PersistentClient(path="./chroma_db")
        self.chroma_collection = db2.get_or_create_collection("quickstart")
        vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        self.storage_context = StorageContext.from_defaults(vector_store=vector_store)
        self.indices = load_indices_from_storage(self.storage_context)
        print(len(self.indices))
    
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

        index = VectorStoreIndex.from_documents(docs, storage_context=self.storage_context, embed_model=self.embed_model)
        index.set_index_id(title)
        index.storage_context.persist(f"./chroma_db/{title}")
        print(len(self.indices))


if __name__ == '__main__':
    emb = EmbeddingsChromaDB()

    #emb.create_new_index('/cs/student/projects1/2022/PASER/syseng_lab/fullstack/COMP0016-PASER/paser_backend/app/LLM/Reports/Annual_Report_2015.pdf', '2015')
