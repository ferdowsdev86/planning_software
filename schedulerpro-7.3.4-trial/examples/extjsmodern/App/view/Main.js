/* global Ext */

Ext.define('App.view.Main', {
    extend : 'Ext.Panel',
    alias  : 'widget.main-view',

    controller : 'main',
    layout     : 'hbox',
    title      : {
        html : '<a id="title" href="../#example-extjsmodern"><h1>ExtJS Modern App integration demo</h1></a>',
        cls  : 'title-link'
    },
    id : 'main-view',

    viewModel : {
        data : {
            rowHeight : 45
        }
    },

    items : [
        {
            xtype     : 'panel',
            title     : 'Ext JS Modern List',
            width     : 250,
            cls       : 'ext-list',
            layout    : 'fit',
            resizable : {
                split : true,
                edges : 'east'
            },
            items : {
                xtype   : 'list',
                itemTpl : '<div class="contact">{firstName} <b>{lastName}</b></div>',
                grouped : true,

                store : {
                    grouper : {
                        property : 'lastName',
                        groupFn  : function(record) {
                            return record.get('lastName')[0];
                        }
                    },

                    data : [
                        { firstName : 'Peter', lastName : 'Venkman' },
                        { firstName : 'Raymond', lastName : 'Stantz' },
                        { firstName : 'Egon', lastName : 'Spengler' },
                        { firstName : 'Winston', lastName : 'Zeddemore' }
                    ]
                }
            }
        },
        {
            title     : 'Bryntum Scheduler Pro',
            xtype     : 'schedulerpropanel',
            reference : 'schedulerProPanel',
            flex      : 1,
            barMargin : 0,
            header    : {
                items : [{
                    xtype    : 'spinnerfield',
                    label    : 'Row height',
                    width    : '12.5em',
                    bind     : '{rowHeight}',
                    minValue : 20
                }, {
                    xtype   : 'button',
                    text    : 'Add Task',
                    ui      : 'action raised',
                    handler : 'addTask'
                }]
            },

            bind : {
                rowHeight : '{rowHeight}'
            },

            project : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : './data/data.json'
                    }
                },
                eventStore : {
                    fields : [
                        { name : 'durationUnit', defaultValue : 'hour' },
                        { name : 'order',  defaultValue : 'New order' },
                        'fixedCost',
                        'contact',
                        'phone'
                    ]
                },
                resourceStore : {
                    fields : [
                        'type'
                    ]
                },

                // This config enables response validation and dumping of found errors to the browser console.
                // It's meant to be used as a development stage helper only so please set it to false for production systems.
                validateResponse : true
            },

            features : {
                group      : 'type',
                percentBar : true
            },

            timeAxis : {
                filters : tick => tick.startDate.getHours() > 6 && tick.startDate.getHours() < 17
            },

            columns : [
                {
                    text  : 'Resource',
                    field : 'name',
                    width : 200
                },
                {
                    text   : 'Type',
                    field  : 'type',
                    hidden : true
                },
                {
                    text   : 'Tasks',
                    field  : 'events.length',
                    width  : 70,
                    align  : 'right',
                    editor : false
                },
                {
                    text      : 'Allocation',
                    type      : 'percent',
                    editor    : false,
                    sortable  : false,
                    groupable : false,
                    align     : 'center',
                    renderer({ record : resource, grid : schedulerPro }) {
                        // Detect overlap
                        if (resource.events.some(task =>
                            task.isScheduled && !schedulerPro.eventStore.isDateRangeAvailable(task.startDate, task.endDate, task, resource))
                        ) {
                            return '<i class="fa fa-exclamation-triangle" style="color: red" data-btip="Overlap!"></i>';
                        }

                        // Calculate allocation
                        const
                            duration   = resource.events.reduce((total, task) => total += task.duration, 0),
                            allocation = Math.round((duration / 40) * 100);

                        return this.defaultRenderer({ value : allocation });
                    }
                }
            ],

            startDate  : new Date(2020, 3, 6),
            endDate    : new Date(2020, 3, 11),
            viewPreset : {
                base      : 'hourAndDay',
                tickWidth : 20,
                headers   : [
                    {
                        unit       : 'day',
                        dateFormat : 'dddd' // Monday
                    },
                    {
                        unit       : 'hour',
                        dateFormat : 'HH' // 00-23
                    }
                ]
            },

            eventRenderer : 'eventRenderer'
        }
    ]
});
