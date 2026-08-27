const schedulerPro = new SchedulerPro({
    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/SchedulerPro/examples/guides/readme/intro.json'
            }
        }
    },
    style             : 'font-size:0.85em',
    resourceImagePath : 'data/Scheduler/images/transparent-users/',
    appendTo          : targetElement,
    autoHeight        : true,
    eventStyle        : 'rounded',
    startDate         : new Date(2025, 2, 23, 4),
    endDate           : new Date(2025, 2, 26),
    // Custom view preset, with more compact display of hours
    viewPreset        : {
        base      : 'hourAndDay',
        tickWidth : 35,
        headers   : [
            {
                unit       : 'day',
                dateFormat : 'ddd DD/MM' //Mon 01/10
            },
            {
                unit       : 'hour',
                dateFormat : 'H'
            }
        ]
    },

    features : {
        timeRanges : {
            narrowThreshold : 10,
            enableResizing  : true
        },
        resourceNonWorkingTime : true,
        cellEdit               : true,
        filter                 : true,
        regionResize           : true,
        dependencies           : true,
        dependencyEdit         : true,
        percentBar             : true,
        group                  : {
            field        : 'type',
            headerHeight : 30
        },
        sort         : 'name',
        eventTooltip : {
            header : {
                title      : 'Information',
                titleAlign : 'start'
            },
            tools : [
                {
                    cls : 'fa fa-trash',
                    handler() {
                        this.eventRecord.remove();
                        this.hide();
                    }
                },
                {
                    cls : 'fa fa-edit',
                    handler() {
                        schedulerPro.features.taskEdit.editEvent(this.eventRecord);
                    }
                }
            ]
        }
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            showEventCount : true,
            width          : 220
        },
        {
            type    : 'action',
            text    : 'Actions',
            actions : [{
                cls     : 'fa fa-fw fa-plus',
                tooltip : 'Add task',
                onClick : async({ record }) => {
                    await schedulerPro.project.addEvent({
                        name         : 'New task',
                        startDate    : schedulerPro.startDate,
                        duration     : 4,
                        durationUnit : 'h',
                        resourceId   : record.id
                    });

                    schedulerPro.features.taskEdit.editEvent(schedulerPro.eventStore.last);
                }
            }, {
                cls     : 'fa fa-fw fa-cog',
                tooltip : 'Settings',
                onClick : ({ record }) => Toast.show('TODO: Show a cool settings dialog')
            }, {
                cls     : 'fa fa-fw fa-copy',
                tooltip : 'Duplicate resource',
                onClick : ({ record }) => {
                    schedulerPro.resourceStore.add(record.copy({
                        name : record.name + ' (copy)'
                    }));
                }
            }]
        }
    ]
});
