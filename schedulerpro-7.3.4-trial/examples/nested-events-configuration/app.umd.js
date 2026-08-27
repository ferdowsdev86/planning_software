var {
    DateHelper,
    EventHelper,
    SchedulerPro
} = window.bryntum.schedulerpro;
function exceeded(eventRecord, capacity) {
    // Check how many children overlap each hour that the parent spans
    // duration could be undefined while we're undoing transaction
    const hours = eventRecord.duration ? DateHelper.as('h', eventRecord.duration, 'd') : DateHelper.as('h', eventRecord.endDate - eventRecord.startDate, 'ms');
    for (let i = 0; i < hours; i++) {
        const time = DateHelper.add(eventRecord.startDate, i, 'h');
        let overlaps = 0;
        for (const child of eventRecord.children) {
            if (time >= child.startDate && time < child.endDate) {
                overlaps++;
            }
        }
        if (overlaps > capacity) {
            return true;
        }
    }
    return false;
}
const scheduler = new SchedulerPro({
    appendTo : 'container',
    // Project holding all demo data, automatically loaded when demo is opened
    project  : {
        autoLoad   : true,
        loadUrl    : './data/data.json',
        // Force using a tree event store. This is normally detected from data, but in case you start without children
        // it can be forced. Also add some additional fields
        eventStore : {
            tree   : true,
            fields : ['color', 'hazardous']
        },
        // Some additional fields for the resource store
        resourceStore : {
            fields : ['color', 'capacity']
        }
    },
    multiEventSelect          : true,
    // Date range to view
    startDate                 : new Date(2022, 0, 2),
    endDate                   : new Date(2022, 0, 9),
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    // Custom view preset, only using a single header row with full day names in it
    viewPreset                : {
        base    : 'dayAndWeek',
        headers : [{
            unit       : 'day',
            dateFormat : 'dddd'
        }],
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
    eventStyle        : null,
    eventColor        : null,
    // Features used by the demo
    features          : {
    // Turn nested events on, not much of a demo without :)
        nestedEvents : {
            // Stack nested events initially (can be changed from the toolbar)
            eventLayout             : 'stack',
            // Grow nested events a bit, compared to the default which is 30
            eventHeight             : 35,
            // Reserve more space above the nested events container
            headerHeight            : 25,
            // Space between nested events
            barMargin               : 5,
            // Add "Group selected events" context menu item
            showCreateGroupMenuItem : true
        },
        // Dependencies cannot be used in combination with nested events
        dependencies   : false,
        // Highlight non-working time (weekends in the demo)
        nonWorkingTime : true,
        // Turn of the schedule menu, we don't want it in the demo
        scheduleMenu   : false,
        // Show event progress (without label, nested events gets in the way)
        percentBar     : {
            showPercentage : false
        },
        // Snap when dragging
        eventDrag : {
            showExactDropPosition : true
        },
        // And when resizing
        eventResize : {
            showExactResizePosition : true
        },
        // Allow selecting multiple events & nested events using marquee selection
        eventDragSelect : {
            includeNested : true
        },
        stickyEvents : false
    },
    // Using a single column with a custom renderer
    columns : [{
        text  : 'Station',
        field : 'name',
        width : 225,
        renderer({
            record,
            size
        }) {
            if (record.capacity) {
                const {
                    barMargin,
                    resourceMargin,
                    eventHeight,
                    headerHeight
                } = scheduler.features.nestedEvents;
                // Fit capacity x events + header, resource margin, barmargins etc + 1px of any overassigned job
                // to show that there are more
                size.height = record.capacity * (eventHeight + barMargin) + 2 * resourceMargin + headerHeight + scheduler.resourceMargin * 2 + 1;
            }

            // Cells display an icon, name of the station (resource) and its capacity
            return [{
                tag       : 'i',
                className : record.iconCls
            }, {
                className : 'name',
                text      : record.name
            }, {
                className : 'capacity',
                text      : `Capacity: ${record.capacity ?? 0}`
            }];
        }
    }],
    // Custom event renderer that injects an add button (icon) in parent events
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
    // Parent event
        if (eventRecord.isParent) {
            // Check if too many children overlap at the same point in time
            const exceedsCapacity = exceeded(eventRecord, resourceRecord.capacity);

            // If that is the case, apply css to make text render in red
            renderData.wrapperCls.toggle('exceeded', exceedsCapacity);

            // Parent event content, name and add button or exclamation icon if capacity was exceeded
            return [{
                tag       : 'i',
                className : 'selection-indicator fa'
            }, eventRecord.name, {
                tag       : 'i',
                className : exceedsCapacity ? 'warning fa fa-exclamation-circle' : 'add-event fa fa-plus-circle',
                dataset   : {
                    // Tooltip for the icon
                    btip : exceedsCapacity ? 'Capacity exceeded' : 'Add job'
                }
            }];
        }
        // Nested event
        else {
            // Hazardous jobs get a different color to make them easy to spot
            renderData.style = `color: ${eventRecord.hazardous ? '#9C3F10' : eventRecord.color ?? resourceRecord.color}`;
            return [{
                tag       : 'i',
                className : 'selection-indicator fa'
            },
            // Name displayed on all events
            eventRecord.name,
            // They also get a biohazard icon
            eventRecord.hazardous ? {
                tag       : 'i',
                className : 'fa fa-biohazard',
                dataset   : {
                    btip : 'Hazardous'
                }
            } : null];
        }
    },
    // Hook called by drag creation and when double clicking to add an event. Used here to turn the added event into
    // a parent
    onEventCreated(eventRecord) {
        eventRecord.convertToParent();
    },
    // Demo toolbar, allows playing around with the settings of the NestedEvents feature
    tbar : {
        items : {
            // Event layout picker
            layout : {
                type     : 'combo',
                editable : false,
                items    : [['none', 'Overlap'], ['stack', 'Stack'], ['pack', 'Pack']],
                value    : 'stack',
                onChange({
                    value
                }) {
                    nestedEvents.eventLayout = value;
                    scheduler.widgetMap.barSettings.menu.widgetMap.stackedEventHeight.disabled = value !== 'stack';
                }
            },
            // Menu button, configs for dragging and resizing nested events
            dragResize : {
                text : 'Drag & resize settings',
                menu : [{
                    text    : 'Constrain drag to parent',
                    checked : false,
                    onToggle({
                        checked
                    }) {
                        nestedEvents.constrainDragToParent = checked;
                    }
                }, {
                    text    : 'Nest on drop',
                    checked : true,
                    onToggle({
                        checked
                    }) {
                        nestedEvents.allowNestingOnDrop = checked;
                    }
                }, {
                    text    : 'De-nest on drop',
                    checked : true,
                    onToggle({
                        checked
                    }) {
                        nestedEvents.allowDeNestingOnDrop = checked;
                    }
                }, {
                    text    : 'Constrain resize to parent',
                    cls     : 'b-separator',
                    checked : true,
                    onToggle({
                        checked
                    }) {
                        nestedEvents.constrainResizeToParent = checked;
                    }
                }]
            },
            // Menu button, configs affecting the nested event bars
            barSettings : {
                text : 'Bar settings',
                ref  : 'barSettings',
                menu : {
                    type          : 'panel',
                    labelPosition : 'align-before',
                    items         : [{
                        ref       : 'resourceMargin',
                        type      : 'slider',
                        label     : 'Resource margin',
                        showValue : 'thumb',
                        value     : 0,
                        min       : 0,
                        max       : 20,
                        onInput({
                            value
                        }) {
                            nestedEvents.resourceMargin = value;
                        }
                    }, {
                        ref       : 'barMargin',
                        type      : 'slider',
                        label     : 'Bar margin',
                        showValue : 'thumb',
                        value     : 5,
                        min       : 0,
                        max       : 20,
                        onInput({
                            value
                        }) {
                            nestedEvents.barMargin = value;
                        }
                    }, {
                        ref       : 'stackedEventHeight',
                        type      : 'slider',
                        label     : 'Stacked event height',
                        showValue : 'thumb',
                        value     : 35,
                        min       : 20,
                        max       : 50,
                        onInput({
                            value
                        }) {
                            nestedEvents.eventHeight = value;
                        }
                    }]
                }
            }
        }
    }
});

// Set up a single click listener for all the "add event" buttons in parent events
EventHelper.on({
    element  : scheduler.element,
    delegate : '.add-event',
    click(event) {
        const
            // Get event and resource from clicked element
            parentEventRecord = scheduler.resolveEventRecord(event),
            currentResource = scheduler.resolveResourceRecord(event),
            // Add a new child
            newChild = parentEventRecord.appendChild({
                name      : 'New job',
                startDate : parentEventRecord.startDate,
                duration  : 1
            });

        // Assign it the resource
        newChild.assign(currentResource);
    }
});

// Set up a var for the NestedEvents feature, to save some code in the toolbar listeners
const {
    nestedEvents
} = scheduler.features;

// Makes parent events render as normal events if all nested events are dragged out of them
// EventModel.convertEmptyParentToLeaf = true;