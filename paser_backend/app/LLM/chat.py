from llama_index.core import Settings
from llama_index.llms.ollama import Ollama

from llama_index.core.tools import QueryEngineTool, ToolMetadata
from .sub_question import SubQuestionQueryEngine
from llama_index.core.callbacks import CallbackManager, LlamaDebugHandler
from .embeddings import EmbeddingsChromaDB
from llama_index.core.postprocessor import MetadataReplacementPostProcessor
from llama_index.core.storage.chat_store import SimpleChatStore
from llama_index.core.memory import ChatMemoryBuffer
from IPython.display import Markdown, display
from .prompts import INITIAL_RESPONSE, SUB_QUERY_PROMPT, FINAL_RESPONSE
import traceback

def display_prompt_dict(prompts_dict):
    for k, p in prompts_dict.items():
        text_md = f"**Prompt Key**: {k}<br>" f"**Text:** <br>"
        print(k)
        display(Markdown(text_md))
        print(p.get_template())
        display(Markdown("<br><br>"))

class Chatbot:
    def __init__(self, embeddings):
        self.embeddings_chroma_db = embeddings
        self.llm = Ollama(model='mistral', request_timeout=120,)# base_url="http://host.docker.internal:11434")

        llama_debug = LlamaDebugHandler(print_trace_on_end=True)
        callback_manager = CallbackManager([llama_debug])
        Settings.callback_manager = callback_manager


        indices = self.embeddings_chroma_db.indices

        query_engine_tools = self.create_query_tools(indices)


        chat_store = SimpleChatStore()

        chat_memory = ChatMemoryBuffer.from_defaults(
            token_limit=3000,
            chat_store=chat_store,
            chat_store_key="user1",
        )

        self.sub_query_engine = SubQuestionQueryEngine.from_defaults(
            query_engine_tools=query_engine_tools,
            use_async=True,
            llm=self.llm
        )
        

        self.sub_query_engine.update_prompts(
            {"question_gen:question_gen_prompt": SUB_QUERY_PROMPT,
             "response_synthesizer:text_qa_template": INITIAL_RESPONSE,
             "response_synthesizer:refine_template": FINAL_RESPONSE
             }
        )

        Settings.llm = self.llm
        Settings.context_window = 8000

    def create_query_tools(self, indecies):
        tools = []

        for name, index in indecies.items():
            description = f"useful for when you want to answer queries about {name}"
            tool = QueryEngineTool(
                query_engine=index.as_query_engine(
                    llm=self.llm, 
                    similarity_top_k=2,
                    # the target key defaults to `window` to match the node_parser's default
                    node_postprocessors=[
                        MetadataReplacementPostProcessor(target_metadata_key="window")
                    ]
                ),
                metadata=ToolMetadata(
                    name=name,
                    description=description
                )
            )
            tools.append(tool)

        return tools
    
    def query(self, query_str):
        try:
            response = self.sub_query_engine.query(query_str)
                
            out = str(response) + self.get_sources(response)
        except Exception as e:
            print(f"An error occurred: {e}")
            traceback.print_exc()

            out = "Sorry, there is no suitable tool to answer your query, please try another query."

        
        return  out

    def get_sources(self, response):   
        if hasattr(response, 'metadata'):
            document_info = response.metadata
            
            out = ('\n' + '_' * 60 + '\n' + 'DOCUMENTS USED:' + '\n')
            if document_info:
                for val in document_info.values():
                    if 'file_name' in val.keys() and 'page_label' in val.keys():
                        out += f"file : {val['file_name']} | page: {val['page_label']}\n"
                return out
            return ""


if __name__ == '__main__':
    emb = EmbeddingsChromaDB()
    chat = Chatbot(emb)

    chat.query('Compare how UNEP technology projects have differed in 2015 and 2022?')

