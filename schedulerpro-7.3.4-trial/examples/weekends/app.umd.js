var {
    DateHelper,
    SchedulerPro,
    ProjectModel,
    StringHelper
} = window.bryntum.schedulerpro;
const project = new ProjectModel({
    autoLoad : false,
    loadUrl  : './data/data.json'
});
const eventColors = {
    Ventilation : 'blue',
    Heating     : 'orange',
    Roof        : 'lime',
    Attic       : 'lime',
    Basement    : 'lime',
    Cistern     : 'purple',
    Gas         : 'red'
};
const scheduler = new SchedulerPro({
    project,
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2020, 11, 1),
    endDate        : new Date(2020, 11, 31),
    rowHeight      : 80,
    barMargin      : 10,
    eventStyle     : 'filled',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        stripe             : true,
        dependencies       : false,
        resourceTimeRanges : true
    },
    columns : [{
        type : 'resourceInfo',
        text : 'Inspector'
    }],
    eventRenderer({
        eventRecord,
        renderData
    }) {
        renderData.eventColor = eventColors[eventRecord.type] || 'gray';
        const {
            iconCls
        } = renderData;

        // We don't want Scheduler to inject our icon.
        // We render it here
        renderData.iconCls = null;
        return [{
            className : 'event-header',
            children  : [{
                className : 'event-sticky-content',
                children  : [{
                    tag       : 'i',
                    className : iconCls
                },
                // xss protection
                {
                    html : StringHelper.encodeHtml(eventRecord.name)
                }]
            }]
        }, {
            className : 'event-body',
            html      : `<div class="event-sticky-content">${scheduler.formatDuration(eventRecord.duration, 1)} work days<i class="fa fa-arrow-right"></i>${Math.round(DateHelper.diff(eventRecord.startDate, eventRecord.endDate, 'd'))} days</div>`
        }];
    },
    tbar : [{
        ref        : 'calendarSelectorCombo',
        type       : 'calendarfield',
        label      : 'Calendar',
        width      : 250,
        valueField : 'idx',
        editable   : false,
        disabled   : true,
        store      : project.calendarManagerStore,
        emptyText  : 'Default calendar',
        onAction   : async({
            source: combo,
            record
        }) => {
            if (project.calendar !== record) {
                combo.disable();
                await project.setCalendar(record);
                combo.enable();
            }
        }
    }, '->', {
        type : 'viewpresetcombo'
    }]
});
project.load().then(async() => {
    // A default calendar with Saturday and Sunday as weekends is loaded with the data, add some extra calendars here
    // programmatically to illustrate that it can be done (could also be part of data)
    project.calendarManagerStore.rootNode.appendChild([
        // All work, no play
        {
            name : '24/7'
        },
        // Hard working, only christmas off
        {
            name      : 'Christmas off',
            intervals : [{
                name      : 'Christmas',
                startDate : new Date(2020, 11, 25),
                endDate   : new Date(2020, 11, 28),
                isWorking : false
            }]
        }]);
    await project.commitAsync();
    project.calendar = scheduler.widgetMap.calendarSelectorCombo.value = project.calendarManagerStore.first;
    scheduler.widgetMap.calendarSelectorCombo.disabled = false;
});