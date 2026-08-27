var {
    Scheduler,
    DateHelper
} = window.bryntum.schedulerpro;
//region "lib/data.js"

class Data {
    static resources = [{
        id   : 'a',
        name : 'Arcady',
        role : 'Developer'
    }, {
        id   : 'b',
        name : 'Dave',
        role : 'Sales'
    }, {
        id   : 'c',
        name : 'Henrik',
        role : 'Sales'
    }, {
        id   : 'd',
        name : 'Linda',
        role : 'Developer'
    }, {
        id   : 'e',
        name : 'Maxim',
        role : 'Developer'
    }, {
        id   : 'f',
        name : 'Mike',
        role : 'Sales'
    }, {
        id   : 'g',
        name : 'Lee',
        role : 'CEO'
    }, {
        id   : 'h',
        name : 'Madison',
        role : 'CTO'
    }];
    static events = [{
        id         : 1,
        resourceId : 'a',
        name       : 'Team scrum',
        startDate  : '2022-02-07 11:00',
        endDate    : '2022-02-07 13:00',
        location   : 'Some office',
        eventType  : 'meeting',
        eventColor : '#ff0000',
        iconCls    : 'fa fa-users'
    }, {
        id         : 2,
        resourceId : 'b',
        name       : 'Prepare campaign',
        startDate  : '2022-02-07 12:00',
        endDate    : '2022-02-07 15:00',
        location   : 'Home office',
        eventType  : 'internal',
        eventColor : 'indigo',
        iconCls    : 'fa fa-image'
    }, {
        id         : 3,
        resourceId : 'c',
        name       : 'Marketing meeting',
        startDate  : '2022-02-07 13:00',
        endDate    : '2022-02-07 16:00',
        location   : 'Customer office',
        eventType  : 'meeting',
        eventColor : 'orange',
        iconCls    : 'fa fa-calendar'
    }, {
        id         : 4,
        resourceId : 'd',
        name       : 'Coding session',
        startDate  : '2022-02-07 09:00',
        endDate    : '2022-02-07 11:00',
        location   : 'Some office',
        eventType  : 'internal',
        eventColor : 'indigo',
        iconCls    : 'fa fa-code'
    }, {
        id         : 5,
        resourceId : 'e',
        name       : 'UX improvements',
        startDate  : '2022-02-07 10:00',
        endDate    : '2022-02-07 13:00',
        location   : 'Home office',
        type       : 'Dental',
        eventType  : 'internal',
        eventColor : 'indigo',
        iconCls    : 'fa fa-code'
    }, {
        id         : 6,
        resourceId : 'f',
        name       : 'Customer meeting',
        startDate  : '2022-02-07 11:00',
        endDate    : '2022-02-07 14:00',
        location   : 'Customer office',
        type       : 'Medical',
        eventType  : 'appointment',
        eventColor : 'orange',
        iconCls    : 'fa fa-calendar'
    }, {
        id         : 7,
        resourceId : 'g',
        name       : 'Golf',
        startDate  : '2022-02-07 14:00',
        endDate    : '2022-02-07 17:00',
        location   : 'Home office',
        type       : 'Medical',
        eventType  : 'appointment',
        eventColor : 'green',
        iconCls    : 'fa fa-golf-ball'
    }, {
        id         : 8,
        resourceId : 'h',
        name       : 'Golf',
        startDate  : '2022-02-07 14:00',
        endDate    : '2022-02-07 17:00',
        location   : 'Customer office',
        type       : 'Dental',
        eventType  : 'appointment',
        eventColor : 'green',
        iconCls    : 'fa fa-golf-ball'
    }];
}

//endregion

