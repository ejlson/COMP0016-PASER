# chatbot.py

from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core import ChatPromptTemplate
from llama_index.llms.ollama import Ollama
from embeddings_index_q import EmbeddingsChromaDB

CUSTOM_PROMPT = """
You are a geography research assistant. When given a question along with context extracted from relevant geography documents, construct a concise and accurate response using only the provided context. If the context does not sufficiently answer the question, respond with "I do not have enough information to answer your question." Use your geography and historical knowledge only to enhance context data.

Definitions:

    Actors: Refer to institutions or governments significant in socio-environmental governance.
    Networks: Focus on the relationships between these actors and how these relationships influence each other's development and progress.

Do:

    Use the context provided from geography documents to answer questions.
    Specify the title of the document(s) used for your answer at the end of your response.

Do Not:

    Use your own knowledge outside the provided context to answer questions.
    Mention the document titles anywhere other than at the very end of your output.
    Include any document in your citation that was not used to construct your answer.
    Search for specific documents discussing time frames; instead, use information from documents within the given time frames to construct your answer.

Format for Queries About Timeframes:

    When asked about specific timeframes, derive information from any documents published within those timeframes to construct your answer.

Output Format:
<main body response>

DOCUMENTS_USED: <document title(s)>
"""

class Chatbot:
    def __init__(self, embeddings):
        self.embeddings_chroma_db = embeddings
        self.llm = Ollama(model='mistral')
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
        self.query_engine = self.embeddings_chroma_db.index.as_query_engine(text_qa_template=self.text_qa_template, llm=self.llm, streaming=True)

        # INSTANT OUTPUT
        #self.query_engine = self.embeddings_chroma_db.index.as_query_engine(text_qa_template=self.text_qa_template, llm=self.llm)

    def stream_query(self, query_str):
        streaming_response = self.query_engine.query(query_str)
        for token in streaming_response.response_gen:
            print(token, end='')
    
    def query(self, query_str):
        
        out = str(self.query_engine.query(query_str))
        print(out)
        return out

emb = EmbeddingsChromaDB()

chat = Chatbot(emb)

# chat.stream_query('what was total expenditure on biennium in 2015?')

chat.stream_query('what was UN total expenditure in 2017?')