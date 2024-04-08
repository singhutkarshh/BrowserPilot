const availableActions = require('./availiableActions');
const getCompletions = require('./setup');


const formattedActions = availableActions.map((action, i) => {
    const args = action.args
        .map((arg) => `${arg.name}: ${arg.type}`)
        .join(', ');
    return `${i + 1}. ${action.name}(${args}): ${action.description}`;
})
    .join('\n');

const systemMessage = `  
    You are a browser automation assistant.  
    
    You can use the following tools:  
    
    ${formattedActions}  
    
    You will be be given a task to perform and the current state of the DOM. You will also be given previous actions that you have taken. You may retry a failed action up to one time.  
    
    This is an example of an action:  
    
    <Thought>I should click the add to cart button</Thought>  
    <Action>click(223)</Action>  
    
    I you are asked to go to a website you can use the navigate action:
    e.g.
    <Thought>I should navigate to example.com</Thought>
    <Action>navigate('https://www.example.com')</Action>

    You must always include the <Thought> and <Action> open/close tags or else your response will be marked as invalid.`;

async function determineNextAction(
    taskInstructions,
    previousActions,
    simplifiedDOM,
    maxAttempts = 3,
    notifyError
) {

    let prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);

    // console.log('prompt', prompt);

    for (let i = 0; i < maxAttempts; i++) {
        try {
            prompt = [
                {
                    role: 'system',
                    content: systemMessage,
                },
                { role: 'user', content: prompt },
            ];
            
            const completion = await getCompletions(prompt);

            return {
                usage: completion.usage,
                prompt,
                response:
                    completion.choices[0].message?.content?.trim() + '</Action>',
            };
        } catch (error) {
            console.log('determineNextAction error', error);
            if (error.response.data.error.message.includes('server error')) {
                notifyError(error.response.data.error.message);
            } else {
                throw new Error(error.response.data.error.message);
            }
        }
    }
    throw new Error(
        `Failed to complete query after ${maxAttempts} attempts. Please try again later.`
    );
}

function formatPrompt(
    taskInstructions,
    previousActions,
    pageContents
) {
    let previousActionsString = '';

    if (previousActions.length > 0) {
        const serializedActions = previousActions
            .map(
                (action) =>
                    `<Thought>${action.thought}</Thought>\n<Action>${action.action}</Action>`
            )
            .join('\n\n');
        previousActionsString = `You have already taken the following actions: \n${serializedActions}\n\n`;
    }

    return `The user requests the following task:  
    
    ${taskInstructions}  
    
    ${previousActionsString}  
    
    Current time: ${new Date().toLocaleString()}  
    
    Current page contents:  
    ${pageContents}`;
}

module.exports = { determineNextAction, formatPrompt };
