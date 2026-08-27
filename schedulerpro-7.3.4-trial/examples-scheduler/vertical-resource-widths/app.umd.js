var {
    SchedulerEventModel,
    Scheduler,
    DateHelper,
    StringHelper
} = window.bryntum.schedulerpro;
class Task extends SchedulerEventModel {
    static fields = [
        // Set a default event icon for all events
        {
            name         : 'iconCls',
            defaultValue : 'fa fa-calendar'
        }];
}
const scheduler = new Scheduler({
    appendTo    : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    mode        : 'vertical',
    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    startDate      : new Date(2019, 0, 1, 6),
    endDate        : new Date(2019, 0, 1, 18),
    viewPreset     : 'hourAndDay',
    barMargin      : 5,
    resourceMargin : 5,
    eventStyle     : 'indented',
    tickSize       : 80,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        filterBar          : true,
        // required to filterable on columns work
        resourceTimeRanges : true,
        timeRanges         : {
            enableResizing      : true,
            showCurrentTimeLine : true
        }
    },
    subGridConfigs : {
        locked : {
            // Wide enough to not clip tick labels for all the zoom levels.
            width : 115
        }
    },
    eventRenderer : ({
        eventRecord
    }) => StringHelper.xss`
        <div class="time">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
        <div class="name">${eventRecord.name}</div>
    `,
    tbar : [{
        type        : 'date',
        value       : 'up.startDate',
        step        : '1d',
        placeholder : 'Select date',
        onChange({
            value
        }) {
            // Preserve time, only changing "day"
            const diff = DateHelper.diff(DateHelper.clearTime(scheduler.startDate), value, 'days');
            scheduler.startDate = DateHelper.add(scheduler.startDate, diff, 'days');
        }
    }, {
        type : 'button',
        text : 'Layout',
        icon : 'fa fa-layer-group',
        menu : {
            items : {
                none : {
                    text        : 'Overlap',
                    checked     : false,
                    closeParent : true
                },
                pack : {
                    text        : 'Pack',
                    checked     : true,
                    closeParent : true
                },
                mixed : {
                    text        : 'Mixed',
                    checked     : false,
                    closeParent : true
                }
            },
            onItem({
                source: item
            }) {
                const {
                    none,
                    pack,
                    mixed
                } = item.owner.widgetMap;
                none.checked = item.ref === 'none';
                pack.checked = item.ref === 'pack';
                mixed.checked = item.ref === 'mixed';
                scheduler.eventLayout = item.ref;
            }
        }
    }, {
        type : 'button',
        text : 'Sizing',
        icon : 'fa fa-expand-arrows-alt',
        menu : {
            tickHeight : {
                type      : 'slider',
                text      : 'Tick height',
                showValue : true,
                min       : 20,
                style     : 'margin-top: .5em',
                value     : 'up.tickSize',
                onInput({
                    value
                }) {
                    // To allow ticks to not fill height
                    scheduler.suppressFit = true;

                    // Set desired size
                    scheduler.tickSize = value;
                }
            },
            resourceMargin : {
                type      : 'slider',
                text      : 'Resource margin',
                showValue : true,
                min       : 0,
                max       : 10,
                style     : 'margin-top: .5em',
                value     : 'up.resourceMargin',
                onInput({
                    value
                }) {
                    scheduler.resourceMargin = value;
                }
            }
        }
    }, '->', {
        type    : 'slidetoggle',
        label   : 'Fill ticks',
        tooltip : 'If on, ticks will be stretched to fill full time axis tick height',
        onChange({
            value
        }) {
            scheduler.fillTicks = value;
        }
    }]
});