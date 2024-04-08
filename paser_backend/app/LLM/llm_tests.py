import unittest
import os
import shutil
from unittest.mock import patch, MagicMock
from embeddings import EmbeddingsChromaDB
from chat import Chatbot
from sub_question import SubQuestionQueryEngine, QueryEngineTool
from llama_index.core.node_parser import SentenceWindowNodeParser
from llama_index.llms.ollama import Ollama


class TestEmbeddingsChromaDB(unittest.TestCase):
   def setUp(self):
       self.test_db_path = "./test_chroma_db"
       self.emb = EmbeddingsChromaDB(db_path=self.test_db_path)
       self.test_index_id = "test_index"
       self.test_doc_path = "test_docs/test_doc.txt"

   def tearDown(self):
       shutil.rmtree(self.test_db_path)

   def test_create_node_parser(self):
       node_parser = self.emb.create_node_parser()
       self.assertIsInstance(node_parser, SentenceWindowNodeParser)

   def test_get_collection_names(self):
       self.emb.db.create_collection(name="test_collection")
       collection_names = self.emb.get_collection_names()
       self.assertIn("test_collection", collection_names)

   @patch("SimpleDirectoryReader")
   def test_load_docs(self, mock_reader):
       mock_reader.return_value.load_data.return_value = ["test_doc_1", "test_doc_2"]
       docs = self.emb.load_docs(["test_dir"])
       self.assertEqual(docs, ["test_doc_1", "test_doc_2"])

   def test_create_new_index(self):
       self.emb.create_new_index(self.test_doc_path, self.test_index_id)
       self.assertIn(self.test_index_id, self.emb.indices)

   def test_add_docs_to_index(self):
       self.emb.create_new_index(self.test_doc_path, self.test_index_id)
       index = self.emb.indices[self.test_index_id]
       index.insert_nodes = MagicMock()
       self.emb.add_docs_to_index([self.test_doc_path], index)
       index.insert_nodes.assert_called()


class TestChatbot(unittest.TestCase):
    def setUp(self):
        self.mock_embeddings = MagicMock()
        self.mock_embeddings.indices = {"test_index": MagicMock()}
        self.chatbot = Chatbot(self.mock_embeddings)

    @patch("Ollama")
    def test_init(self, mock_ollama):
        mock_ollama.return_value = MagicMock()
        chatbot = Chatbot(self.mock_embeddings)
        self.assertIsInstance(chatbot.llm, MagicMock)
        self.assertIsInstance(chatbot.sub_query_engine, SubQuestionQueryEngine)

    def test_create_query_tools(self):
        tools = self.chatbot.create_query_tools(self.mock_embeddings.indices)
        self.assertEqual(len(tools), 1)
        self.assertIsInstance(tools[0], QueryEngineTool)

    @patch.object(SubQuestionQueryEngine, "query")
    def test_query(self, mock_query):
        mock_query.return_value = MagicMock(metadata={"test_index": {"file_name": "test.pdf", "page_label": "1"}})
        response = self.chatbot.query("test query")
        self.assertIn("test.pdf", response.metadata)
        self.assertIn("page: 1", response.metadata)


if __name__ == "__main__":
   unittest.main()