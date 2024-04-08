from langchain_community.embeddings import HuggingFaceEmbeddings
from llama_index.core.storage import StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SentenceWindowNodeParser, SentenceSplitter
import chromadb
import sqlite3
import os


class EmbeddingsChromaDB:
    def __init__(self, db_path="./chroma_db"):
        self.db_path = db_path
        self.db = chromadb.PersistentClient(path="./chroma_db")

        self.embed_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
        self.node_parser = self.create_node_parser()

        Settings.embed_model = self.embed_model
        Settings.text_splitter = SentenceSplitter()


        self.indices = {}
        self.init_all_indices()

    def create_node_parser(self):
        node_parser = SentenceWindowNodeParser.from_defaults(
            window_size=7,
            window_metadata_key="window",
            original_text_metadata_key="original_text",
        )

        return node_parser


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
        for collection in collections:
            self.indices[collection] = self.init_vector_index(collection)


    def init_vector_index(self, index_id):
        chroma_collection = self.db.get_collection(name=f"{index_id}")
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        storage_context = StorageContext.from_defaults(persist_dir=f"./chroma_db/{index_id}", vector_store=vector_store)
        index = VectorStoreIndex.from_vector_store(vector_store=vector_store, storage_context=storage_context) # , top_k=5)

        return index

    def add_docs_to_index(self, doc_path, index):
        indices = self.get_collection_names()
        try:
            if index not in indices:
                self.create_new_index(doc_path, index)
            else:
                docs = self.load_docs([doc_path])
                nodes = self.node_parser.get_nodes_from_documents(docs)
                index.insert_nodes(nodes)
        except ValueError:
            print("File failed to upload due to incorrect save format or filename.")

    def load_docs(self, doc_paths):
        docs = []
        for doc_path in doc_paths:
            # if path is a directory
            if os.path.isdir(doc_path):
                reader = SimpleDirectoryReader(input_dir=doc_path, recursive=True, required_exts=[".pdf", ".docx", "pptx"])
                doc = reader.load_data()
                docs.extend(doc)
            else:
                docs.extend(SimpleDirectoryReader(input_files=[doc_path]).load_data())
        return docs

    def create_new_index(self, doc_path, title):
        docs = self.load_docs([doc_path])
        self.chroma_collection = self.db.create_collection(name=f"{title}")
        vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        nodes = self.node_parser.get_nodes_from_documents(docs)
        index = VectorStoreIndex(nodes, vector_store=vector_store, storage_context=storage_context)
        index.set_index_id(title)
        storage_context.persist(persist_dir=f"./chroma_db/{title}")




if __name__ == '__main__':
    emb = EmbeddingsChromaDB()

    actors = ['unep', 'lter', 'gpai']
    for actor in actors:
        emb.create_new_index(f'/Users/antonzhulkovskiy/Desktop/paser/research_actors/{actor}', actor)
    
    emb.init_all_indices()