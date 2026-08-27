var {
    SchedulerEventModel,
    Scheduler,
    DateHelper,
    StringHelper
} = window.bryntum.schedulerpro;
class Task extends SchedulerEventModel {
    static get fields() {
        return [
            // Set a default event icon for all events
            {
                name         : 'iconCls',
                defaultValue : 'fa fa-calendar'
            }];
    }
}
const scheduler = new Scheduler({
    appendTo         : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    mode             : 'vertical',
    // When a bar is less than this width, it gets a CSS class `b-sch-event-narrow`
    // this means that the text is rotated to run vertically.
    narrowEventWidth : 100,
    crudManager      : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            field : ['team', 'city']
            // groupers : [{ field : 'city', ascending : true }]
        },
        loadUrl : 'data/data.json'
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
        print                 : true,
        filterBar             : true,
        // required to filterable on columns work
        resourceColumnReorder : true,
        resourceTimeRanges    : true,
        timeRanges            : {
            enableResizing      : true,
            showCurrentTimeLine : true
        },
        resourceMenu : {
            items : {
                // We add an extra item to the resoure menu
                add : {
                    text   : 'Add resource',
                    icon   : 'fa fa-plus',
                    onItem : ({
                        resourceRecord
                    }) => scheduler.resourceStore.insert(scheduler.resourceStore.indexOf(resourceRecord), {
                        name : 'John Doe'
                    })
                }
            }
        },
        summary : {
            disabled : true,
            renderer : ({
                events
            }) => events.length,
            verticalSummaryColumnConfig : {
                text : 'Summary'
            }
        }
    },
    // Uncomment to constrain drag drops
    // getDateConstraints(resourceRecord, eventRecord) {
    //     return {
    //         start : new Date(2019, 0, 1, 7),
    //         end   : new Date(2019, 0, 1, 13)
    //     };
    // },

    resourceColumns : {
        columnWidth : 140 //,
    //headerRenderer : ({ resourceRecord }) => StringHelper.xss`${resourceRecord.id} - ${resourceRecord.name}`
    },
    verticalTimeAxisColumn : {
        filterable : {
            // filter configuration
            filterField : {
                // define the configuration for the filter field
                type        : 'text',
                // type of the field rendered for the filter
                placeholder : 'Filter events',
                onChange    : ({
                    value
                }) => {
                    // on change of the field, filter the event store
                    scheduler.eventStore.filter({
                        // filter event by name converting to lowerCase to be equal comparison
                        filters : event => event.name.toLowerCase().includes(value.toLowerCase()),
                        replace : true // to replace all existing filters with a new filter
                    });
                }
            }
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
        text : 'Print',
        icon : 'fa fa-print',
        onClick() {
            return scheduler.features.print.showPrintDialog();
        }
    }, {
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
        id   : 'fitButton',
        text : 'Fit',
        icon : 'fa fa-arrows-alt-h',
        menu : {
            items : {
                none : {
                    text        : 'No fit',
                    checked     : false,
                    //!scheduler.resourceColumns.fitWidth && !scheduler.resourceColumns.fillWidth,
                    closeParent : true
                },
                fill : {
                    text        : 'Fill width',
                    checked     : 'up.resourceColumns.fillWidth',
                    closeParent : true
                },
                fit : {
                    text        : 'Fit width',
                    checked     : 'up.resourceColumns.fitWidth',
                    closeParent : true
                }
            },
            onItem({
                source: item
            }) {
                item.owner.widgetMap.none.checked = item.ref === 'none';
                scheduler.resourceColumns.fillWidth = item.owner.widgetMap.fill.checked = item.ref === 'fill';
                scheduler.resourceColumns.fitWidth = item.owner.widgetMap.fit.checked = item.ref === 'fit';
                scheduler.resourceColumns.fitWidth = item.ref === 'fit';
            }
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
            columnWidth : {
                type      : 'slider',
                text      : 'Resource cell width',
                width     : '13em',
                showValue : false,
                min       : 50,
                max       : 200,
                value     : 'up.resourceColumnWidth',
                onInput({
                    value
                }) {
                    const fitWidgetMap = scheduler.widgetMap.fitButton.menu.widgetMap || {},
                        fitNoneButton = fitWidgetMap.none,
                        fitFillButton = fitWidgetMap.fill,
                        fitFitButton = fitWidgetMap.fit;
                    if (fitNoneButton) {
                        fitNoneButton.checked = true;
                        fitFillButton.checked = false;
                        fitFitButton.checked = false;
                    }
                    scheduler.resourceColumns.fitWidth = scheduler.resourceColumns.fillWidth = null;
                    scheduler.resourceColumns.columnWidth = value;
                }
            },
            tickHeight : {
                type      : 'slider',
                text      : 'Tick height',
                showValue : false,
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
            barMargin : {
                type      : 'slider',
                text      : 'Bar margin',
                showValue : false,
                min       : 0,
                max       : 10,
                style     : 'margin-top: .5em',
                value     : 'up.barMargin',
                onInput({
                    value
                }) {
                    scheduler.barMargin = value;
                }
            },
            resourceMargin : {
                type      : 'slider',
                text      : 'Resource margin',
                showValue : false,
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
    }, {
        type       : 'button',
        text       : 'Show summary',
        toggleable : true,
        icon       : 'fa fa-table',
        onToggle({
            pressed
        }) {
            scheduler.features.summary.disabled = !pressed;
        }
    }, {
        type        : 'combo',
        label       : 'Group by',
        editable    : false,
        clearable   : true,
        placeholder : 'None',
        items       : ['City', 'Role'],
        // value : 'city',
        onChange({
            value
        }) {
            if (value) {
                scheduler.resourceStore.group(value.toLowerCase(), true);
            }
            else {
                scheduler.resourceStore.clearGroupers();
            }
        }
    }]
});