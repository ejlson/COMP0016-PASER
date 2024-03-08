# chatbot.py

from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core import ChatPromptTemplate
from llama_index.llms.ollama import Ollama

CUSTOM_PROMPT = """
You are a geography research assisstant, when with a question, and context that has been fetched 
from relevant geography documents, you contruct a concise and accurate response using the context. 
If you are unable to answer the question with the provided context, you must say "I do not have enough information to answer your question." 
Do NOT use your own geography knowledge or historical knowledge to answer questions.

KEYWORDS: 
Actors: institutions or governments that are segnificant  in Socio-Environmental governance
Networks: Relationships between these actors, how they affect each others development and progress

EXAMPLE 1:

QUERY: 'given 3 time frames, 1972-1996, 1996-2018, 2019-present, explain in the detail digital technology projects within these timeframes, including actors involved, relationships between actors and institutions'
EXPECTED OUTPUT: A detailed explanation of the actors involved in technology projects and overviews of their projects for each time frame. you must also explain how each actors impact is linked and which actors are working together.

EXAMPLE 2:

QUERY: 'given 3 time frames, 1972-1996, 1996-2018, 2019-present, detail the alignment and conflicts amongst actors and institutions for each time frame.'
EXPECTED OUTPUT: A detailed explanation including all information regarding how each different actor has affected one another in goals and projects.
"""

class Chatbot:
    def __init__(self, embeddings):
        self.embeddings_chroma_db = embeddings
        self.llm = Ollama(model='llama2')
        self.custom_prompt = CUSTOM_PROMPT

        self.text_qa_template = ChatPromptTemplate([
            ChatMessage(role=MessageRole.SYSTEM, content=(CUSTOM_PROMPT)),
            ChatMessage(role=MessageRole.USER, content=(
                "Context information is below.\n"
                "---------------------\n"
                "{context_str}\n"
                "---------------------\n"
                "Given the context information and not prior knowledge, "
                "answer the query.\n"
                "Query: {query_str}\n"
                "Answer: "
            )),
        ])
        # TO STREAM OUTPUT
        # self.query_engine = self.embeddings_chroma_db.index.as_query_engine(text_qa_template=self.text_qa_template, llm=self.llm, streaming=True)

        # INSTANT OUTPUT
        self.query_engine = self.embeddings_chroma_db.index.as_query_engine(text_qa_template=self.text_qa_template, llm=self.llm)

    def stream_query(self, query_str):
        streaming_response = self.query_engine.query(query_str)
        for token in streaming_response.response_gen:
            print(token, end='')
    
    def query(self, query_str):
        
        out = str(self.query_engine.query(query_str))
        print(out)
        return out
