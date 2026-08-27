import shared from '../_shared/shared.module.js';
import { EventModel, ResourceModel, SchedulerPro, DomHelper, DateHelper, StringHelper, GlobalEvents, Toast } from '../../build/schedulerpro.module.js';
//region "lib/Task.js"

class Task extends EventModel {
    static fields = [
        'trending'
    ];
}

//endregion

//region "lib/Resource.js"

class Resource extends ResourceModel {
    static fields = [
        'flag'
    ];

    get readOnly() {
        return this.isParent;
    }

    get rowHeight() {
        if (this.isLeaf) {
            return super.rowHeight;
        }
        return 45;
    }
}

//endregion

const scheduler = new SchedulerPro({
    appendTo         : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    eventStyle       : 'indented',
    tickSize         : 60,
    rowHeight        : 65,
    barMargin        : 7,
    snap             : true,
    zoomOnMouseWheel : false,
    startDate        : new Date(2025, 2, 1),
    endDate          : new Date(2025, 5, 1),
    multiEventSelect : true,
    columns          : [
        {
            type  : 'tree',
            text  : 'Name',
            width : 300,
            field : 'name',
            renderer(renderData) {
                const { record, value } = renderData;
                if (record.isLeaf) {
                    renderData.iconCls = `fa b-${record.parent.eventColor || 'green'} fa-square`;
                }
                else if (record.flag) {
                    return [{
                        tag   : 'img',
                        alt   : record.name,
                        class : 'flag',
                        src   : `./resources/${record.flag}.svg`,
                        style : 'vertical-align: middle'
                    }, value];
                }

                return value;
            }
        }
    ],

    listeners : {
        tickCellClick({ resourceRecord, startDate, endDate }) {
            let totalEvents = 0;

            resourceRecord.traverse(node => {
                node.events.forEach(task => {
                    if (DateHelper.intersectSpans(task.startDate, task.endDate, startDate, endDate)) {
                        totalEvents++;
                    }
                });
            }, true);

            Toast.show({
                html : StringHelper.xss`
                    <div class="tick-cell-toast">
                        <h3>Tick cell clicked</h3>
                        <div class="toast-grid">
                            <div class="label">Resource:</div>
                            <div class="value">${resourceRecord.name}</div>
                            <div class="label">Date:</div>
                            <div class="value">${DateHelper.format(startDate, 'MMMM D')}</div>
                            <div class="label">Total events:</div>
                            <div class="value">${totalEvents}</div>
                        </div>
                    </div>
                `,
                timeout : 3000
            });
        }
    },

    features : {
        sort            : 'name',
        tree            : true,
        regionResize    : false,
        dependencies    : false,
        eventDragSelect : true,
        nonWorkingTime  : true,
        scheduleTooltip : false,
        taskEdit        : {
            editorConfig : {
                autoUpdateRecord : true
            }
        },

        cellMenu : {
            items : {
                eventColor : {
                    text : 'L{SchedulerBase.color}',
                    icon : 'b-icon b-icon-palette',
                    menu : {
                        type : 'eventcolorpicker'
                    }
                }
            }
        },
        treeSummary : {
            // A callback function used to generate and format the summary tick cell values
            renderer({ startDate, endDate, resourceRecord, timeline }) {
                let totalEvents = 0, backgroundColor = '';

                resourceRecord.traverse(node => {
                    node.events.forEach(task => {
                        if (DateHelper.intersectSpans(task.startDate, task.endDate, startDate, endDate)) {
                            totalEvents++;
                        }
                    });
                }, true);

                if (totalEvents) {
                    const
                        min = 1, max = 30,
                        normalized   = (totalEvents - min) / (max - min),
                        alpha        = 0.05 + (normalized) * 0.5;

                    backgroundColor = `rgba(30, 144, 255, ${alpha})`;
                }

                return {
                    class : {
                        'b-summary-value' : 1
                    },
                    style : {
                        backgroundColor
                    },
                    dataset : {
                        btip : totalEvents ? `${DateHelper.format(startDate, 'MMMM DD')}: ${totalEvents} event${totalEvents > 1 ? 's' : ''}` : undefined
                    },
                    text : totalEvents
                };
            }
        }
    },

    viewPreset : {
        base    : 'weekAndMonth',
        headers : [
            {
                unit       : 'month',
                align      : 'start',
                dateFormat : 'MMM YYYY'
            },
            {
                unit       : 'day',
                dateFormat : 'D'
            }
        ]
    },

    project : {
        autoLoad   : true,
        loadUrl    : 'data/data.json',
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : Resource
        }
    },

    tbar : [
        {
            type    : 'slidetoggle',
            text    : 'Show summaries',
            checked : true,
            onChange({ value }) {
                scheduler.features.treeSummary.disabled = !value; // slideToggle to disable treeSummary feature
            }
        },
        {
            type : 'slidetoggle',
            text : 'Compact mode',
            onChange({ value }) {
                scheduler.rowHeight = value ? 44 : 65;
            }
        },
        {
            type    : 'slidetoggle',
            text    : 'Dark mode',
            ref     : 'modeToggle',
            checked : DomHelper.isDarkTheme,
            onChange({ userAction }) {
                userAction && DomHelper.toggleLightDarkTheme();
            }
        },
        '->',
        {
            type    : 'checkboxgroup',
            label   : 'Event categories',
            value   : 'Cultural,Music,Sports,Tech',  // the default choice
            inline  : true,
            options : {
                Cultural : 'Cultural',
                Music    : 'Music',
                Sports   : 'Sports',
                Tech     : 'Technology'
            },
            onChange : 'up.onCategoriesChange'
        }
    ],

    eventRenderer({ eventRecord }) {
        // A DomConfig object describing the content of the event element
        return [
            {
                tag   : 'span',
                class : 'b-event-dates',
                text  : DateHelper.format(eventRecord.startDate, 'MMM D') + '-' + DateHelper.format(DateHelper.add(eventRecord.endDate, -1, 'ms'), 'D')
            },
            {
                tag   : 'span',
                class : 'b-event-name',
                text  : eventRecord.name
            },
            eventRecord.trending ? {
                tag   : 'span',
                class : 'b-event-badge',
                text  : 'TRENDING'
            } : undefined
        ];
    },

    onCategoriesChange({ value }) {
        this.resourceStore.clearFilters(true);
        this.resourceStore.filter(rec => {
            if (rec.parent.flag || rec.isLeaf) {
                const category = rec.parent.flag ? rec : rec.parent;
                return value.some(val => category.name.toLowerCase().includes(val.toLowerCase()));
            }
        });
    }
});

GlobalEvents.on({
    theme : ({ theme }) => scheduler.widgetMap.modeToggle.checked = theme.toLowerCase().includes('dark')
});
