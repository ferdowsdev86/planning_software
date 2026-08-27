import shared from '../_shared/shared.module.js';
import { AIHelper, AnthropicPlugin, GooglePlugin, OpenAIPlugin, DragHelper, StringHelper, DomHelper, Model, EventModel, ResourceModel, DateHelper, Grid, SchedulerPro } from '../../build/schedulerpro.module.js';
//region "lib/trainingData.js"

// Example training data which is used to "teach" the AI more complex behavior, or simply to give it more information
// on how to respond to certain prompts.
// Must be an array containing arrays of these example conversations
const trainingData = [
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

//endregion

//region "lib/AI.js"

const
    userSettingsKey      = 'ai-user-settings',
    promptHistoryKey     = 'prompt-history';
let showNoConnectionIcon = true,
    savedUserSettings    = localStorage.getItem(userSettingsKey),
    savedPromptHistory   = localStorage.getItem(promptHistoryKey);





const
    userSettings  = savedUserSettings ? JSON.parse(savedUserSettings) : {},
    promptHistory = savedPromptHistory ? JSON.parse(savedPromptHistory) : [];

const getPlugin = model => model.includes('gpt') ? OpenAIPlugin : model.includes('gemini') ? GooglePlugin : AnthropicPlugin;

const ai = {

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

//endregion

//region "lib/Drag.js"

// Handles dragging unscheduled appointment from the grid onto the schedule
class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        autoSizeClonedTarget : false,
        unifiedProxy         : true,
        swapWhenDropOnEvent  : true,
        // Prevent removing proxy on drop, we adopt it for usage in the Schedule
        removeProxyAfterDrop : false,

        // Don't drag the actual row element, clone it
        cloneTarget        : true,
        // Only allow drops on the schedule area
        dropTargetSelector : '.b-timeline-sub-grid .b-grid-row:not(.b-group-row),.b-sch-event-wrap',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector     : '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement, initialXY) {
        const
            { schedule, grid } = this,
            { isHorizontal }   = schedule,
            draggedAppointment = grid.getRecordFromElement(grabbedElement),
            proxy              = document.createElement('div'),
            sizeProp           = isHorizontal ? 'width' : 'height',
            crossSizeProp      = isHorizontal ? 'height' : 'width',
            // In horizontal mode resource lanes are rows (cross size = row height); in vertical mode they
            // are columns (cross size = resource column width)
            crossSize          = (isHorizontal ? schedule.rowHeight : schedule.resourceColumnWidth) - (2 * schedule.resourceMargin);

        proxy.style.cssText = '';
        proxy.style[sizeProp]      = schedule.tickSize - (2 * schedule.resourceMargin) + 'px';
        proxy.style[crossSizeProp] = crossSize + 'px';

        // Fake an event bar
        proxy.classList.add('b-sch-event-wrap', 'b-style-tonal', `b-sch-${schedule.mode}`, 'b-colorized');
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <i class="b-icon b-${draggedAppointment.iconCls}"></i>
                    <div>
                        <div>${draggedAppointment.name}</div>
                    </div>
                </div>
            </div>
        `;

        return proxy;
    }

    onDragStart({ context }) {
        const
            me                 = this,
            { schedule, grid } = me,
            { selectedRecord } = grid;

        // save a reference to the task being dragged so we can access them later
        context.task = selectedRecord;
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule } = this,
            { task }     = context,
            coordinate   = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            newStartDate = schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            technician   = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);

        if (!technician) {
            return;
        }

        // Validate the drop position
        context.valid = newStartDate && technician.canPerformTask(task, newStartDate);

        // Save reference to the technician so we can use it in onTaskDrop
        context.technician = technician;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned appointment to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            me                 = this,
            { schedule, grid } = me;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const
                { task, element, technician } = context,
                sizeProp                      = schedule.isHorizontal ? 'offsetWidth' : 'offsetHeight',
                coordinate                    = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element) + (element[sizeProp] / 2),
                dropDate                      = schedule.getDateFromCoordinate(coordinate, 'round', false),
                // We schedule the task on the first available time slot for the day
                firstAvailableDaySlot         = technician.getFirstAvailableTimeSlot(dropDate, task);

            if (firstAvailableDaySlot) {
                await schedule.scheduleEvent({
                    eventRecord    : task,
                    startDate      : firstAvailableDaySlot,
                    // Assign to the technician (resource) it was dropped on
                    resourceRecord : technician,
                    element
                });

                grid.store.remove(task);
            }
            else {
                context.valid = false;
            }
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}

//endregion

//region "lib/Skill.js"

class Skill extends Model {
    static fields = [
        // Add additional Skill related fields here
        { name : 'name', description : 'The name of the skill' }
    ];

    get classDisplayName() {
        return this.name;
    }
}

//endregion

//region "lib/Task.js"

// Custom Task model, based on EventModel with additional fields and changed defaults
class Task extends EventModel {
    static fields = [
        { name : 'iconCls', defaultValue : 'fa fa-bus' },
        { name : 'licensePlate', defaultValue : '', description : 'The license plate of the vehicle being worked on' },
        { name : 'skillIds', type : 'array' },
        { name : 'durationUnit', defaultValue : 'h' },
        { name : 'skills' }
    ];

    get skills() {
        const skillStore = this.firstStore?.crudManager.getCrudStore('skills');
        return skillStore && this.skillIds ? skillStore.getByIds(this.skillIds) : [];
    }

    get requiredSkillNames() {
        return this.skills?.map(s => s.name) || [];
    }
}

//endregion

//region "lib/Technician.js"

// Custom Technician resource model, based on ResourceModel with additional fields
class Technician extends ResourceModel {
    static fields = [
        { name : 'id', description : 'Unique identifier' },
        { name : 'name', description : 'The name of the technician' },
        { name : 'skillIds', type : 'array', defaultValue : [] },
        { name : 'skills' },
        { name : 'type', description : 'The type of resource (e.g. Mechanics, Technicians)' },
        { name : 'hoursPerDay', defaultValue : 8, description : 'The maximum hours a resource is allowed to work per day. Always take this number into account when rescheduling or reassigning tasks to another resource.' },
        { name : 'hoursPerWeek', defaultValue : 40, description : 'The maximum hours a resource is allowed to work per week. Always take this number into account when rescheduling or reassigning tasks to another resource.' }
    ];

    getBookedHours(startDate, endDate) {
        let total = 0;
        this.events.forEach(eventRecord => {
            if (DateHelper.intersectSpans(eventRecord.startDate, eventRecord.endDate, startDate, endDate)) {
                total += eventRecord.duration;
            }
        });

        return total;
    }

    canPerformTask(taskRecord, startDate) {
        const
            {
                skillIds : requiredSkills,
                calendar
            }                     = taskRecord,
            endDate               = startDate && DateHelper.add(startDate, taskRecord.duration, taskRecord.durationUnit),
            skillsMatch           = !requiredSkills || requiredSkills.every(skillId => this.skillIds?.includes(skillId)),
            hasEnoughAvailability = Boolean(!startDate || this.getFirstAvailableTimeSlot(startDate, taskRecord));

        return skillsMatch && (!startDate || (
            // Respect technician working time
            (!calendar || calendar.isWorkingTime(startDate, endDate, true)))) &&
            hasEnoughAvailability;
    }

    get skills() {
        const skillStore = this.firstStore?.crudManager.getCrudStore('skills');
        return skillStore && this.skillIds ? skillStore.getByIds(this.skillIds) : [];
    }

    get skillNames() {
        return this.skills?.map(s => s.name) || '';
    }

    getEventsForDay(date) {
        return this.getEventsInRange(date, DateHelper.add(date, 1, 'day'));
    }

    getEventsInRange(startDate, endDate) {
        return this.events.filter(eventRecord => DateHelper.intersectSpans(startDate, endDate, eventRecord.startDate, eventRecord.endDate));
    }

    getFirstAvailableTimeSlot(date, taskRecord) {
        date = DateHelper.clearTime(date);

        const availabilityRange = this.effectiveCalendar.getWorkingTimeRanges(date, DateHelper.add(date, 1, 'day'))[0];

        if (availabilityRange) {
            let eventsOnDate = this.getEventsForDay(date);

            if (DateHelper.isSameDate(taskRecord.startDate, date)) {
                eventsOnDate = eventsOnDate.filter(ev => ev !== taskRecord);
            }

            const
                nextStartSlot          = eventsOnDate[eventsOnDate.length - 1]?.endDate || availabilityRange.startDate,
                remainingAvailableTime = availabilityRange.endDate - nextStartSlot;

            if (remainingAvailableTime >= taskRecord.durationMS) {
                return nextStartSlot;
            }
        }
    }
}

//endregion

//region "lib/UnplannedGrid.js"

// Custom grid that displays unplanned maintenance tasks
class UnplannedGrid extends Grid {
    static $name = 'UnplannedGrid';

    static configurable = {
        hideHeaders                : true,
        rowHeight                  : 65,
        disableGridRowModelWarning : true,
        collapsible                : true,
        flex                       : '0 0 320px',
        ui                         : 'toolbar',
        title                      : 'Unplanned maintenance',
        emptyText                  : 'No unplanned maintenance',
        selectionMode              : {
            multiSelect : false
        },
        features : {
            stripe : true,
            sort   : 'name'
        },

        columns : [
            {
                flex       : 1,
                field      : 'name',
                id         : 'name', // for state
                cellCls    : 'unscheduledNameCell',
                htmlEncode : false,
                renderer   : ({ record : task }) => `
                        <div class="vehicle-ct">
                            <i class="${StringHelper.encodeHtml(task.iconCls) || ''}"></i>
                            <span class="licensePlate">${StringHelper.encodeHtml(task.licensePlate)}</span>
                        </div>
                        <div class="name-container">
                            <div class="main-info"><span class="task-name">${StringHelper.encodeHtml(task.name)}</span></div>
                            <div class="meta-info"><ul class="skills">${task.requiredSkillNames.map(skill => `<li data-btip="This task requires a technician with the following skills: <strong>${task.requiredSkillNames.join(', ')}</strong>">${skill}</li>`).join('')}</ul><span class="duration">${task.duration ? task.duration + 'h' : ''}</span></div>
                        </div>
                    `
            }
        ]
    };
}

//endregion

//region "lib/MainSchedule.js"

// Customized scheduler displaying planned maintenance work for vehicles
class MainSchedule extends SchedulerPro {
    static $name = 'Schedule';

    static configurable = {
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        rowHeight                 : 65,
        barMargin                 : 7,
        tickSize                  : 150,
        fillTicks                 : true,
        eventStyle                : 'tonal',
        eventColor                : 'indigo',
        useInitialAnimation       : false,
        zoomOnMouseWheel          : false,
        zoomOnTimeAxisDoubleClick : false,
        title                     : 'Planned maintenance activities',
        ui                        : 'toolbar',
        autoCreate                : {
            useEventModelDefaults : true
        },
        features : {
            scheduleMenu      : false,
            eventDragCreate   : false,
            dependencies      : false,
            calendarHighlight : {
                calendar : 'resource',
                inflate  : {
                    x : -8,
                    y : -1
                },
                collectAvailableResources({ scheduler, eventRecords }) {
                    return scheduler.resourceStore.query(technician => technician.canPerformTask(eventRecords[0]));
                }
            },
            scheduleTooltip : false,
            columnLines     : true,
            group           : {
                field        : 'type',
                headerHeight : 45,
                showCount    : false
            },
            resourceNonWorkingTime : {
                enableMouseEvents : true
            },
            filterBar : {
                compactMode : true
            },
            // Configure event menu items with correct phrases (could also be done through localization)
            eventMenu : {
                items : {
                    splitEvent : false,
                    unassign   : {
                        icon : 'fa fa-calendar-xmark',
                        text : 'Move to unplanned list',
                        onItem({ eventRecord }) {
                            const { project } = eventRecord;
                            eventRecord.remove();

                            project.getCrudStore('unplanned').add(eventRecord);
                        }
                    }
                }
            },
            eventResize : false,
            eventDrag   : {
                tooltipTemplate : ({ eventRecord, startDate, newResource }) => {
                    const firstAvailableTimeSlot = newResource.isSpecialRow ? null : newResource.getFirstAvailableTimeSlot(startDate, eventRecord);

                    return `<div class="b-tooltip-section">
                        <strong><i class="fa fa-calendar-days"'}"></i>Schedule on</strong>
                        ${DateHelper.format(startDate, 'MMM DD')}
                    </div>
                    <div class="b-tooltip-section">
                        <strong><i class="fa fa-tools"'}"></i>Required skills</strong>
                        <ul class="skills">
                            ${eventRecord.skills.map(skillRecord => `<li><i class="fa fa-${!newResource.isSpecialRow && newResource.skillIds?.includes?.(skillRecord.id) ? 'check' : 'xmark'}"></i>${StringHelper.encodeHtml(skillRecord.name)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="b-tooltip-section">
                        <strong><i class="fa fa-clock"'}"></i>Resource availability</strong>
                        <i class="fa fa-${firstAvailableTimeSlot ? 'check' : 'xmark'}"></i> ${firstAvailableTimeSlot ? DateHelper.format(firstAvailableTimeSlot, 'LST') : 'No availability'}
                    </div>
                    `;
                },
                // Validation method, called as you drag events around in the schedule
                validatorFn({ eventRecords, newResource, startDate }) {
                    const
                        task  = eventRecords[0],
                        valid = newResource.canPerformTask(task, startDate);

                    return valid;
                }
            },
            eventTooltip : {
                template({ eventRecord }) {
                    return `<div class="field"><label>Task</label><span>${StringHelper.encodeHtml(eventRecord.name)}</span></div>
                        <div class="field"><label>Required skills</label><ul class="skills">${eventRecord.requiredSkillNames.map(skill => `<li>${skill}</li>`).join('')}</ul></div>
                        <div class="field"><label>Start</label><span>${DateHelper.format(eventRecord.startDate, 'MMM DD LST')}</span></div>
                        <div class="field"><label>Duration</label><span>${eventRecord.fullDuration}</span></div>
                        <div class="field"><label>Assigned to</label><span>${StringHelper.encodeHtml(eventRecord.resource.name)}</span></div>
                        <div class="field"><label>Completed</label><span></span></div>
                    `;
                }
            },
            taskEdit : {
                editorConfig : {
                    title : 'Task'
                },

                // Add items to the General tab
                items : {
                    generalTab : {
                        items : {
                            resourcesField : {
                                label : 'Technician'
                            },
                            effortField  : false,
                            // Add a vehicle field
                            vehicleField : {
                                type   : 'text',
                                name   : 'licensePlate',
                                label  : 'Vehicle',
                                // Place after name field
                                weight : 150
                            },
                            skillField : {
                                type         : 'combo',
                                multiSelect  : true,
                                idField      : 'id',
                                displayField : 'name',
                                label        : 'Skills',
                                name         : 'skillIds',
                                weight       : 160
                            }
                        }
                    }
                }
            },
            stickyEvents : false
        },

        // Define the columns to use
        columns : [
            {
                type           : 'resourceInfo',
                id             : 'resourceInfo', // for state
                text           : 'Staff',
                width          : 300,
                showEventCount : false,
                // Show skills each technician has
                showMeta(resourceRecord) {
                    const
                        { skillNames = [] }    = resourceRecord,
                        { startDate, endDate } = this.grid,
                        bookedHours            = resourceRecord.getBookedHours(startDate, endDate),
                        overAllocated          = bookedHours > resourceRecord.hoursPerWeek;

                    return `<ul class="skills">${skillNames.map(skill => `<li>${StringHelper.encodeHtml(skill)}</li>`).join('')}</ul>
                        <div data-btip="${bookedHours}h / ${resourceRecord.hoursPerWeek} allocated"><i class="fa ${overAllocated ? 'fa-triangle-exclamation' : 'fa-clock'}"></i>${bookedHours} / ${resourceRecord.hoursPerWeek}</div>`;
                },
                filterable : {
                    filterField : {
                        triggers : {
                            search : {
                                cls : 'fa fa-filter'
                            }
                        },
                        placeholder : 'Staff'
                    }
                }
            }
        ],

        // Custom view preset with single header row configuration
        viewPreset : {
            base      : 'dayAndWeek',
            shiftUnit : 'week',
            headers   : [
                {
                    unit       : 'd',
                    align      : 'center',
                    dateFormat : 'ddd DD'
                }
            ]
        },

        // navigation buttons
        tools : [
            {
                type      : 'button',
                icon      : 'fa fa-chevron-left',
                rendition : 'text',
                onAction  : 'up.onPreviousWeekClick'
            },
            {
                type      : 'button',
                text      : 'Today',
                rendition : 'text',
                onAction  : 'up.onTodayClick'
            },
            {
                type      : 'button',
                icon      : 'fa fa-chevron-right',
                rendition : 'text',
                onAction  : 'up.onNextWeekClick'
            },
            {
                type      : 'button',
                text      : 'Auto-schedule',
                icon      : 'fa fa-wand-magic-sparkles',
                rendition : 'text',
                tooltip   : 'Tries to fit the unplanned events into the currently displayed timeframe',
                onAction  : 'up.onAutoScheduleClick'
            }
        ],

        onNextWeekClick() {
            this.shiftNext();
        },

        onTodayClick() {
            this.scrollToDate(new Date());
        },

        onPreviousWeekClick() {
            this.shiftPrevious();
        },

        async onAutoScheduleClick() {
            const
                unplannedStore = this.project.getCrudStore('unplanned'),
                toRemove       = [];

            this.suspendRefresh();

            // Basic implementation of assigning unplanned tasks to available resources
            for (let i = unplannedStore.count - 1; i >= 0; --i) {
                const eventRecord = unplannedStore.getAt(i);

                this.resourceStore.forEach(technicianRecord => {
                    if (technicianRecord.hoursPerWeek - technicianRecord.getBookedHours(this.startDate, this.endDate) < eventRecord.duration) {
                        return;
                    }
                    this.timeAxis.forEach(({ startDate })  => {
                        startDate = technicianRecord.getFirstAvailableTimeSlot(startDate, eventRecord);
                        if (startDate && technicianRecord.canPerformTask(eventRecord, startDate)) {
                            // Collect records to remove instead of removing right away, which would cause multiple
                            // UI refreshes
                            toRemove.push(eventRecord);
                            this.scheduleEvent({
                                eventRecord,
                                startDate,
                                resourceRecord : technicianRecord
                            });
                            return false;
                        }
                    });
                    return eventRecord.resources.length === 0;
                }, undefined, { includeCollapsedGroupRecords : true });

                await this.project.commitAsync();
            }
            this.resumeRefresh();

            // Remove from unplanned in one go, only causing a single refresh of the grid
            unplannedStore.remove(toRemove);
        }
    };

    construct() {
        super.construct(...arguments);

        // Populate the skills combo in the event editor
        this.features.taskEdit.items.generalTab.items.skillField.store = this.project.getCrudStore('skills');
    }

    // Return a DOM config object for what to show inside the event bar (you can return an HTML string too)
    eventRenderer({ eventRecord }) {
        return [
            {
                class    : 'b-event-header',
                children : [{
                    class : 'b-event-name',
                    text  : eventRecord.name
                },
                {
                    class : 'b-event-duration',
                    text  : eventRecord.fullDuration.toString(true)
                }]
            },
            {
                class : 'licensePlate',
                html  : StringHelper.xss`<div>Vehicle: ${eventRecord.licensePlate}</div>`
            }
        ];
    }

    // Remove highlights on days when there already are events
    onBeforeRenderCalendarHighlights(event) {
        const { events, highlights } = event;

        if (events.length) {
            event.highlights = highlights.filter(h => !events.some(e => DateHelper.isEqual(e.startDate, h.startDate, 'day')));
        }
    }

    getResourceImage(resource) {
        return this.resourceImagePath + (resource.image !== false ? StringHelper.encodeHtml(resource.name.toLowerCase() + '.jpg') : 'none.png');
    }

    onBeforeEventEditShow({ editor, eventRecord }) {
        editor.widgetMap.vehicleField.readOnly = !eventRecord.isCreating;
    }
}

//endregion

//region "lib/Schedule.js"

class Schedule extends MainSchedule {
    static $name = 'Schedule';

    static configurable = {
        features : {
            ai
        }
    };
}

//endregion

// Displays planned sessions
const schedule = new Schedule({
    ref        : 'schedule',
    appendTo   : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2024, 10, 4),
    endDate    : new Date(2024, 10, 9),
    flex       : 1,

    project : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Technician,
            sorters    : [{ field : 'name', ascending : true }]
        },
        eventStore : {
            modelClass : Task
        },
        loadUrl    : 'data/data.json',
        crudStores : [
            {
                id         : 'skills',
                modelClass : Skill
            },
            {
                id                  : 'unplanned',
                modelClass          : Task,
                reapplySortersOnAdd : true
            }
        ]
    }
});

// Holds unplanned sessions, that can be dragged to the schedule
const unplannedGrid = new UnplannedGrid({
    ref         : 'unplanned',
    collapsible : true,
    appendTo    : 'main',
    store       : schedule.project.getCrudStore('unplanned'),
    listeners   : {
        selectionChange() {
            schedule.highlightResourceCalendarsForEventRecords(this.selectedRecords);
        }
    }
});

// Handles dragging
const drag = new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});
