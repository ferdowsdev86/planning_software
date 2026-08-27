import shared from '../_shared/shared.module.js';
import { SchedulerEventModel, SchedulerResourceModel, Scheduler, DateHelper, AvatarRendering } from '../../build/schedulerpro.module.js';
//region "lib/Task.js"

class Task extends SchedulerEventModel {
    static get fields() {
        return [
            { name : 'icon' },
            // A custom field used in this demo to define how many hours / day the task will be worked on
            { name : 'effortPerDay', defaultValue : 4 }
        ];
    }

    assign(resourceRecord, clear) {
        if (resourceRecord.isParent) {
            resourceRecord = resourceRecord.children[this.resource.parentIndex];
        }
        return super.assign(resourceRecord, clear);
    }
}

//endregion

//region "lib/Resource.js"

class Resource extends SchedulerResourceModel {
    static get fields() {
        return [
            // A custom field used in this demo to define how many hours / day a resource is working
            { name : 'hoursPerDay', defaultValue : 8 }
        ];
    }

}

//endregion

const scheduler = new Scheduler({
    appendTo                  : 'container',
    columnLines               : false,
    eventStyle                : 'rounded',
    cls                       : 'b-capacity-indicators',
    tickSize                  : 100,
    rowHeight                 : 50,
    barMargin                 : 5,
    snap                      : true,
    // resourceImagePath : '../_shared/images/transparent-users/',
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    startDate                 : new Date(2025, 0, 6),
    endDate                   : new Date(2025, 5, 1),
    allowOverlap              : false,
    timeResolution            : {
        increment : 1,
        unit      : 'd'
    },
    viewPreset : {
        base    : 'dayAndMonth',
        headers : [
            {
                unit       : 'month',
                align      : 'start',
                dateFormat : 'MMM YYYY'
            },
            {
                unit       : 'day',
                dateFormat : 'D<br>ddd'
            }
        ]
    },

    columns : [
        {
            type            : 'tree',
            text            : 'Staff',
            width           : 350,
            field           : 'name',
            expandIconCls   : 'fa fa-chevron-down',
            collapseIconCls : 'fa fa-chevron-up',
            headerWidgets   : [
                {
                    type    : 'button',
                    icon    : 'fa fa-angles-down',
                    cls     : 'b-transparent',
                    onClick : 'up.onExpandAllClick'
                },
                {
                    type    : 'button',
                    icon    : 'fa fa-angles-up',
                    cls     : 'b-transparent',
                    onClick : 'up.onCollapseAllClick'
                }
            ],
            renderer({ record, value, grid }) {
                const domConfig = [value];
                if (record.isParent) {
                    if (!this.avatarRendering) {
                        this.avatarRendering = new AvatarRendering({
                            element : grid.element
                        });
                    }

                    domConfig.unshift(this.avatarRendering.getResourceAvatar({
                        imageUrl : `../_shared/images/transparent-users/${record.name.split(' ')[0].toLowerCase()}.png`,
                        initials : record.initials
                    }),
                    {
                        class : 'b-daily-hours',
                        text  : record.hoursPerDay + ':00 h/d'
                    });
                }

                return domConfig;
            }
        }
    ],

    features : {
        eventDragSelect : true,
        eventDrag       : {
            snapToResource : true,
            showTooltip    : false
        },
        eventMenu : {
            items : {
                // Add extra items shown for each event
                assign : {
                    text   : 'Move to...',
                    icon   : 'fa fa-fw fa-people-arrows',
                    weight : 100,
                    // Add submenu, items are populated below in the beforeSubMenu event listener function
                    menu   : {
                        items : ['aaa']
                    }
                }
            },
            menu : {
                listeners : {
                    beforeSubMenu({ item }) {
                        if (item.ref === 'assign') {
                            const
                                scheduler = this.up('schedulerpro'),
                                { menuContext } = scheduler.features.eventMenu,
                                resources = scheduler.resourceStore.rootNode.children.map(resource => ({
                                    text     : resource.name,
                                    disabled : menuContext.resourceRecord.parent === resource,
                                    onItem() {
                                        scheduler.selectedEvents.concat(menuContext.eventRecord).forEach(eventRecord => {
                                            scheduler.resourceStore.toggleCollapse(resource, false);
                                            eventRecord.assign(resource, true);
                                        });
                                    }
                                }));

                            item.menu.items = [...resources];
                        }
                    }
                }
            }
        },
        sort       : 'name',
        timeRanges : {
            enableResizing : true,
            showTooltip    : false
        },
        tree            : true,
        scheduleTooltip : false,
        regionResize    : false,
        nonWorkingTime  : true,
        eventEdit       : {
            editorConfig : {
                autoUpdateRecord : true
            },
            items : {
                resourceField     : false,
                effortPerDayField : {
                    type   : 'number',
                    min    : 0,
                    max    : 5,
                    step   : 0.1,
                    name   : 'effortPerDay',
                    label  : 'Hours / Day',
                    weight : 200
                }
            }
        },

        treeSummary : {
            // A callback function used to calculate and format tick summary values.
            // In this case, let's sum the effort of each task assigned to the parent resource that intersects with
            // the tick cell interval dates. In order to check if it's overallocated, compare to the available
            // hours per day of the resource
            renderer({ startDate, endDate, resourceRecord, timeline }) {
                if (timeline.project.effectiveCalendar.isWorkingTime(startDate, endDate)) {
                    const { hoursPerDay } = resourceRecord;
                    let totalHours = 0;

                    resourceRecord.traverse(node => {
                        node.events.forEach(task => {
                            // Be sure that when running this piece of code, project already computed all tasks endaDate
                            if (task.endDate && DateHelper.intersectSpans(task.startDate, task.endDate, startDate, endDate)) {
                                totalHours += task.effortPerDay || 0;
                            }
                        });
                    }, true);

                    return [
                        {
                            class : {
                                'fa fa-check'      : totalHours === hoursPerDay,
                                'b-over-allocated' : totalHours > hoursPerDay
                            },
                            dataset : {
                                btip : totalHours > hoursPerDay ? `Overallocated by ${totalHours - hoursPerDay}h` : undefined
                            },
                            text : totalHours !== hoursPerDay ? `${totalHours}:00` : undefined
                        }
                    ];
                }

                return '';
            }
        }
    },

    crudManager : {
        autoLoad   : true,
        loadUrl    : 'data/data.json',
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : Resource
        }
    },

    eventRenderer({ eventRecord }) {
        return [
            {
                class    : 'b-wrap',
                children : [
                    { tag : 'span', text : eventRecord.name },
                    eventRecord.icon ? { tag : 'i', class : eventRecord.icon } : undefined
                ]
            },
            {
                class : 'b-event-duration',
                text  : (eventRecord.effortPerDay || 0) + ':00 h/d'
            }
        ];
    },

    onCollapseAllClick() {
        this.features.tree.collapseAll();
    },

    onExpandAllClick() {
        this.features.tree.expandAll();
    }
});
