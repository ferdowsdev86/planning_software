import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';
import { CustomEventModel } from './lib/CustomEvent';

type AnyObject = { [key : string] : any }

export const schedulerProps : BryntumSchedulerProps = {
    crudManager : {
        loadUrl  : 'data.json',
        autoLoad : true
    },
    rowHeight  : 80,
    barMargin  : 5,
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    // Turn off animations, to speed up the demo a bit since a lot will be on screen
    useInitialAnimation   : false,
    enableEventAnimations : false,

    // Don't track timeline context while scrolling, speeds up scrolling a bit by hitting DOM less
    updateTimelineContextOnScroll : false,

    // Disabling sticky headers speeds up scrolling a bit, since `position: sticky` promotes element to its own layer
    stickyHeaders : false,

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 200 }
    ],

    eventRenderer({ eventRecord, renderData })  {
        // Add CSS class to the event DOM based on `type` of the event
        (renderData.cls as AnyObject)[`b-type-${(eventRecord as CustomEventModel).type}`] = 1;

        // To use Vue component as event renderer we need to return `vue: true` and name of the renderer component
        // All other properties are passed to the Vue renderer component
        return {
            vue : true,
            is  : 'VueEventRenderer',
            eventRecord
        };
    },

    eventMenuFeature : {
        // We want to trigger the event menu to show when clicking our ellipsis icon
        clickTriggerSelector : '.b-sch-event .fa-ellipsis'
    },

    // We use a couple of custom fields so make them appear in the event editor popup
    eventEditFeature : {
        items : {
            typeField : {
                weight : 110,
                type   : 'container',
                cls    : 'b-widget b-field b-label-above b-has-label b-custom-buttongroup-container',
                items  : {
                    label : {
                        tag  : 'label',
                        cls  : 'b-label b-align-start',
                        html : 'Type'
                    },
                    typeButtons : {
                        type        : 'buttongroup',
                        name        : 'type',
                        toggleGroup : true,
                        items       : [
                            { text : 'Meeting', value : 'meeting' },
                            { text : 'Task', value : 'task' },
                            { text : 'Time off', value : 'timeoff' }
                        ]
                    }
                }
            },
            // Using this ref hooks dynamic toggling of fields per eventType up
            progressField : {
                text  : 'Progress',
                type  : 'slider',
                name  : 'progress',
                label : 'Progress',
                flex  : '1 1 auto'
            },
            resourceField : {
                label : 'Resources'
            }
        },

        // Use slide-in overlay editor
        editorConfig : {
            drawer   : true,
            ui       : 'plain',
            defaults : {
                labelPosition : 'above'
            }
        }
    },

    // Features that can be toggled in Custom mode
    dependenciesFeature : {
        disabled : true
    },
    resourceTimeRangesFeature : {
        disabled : true
    },
    timeRangesFeature : {
        disabled       : true,
        enableResizing : true
    },
    eventNonWorkingTimeFeature : {
        disabled : true
    },
    nonWorkingTimeFeature : {
        disabled : true
    },
    // Turn off schedule tooltip to boost scrolling performance a bit
    scheduleTooltipFeature : false,
    // Disabling sticky events speeds up scrolling a bit, since `position: sticky` promotes element to its own layer
    stickyEventsFeature    : false

};
