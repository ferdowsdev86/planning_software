var {
    Scheduler,
    StringHelper,
    DateHelper
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        eventDragCreate : false,
        eventResize     : false,
        eventTooltip    : false,
        stickyEvents    : false,
        eventDrag       : {
            constrainDragToResource : true
        }
    },
    columns : [{
        type           : 'resourceInfo',
        text           : 'Staff',
        field          : 'name',
        width          : '14em',
        showEventCount : false,
        showRole       : true
    }],
    rowHeight  : 80,
    startDate  : new Date(2017, 5, 1),
    endDate    : new Date(2017, 5, 11),
    viewPreset : {
        base    : 'dayAndWeek',
        headers : [{
            unit     : 'day',
            align    : 'center',
            renderer : (startDate, endDate) => `
                    <div>${DateHelper.format(startDate, 'ddd')}</div>
                    <div>${DateHelper.format(startDate, 'DD MMM')}</div>
                `
        }]
    },
    eventLayout        : 'none',
    managedEventSizing : false,
    crudManager        : {
        autoLoad   : true,
        eventStore : {
            fields : ['startInfo', 'startInfoIcon', 'endInfo', 'endInfoIcon']
        },
        loadUrl : 'data/data.json'
    },
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        let startEndMarkers = '';

        // Add a custom CSS classes to the template element data by setting a property name
        renderData.cls.milestone = eventRecord.isMilestone;
        renderData.cls.normalEvent = !eventRecord.isMilestone;
        renderData.cls[resourceRecord.id] = 1;
        if (eventRecord.startInfo) {
            startEndMarkers = `<i class="b-start-marker ${eventRecord.startInfoIcon}" data-btip="${eventRecord.startInfo}"></i>`;
        }
        if (eventRecord.endInfo) {
            startEndMarkers += `<i class="b-end-marker ${eventRecord.endInfoIcon}" data-btip="${eventRecord.endInfo}"></i>`;
        }
        return startEndMarkers + StringHelper.encodeHtml(eventRecord.name);
    }
});