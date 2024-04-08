const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const client = new OpenAIClient("https://yodagpt.openai.azure.com/",
               new AzureKeyCredential("769bbebe6aef4d97941f2efe586b5497"));
  

async function getCompletions(prompt) {
    const completion = await client.getChatCompletions(
        "yoda-gpt",
        prompt,
        {
            maxTokens: 150,
            temperature: 0,
            stop: ["</Action>"]
        }
       ); 
       return completion;
       
}

module.exports = getCompletions;