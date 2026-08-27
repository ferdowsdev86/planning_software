/* global Ext */

Ext.define('App.view.scheduler.SchedulerPanel', {
    extend : 'Ext.Panel',
    xtype  : 'schedulerpanel',
    layout : 'fit',
    cls    : 'bryntum-schedulerpro',

    columns  : [],
    features : {
        stripe       : true,
        regionResize : false,
        timeRanges   : {
            enableResizing      : true,
            showCurrentTimeLine : true,
            showHeaderElements  : true
        }
    },
    viewPreset                   : null,
    weekStartDay                 : Ext.Date.firstDayOfWeek,
    startDate                    : null,
    endDate                      : null,
    snapToIncrement              : false,
    snapRelativeToEventStartDate : false,
    forceFit                     : false,
    autoCreate                   : true,
    allowOverlap                 : true,
    showRemoveEventInContextMenu : true,
    disableGridRowModelWarning   : true,
    eventStore                   : null,
    resourceStore                : null,
    assignmentStore              : null,
    dependencyStore              : null,
    eventRenderer                : null,

    exportedProperties : [
        'appendTo',
        'columns',
        'features',
        'viewPreset',
        'weekStartDay',
        'startDate',
        'endDate',
        'snapToIncrement',
        'snapRelativeToEventStartDate',
        'rowHeight',
        'barMargin',
        'forceFit',
        'autoCreate',
        'allowOverlap',
        'enableEventAnimations',
        'disableGridRowModelWarning',
        'animateRemovingRows',
        'eventStore',
        'resourceStore',
        'assignmentStore',
        'dependencyStore',
        'eventRenderer'
    ],

    initComponent : function() {
        const me = this;

        me.callParent(arguments);

        // Create the scheduler instance
        me._scheduler = me.createSchedulerInstance();

        // Render scheduler after panel is rendered
        me.on('boxready', function() {
            if (!me._scheduler.rendered) {
                me._scheduler.render(me.body.dom);
            }
        }, me, { single : true });
    },

    destroy : function() {
        this._scheduler = Ext.destroy(this._scheduler);
        this.callParent(arguments);
    },

    /**
     * Returns the Bryntum Scheduler instance which this Panel wraps.
     */
    getScheduler : function() {
        return this._scheduler;
    },

    /**
     * Creates the Bryntum Scheduler instance with exported properties.
     * @private
     */
    createSchedulerInstance : function() {
        const
            me                 = this,
            exportedProperties = me.exportedProperties,
            schedulerConfig    = Ext.apply({}, me.scheduler),
            proto              = me.self.prototype;
        let i, prop, value;

        for (i = 0; i < exportedProperties.length; i++) {
            prop = exportedProperties[i];
            value = me[prop];
            if (typeof value !== 'undefined') {
                schedulerConfig[prop] = value;
            }

            // Create getters and setters to export the Bryntum grid's properties
            // as getXxx/setXxx methods.
            if (!me.propertiesExported) {
                me.createPropertyProxy(proto, exportedProperties[i]);
                proto.propertiesExported = true;
            }

        }

        // Handle eventRenderer as function or string
        if (typeof schedulerConfig.eventRenderer === 'string') {
            const functionName = schedulerConfig.eventRenderer;

            schedulerConfig.eventRenderer = function() {
                return Ext.callback(functionName, null, arguments, 0, me);
            };
        }

        const scheduler = new bryntum.schedulerpro.Scheduler(schedulerConfig);
        // Forward all events from scheduler to this panel
        scheduler.on({
            catchAll : me.onSchedulerEvent,
            thisObj  : me,
            prio     : 100
        });

        return scheduler;
    },

    createPropertyProxy : function(proto, name) {
        const capName = Ext.String.capitalize(name);

        proto['set' + capName] = function(value) {
            this._scheduler[name] = value;
        };
        proto['get' + capName] = function() {
            return this._scheduler[name];
        };
    },

    /**
     * Forwards events from the scheduler to this panel.
     */
    onSchedulerEvent : function(event) {
        // Fire event on this panel, passing the scheduler event
        return this.fireEvent(event.type, this, event);
    }
});
