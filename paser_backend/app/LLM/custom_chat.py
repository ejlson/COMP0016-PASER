from llama_index.core.agent import (
    CustomSimpleAgentWorker,
    Task,
    AgentChatResponse,
)

from typing import Dict, Any, List, Tuple, Optional
from llama_index.core.tools import BaseTool, QueryEngineTool
from llama_index.core.program import LLMTextCompletionProgram
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from llama_index.core.output_parsers import PydanticOutputParser, LangchainOutputParser
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core import ChatPromptTemplate, PromptTemplate
from llama_index.core.selectors import LLMSingleSelector, LLMMultiSelector
from llama_index.core.bridge.pydantic import Field, BaseModel

from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.bridge.pydantic import PrivateAttr
from llama_index.core.agent import AgentRunner
import re
from llama_index.llms.ollama import Ollama
from llama_index.core.output_parsers.base import OutputParserException


DEFAULT_PROMPT_STR = """
You are a geography research assistant. When given a question along with context extracted from relevant geography documents, construct a concise and accurate response using the provided context to help.

Definitions:

    Actors: Refer to institutions or governments significant in socio-environmental governance.
    Networks: Focus on the relationships between these actors and how these relationships influence each other's development and progress.

Do:

    Use the context provided from geography documents to answer questions.
    Specify the title of the document(s) used for your answer at the end of your response.
    Do not say you are unable to answer a question just because it isnt answered in the context, you can contruct an answer by analysing informaiton in the context.

Do Not:

    Use solely your own knowledge outside the provided context to answer questions.
    Mention the document titles anywhere other than at the very end of your output.
    Include any document in your citation that was not used to construct your answer.
    Search for specific documents discussing time frames; instead, use information from documents within the given time frames to construct your answer.

Format for Queries About Timeframes:

    When asked about specific timeframes, derive information from any documents published within those timeframes to construct your answer.

Output Format:
<main body response>
"""

def get_chat_prompt_template(
    system_prompt: str, current_reasoning: Tuple[str, str]
) -> ChatPromptTemplate:
    system_msg = ChatMessage(role=MessageRole.SYSTEM, content=system_prompt)
    messages = [system_msg]
    for raw_msg in current_reasoning:
        if raw_msg[0] == "user":
            messages.append(
                ChatMessage(role=MessageRole.USER, content=raw_msg[1])
            )
        else:
            messages.append(
                ChatMessage(role=MessageRole.ASSISTANT, content=raw_msg[1])
            )

    print(messages)
    return ChatPromptTemplate(message_templates=messages)


class ResponseEval(BaseModel):
    """Evaluation of whether the response has an error."""

    has_error: bool = Field(
        ..., description="Whether the response has an error."
    )
    new_question: str = Field(..., description="The suggested new question.")
    explanation: str = Field(
        ...,
        description=(
            "The explanation for the error as well as for the new question."
            "Can include the direct stack trace as well."
        ),
    )



class RetryAgentWorker(CustomSimpleAgentWorker):
    """Agent worker that adds a retry layer on top of a router.

    Continues iterating until there's no errors / task is done.

    """

    prompt_str: str = Field(default=DEFAULT_PROMPT_STR)
    max_iterations: int = Field(default=10)

    _router_query_engine: RouterQueryEngine = PrivateAttr()

    def __init__(self, tools: List[BaseTool], **kwargs: Any) -> None:
        """Init params."""
        # validate that all tools are query engine tools
        for tool in tools:
            if not isinstance(tool, QueryEngineTool):
                raise ValueError(
                    f"Tool {tool.metadata.name} is not a query engine tool."
                )
        self._router_query_engine = RouterQueryEngine(
            selector=LLMSingleSelector.from_defaults(),
            query_engine_tools=tools,
            verbose=kwargs.get("verbose", True),
        )

        super().__init__(
            tools=tools,
            **kwargs,
        )

    def _initialize_state(self, task: Task, **kwargs: Any) -> Dict[str, Any]:
        """Initialize state."""
        return {"count": 0, "current_reasoning": []}

    def _run_step(
        self, state: Dict[str, Any], task: Task, input: Optional[str] = None
    ) -> Tuple[AgentChatResponse, bool]:
        """Run step.

        Returns:
            Tuple of (agent_response, is_done)

        """
        if "new_input" not in state:
            new_input = task.input
        else:
            new_input = state["new_input"]

        # first run router query engine
        response = self._router_query_engine.query(new_input)


        # append to current reasoning
        state["current_reasoning"].extend(
            [("user", new_input), ("assistant", str(response))]
        )

        # Then, check for errors
        # dynamically create pydantic program for structured output extraction based on template
        chat_prompt_tmpl = get_chat_prompt_template(
            self.prompt_str, state["current_reasoning"]
        )


        '''llm_program = LLMTextCompletionProgram.from_defaults(
            output_parser=PydanticOutputParser(output_cls=ResponseEval),
            prompt=chat_prompt_tmpl,
            llm=self.llm
        )

        print(f"%%%%\n{new_input} \n---\n{str(response)}\n%%%%")
        # run program, look at the result
        response_eval = llm_program(
            query_str=new_input, response_str=str(response)
        )
        if not response_eval.has_error:
            is_done = True
        else:
            is_done = False
        state["new_input"] = response_eval.new_question'''

        if self.verbose:
            print(f"> Question: {new_input}")
            print(f"> Response: {response}")
            #print(f"> Response eval: {response_eval.dict()}")
        is_done = True
        # return response
        # source = self.get_sources(response)

        response = str(response) # + source

        return AgentChatResponse(response=str(response)), is_done
    
    def get_sources(self, response):   
        if hasattr(response, 'metadata'):
            document_info = str(response.metadata)
            find = re.findall(r"'page_label': '[^']*', 'file_name': '[^']*'", document_info)

            sources = '\n\n'+'=' * 60+'\nContext Information' + str(find) + '\n'+'=' * 60+'\n'

            return sources

    def _finalize_task(self, state: Dict[str, Any], **kwargs) -> None:
        """Finalize task."""
        # nothing to finalize here
        # this is usually if you want to modify any sort of
        # internal state beyond what is set in `_initialize_state`
        pass

