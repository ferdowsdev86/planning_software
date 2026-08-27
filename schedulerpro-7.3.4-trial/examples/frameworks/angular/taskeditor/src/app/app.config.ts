import { EventModel, PercentColumn, ResourceModel, Scheduler, StringHelper, TaskEditConfig } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

// Custom event model with multiple additional fields and a reconfigured default field
class ProEvent extends EventModel {
    static override get fields() {
        return [
            { name : 'durationUnit', defaultValue : 'hour' },
            { name : 'order',  defaultValue : 'New order' },
            'cost',
            'contact',
            'phone'
        ];
    }

    declare order : string;
}

// Custom resource model with an additional field
class Resource extends ResourceModel {
    static override get fields() {
        return [
            'type'
        ];
    }
}

export const schedulerProProps : BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    project    : {
        autoLoad : true,
        loadUrl  : './assets/data/data.json',

        // Custom model classes that have additional fields
        resourceModelClass : Resource,
        eventModelClass    : ProEvent
    },
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 20,
        headers   : [
            {
                unit       : 'day',
                dateFormat : 'dddd' // Monday
            },
            {
                unit       : 'hour',
                dateFormat : 'HH' // 00-23
            }
        ]
    },

    columns : [
        {
            text  : 'Resource',
            field : 'name',
            width : 200
        },
        {
            text   : 'Type',
            field  : 'type',
            hidden : true
        },
        {
            text   : 'Tasks',
            field  : 'events.length',
            width  : 70,
            align  : 'right',
            editor : false
        },
        {
            text      : 'Allocation',
            type      : 'percent',
            editor    : false,
            sortable  : false,
            groupable : false,
            align     : 'center',
            renderer(data) {
                const record = data.record as ResourceModel;
                const grid   = data.grid as Scheduler;
                const column = data.column as PercentColumn;

                // Detect overlap
                if (record.events.some((task : EventModel) =>
                    task.isScheduled && !grid.eventStore.isDateRangeAvailable(task.startDate as Date, task.endDate as Date, task, record))
                ) {
                    return {
                        tag       : 'i',
                        className : 'fa fa-exclamation-triangle',
                        style     : 'color : red',
                        dataset   : {
                            btip : 'Overlap!'
                        }
                    };
                }

                // Calculate allocation
                const
                    duration   = record.events.reduce((total : number, task : EventModel) => total += task.duration, 0),
                    allocation = Math.round((duration / 40) * 100);

                return column.defaultRenderer({ value : allocation });
            }
        }
    ],

    timeAxis : {
        filters : [{
            filterBy(tick : {startDate : Date}) {
                return tick.startDate.getHours() > 6 && tick.startDate.getHours() < 17;
            }
        }]
    },

    eventRenderer(data) {
        const eventRecord = data.eventRecord as ProEvent;
        const resourceRecord = data.resourceRecord as ResourceModel;
        const renderData = data.renderData as { eventColor : string; style : string };

        renderData.eventColor = new Map([
            ['Order 1', '#ffefd5'],
            ['Order 2', '#87cefa'],
            ['New order', '#ffa500']
        ]).get(eventRecord.order as string) as string;

        // Highlight overlapping tasks within a resource
        if (!eventRecord.eventStore.isDateRangeAvailable(eventRecord.startDate as Date, eventRecord.endDate as Date, eventRecord, resourceRecord)) {
            renderData.eventColor = '#f08080';
        }

        renderData.style = `border-color: ${renderData.eventColor}; color: ${renderData.eventColor}`;

        return [
            {
                className : 'desc',
                children  : [
                    StringHelper.encodeHtml(eventRecord.name),
                    {
                        tag       : 'div',
                        className : 'order',
                        html      : `${eventRecord.order}, ${eventRecord.percentDone}%`
                    }
                ]
            },
            eventRecord.note ? {
                tag       : 'i',
                className : 'fa fa-sticky-note b-last',
                dataset   : {
                    btip : eventRecord.note
                }
            } : null
        ];
    },

    taskEditFeature : {
        // Change editor title
        editorConfig : {
            title : 'Edit '
        },

        // Customize its contents
        items : {
            generalTab : {
                // Customize the title of the general tab
                title : 'Common',
                items : {
                    // Hide the end date field
                    endDateField : null,
                    // Add a field to edit order name
                    orderField   : {
                        type   : 'text',
                        name   : 'order',
                        label  : 'Order',
                        // Place after name field
                        weight : 150
                    },
                    priority : {
                        type       : 'radiogroup',
                        name       : 'priority',
                        label      : 'Priority',
                        labelWidth : '6em',
                        flex       : '1 0 100%',
                        weight     : 150,  // Place before resources field
                        options    : {
                            high : 'High',
                            med  : 'Medium',
                            low  : 'Low'
                        }
                    }
                }
            },
            // Hide the notes tab
            notesTab  : null,
            // Add a custom tab with some fields
            customTab : {
                defaults : {
                    labelWidth : '5em'
                },
                title : 'Job',
                items : {
                    noteField : {
                        type  : 'text',
                        name  : 'note',
                        label : 'Note'
                    },
                    costField : {
                        type  : 'number',
                        name  : 'cost',
                        label : 'Cost'
                    },
                    contactField : {
                        type  : 'text',
                        name  : 'contact',
                        label : 'Contact'
                    },
                    phoneField : {
                        type  : 'text',
                        name  : 'phone',
                        label : 'Phone'
                    }
                },
                // Show it after generalTab, which has weight 100
                weight : 150
            }
        }
    }
};
