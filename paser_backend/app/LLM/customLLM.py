from typing import Optional, List, Mapping, Any

from llama_index.core import SimpleDirectoryReader, SummaryIndex
from llama_index.core.callbacks import CallbackManager
from llama_index.core.llms import (
    CustomLLM,
    CompletionResponse,
    CompletionResponseGen,
    LLMMetadata,
)
from llama_index.core.llms.callbacks import llm_completion_callback


class OurLLM(CustomLLM):
    context_window: int = 3900
    num_output: int = 256
    model_name: str = "Gemma"
    model: Any = None

    def __init__(self, model, num_output):
        super(OurLLM, self).__init__()
        self.model = model
        self.num_output = num_output

    @property
    def metadata(self) -> LLMMetadata:
        """Get LLM metadata."""
        return LLMMetadata(
            num_output=self.num_output,
            model_name=self.model_name,
        )

    @llm_completion_callback()
    def complete(self, prompt: str, **kwargs: Any) -> CompletionResponse:
        return CompletionResponse(text=self.model.generate(prompt, max_length=self.num_output))


    @llm_completion_callback()
    def stream_complete(
        self, prompt: str, **kwargs: Any
    ) -> CompletionResponseGen:
        response = ""
        for token in self.model.generate(prompt, max_length=self.num_output):
            response += token
            yield CompletionResponse(text=response, delta=token)