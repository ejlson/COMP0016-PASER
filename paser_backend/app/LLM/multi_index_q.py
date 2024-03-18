from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core import ChatPromptTemplate, Settings
from llama_index.llms.ollama import Ollama

from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.callbacks import CallbackManager, LlamaDebugHandler
from custom_chat import RetryAgentWorker
from llama_index.core.agent import AgentRunner
from embeddings_index_q import EmbeddingsChromaDB

class Chatbot:
    def __init__(self, embeddings):
        self.embeddings_chroma_db = embeddings
        self.llm = Ollama(model='mistral')

        llama_debug = LlamaDebugHandler(print_trace_on_end=True)
        callback_manager = CallbackManager([llama_debug])

        Settings.callback_manager = callback_manager

        indices = self.embeddings_chroma_db.indices

        query_engine_tools = self.create_query_tools(indices)

        self.sub_query_engine = SubQuestionQueryEngine.from_defaults(
            query_engine_tools=query_engine_tools,
            use_async=True,
            llm=self.llm,
        )

        main_tool = self.create_main_tool()

        Settings.llm = self.llm

        Settings.context_window = 8000

        agent_worker = RetryAgentWorker.from_tools(
            query_engine_tools + [main_tool],
            llm=self.llm,
            verbose=True,
            callback_manager=callback_manager,
        )

        self.agent = AgentRunner(agent_worker, callback_manager=callback_manager, llm=self.llm)

    def create_main_tool(self):
        tool = QueryEngineTool(
            query_engine=self.sub_query_engine,
            metadata=ToolMetadata(
                name="sub_question_query_engine",
                description="useful for when you want to answer queries that require analyzing multiple organizations and/or timeframes"
            )
        )

        return tool


    def create_query_tools(self, indecies):
        tools = []

        for name, index in indecies.items():
            description = f"useful for searching documents by or about {name}"
            tool = QueryEngineTool(
                query_engine=index.as_query_engine(self.llm),
                metadata=ToolMetadata(
                    name=name,
                    description=description
                )
            )
            tools.append(tool)

        return tools

    def stream_query(self, query_str):
        streaming_response = self.query_engine.query(query_str)
        for token in streaming_response.response_gen:
            print(token, end='')
    
    def query(self, query_str):
        response = self.agent.chat(query_str)
        print(response)
        return str(response)

emb = EmbeddingsChromaDB()
chat = Chatbot(emb)

chat.query('Compare how UN technology projects have differed in 2015 and 2022?')
