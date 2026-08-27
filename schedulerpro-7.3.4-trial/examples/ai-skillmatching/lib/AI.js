import AIHelper from '../../../lib/Core/feature/ai/AIHelper.js';
import AnthropicPlugin from '../../../lib/Core/feature/ai/apiPlugins/AnthropicPlugin.js';
import GooglePlugin from '../../../lib/Core/feature/ai/apiPlugins/GooglePlugin.js';
import OpenAIPlugin from '../../../lib/Core/feature/ai/apiPlugins/OpenAIPlugin.js';
import { trainingData } from './trainingData.js';

const
    userSettingsKey      = 'ai-user-settings',
    promptHistoryKey     = 'prompt-history';
let showNoConnectionIcon = true,
    savedUserSettings    = localStorage.getItem(userSettingsKey),
    savedPromptHistory   = localStorage.getItem(promptHistoryKey);





const
    userSettings  = savedUserSettings ? JSON.parse(savedUserSettings) : {},
    promptHistory = savedPromptHistory ? JSON.parse(savedPromptHistory) : [];

export const getPlugin = model => model.includes('gpt') ? OpenAIPlugin : model.includes('gemini') ? GooglePlugin : AnthropicPlugin;

export const ai = {

    showNoConnectionIcon,
    promptUrl       : './php/prompt.php',
    textToSpeechUrl : './php/texttospeech.php',
    transcribeUrl   : './php/transcribe.php',
    feedbackUrl     : './php/feedback.php',
    trainingData,
    model           : 'gpt-4-1',
    userSettings    : { ...userSettings },
    promptHistory,
    // Expects an array of objects { id, name, apiPlugin }
    availableApis   : fetch('php/getapis.php')  .then(r => r.json().then(response => {
        return response.data.map(({ id, name }) => ({
            id,
            name,
            apiPlugin : getPlugin(id)
        }));
    })),
    chatButton : {
        appendTo  : 'container',
        tooltip   : 'Bryntum Copilot',
        chatPanel : {
            title                    : 'Bryntum Copilot',
            intro                    : { html : 'Hey there, I\'m Bob - your AI Assistant' },
            avatar                   : 'resources/avatar.webp',
            showTimestamp            : true,
            showReadAloud            : true,
            showRecordButton         : true,
            examplePrompts           : ['Reassign all Michael\'s events to Lee', 'Book Henrik for Wednesday 10.00, 2 hours "Fix cable"'],
            messageTriggersPlacement : 'below'

        }
    },
    requireConfirmationOnAdds : true,
    models                    : {
        Skill : {
            store       : 'skills',
            description : 'A skill that a Resource can have or a UnplannedTask/Event can require. Make sure to read skills before creating conditions based on the skills fields, to get correct name/id mappings'
        },
        UnplannedTask : {
            store     : 'unplanned',
            relations : {
                skills : {
                    relatedModelName : 'Skill',
                    description      : 'An array of Skill objects required for this UnplannedTask (useful for conditions). Make sure to read skills before creating conditions based on the skills field',
                    isArray          : true
                }
            },
            description : 'A number of tasks that can be assigned to a Resource with matching Skills and planned to a date'
        },
        Resource : {
            relations : {
                skills : {
                    relatedModelName : 'Skill',
                    description      : 'An array of related Skill objects this Resource have (useful for conditions). Make sure to read skills before creating conditions based on the skills field',
                    isArray          : true
                }
            }
        },
        Event : {
            relations : {
                skills : {
                    relatedModelName : 'Skill',
                    description      : 'An array of related Skill objects that are required for this Event (useful for conditions). Make sure to read skills before creating conditions based on the skills field',
                    isArray          : true
                }
            }
        }
    },
    tools : {
        getSkills             : AIHelper.createGetRecordsTool({ modelName : 'Skill' }),
        getUnplannedTask      : AIHelper.createGetRecordsTool({ modelName : 'UnplannedTask' }),
        scheduleUnplannedTask : AIHelper.createBasicTool({
            description : 'Use this to schedule and assign an unplanned task to a resource and a date. You need to read Resources to know the resourceId. If a date is not specified, you also will need to read events',
            properties  : {
                unplannedTaskId : {
                    type        : 'number',
                    description : 'The id of the unplanned task'
                },
                resourceId : {
                    type        : 'string',
                    description : 'The id of the Resource to assign this Task to. Must be an id not a name.'
                },
                date : {
                    type        : 'string',
                    description : 'The date and time to set to the unplanned task. Make sure the resource is available at that time'
                }
            },
            required : ['unplannedTaskId', 'resourceId', 'date'],
            async fn({ args }) {
                const
                    store = this.client.project.getCrudStore('unplanned'),
                    eventRecord = store.getById(args.unplannedTaskId),
                    resourceRecord = this.client.resourceStore.getById(args.resourceId);

                if (!eventRecord) {
                    return AIHelper.error('unplanned task not found');
                }
                if (!resourceRecord) {
                    return AIHelper.error('resource not found');
                }

                await this.client.scheduleEvent({
                    eventRecord,
                    resourceRecord,
                    startDate : new Date(args.date)
                });

                store.remove(eventRecord);

                return 'success';
            }
        }),
        showDetailsOfEvent : AIHelper.createConditionTool({
            description : 'Use this to display a details tooltip for a single Event. Only use this once per prompt',
            conditions  : [{ modelName : 'Event' }],
            fn({ records }) {
                const
                    event = records?.[0],
                    element = event && this.client.getElementFromEventRecord(event);

                if (element) {
                    const { tooltip } = this.client.features.eventTooltip;
                    tooltip.activeTarget = element;
                    tooltip.updateContent();
                    tooltip.showBy(element);

                    return 'success';
                }

                return AIHelper.error('event not found');
            }
        }),
        setEventIcon : AIHelper.createConditionTool({
            description : 'Assign an icon to an event',
            conditions  : [{ modelName : 'Event' }],
            properties  : {
                icon : { type : 'string', description : 'The name of a FontAwesome Free icon' }
            },
            required : ['icon'],
            fn({ args : { icon }, records }) {
                icon = icon.replace('fa-', '');
                records.forEach(eventRecord => eventRecord.iconCls = 'fa fa-' + icon);

                return 'success';
            }
        }),
        getWorkloadForResource : AIHelper.createBasicTool({
            description : 'Use this to get the total amount of planned hours of work for a specific resource during a specific time span',
            properties  : {
                resourceId : {
                    type        : 'string',
                    description : 'The id of the resource'
                },
                startDate : {
                    type        : 'string',
                    description : 'The start date of the timespan to summarize from. If omitted, the current visible range will be used.'
                },
                endDate : {
                    type        : 'string',
                    description : 'The end date of the timespan to summarize from. If omitted, the current visible range will be used.'
                }
            },
            required : ['resourceId'],
            fn({ args:{ resourceId, startDate, endDate } }) {
                const resourceRecord = this.client.resourceStore.getById(resourceId);

                if (resourceRecord) {
                    startDate && (startDate = new Date(startDate));
                    endDate && (endDate = new Date(endDate));

                    startDate ??= this.client.visibleDateRange.startDate;
                    endDate ??= this.client.visibleDateRange.endDate;

                    return resourceRecord.getBookedHours(startDate, endDate).toString();
                }

                return AIHelper.error(`resource with id ${resourceId} not found`);
            }
        })
    },
    listeners : {
        // Use this event to save the user's AI settings
        userSettingsUpdate({ changes }) {
            Object.assign(userSettings, changes);
            // In this demo, we save to localStorage
            localStorage.setItem(userSettingsKey, JSON.stringify(userSettings));
        },
        // Use this event to save the user's prompt history
        promptHistoryUpdate({ promptHistory }) {
            localStorage.setItem(promptHistoryKey, JSON.stringify(promptHistory));
        }
    }
};
