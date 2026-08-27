// Example training data which is used to "teach" the AI more complex behavior, or simply to give it more information
// on how to respond to certain prompts.
// Must be an array containing arrays of these example conversations
export const trainingData = [
    [
        {
            role    : 'user',
            content : 'Highlight all events which requires a welder'
        },
        {
            role      : 'assistant',
            toolCalls : [
                {
                    id   : '1',
                    name : 'getSkills'
                }
            ],
            // Use a description property to explain certain points more clearly
            description : 'Since the user asks about a skill, you need to find out skill names'
        },
        {
            content     : [{ id : 1, name : 'Diagnostics' }, { id : 2, name : 'Electrical' }, { id : 3, name : 'Brakes' }, { id : 4, name : 'Suspension' }, { id : 5, name : 'Engine' }, { id : 6, name : 'HVAC' }, { id : 7, name : 'Transmission' }, { id : 8, name : 'Welding' }, { id : 9, name : 'Hydraulics' }, { id : 10, name : 'Bodywork' }],
            role        : 'tool',
            description : 'From the tool response, we reason that welder = Welding with id 8'
        },
        {
            role      : 'assistant',
            toolCalls : [
                {
                    id         : '1',
                    name       : 'highlightEvents',
                    parameters : {
                        eventConditions : {
                            type       : 'all',
                            conditions : [
                                {
                                    field    : 'skills.id',
                                    operator : '=',
                                    value    : '8'
                                }
                            ]
                        }
                    }
                }
            ],
            description : 'Now the highlightEvents tool call can be made correctly'
        },
        {
            content : 'successfully highlighted 1 Events',
            role    : 'tool'
        }
    ]
];
