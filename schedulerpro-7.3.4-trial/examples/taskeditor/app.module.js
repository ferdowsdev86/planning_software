import shared from '../_shared/shared.module.js';
import { EventModel, ResourceModel, StringHelper, SchedulerPro } from '../../build/schedulerpro.module.js';
//region "lib/ProEvent.js"

// Custom event model with multiple additional fields and a reconfigured default field
class ProEvent extends EventModel {
    static get fields() {
        return [
            { name : 'durationUnit', defaultValue : 'hour' },
            { name : 'order',  defaultValue : 'New order' },
            'jobCost',
            'contact',
            'phone',
            'priority'
        ];
    }
}

//endregion

//region "lib/Resource.js"

// Custom resource model with an additional field
class Resource extends ResourceModel {
    static get fields() {
        return [
            'type'
        ];
    }

    get percentAllocated() {
        const duration = this.events.reduce((total, task) => total += task.duration, 0);
        return Math.round((duration / 40) * 100);
    }
}

//endregion

const scheduler = new SchedulerPro({
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json',

        // Custom model classes that have additional fields
        resourceModelClass : Resource,
        eventModelClass    : ProEvent,

        // Display the editor when data is loaded
        listeners : {
            async load() {
                // Await initial calculations
                await scheduler.project.commitAsync();


                // Show the editor with 500 ms delay
                this.setTimeout(() => scheduler.editEvent(scheduler.eventStore.first, scheduler.resourceStore.getById('weld')), 500);
            }
        }
    },

    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2020, 3, 6),
    endDate    : new Date(2020, 3, 11),
    rowHeight  : 50,
    barMargin  : 0,
    eventStyle : null,

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
            width  : 80,
            align  : 'right',
            editor : false
        },
        {
            text      : 'Allocation',
            type      : 'percent',
            field     : 'percentAllocated', // A custom getter defined in .lib/Resource.js
            editor    : false,
            sortable  : false,
            groupable : false,
            align     : 'center',
            width     : 120,
            renderer(renderData) {
                const
                    { record: resource } = renderData,
                    domConfig            = this.defaultRenderer(renderData);

                // If overlapping, inject a warning icon before the progress bar to alert user
                if (resource.events.some(task =>
                    task.isScheduled && !scheduler.eventStore.isDateRangeAvailable(task.startDate, task.endDate, task, resource))
                ) {
                    return [{
                        tag       : 'i',
                        className : 'fa fa-exclamation-triangle',
                        style     : 'color : red',
                        dataset   : {
                            btip : 'Overlap!'
                        }
                    }, domConfig];
                }

                return domConfig;
            }
        }
    ],

    features : {
        group : 'type',

        percentBar : true,

        taskEdit : {
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
                        startDateField : {
                            timeField : {
                                hidden : true
                            }
                        },
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
                            type    : 'radiogroup',
                            name    : 'priority',
                            label   : 'Priority',
                            inline  : true,
                            weight  : 150,  // Place before resources field
                            span    : 3,
                            options : {
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
                    labelPosition : 'align-before',
                    title         : 'Job',
                    items         : {
                        noteField : {
                            type  : 'text',
                            name  : 'note',
                            label : 'Note'
                        },
                        jobCostField : {
                            type  : 'number',
                            name  : 'jobCost',
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
        },
        stickyEvents : false
    },

    timeAxis : {
        filters : tick => tick.startDate.getHours() > 6 && tick.startDate.getHours() < 17
    },

    eventRenderer({ eventRecord : task, resourceRecord, renderData }) {
        // CSS class needed to allow using primary color scale in styling
        renderData.cls.add('b-colorize');

        renderData.eventColor = {
            'Order 1'   : '#ffefd5',
            'Order 2'   : '#87cefa',
            'New order' : '#ffa500'
        }[task.order];

        // Highlight overlapping tasks within a resource
        if (!scheduler.eventStore.isDateRangeAvailable(task.startDate, task.endDate, task, resourceRecord)) {
            renderData.eventColor = '#f08080';
        }

        return [
            {
                className : 'desc',
                children  : [
                    StringHelper.encodeHtml(task.name),
                    {
                        tag       : 'div',
                        className : 'order',
                        html      : `${task.order}, ${task.percentDone}%`
                    }
                ]
            },
            task.note ? {
                tag       : 'i',
                className : 'fa fa-sticky-note b-last',
                dataset   : {
                    btip : StringHelper.encodeHtml(task.note)
                }
            } : null
        ];
    }
});
