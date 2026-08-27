var {
    ResourceModel,
    EventModel,
    DateHelper,
    SchedulerPro,
    StringHelper
} = window.bryntum.schedulerpro;
//region "lib/DriverResource.js"

class DriverResource extends ResourceModel {
    static get fields() {
        return ['vehicle', 'active'];
    }
}

//endregion

//region "lib/EventWithBoundaries.js"

class EventWithBoundaries extends EventModel {
    static get fields() {
        return ['minStartTime', 'maxEndTime',
            // override field defaultValue to hours
            {
                name         : 'durationUnit',
                defaultValue : 'h'
            }];
    }
    get minStartDate() {
        if (this.minStartTime) {
            const start = DateHelper.startOf(this.startDate);
            start.setHours(this.minStartTime);
            return start;
        }
    }
    get maxEndDate() {
        if (this.maxEndTime) {
            const end = DateHelper.startOf(this.endDate);
            end.setHours(this.maxEndTime);
            return end;
        }
    }
}

//endregion

const scheduler = new SchedulerPro({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    flex       : 1,
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project    : {
        autoLoad        : true,
        eventModelClass : EventWithBoundaries,
        resourceStore   : {
            modelClass : DriverResource,
            sorters    : [{
                field     : 'name',
                ascending : true
            }]
        },
        loadUrl : './data/data.json'
    },
    startDate      : new Date(2022, 4, 25, 7),
    endDate        : new Date(2022, 4, 25, 20),
    rowHeight      : 80,
    barMargin      : 10,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventColor     : 'blue',
    eventStyle     : 'filled',
    timeResolution : {
        unit      : 'min',
        increment : 20
    },
    snap       : true,
    viewPreset : {
        base    : 'hourAndDay',
        headers : [{
            unit       : 'd',
            align      : 'center',
            dateFormat : 'LL'
        }, {
            unit       : 'h',
            align      : 'center',
            dateFormat : 'h A'
        }]
    },
    features : {
        eventDrag : {
            snapToResource : true
        },
        scheduleTooltip   : false,
        dependencies      : false,
        // Enable the highlight time span feature
        timeSpanHighlight : true,
        filterBar         : true,
        // Custom event tooltip
        eventTooltip      : {
            template : ({
                eventRecord
            }) => `<dl>
                <dt>${StringHelper.encodeHtml(eventRecord.name)}</dt>
                <dd>
                     <i class="fa fa-map-marker-alt"></i>${StringHelper.encodeHtml(eventRecord.resource.name)}
                </dd>
                <dt>Scheduled at:</dt>
                <dd>
                    <i class="fa fa-calendar-alt"></i>${DateHelper.format(eventRecord.startDate, 'LST')} - ${DateHelper.format(eventRecord.endDate, 'LST')}
                </dd>
                ${typeof eventRecord.minStartTime === 'number' ? `
                <dt>Deliver between:</dt>
                <dd>
                    <i class="fa fa-clock"></i>${DateHelper.format(eventRecord.minStartDate, 'LST')} - ${DateHelper.format(eventRecord.maxEndDate, 'LST')}
                </dd>` : ''}
            </dl>`
        },
        // Customize the task editor fields of the General tab
        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        // two custom fields for min / max daily delivery time
                        minStartTime : {
                            type  : 'number',
                            min   : 0,
                            max   : 23,
                            label : 'Delivery time',
                            width : 200,
                            flex  : '0 0 200px',
                            name  : 'minStartTime',
                            span  : 1
                        },
                        maxEndTime : {
                            label : '-',
                            type  : 'number',
                            min   : 0,
                            max   : 24,
                            flex  : '0 0 90px',
                            name  : 'maxEndTime',
                            span  : 1
                        },
                        // Not using % done field in this demo
                        percentDoneField : false,
                        // Make effort field half width, it can share row with Duration
                        effortField      : {
                            span : 1
                        }
                    }
                }
            }
        }
    },
    // A simple demo button to show off the highlighting API
    tbar : [{
        type    : 'slidetoggle',
        ref     : 'highlightDragToggle',
        text    : 'Highlight while dragging',
        checked : true
    }, {
        type     : 'slidetoggle',
        ref      : 'highlightToggle',
        text     : 'Highlight 9-10am + 2-4pm',
        onChange : 'up.onHighlightToggle'
    }],
    // A custom event renderer returning a DOMConfig object
    eventRenderer({
        eventRecord,
        resourceRecord: machine,
        renderData
    }) {
        const {
            minStartDate,
            maxEndDate
        } = eventRecord;
        if (!minStartDate || !maxEndDate) {
            return StringHelper.encodeHtml(eventRecord.name);
        }
        return [{
            children : [{
                class : 'eventName',
                html  : StringHelper.encodeHtml(eventRecord.name)
            }, {
                class : 'b-delivery-window',
                html  : `Deliver ${DateHelper.format(minStartDate, 'LST')} - ${DateHelper.format(maxEndDate, 'LST')}</div>`
            }]
        }];
    },
    columns : [{
        type           : 'resourceInfo',
        text           : 'Driver',
        width          : 195,
        showEventCount : false,
        filterable     : {
            filterField : {
                triggers : {
                    search : {
                        cls : 'fa fa-filter'
                    }
                },
                placeholder : 'Search drivers...'
            }
        },
        showMeta : record => StringHelper.xss`<i class="fa fa-circle b-active-status ${record.active ? 'b-active' : ''}"></i><i class="fa fa-${record.vehicle || ''}"></i >`
    }, {
        text   : 'City',
        field  : 'city',
        width  : 120,
        editor : false
    }],
    // This template method dictates how event bars are constrained for drag drop, resize and create UI interactions
    getDateConstraints(resourceRecord, eventRecord) {
        if (eventRecord) {
            const {
                minStartDate,
                maxEndDate
            } = eventRecord;
            if (minStartDate) {
                return {
                    start : minStartDate,
                    end   : maxEndDate
                };
            }
        }
    },
    // Utility method used to highlight the delivery window for an event record
    highlightDeliveryWindow({
        minStartDate,
        maxEndDate
    }) {
        const highlightEnabled = this.widgetMap.highlightDragToggle.checked;
        this.widgetMap.highlightToggle.checked = false;
        if (highlightEnabled && minStartDate && maxEndDate) {
            scheduler.highlightTimeSpan({
                // Optional, to support animations
                animationId : 'deliveryWindow',
                // Highlight surrounding area
                surround    : true,
                name        : 'Unavailable time',
                // The time span to visualize
                startDate   : minStartDate,
                endDate     : maxEndDate
            });
        }
    },
    onHighlightToggle({
        checked
    }) {
        if (checked) {
            this.highlightTimeSpans([{
                name      : 'Morning',
                // Add a custom CSS class to the highlight element
                cls       : 'morning',
                startDate : new Date(2022, 4, 25, 9),
                endDate   : new Date(2022, 4, 25, 10)
            }, {
                name      : 'Afternoon',
                startDate : new Date(2022, 4, 25, 14),
                endDate   : new Date(2022, 4, 25, 16)
            }]);
        }
        else {
            this.unhighlightTimeSpans(true);
        }
    },
    // A few event listeners
    listeners : {
        scheduleClick() {
            scheduler.unhighlightTimeSpans(true);
            scheduler.widgetMap.highlightToggle.checked = false;
        },
        eventSelectionChange() {
            const selectedEvent = scheduler.selectedEvents[0];
            if (selectedEvent && scheduler.selectedEvents.length === 1) {
                scheduler.highlightDeliveryWindow(scheduler.selectedEvents[0]);
            }
        },
        eventDragStart({
            eventRecords
        }) {
            scheduler.highlightDeliveryWindow(eventRecords[0]);
        },
        eventDragReset() {
            scheduler.unhighlightTimeSpans();
        },
        eventResizeStart({
            eventRecord
        }) {
            scheduler.highlightDeliveryWindow(eventRecord);
        },
        eventResizeEnd() {
            scheduler.unhighlightTimeSpans();
        }
    }
});