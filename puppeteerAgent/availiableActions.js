const availableActions = [
    {
        name: 'click',
        description: 'Clicks on an element',
        args: [
            {
                name: 'elementId',
                type: 'number',
            },
        ],
    },
    {
        name: 'setValue',
        description: 'Focuses on and sets the value of an input element',
        args: [
            {
                name: 'elementId',
                type: 'number',
            },
            {
                name: 'value',
                type: 'string',
            }
        ],
    },
    {
        name: 'navigate',
        description: 'Search for a url you will need to visit and navigate to a new URL',
        args: [
            {
                name: 'url',
                type: 'string',
            },
        ],
    },
    {
        name: 'finish',
        description: 'Indicates the task is finished',
        args: [],
    },
    {
        name: 'fail',
        description: 'Indicates that you are unable to complete the task',
        args: [],
    },
];

module.exports = availableActions;