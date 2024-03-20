from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core import ChatPromptTemplate, Settings
from llama_index.llms.ollama import Ollama

from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.core.callbacks import CallbackManager, LlamaDebugHandler
from .custom_chat import RetryAgentWorker
from llama_index.core.agent import AgentRunner
from .embeddings import EmbeddingsChromaDB

from llama_index.core.storage.chat_store import SimpleChatStore
from llama_index.core.memory import ChatMemoryBuffer
import re

from IPython.display import Markdown, display
from llama_index.core import PromptTemplate, SelectorPromptTemplate



custom_sub_q_prompt = PromptTemplate("""
Given a user question, and a list of tools, output a list of relevant sub-questions in JSON markdown that when composed can help answer the full user question:
Ensure the output follows strict JSON format with proper use of double quotes, brackets, and braces. If comments are included for explanation, ensure they are not part of the final JSON output.
Tips:
    When given a timeframe, make sub quries of several different years to adequately search for data throughout the timeframe
                                        

# Example 1
<Tools>
```json
{{
    "uber_10k": "Provides information about Uber financials for year 2021",
    "lyft_10k": "Provides information about Lyft financials for year 2021"
}}
```

<User Question>
Compare and contrast the revenue growth and EBITDA of Uber and Lyft for year 2021


<Output>
```json
{{
    "items": [
        {{
            "sub_question": "What is the revenue growth of Uber",
            "tool_name": "uber_10k"
        }},
        {{
            "sub_question": "What is the EBITDA of Uber",
            "tool_name": "uber_10k"
        }},
        {{
            "sub_question": "What is the revenue growth of Lyft",
            "tool_name": "lyft_10k"
        }},
        {{
            "sub_question": "What is the EBITDA of Lyft",
            "tool_name": "lyft_10k"
        }}
    ]
}}
```

# Example 2
                                     
Put your subquestions into the JSON template below the output tag                                 
                                    
<Tools>
```json
{tools_str}
```

<User Question>
{query_str}

<Output>
                                     
{{
    "items": [
        {{
            "sub_question": "<Sub query goes here>",
            "tool_name": "<tool name goes here>"
        }},
        {{
            "sub_question": "<Sub query goes here>",
            "tool_name": "<tool name goes here>"
        }},
        {{
            "sub_question": "<Sub query goes here>",
            "tool_name": "<tool name goes here>"
        }},
        {{
            "sub_question": "<Sub query goes here>",
            "tool_name": "<tool name goes here>"
        }}
    ]
}}

""")


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
        self.llm = Ollama(model='mistral', request_timeout=120)

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
            llm=self.llm,
        )

        self.sub_query_engine.update_prompts(
            {"question_gen:question_gen_prompt": custom_sub_q_prompt
             }
        )

        #self.sub_query_engine.update_prompts()

        display_prompt_dict(self.sub_query_engine.get_prompts())

        main_tool = self.create_main_tool()


        Settings.llm = self.llm

        Settings.context_window = 8000

        agent_worker = RetryAgentWorker.from_tools(
            [main_tool] + query_engine_tools,
            llm=self.llm,
            verbose=True,
            callback_manager=callback_manager,
        )

        self.agent = AgentRunner(agent_worker, callback_manager=callback_manager, memory=chat_memory)

    def create_main_tool(self):
        tool = QueryEngineTool(
            query_engine=self.sub_query_engine,
            metadata=ToolMetadata(
                name="sub_question_query_engine",
                description="useful for when you want to answer queries that require using multiple tools/indices"
            )
        )

        return tool


    def create_query_tools(self, indecies):
        tools = []

        for name, index in indecies.items():
            description = f"useful for when you want to answer queries about {name}"
            tool = QueryEngineTool(
                query_engine=index.as_query_engine(llm=self.llm),
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

        response = self.sub_query_engine.query(query_str)

        out = str(response) + self.get_sources(response)
        return  out

    def get_sources(self, response):   
        if hasattr(response, 'metadata'):
            document_info = response.metadata
            
            out = ('\n' + '=' * 60 + '\n' + 'DOCUMENTS USED' + '\n' + '=' * 60 + '\n')
            for val in document_info.values():
                if 'file_name' in val.keys() and 'page_label' in val.keys():
                    out += f"file : {val['file_name']} | page: {val['page_label']}"
                    out += ('\n' + '_' * 60 + '\n')

            return out


if __name__ == '__main__':
    emb = EmbeddingsChromaDB()
    chat = Chatbot(emb)

    chat.query('Compare how UNEP technology projects have differed in 2015 and 2022?')