const {
        resources,
        events
    } = Data,
    scheduler = new Scheduler({
        resources,
        events,
        appendTo       : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom     : true,
        startDate      : new Date(2022, 1, 7, 6),
        endDate        : new Date(2022, 1, 7, 19),
        viewPreset     : 'hourAndDay',
        rowHeight      : 70,
        barMargin      : 15,
        snap           : true,
        allowOverlap   : false,
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        multiEventSelect : true,
        eventStyle       : 'rounded',
        tickSize         : 80,
        features         : {
            scheduleTooltip : false,
            eventDrag       : {
                snapToResource : true
            },
            timeSelection : {
                selectOnClick    : true,
                enableDragSelect : true,
                selectedTimeSpan : {
                    startDate : new Date(2022, 1, 7, 10),
                    endDate   : new Date(2022, 1, 7, 12)
                },
                // Uncomment to show a tooltip when hovering the time selection header element
                // tooltipTemplate({ startDate, endDate }) {
                //     const count = this.client.resourceStore.getAvailableResources({ startDate, endDate }).length;
                //     return `${count || 'No'} available resource${count > 1 ? 's' : ''}`;
                // },

                headerRenderer({
                    timeRange
                }) {
                    return `<span class='b-selection-start'>${DateHelper.format(timeRange.startDate, 'LST')}</span>
                        <button class='fa fa-plus' data-btip='Create event' aria-label="Create event"></button>
                        <span class='b-selection-end'>${DateHelper.format(timeRange.endDate, 'LST')}</span>
                        <i class='b-icon b-icon-close' data-ref="closeButton" data-btip='Close' aria-label="Close"></i>`;
                }
            }
        },
        columns : [{
            type  : 'resourceInfo',
            width : 150,
            text  : 'Staff'
        }],
        tbar : [{
            type       : 'combo',
            label      : 'On selection:',
            ref        : 'selectionChangeAction',
            inputWidth : 275,
            value      : 'select',
            editable   : false,
            items      : [{
                text  : 'Do nothing',
                value : ''
            }, {
                text    : 'Select intersecting events',
                pressed : true,
                value   : 'select'
            }, {
                text  : 'Filter out unavailable resources',
                value : 'filterout'
            }],
            onChange : 'up.onComboChange'
        }, {
            type        : 'buttongroup',
            rendition   : 'padded',
            ref         : 'selectionStyle',
            toggleGroup : true,
            items       : [{
                text  : 'Click',
                value : 'click'
            }, {
                text    : 'Drag-select',
                value   : 'drag',
                pressed : true
            }],
            onChange : 'up.onSelectionTypeChange'
        }, {
            text    : 'Select 10 AM - 12 PM',
            onClick : () => scheduler.features.timeSelection.selectedTimeSpan = {
                startDate : new Date(2022, 1, 7, 10),
                endDate   : new Date(2022, 1, 7, 12)
            }
        }, {
            type : 'widget',
            ref  : 'selectionLabel'
        }],
        onSelectionTypeChange({
            value
        }) {
            this.features.timeSelection.enableDragSelect = value === 'drag';
        },
        onTimeSelectionChange({
            startDate,
            endDate
        }) {
            const {
                selectionLabel,
                selectionChangeAction
            } = this.widgetMap;
            if (!selectionChangeAction.value) {
                this.resourceStore.clearFilters();
                return;
            }
            const intersectingEvents = startDate && this.eventStore.getEvents({
                    startDate,
                    endDate
                }),
                availableResources = startDate ? this.resourceStore.getAvailableResources({
                    startDate,
                    endDate
                }).length : this.resourceStore.count;
            if (startDate && selectionChangeAction.value === 'select') {
                this.resourceStore.clearFilters();
                // When time selection changes if "Select events" button is pressed we select all intersecting events
                this.selectedEvents = intersectingEvents;
            }
            else {
                if (!startDate) {
                    this.resourceStore.clearFilters();
                }
                else {
                    // We filter out all unavailable resources to quickly see the available slots
                    this.resourceStore.filter({
                        filters : resource => this.isDateRangeAvailable(startDate, endDate, null, resource),
                        replace : true
                    });
                }
            }
            selectionLabel.html = startDate ? `${availableResources} available resources, ${intersectingEvents.length} intersecting events` : '';
        },
        // When clicking the + icon in the header element, create a new event for each unallocated resource
        onTimeSelectionElementClick({
            domEvent,
            startDate,
            endDate
        }) {
            if (domEvent.target.matches('button')) {
                const toAdd = this.resourceStore.getAvailableResources({
                    startDate,
                    endDate
                }).map(resource => ({
                    name       : 'New task',
                    resourceId : resource.id,
                    iconCls    : 'fa fa-star',
                    startDate,
                    endDate
                }));
                this.selectedEvents = this.eventStore.add(toAdd);
            }
        },
        onComboChange({
            source
        }) {
            const {
                selectedTimeSpan
            } = this.features.timeSelection;
            if (selectedTimeSpan) {
                this.onTimeSelectionChange(selectedTimeSpan);
            }
        }
    });