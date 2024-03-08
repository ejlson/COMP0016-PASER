from app.LLM.embeddings import EmbeddingsChromaDB
from app.LLM.chat import Chatbot

class ChatSingleton:
    _instance = None
    chatbot = None
    embeddings = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChatSingleton, cls).__new__(cls)
            cls.embeddings = EmbeddingsChromaDB()

            cls.chatbot = Chatbot(cls.embeddings)

        return cls._instance