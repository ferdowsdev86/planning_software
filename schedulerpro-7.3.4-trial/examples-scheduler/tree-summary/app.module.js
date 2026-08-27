import shared from '../_shared/shared.module.js';
import { SchedulerEventModel, SchedulerResourceModel, Scheduler, DateHelper } from '../../build/schedulerpro.module.js';
//region "lib/Task.js"

class Task extends SchedulerEventModel {
    static get fields() {
        return [
            {
                name         : 'demandedCapacity',
                type         : 'number',
                defaultValue : 0
            }
        ];
    }
}

//endregion

//region "lib/Project.js"

class Project extends SchedulerResourceModel {
    static get fields() {
        return [
        ];
    }
}

//endregion

const scheduler = new Scheduler({
    appendTo   : 'container',
    eventStyle : 'outlined',
    cls        : 'b-capacity-indicators',
    tickSize   : 60,
    rowHeight  : 50,
    barMargin  : 5,
    snap       : true,

    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            width : 300,
            field : 'name',
            renderer(renderData) {
                const { record } = renderData;
                if (record.isLeaf) {
                    renderData.iconCls = `fa b-${record.parent.eventColor} fa-circle`;
                }

                return renderData.value;
            }
        },
        {
            type  : 'percent',
            text  : 'Progress',
            field : 'progress',
            width : 150
        }
    ],

    features : {
        sort           : 'name',
        tree           : true,
        regionResize   : false,
        nonWorkingTime : true,
        eventEdit      : {
            editorConfig : {
                autoUpdateRecord : true
            },
            items : {
                capacityField : {
                    type   : 'number',
                    min    : 0,
                    max    : 5,
                    step   : 0.1,
                    name   : 'demandedCapacity',
                    label  : 'Capacity',
                    weight : 120
                }
            }
        },
        treeSummary : {
            // Function used to both calculate and format a summary value for a parent resource summary cell.
            // Return textual content or a DomConfig object
            renderer({ startDate, endDate, resourceRecord, timeline }) {
                let totalDemandedCapacity = 0;

                resourceRecord.traverse(node => {
                    node.events.forEach(task => {
                        if (DateHelper.intersectSpans(task.startDate, task.endDate, startDate, endDate)) {
                            totalDemandedCapacity += task.demandedCapacity || 0;
                        }
                    });
                }, true);

                if (timeline.project.effectiveCalendar.isWorkingTime(startDate, endDate)) {
                    const
                        available = (1 - totalDemandedCapacity);

                    return [
                        {
                            class : {
                                'b-always-transition' : 1,
                                'b-used-capacity'     : 1,
                                'b-over-scheduled'    : totalDemandedCapacity > 1,
                                'b-bryntum'           : 1
                            },
                            style : {
                                width : `${Math.min(100, 100 * totalDemandedCapacity)}%`
                            },
                            dataset : {
                                btip : `${totalDemandedCapacity} capacity used`
                            }
                        },
                        {
                            class : {
                                'b-always-transition'  : 1,
                                'b-available-capacity' : 1,
                                'b-bryntum'            : 1
                            },
                            style : {
                                'inset-inline-start' : `${100 * totalDemandedCapacity}%`,
                                width                : `${100 * available}%`
                            },
                            dataset : {
                                btip : `${1 - totalDemandedCapacity} capacity available`
                            }
                        },
                        {
                            class : 'b-capacity',
                            text  : String(available.toFixed(1))
                        }
                    ];
                }

                return '';
            }
        }
    },

    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    startDate                 : new Date(2025, 0, 1),
    endDate                   : new Date(2025, 5, 1),
    viewPreset                : {
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

    crudManager : {
        autoLoad   : true,
        loadUrl    : 'data/data.json',
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : Project
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
            type    : 'slidetoggle',
            text    : 'Show capacity indicators',
            checked : true,
            onChange({ value }) {
                scheduler.runWithTransition(() => {
                    scheduler.element.classList.toggle('b-capacity-indicators', value); // slideToggle to hide/show the capacity indicators
                }, true);
            }
        }
    ],

    eventRenderer({ eventRecord }) {
        return [
            {
                tag   : 'span',
                class : 'b-event-name',
                text  : eventRecord.name
            },
            {
                class : 'b-event-capacity',
                text  : eventRecord.demandedCapacity.toFixed(1)
            }
        ];
    }
});
scheduler.element.classList.toggle('b-summary-histogram');
