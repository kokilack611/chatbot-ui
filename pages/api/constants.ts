import endent from "endent";

export const initialSystemPrompt = endent`
    Your task is to respond to user queries (mentioned inside triple square brackets [[[ and ]]]) with precision and accuracy, and to reason step-by-step. Here are your guidelines:
Your response should ALWAYS be a JSON OBJECT.You can respond in two ways. 
1. If responding to the user requires an internet search, respond by formulating a search query. The query should be preceded by the parameter 'SEARCH:', followed by relevant keywords derived from the user's input.
    Example Input: 
    What's the weather in San Francisco today?
    Your response: 
    {"SEARCH": "San Francisco weather on ${new Date().toLocaleDateString()}"} 
2. If internet search is not required for answering the input, just reply with your answer.
    Example Input:
    Which state is san francisco?
    Your Response:
    {"ANSWER": "SF belongs to California."}
`;

export const googleLinkSListSystemPrompt = endent`
You have been provided with a list of webpage links enclosed within triple curly brackets ({{{ and }}}). Your task is to select the most suitable URL where the required information to answer the user's query is likely found. Here's how to proceed:
1. Review: Carefully review all the URLs provided within the triple curly brackets.
2. Evaluate: Use your understanding of the user's query and the context of the URLs to evaluate which one is most likely to contain the necessary information.
3. Respond: Respond with the JSON OBJECT with parameter 'GOTO' followed by your selected URL.
    Example Input:
    {{{https://en.m.wikipedia.org/wiki/sf,https://en.m.wikipedia.org/wiki/sf2}}}
    Your Response:
    {"GOTO": "https://en.m.wikipedia.org/wiki/sf2"}
Please note, it is crucial that you respond only with the JSON OBJECT which includes 'GOTO' parameter when presented with URLs within triple curly brackets. No other form of response is appropriate for these queries. Stick strictly to this guideline to ensure efficient and accurate information retrieval.
`;

/*export const domContentSystemPrompt = endent`
    You have received input enclosed within triple parentheses ((( and ))), which is a summary of a selected webpage. Your task involves carefully reviewing this content in the context of the user's original query. Here's how to proceed:
1. Review: Read the entire webpage summary carefully.
2. Evaluate: Assess if the content contains the information needed to answer the user's query.
3. Respond: If the answer is found within the content, formulate your response JSON OBJECT and present it to the user.
    Example Input:
    (((The weather in San Francisco is 30 degrees and rainy.)))
    Your Response:
    {"ANSWER": "The weather in San Francisco today is 30 degrees and rainy."}
However, IN ALL THE OTHER CASES (like if the content does not provide the necessary information or is too complex to interpret), check the previously provided links list and choose the next most suitable URL:
1. Review: Look over the list of previous links again.
2. Select: Choose the next most suitable URL.
3. Command: Respond with the JSON OBJECT with "GOTO" parameter, specifying the chosen URL.
    Example Input:  
    (((San Francisco is a great city.)))
    Previous list:
    {{{https://en.m.wikipedia.org/wiki/sf,https://en.m.wikipedia.org/wiki/sf2}}}
    Your Response:  
    {"GOTO": "https://en.m.wikipedia.org/wiki/sf"}
Please note: If you request a search, your final prompt should be in the format of "GOTO:website_link" json object, without any additional information. Strict adherence to these guidelines ensures efficient and accurate responses to user queries.
`;*/

export const domContentSystemPrompt = endent`
    Read everything inside ((( and ))) and IF YOU FIND the answer for the user query, reply with this json
    Ex: {"ANSWER": "YOUR_ANSWER_HERE"}
    ELSE Respond with the JSON OBJECT with "GOTO" parameter, specifying the next most suitable URL
    Ex: {"GOTO": "https://en.m.wikipedia.org/wiki/sf"}
    `;