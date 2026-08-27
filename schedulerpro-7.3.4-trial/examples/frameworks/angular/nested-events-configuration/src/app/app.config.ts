import { DateHelper, DomClassList, EventModel, ResourceModel, SchedulerPro, Widget } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

class AppResourceModel extends ResourceModel {
    declare capacity: number;
    declare color: string;

    static override get fields() {
        return [
            'capacity',
            'color'
        ];
    }
}

class AppEventModel extends EventModel {
    declare hazardous: boolean;
    declare color: string;

    static override get fields() {
        return [
            { name : 'hazardous', type : 'boolean' },
            'color'
        ];
    }
}

const schedulerPro        = (widget: Widget): SchedulerPro => widget.up(SchedulerPro.type);
const nestedEventsFeature = (widget: Widget) => schedulerPro(widget).features.nestedEvents;

const exceeded = (appEvent: AppEventModel, capacity: number): boolean => {
    // Check how many children overlap each hour that the parent spans
    const hours = DateHelper.as('h', appEvent.duration, 'd');

    for (let i = 0; i < hours; i++) {
        const time   = DateHelper.add(appEvent.startDate, i, 'h');
        let overlaps = 0;
        for (const child of appEvent.children as Array<any>) {
            if (time >= child.startDate && time < child.endDate) {
                overlaps++;
            }
        }

        if (overlaps > capacity) {
            return true;
        }
    }

    return false;
};

