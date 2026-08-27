import shared from '../_shared/shared.module.js';
import { Toast, SchedulerPro } from '../../build/schedulerpro.module.js';

const schedulerPro = new SchedulerPro({
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },

    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventStyle : 'rounded',
    startDate  : '2020-03-23',
    endDate    : '2020-03-26',
    // Custom view preset, with more compact display of hours
    viewPreset : {
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
        group                  : 'type',
        sort                   : 'name',
        eventTooltip           : {
            header : {
                title      : 'Information',
                titleAlign : 'start'
            },
            tools : [
                {
                    cls     : 'fa fa-trash',
                    handler : function() {
                        this.eventRecord.remove();
                        this.hide();
                    }
                },
                {
                    cls     : 'fa fa-edit',
                    handler : function() {
                        schedulerPro.editEvent(this.eventRecord);
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
            width          : 220,
            validNames     : null
        },
        {
            type  : 'resourceCalendar',
            text  : 'Shift',
            width : 120
        },
        {
            type    : 'action',
            text    : 'Actions',
            width   : 90,
            align   : 'center',
            actions : [{
                cls     : 'fa fa-fw fa-plus',
                tooltip : 'Add task',
                onClick : async({ record }) => {
                    const [eventRecord] = schedulerPro.eventStore.add({
                        name         : 'New task',
                        startDate    : schedulerPro.startDate,
                        duration     : 4,
                        durationUnit : 'h'
                    });

                    eventRecord.assign(record);

                    await schedulerPro.project.commitAsync();

                    schedulerPro.editEvent(eventRecord);
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
