import SchedulerPro from '../../../lib/SchedulerPro/view/SchedulerPro.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import '../../../lib/Scheduler/feature/Labels.js';
import '../../../lib/Grid/feature/Stripe.js';
import '../../../lib/Grid/column/PercentColumn.js';
import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import '../../../lib/Scheduler/widget/ViewPresetCombo.js';
import '../../../lib/SchedulerPro/feature/EventBuffer.js';
import ProductionProject from './ProductionProject.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';



// Customized scheduler displaying sessions per room
export default class Schedule extends SchedulerPro {

    static $name = 'Schedule';

    static type = 'schedule';

    static configurable = {
        tickSize                  : 30,
        allowOverlap              : false,
        eventColor                : 'blue',
        snap                      : true,
        rowHeight                 : 80,
        barMargin                 : 14,
        highlightPredecessors     : true,
        highlightSuccessors       : true,
        autoCreate                : false,
        milestoneTextPosition     : 'inside',
        startHour                 : 5,
        endHour                   : 23,
        projectModelClass         : ProductionProject,
        // Enables smoother wheel and pinch zooming. Not enabled in this demo since the preset setup does not allow for
        // smooth zooming
        smoothZoom                : false,
        zoomOnMouseWheel          : false,
        zoomOnTimeAxisDoubleClick : false,

        features : {
            eventBuffer     : true,
            eventDragCreate : false,
            eventDrag       : {
                snapToResource : true
            },
            labels : {
                disabled : true,
                // using field as label (will first look in event and then in resource)
                right    : {
                    renderer : ({ eventRecord }) => StringHelper.xss`${eventRecord.name} (order #${eventRecord.orderId})`
                }
            },
            eventMenu : {
                items : {
                    deleteEvent : {
                        text : 'Delete task'
                    },
                    unassignEvent : false
                }
            },
            taskEdit : {
                editorConfig : {
                    title : 'Task'
                },
                items : {
                    generalTab : {
                        title : 'Details',
                        items : {
                            preambleField : {
                                label : 'Setup time'
                            },
                            postambleField : {
                                label : 'Cleanup'
                            },
                            effortField : {
                                cls : 'b-half-width'
                            },
                            endDateField     : false,
                            percentDoneField : false
                        }
                    }
                }
            }
        },
        tbar : [
            {
                icon      : 'fa fa-caret-left',
                rendition : 'text',
                onAction  : 'up.onPreviousDayClick'
            },
            {
                type     : 'button',
                text     : 'Today',
                onAction : 'up.onTodayClick'
            },
            {
                icon      : 'fa fa-caret-right',
                rendition : 'text',
                onAction  : 'up.onNextDayClick'
            },
            {
                type : 'widget',
                ref  : 'dateLabel',
                flex : 1
            },
            {
                type     : 'slidetoggle',
                text     : 'Show setup time',
                checked  : true,
                onChange : 'up.onToggleShowSetup'
            },
            {
                type    : 'viewpresetcombo',
                width   : '7.5em',
                presets : ['customHourAndDay', 'customDayAndWeek', 'customDayAndWeek_shiftWeek']
            },
            {
                type      : 'button',
                icon      : 'b-icon b-icon-menu',
                rendition : 'text',
                onAction  : 'up.onMenuButtonClick'
            }
        ],

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Resource',
                field          : 'name',
                width          : 220,
                showEventCount : false,
                showMeta       : record => `<span class="b-capacity">Capacity ${record.capacity}</span>
                                                <span class="b-status ${record.running ? 'b-running' : 'fa fa-exclamation-triangle'}">${record.running ? 'Running' : record.statusMessage || 'Unknown error'}</span>`
            },
            {
                type   : 'percent',
                text   : 'Used capacity',
                field  : 'capacity',
                width  : 140,
                editor : false,
                renderer({ record : resource, grid : scheduler }) {
                    // Calculate allocation
                    const
                        usedCapacity = resource.events.filter(task => scheduler.isInTimeAxis(task)).reduce((total, task) => total += task.orderSize, 0),
                        allocation   = Math.round(usedCapacity / (resource.capacity * DateHelper.getDurationInUnit(scheduler.startDate, scheduler.endDate, 'days')) * 100);

                    return this.defaultRenderer({ value : allocation });
                }
            }
        ],

        // Custom view presets with header configuration
        presets : [
            {
                id          : 'customHourAndDay',
                name        : '1 day',
                base        : 'hourAndDay',
                start       : 5,
                defaultSpan : 18,
                tickWidth   : 45,
                headers     : [
                    {
                        unit       : 'h',
                        dateFormat : 'HH'
                    }
                ]
            }, {
                id              : 'customDayAndWeek',
                name            : '3 days',
                base            : 'dayAndWeek',
                defaultSpan     : 3,
                mainHeaderLevel : 0,
                headers         : [
                    {
                        unit       : 'd',
                        dateFormat : 'MMM Do'
                    }
                ]
            },
            {
                id              : 'customDayAndWeek_shiftWeek',
                name            : '1 week',
                base            : 'dayAndWeek',
                shiftIncrement  : 7,
                shiftUnit       : 'day',
                mainHeaderLevel : 0,
                defaultSpan     : 7,
                headers         : [
                    {
                        unit       : 'd',
                        dateFormat : 'MMM Do'
                    }
                ]
            }
        ],

        // Default viewPreset
        viewPreset : 'customHourAndDay'

    };

    construct(...args) {
        super.construct(...args);

        this.onTimeAxisChange();

        this.on({
            presetchange : this.onPresetChange
        });
    }

    eventRenderer({ eventRecord, renderData }) {
        eventRecord.orderId && renderData.cls.add(`order${eventRecord.orderId}`);

        if (eventRecord.isMilestone) {
            return eventRecord.orderSize;
        }
        // Event contents
        return StringHelper.xss`<div class="eventName">${eventRecord.name}</div><div class="orderinfo">Order #${eventRecord.orderId}, size: ${eventRecord.orderSize}</div>`;
    }

    onTimeAxisChange() {
        this.widgetMap.dateLabel.html = DateHelper.format(this.startDate, 'MMM D YYYY');
    }

    onNextDayClick() {
        this.shiftNext();
    }

    onTodayClick() {
        const startDate = DateHelper.clearTime(new Date());

        this.setTimeSpan(DateHelper.add(startDate, this.startHour, 'h'), DateHelper.add(startDate, this.endHour, 'h'));
    }

    onPreviousDayClick() {
        this.shiftPrevious();
    }

    onPresetChange({ to }) {
        this.features.labels.disabled = to?.id === 'customHourAndDay';
    }

    onMenuButtonClick() {
        this.trigger('toggleOrderList');
    }

    onToggleShowSetup({ checked }) {
        this.features.eventBuffer.disabled = !checked;
    }
}

Schedule.initClass();