export const schedulerProProps: BryntumSchedulerProProps = {
    startDate  : new Date(2022, 0, 2),
    endDate    : new Date(2022, 0, 9),
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    // Custom view preset, only using a single header row with full day names in it
    viewPreset : {
        base    : 'dayAndWeek',
        headers : [
            {
                unit       : 'day',
                dateFormat : 'dddd'
            }
        ],
        timeResolution : {
            unit      : 'hour',
            increment : 6
        }
    },
    // Use the same date format for tooltips etc
    displayDateFormat : 'dddd HH:mm',
    // Need a large row height to fit stacked nested events
    rowHeight         : 165,
    // Some more space at resource top/bottom
    resourceMargin    : 20,
    // Don't use any event style or color, makes it easier to customize the appearance
    eventStyle        : undefined,
    eventColor        : undefined,

    // Turn nested events on, not much of a demo without :)
    nestedEventsFeature : {
        // Stack nested events initially (can be changed from the toolbar)
        eventLayout  : 'stack',
        // Grow nested events a bit, compared to the default which is 30
        eventHeight  : 35,
        // Reserve more space above the nested events container
        headerHeight : 25,
        // Space between nested events
        barMargin    : 5
    },
    // Dependencies cannot be used in combination with nested events
    dependenciesFeature   : false,
    // Highlight non-working time (weekends in the demo)
    nonWorkingTimeFeature : true,
    // Turn of the schedule menu, we don't want it in the demo
    scheduleMenuFeature   : false,
    // Show event progress (without label, nested events gets in the way)
    percentBarFeature     : {
        showPercentage : false
    },
    // Snap when dragging
    eventDragFeature : {
        showExactDropPosition : true
    },
    // And when resizing
    eventResizeFeature : {
        showExactResizePosition : true
    },
    // Using a single column with a custom renderer
    columns : [
        {
            type  : 'column',
            text  : 'Station',
            field : 'name',
            width : 200,
            renderer({ record, size, grid }) {
                const resource  = record as AppResourceModel;
                const scheduler = grid as SchedulerPro;
                if (resource.capacity) {
                    const {
                        barMargin,
                        resourceMargin,
                        eventHeight,
                        headerHeight
                    } = scheduler.features.nestedEvents;
                    // Fit capacity x events + header, resource margin, barMargins etc + 1px of any over-assigned job
                    // to show that there are more
                    size.height =
                        resource.capacity * (eventHeight as number + barMargin) +
                        2 * (resourceMargin as number) +
                        headerHeight +
                        (scheduler.resourceMargin as number) * 2 +
                        1;
                }

                // Cells display an icon, name of the station (resource) and its capacity
                return [
                    {
                        tag       : 'i',
                        className : resource.iconCls
                    },
                    {
                        className : 'name',
                        text      : resource.name
                    },
                    {
                        className : 'capacity',
                        text      : `Capacity: ${resource.capacity ?? 0}`
                    }
                ];
            }
        }
    ],
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        const appEvent    = eventRecord as AppEventModel;
        const appResource = resourceRecord as AppResourceModel;

        // Parent event
        if (appEvent.isParent) {
            // Check if too many children overlap at the same point in time
            const exceedsCapacity = exceeded(
                appEvent,
                appResource.capacity
            );

            // If that is the case, apply css to make text render in red
            (renderData.wrapperCls as DomClassList).toggle('exceeded', exceedsCapacity);

            // Parent event content, name and add button or exclamation icon if capacity was exceeded
            return [
                appEvent.name,
                {
                    tag       : 'i',
                    className : exceedsCapacity ? 'fa fa-exclamation-circle' : 'add-event fa fa-plus-circle',
                    dataset   : {
                        // Tooltip for the icon
                        btip : exceedsCapacity ? 'Capacity exceeded' : 'Add job'
                    }
                }
            ];
        }
        // Nested event
        else {
            // Hazardous jobs get a different color to make them easy to spot
            renderData.style = `color: ${appEvent.hazardous ? '#9c3f10' : appEvent.color ?? appResource.color}`;
            return [
                // They also get a biohazard icon
                appEvent.hazardous
                    ? {
                        tag       : 'i',
                        className : 'fa fa-biohazard',
                        dataset   : {
                            btip : 'Hazardous'
                        }
                    }
                    : null,
                // Name displayed on all events
                appEvent.name
            ];
        }
    },

    // Demo toolbar, allows playing around with the settings of the NestedEvents feature
    tbar : {
        items : {
            // Event layout picker
            layout : {
                type     : 'combo',
                editable : false,
                items    : [
                    ['none', 'Overlap'],
                    ['stack', 'Stack'],
                    ['pack', 'Pack']
                ],
                value    : 'stack',
                onChange : ({ value, source }) => nestedEventsFeature(source).eventLayout = value
            },
            // Menu button, configs for dragging and resizing nested events
            dragResize : {
                text : 'Drag & resize settings',
                menu : [
                    {
                        type     : 'menuitem',
                        text     : 'Constrain drag to parent',
                        checked  : false,
                        onToggle : ({ checked, item }) => nestedEventsFeature(item).constrainDragToParent = checked
                    },
                    {
                        type     : 'menuitem',
                        text     : 'Nest on drop',
                        checked  : true,
                        onToggle : ({ checked, item }) => nestedEventsFeature(item).allowNestingOnDrop = checked
                    },
                    {
                        type     : 'menuitem',
                        text     : 'De-nest on drop',
                        checked  : true,
                        onToggle : ({ checked, item }) => nestedEventsFeature(item).allowDeNestingOnDrop = checked
                    },
                    {
                        type     : 'menuitem',
                        text     : 'Constrain resize to parent',
                        cls      : 'b-separator',
                        checked  : true,
                        onToggle : ({ checked, item }) => nestedEventsFeature(item).constrainResizeToParent = checked
                    }
                ]
            },
            // Menu button, configs affecting the nested event bars
            barSettings : {
                type : 'button',
                text : 'Bar settings',
                ref  : 'barSettings',
                menu : [
                    {
                        type    : 'slider',
                        ref     : 'resourceMargin',
                        text    : 'Resource margin',
                        value   : 0,
                        min     : 0,
                        max     : 20,
                        onInput : ({ value, source }) => nestedEventsFeature(source).resourceMargin = value
                    },
                    {
                        type    : 'slider',
                        ref     : 'barMargin',
                        text    : 'Bar margin',
                        value   : 5,
                        min     : 0,
                        max     : 20,
                        onInput : ({ value, source }) => nestedEventsFeature(source).barMargin = value
                    },
                    {
                        type    : 'slider',
                        ref     : 'stackedEventHeight',
                        text    : 'Stacked event height',
                        value   : 35,
                        min     : 20,
                        max     : 50,
                        onInput : ({ value, source }) => nestedEventsFeature(source).eventHeight = value
                    }
                ]
            }
        }
    }

};

export const projectProps: BryntumSchedulerProProjectModelProps = {
    autoLoad  : true,
    transport : {
        load : {
            url : './assets/data/data.json'
        }
    },
    // Force using a tree event store. This is normally detected from data, but in case you start without children
    // it can be forced. Also add some additional fields
    eventStore : {
        tree       : true,
        modelClass : AppEventModel
    },
    // Some additional fields for the resource store
    resourceStore : {
        modelClass : AppResourceModel
    }
};
