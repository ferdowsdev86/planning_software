import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

//region Data

const
    resources = [
        { id : 101, name : 'Mike' },
        { id : 102, name : 'Linda' },
        { id : 103, name : 'Don' },
        { id : 104, name : 'Karen' },
        { id : 105, name : 'Doug' },
        { id : 106, name : 'Peter' },
        { id : 107, name : 'Sam' },
        { id : 108, name : 'Melissa' },
        { id : 109, name : 'John' },
        { id : 110, name : 'Ellen' }
    ],
    events    = [
        {
            id         : 1,
            startDate  : '2024-01-15T09:00:00',
            endDate    : '2024-01-15T10:00:00',
            name       : 'Soccer Match',
            allDay     : false,
            resourceId : 101,
            eventColor : 'green'
        },
        {
            id         : 2,
            startDate  : '2024-01-15T10:00:00',
            endDate    : '2024-01-15T11:00:00',
            name       : 'Basketball Game',
            allDay     : false,
            resourceId : 102,
            eventColor : 'blue'
        },
        {
            id         : 3,
            startDate  : '2024-01-15T14:00:00',
            endDate    : '2024-01-15T15:00:00',
            name       : 'Tennis Match',
            allDay     : false,
            resourceId : 103,
            eventColor : 'red'
        },
        {
            id         : 4,
            startDate  : '2024-01-15T12:00:00',
            endDate    : '2024-01-15T13:00:00',
            name       : 'Golf Tournament',
            allDay     : false,
            resourceId : 104,
            eventColor : 'orange'
        },
        {
            id         : 5,
            startDate  : '2024-01-15T13:00:00',
            endDate    : '2024-01-15T14:00:00',
            name       : 'Baseball Game',
            allDay     : false,
            resourceId : 105,
            eventColor : 'purple'
        },
        {
            id         : 6,
            startDate  : '2024-01-15T16:00:00',
            endDate    : '2024-01-15T17:00:00',
            name       : 'Volleyball Match',
            allDay     : false,
            resourceId : 106,
            eventColor : 'brown'
        },
        {
            id         : 7,
            startDate  : '2024-01-15T10:00:00',
            endDate    : '2024-01-15T11:00:00',
            name       : 'Table Tennis',
            allDay     : false,
            resourceId : 107,
            eventColor : 'pink'
        },
        {
            id         : 8,
            startDate  : '2024-01-15T15:00:00',
            endDate    : '2024-01-15T16:00:00',
            name       : 'Hockey Game',
            allDay     : false,
            resourceId : 108,
            eventColor : 'teal'
        },
        {
            id         : 9,
            startDate  : '2024-01-15T12:00:00',
            endDate    : '2024-01-15T13:00:00',
            name       : 'Athletics Meet',
            allDay     : false,
            resourceId : 109,
            eventColor : 'cyan'
        },
        {
            id         : 10,
            startDate  : '2024-01-15T16:00:00',
            endDate    : '2024-01-15T17:00:00',
            name       : 'Boxing Match',
            allDay     : false,
            resourceId : 110,
            eventColor : 'lime'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo         : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    resources,
    events,
    startDate        : new Date(2024, 0, 15, 9),
    endDate          : new Date(2024, 0, 15, 18),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    tickSize         : 150,
    barMargin        : 5,
    multiEventSelect : true,
    eventStyle       : 'indented',
    autoCreate       : false,
    columns          : [
        { text : 'Name', field : 'name', width : 130 }
    ],
    features : {
        eventDragCreate    : false,
        eventEdit          : false,
        scheduleTooltip    : false,
        resourceTimeRanges : {
            // Enable the resource time range elements to be reachable in the DOM (to show tooltips etc.)
            enableMouseEvents : true
        },
        simpleEventEdit : {
            editorConfig : {
                inputField : {
                    placeholder : 'Type a name'
                }
            }
        },
        scheduleContext : {
            multiSelect  : false,
            triggerEvent : 'hover',
            widget       : {
                type      : 'buttongroup',
                cls       : 'context-button',
                rendition : 'text',
                items     : {
                    addEvent : {
                        icon    : 'fa fa-plus',
                        tooltip : {
                            html                 : 'Add event',
                            hoverDelay           : 1000,
                            hideDelay            : 0,
                            hideOnDelegateChange : true
                        },
                        onClick : 'up.onAddClick'
                    },
                    toggleUnavailable : {
                        icon    : 'fa fa-ban',
                        tooltip : {
                            html                 : 'Toggle unavailable',
                            hoverDelay           : 1000,
                            hideDelay            : 0,
                            hideOnDelegateChange : true
                        },
                        onClick : 'up.onToggleUnavailableClick'
                    },
                    ellipsisButton : {
                        cls      : 'b-blue b-transparent',
                        icon     : 'fa fa-ellipsis',
                        menuIcon : null,
                        menu     : {
                            items : {
                                removeAll : {
                                    icon   : 'fa fa-times',
                                    text   : 'Remove all events',
                                    onItem : 'up.onRemoveAllClick'
                                },
                                toggleHeight : {
                                    icon   : 'fa fa-up-down',
                                    text   : 'Toggle row height',
                                    onItem : 'up.onToggleRowHeight'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    tbar : {
        items : {
            toggleContextPosition : {
                type     : 'slidetoggle',
                label    : 'Context widget above events',
                onChange : 'up.onContextPositionToggle'
            },
            toggleDisabled : {
                type     : 'slidetoggle',
                label    : 'Enable schedule context feature',
                onChange : 'up.onDisableToggle',
                checked  : true
            }
        }
    },

    async onAddClick() {
        const { resourceRecord, tickStartDate } = this.features.scheduleContext.context;

        this.features.scheduleContext.widget.hide();

        const eventRecord      = await scheduler.scheduleEvent({
            startDate   : tickStartDate,
            eventRecord : { duration : 1, durationUnit : this.timeAxis.unit },
            resourceRecord
        });
        eventRecord.isCreating = true;

        this.editEvent(eventRecord);
    },

    async onToggleUnavailableClick() {
        const
            {
                resourceRecord,
                tickStartDate,
                tickEndDate
            }        = this.features.scheduleContext.context,
            existing = this.resourceTimeRangeStore.getRanges({
                resourceRecord,
                startDate : tickStartDate,
                endDate   : tickEndDate
            });

        // Remove ranges which intersect the context
        if (existing.length) {
            existing.forEach(r => r.remove());
        }
        else {
            await this.resourceTimeRangeStore.add({
                startDate    : tickStartDate,
                duration     : 1,
                durationUnit : this.timeAxis.unit,
                resourceId   : resourceRecord.id,
                cls          : 'b-resource-unavailable'
            });
        }

        this.features.scheduleContext.widget.hide();
    },

    async onRemoveAllClick() {
        const { resourceRecord } = this.features.scheduleContext.context;

        this.eventStore.remove(resourceRecord.events);
        this.features.scheduleContext.widget.hide();
    },

    onToggleRowHeight() {
        const { resourceRecord } = this.features.scheduleContext.context;
        resourceRecord.rowHeight = (resourceRecord.rowHeight || this.rowHeight) === this.rowHeight ? 20 : this.rowHeight;
    },

    onTimelineContextChange({ context }) {
        if (context) {
            const
                { domEvent }  = context,
                { target }    = domEvent,
                { widgetMap } = this.features.scheduleContext.widget;

            widgetMap.addEvent.disabled = Boolean(target.closest('.b-resource-unavailable'));
            widgetMap.toggleUnavailable.icon = target.closest('.b-resource-unavailable') ? 'fa fa-user-check' : 'fa fa-user-slash';
        }
    },

    onContextPositionToggle({ checked }) {
        const { scheduleContext } = this.features;

        this.element.classList.toggle('context-widget-at-top', 'checked');

        // We show the widget in the gap above any events, so we can share with event bars
        scheduleContext.shareWithEvent = checked;

        if (checked) {
            scheduler.setConfig({
                rowHeight      : 95,
                resourceMargin : {
                    start : 50,
                    end   : 5
                }
            });
        }
        else {
            scheduler.setConfig({
                rowHeight      : scheduler.config.rowHeight,
                resourceMargin : scheduler.config.barMargin
            });
        }
    },

    onDisableToggle({ checked }) {
        this.features.scheduleContext.disabled = !checked;
    }
});
