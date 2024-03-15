from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core import ChatPromptTemplate, Settings, PromptHelper, ServiceContext
from llama_index.llms.ollama import Ollama

from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.callbacks import CallbackManager, LlamaDebugHandler

from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.tools import 


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

        node_parser = SentenceSplitter.from_defaults()

        prompt_helper = PromptHelper(context_window=8000)

        service_context = ServiceContext.from_defaults(
            llm=self.llm, 
            embed_model=self.embeddings_chroma_db, 
            node_parser=node_parser, 
            prompt_helper=prompt_helper)


        # TO STREAM OUTPUT
        # self.query_engine = self.embeddings_chroma_db.index.as_query_engine(text_qa_template=self.text_qa_template, llm=self.llm, streaming=True)

        # INSTANT OUTPUT
        self.query_engine_old = self.embeddings_chroma_db.index.as_query_engine(text_qa_template=self.text_qa_template, llm=self.llm)

        llama_debug = LlamaDebugHandler(print_trace_on_end=True)
        callback_manager = CallbackManager([llama_debug])

        Settings.callback_manager = callback_manager

        query_engine_tools = [
            QueryEngineTool(
                query_engine=self.query_engine_old,
                metadata=ToolMetadata(
                    name="Documents",
                    description="used to search context for any queries",
                ),
            ),
        ]

        self.query_engine = SubQuestionQueryEngine.from_defaults(
            query_engine_tools=query_engine_tools,
            use_async=True,
            llm=self.llm
        )

    def stream_query(self, query_str):
        streaming_response = self.query_engine.query(query_str)
        for token in streaming_response.response_gen:
            print(token, end='')
    
    def query(self, query_str):
        response = self.query_engine.query(query_str)
        print(response)
        return str(response)

