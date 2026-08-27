/* global Ext */

Ext.define('App.view.main.Main', {
    extend     : 'Ext.panel.Panel',
    alias      : 'widget.main-view',
    id         : 'main-view',
    controller : 'main',

    title : '<a id="title" href="../../examples/#example-examples-scheduler-extjsclassic"><h1>ExtJS Classic App integration demo</h1></a>',

    layout : {
        type  : 'hbox',
        align : 'stretch'
    },

    items : [
        {
            xtype     : 'grid',
            reference : 'gridPanel',
            title     : 'Ext JS Classic Grid',
            width     : 250,
            resizable : {
                split : true,
                edges : 'east'
            },
            columns : [
                { text : 'First Name', dataIndex : 'firstName', flex : 1, editor : 'textfield' },
                { text : 'Last Name', dataIndex : 'lastName', flex : 1, editor : 'textfield' }
            ],
            grouped  : true,
            features : [
                { ftype : 'grouping' }
            ],
            plugins : [{
                ptype        : 'cellediting',
                clicksToEdit : 2
            }],
            tbar : ['->',
                {
                    xtype   : 'button',
                    iconCls : 'fa fa-plus',
                    text    : 'Add Person',
                    handler : 'addPerson'
                }
            ],
            store : {
                fields  : ['firstName', 'lastName'],
                grouper : {
                    property : 'lastName',
                    groupFn  : function(record) {
                        return record.get('lastName')?.[0];
                    }
                },
                data : [
                    { firstName : 'Peter', lastName : 'Venkman' },
                    { firstName : 'Raymond', lastName : 'Stantz' },
                    { firstName : 'Egon', lastName : 'Spengler' },
                    { firstName : 'Winston', lastName : 'Zeddemore' },
                    { firstName : 'Janine', lastName : 'Melnitz' },
                    { firstName : 'Louis', lastName : 'Tully' },
                    { firstName : 'Dana', lastName : 'Barrett' },
                    { firstName : 'Slimer', lastName : 'Ghost' },
                    { firstName : 'Gozer', lastName : 'Destructor' },
                    { firstName : 'Ray', lastName : 'Parker' },
                    { firstName : 'Walter', lastName : 'Peck' },
                    { firstName : 'Ilyana', lastName : 'Kovacs' },
                    { firstName : 'Marcus', lastName : 'Bishop' },
                    { firstName : 'Elena', lastName : 'Santiago' },
                    { firstName : 'Tom', lastName : 'Hollis' }

                ]
            }
        },
        {
            title     : 'Bryntum Scheduler Pro',
            xtype     : 'schedulerpanel',
            reference : 'schedulerPanel',
            flex      : 1,
            barMargin : 0,
            tbar      : ['->',
                {
                    xtype   : 'button',
                    iconCls : 'fa fa-plus',
                    text    : 'Add Task',
                    handler : 'addTask'
                }, {
                    xtype   : 'button',
                    iconCls : 'fa fa-plus',
                    text    : 'Add Time Range',
                    handler : 'addTimeRange'
                }],

            eventStore : {
                readUrl  : 'data/events.json',
                autoLoad : true
            },

            resourceStore : {
                readUrl  : 'data/resources.json',
                autoLoad : true
            },

            columns : [
                { text : 'Name', field : 'name', width : 130, locked : true }
            ],

            startDate  : new Date(2025, 9, 1, 12),
            endDate    : new Date(2025, 9, 1, 20),
            viewPreset : 'hourAndDay',

            eventRenderer : 'eventRenderer'
        }
    ]
});
