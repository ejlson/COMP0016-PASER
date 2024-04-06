from llama_index.core import PromptTemplate

INITIAL_RESPONSE = PromptTemplate("""
Context information is below.
---------------------
{context_str}
---------------------
Given the context information and not prior knowledge, from the perspective of a highly sophisticated geography researcher answer in as much detail the query.
Query: {query_str}
Answer: 

""")

SUB_QUERY_PROMPT = PromptTemplate("""
Given a user question, and a list of tools, output a list of relevant sub-questions that will be used to find most relevant context in embeddings in json markdown that when composed can help answer the full user question (make sure the relevant organisations tools are selected):
Only one tool can be used per sub_question.
follow this output format:
```json
{{"items": [{{"sub_question": "", "tool_name": ""}}, {{"sub_question": "", "tool_name": ""}}]}}
```

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
{{"items": [{{"sub_question": "What is the revenue growth of Uber","tool_name": "uber_10k"}},{{"sub_question": "What is the EBITDA of Uber","tool_name": "uber_10k"}},{{"sub_question": "What is the revenue growth of Lyft","tool_name": "lyft_10k"}},{{"sub_question": "What is the EBITDA of Lyft","tool_name": "lyft_10k"}}]}}
```
                                     
# YOUR TURN, FILL IN THE TEMPLATE UNDER THE <Output> tag.
                                                                         
<Tools>
```json
{tools_str}
```

<User Question>
{query_str}

<Output>
```json                                     
{{"items": [{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}},{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}},{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}},{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}}]}}
```
""")

FINAL_RESPONSE = PromptTemplate("""
The original query is as follows: {query_str}
We have provided an existing answer: {existing_answer}
We have the opportunity to refine the existing answer (only if needed) with some more context below.
------------
{context_msg}
------------
Given the new context, refine the original answer to better answer the query. If the context isn't useful, return the original answer.
Refined Answer: 
""")


SUB_QUERY_PROMPT_2 = PromptTemplate("""
Given a user question, and a list of tools, output a list of relevant sub-quries that will be used to find most relevant context in embeddings in json markdown that when composed can help answer the full user question (make sure the relevant organisations tools are selected):
follow this output format:
```json
{{"items": [{{"sub_question": "", "tool_name": ""}}, {{"sub_question": "", "tool_name": ""}}]}}
```
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
{{"items": [{{"sub_question": "What is the revenue growth of Uber","tool_name": "uber_10k"}},{{"sub_question": "What is the EBITDA of Uber","tool_name": "uber_10k"}},{{"sub_question": "What is the revenue growth of Lyft","tool_name": "lyft_10k"}},{{"sub_question": "What is the EBITDA of Lyft","tool_name": "lyft_10k"}}]}}
```
                                     
# YOUR TURN, FILL IN THE TEMPLATE UNDER THE <Output> tag.
                                                                         
<Tools>
```json
{tools_str}
```

<User Question>
{query_str}

<Output>
```json                                     
{{"items": [{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}},{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}},{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}},{{"sub_question": "<Sub query goes here>","tool_name": "<tool name goes here>"}}]}}
```
""")