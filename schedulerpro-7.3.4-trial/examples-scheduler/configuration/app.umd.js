var {
    DateHelper,
    SchedulerEventModel,
    Scheduler,
    PresetManager
} = window.bryntum.schedulerpro;

//region Presets & Widgets

PresetManager.registerPreset('dayNightShift', {
    name              : 'Day/night shift (custom)',
    tickWidth         : 35,
    displayDateFormat : 'HH:mm',
    shiftIncrement    : 1,
    shiftUnit         : 'day',
    timeResolution    : {
        unit      : 'minute',
        increment : 15
    },
    defaultSpan     : 24,
    mainHeaderLevel : 1,
    headers         : [{
        unit       : 'day',
        increment  : 1,
        dateFormat : 'MMMM Do YYYY'
    }, {
        unit      : 'hour',
        increment : 12,
        renderer(startDate, endDate, headerConfig, cellIdx) {
            if (startDate.getHours() === 0) {
                // Setting a custom CSS on the header cell element
                headerConfig.headerCellCls = 'fa fa-moon';
                return DateHelper.format(startDate, 'MMM DD') + ' Night Shift';
            }
            else {
                // Setting a custom CSS on the header cell element
                headerConfig.headerCellCls = 'fa fa-sun';
                return DateHelper.format(startDate, 'MMM DD') + ' Day Shift';
            }
        }
    }, {
        unit       : 'hour',
        increment  : 1,
        dateFormat : 'H'
    }]
});
PresetManager.registerPreset('weekNumberAndYear', {
    name              : 'Year/week number',
    tickWidth         : 35,
    displayDateFormat : '{w.}W YYYY',
    shiftIncrement    : 1,
    shiftUnit         : 'year',
    timeResolution    : {
        unit      : 'd',
        increment : 1
    },
    defaultSpan     : 24,
    mainHeaderLevel : 1,
    headers         : [{
        unit       : 'y',
        increment  : 1,
        dateFormat : 'YYYY'
    }, {
        unit       : 'w',
        increment  : 1,
        dateFormat : 'WW'
    }]
});

// secondAndMinute is not used for smooth zooming by default, but we want to include it in this demo
PresetManager.registerPreset('smoothSecondAndMinute', {
    base             : 'secondAndMinute',
    useForSmoothZoom : true
});
const requiredPresetIds = {
        smoothSecondAndMinute : 1,
        minuteAndHour         : 1,
        dayNightShift         : 1,
        weekAndDayLetter      : 1,
        monthAndYear          : 1
    },
    // The set of available Presets is what provides the zoom levels.
    presets = PresetManager.records.filter(p => requiredPresetIds[p.id]);

//endregion

//region Data

const resources = [{
        id         : 1,
        name       : 'Arcady',
        role       : 'Core developer',
        eventColor : 'purple'
    }, {
        id         : 2,
        name       : 'Dave',
        role       : 'Tech Sales',
        eventColor : 'indigo'
    }, {
        id         : 3,
        name       : 'Henrik',
        role       : 'Sales',
        eventColor : 'blue'
    }, {
        id         : 4,
        name       : 'Linda',
        role       : 'Core developer',
        eventColor : 'cyan'
    }, {
        id         : 5,
        name       : 'Maxim',
        role       : 'Developer & UX',
        eventColor : 'green'
    }, {
        id         : 6,
        name       : 'Mike',
        role       : 'CEO',
        eventColor : 'lime'
    }, {
        id         : 7,
        name       : 'Lee',
        role       : 'CTO',
        eventColor : 'orange'
    }],
    events = [{
        id          : 1,
        resourceId  : 1,
        percentDone : 60,
        startDate   : new Date(2017, 0, 1, 10),
        endDate     : new Date(2017, 0, 1, 12)
    }, {
        id          : 2,
        resourceId  : 2,
        percentDone : 20,
        startDate   : new Date(2017, 0, 1, 12),
        endDate     : new Date(2017, 0, 1, 17)
    }, {
        id          : 3,
        resourceId  : 3,
        percentDone : 80,
        startDate   : new Date(2017, 0, 1, 14),
        endDate     : new Date(2017, 0, 1, 16)
    }, {
        id          : 4,
        resourceId  : 4,
        percentDone : 90,
        startDate   : new Date(2017, 0, 1, 8),
        endDate     : new Date(2017, 0, 1, 11)
    }, {
        id          : 5,
        resourceId  : 5,
        percentDone : 40,
        startDate   : new Date(2017, 0, 1, 15),
        endDate     : new Date(2017, 0, 1, 17)
    }, {
        id          : 6,
        resourceId  : 6,
        percentDone : 70,
        startDate   : new Date(2017, 0, 1, 16),
        endDate     : new Date(2017, 0, 1, 18)
    }];

//endregion

class EventModelWithPercent extends SchedulerEventModel {
    static fields = [{
        name         : 'percentDone',
        type         : 'number',
        defaultValue : 0
    }];
}
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventStyle : 'filled',
    features   : {
        stripe : true,
        sort   : 'name'
    },
    columns : [{
        type  : 'resourceInfo',
        text  : 'Staff',
        width : '10em'
    }],
    resources,
    eventStore : {
        modelClass : EventModelWithPercent,
        data       : events
    },
    startDate     : new Date(2017, 0, 1),
    endDate       : new Date(2017, 0, 2),
    // Use our custom list of just the ones we plucked out of the PresetManager
    presets,
    viewPreset    : 'dayNightShift',
    eventRenderer : ({
        eventRecord,
        renderData
    }) => {
        const value = eventRecord.percentDone || 0;
        // Add a child to the event element (b-sch-event)
        renderData.children.push({
            className : 'value',
            style     : {
                width : `${value}%`
            },
            html : value
        });
    },
    listeners : {
        zoomLevelChange({
            zoomLevel
        }) {
            const me = this,
                {
                    zoomInButton,
                    zoomOutButton
                } = me.widgetMap;
            zoomOutButton.disabled = zoomLevel === me.minZoomLevel;
            zoomInButton.disabled = zoomLevel === me.maxZoomLevel;
        }
    },
    tbar : [{
        type    : 'viewpresetcombo',
        width   : '17em',
        ref     : 'presetCombo',
        presets : presets.map(p => p.id),
        picker  : {
            maxHeight : 500
        }
    }, {
        type      : 'button',
        ref       : 'zoomInButton',
        icon      : 'b-icon-search-plus',
        text      : 'Zoom in',
        rendition : 'text',
        onClick() {
            scheduler.zoomIn({
                animate : true
            });
        }
    }, {
        type      : 'button',
        ref       : 'zoomOutButton',
        icon      : 'b-icon-search-minus',
        text      : 'Zoom out',
        rendition : 'text',
        onClick() {
            scheduler.zoomOut({
                animate : true
            });
        }
    }]
});