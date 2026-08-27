var {
    Scheduler,
    DomHelper,
    Container
} = window.bryntum.schedulerpro;
const workingTime = {
    fromDay  : 1,
    toDay    : 6,
    fromHour : 8,
    toHour   : 17
};

// Get values from the form and use as working time config
function refreshWorkingTime() {
    const newWorkingTime = {};
    tools.eachWidget(field => {
        if (field.isType('number')) {
            newWorkingTime[field.name] = field.value;
        }
    });
    scheduler.workingTime = newWorkingTime;
    displayInfo();
}

// Display humanly readable info about working time in a bar below the header
function displayInfo() {
    const {
            info
        } = elements,
        {
            fromDay,
            toDay,
            fromHour,
            toHour
        } = scheduler.workingTime || {},
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayPart = fromDay >= 0 && toDay >= 0 ? `${days[fromDay]} - ${days[toDay - 1]}` : '',
        timePart = fromHour >= 0 && toHour >= 0 ? `${fromHour} - ${toHour}` : '';
    if (timePart || dayPart) {
        info.innerHTML = `<i class="fa fa-calendar-check"></i> Scheduler configured to show only working time: <b>${dayPart} ${timePart}</b>`;
        info.classList.remove('not-in-use');
    }
    else {
        info.innerHTML = '<i class="fa fa-calendar"></i> Scheduler not configured with working time';
        info.classList.add('not-in-use');
    }
}

// Create infrastructure to hold the different components of the demo
const elements = DomHelper.createElement({
    parent    : 'container',
    tag       : 'div',
    reference : 'outer',
    className : 'demo-app',
    dataset   : {
        appElement : true // To work with the built-in code editor, not demo related
    },
    children : [{
        reference : 'info'
    }, {
        reference : 'horizontal',
        children  : [{
            reference : 'container'
        }, {
            reference : 'tools'
        }]
    }]
});
const tools = new Container({
    appendTo      : elements.tools,
    labelPosition : 'align-before',
    items         : {
    // Combo for picking a view preset
        viewPresetCombo : {
            type     : 'combo',
            value    : 'week',
            editable : false,
            span     : 2,
            items    : [{
                value      : 'month',
                text       : 'Month',
                startDate  : new Date(2019, 0, 1),
                endDate    : new Date(2019, 2, 31),
                viewPreset : {
                    base              : 'monthAndYear',
                    displayDateFormat : 'ddd D/M HH:mm'
                }
            }, {
                value      : 'week',
                text       : 'Week',
                startDate  : new Date(2019, 1, 1),
                endDate    : new Date(2019, 1, 16),
                viewPreset : {
                    base              : 'weekAndMonth',
                    displayDateFormat : 'ddd D/M HH:mm',
                    timeResolution    : {
                        unit      : 'hour',
                        increment : 1
                    },
                    headers : [{
                        unit       : 'month',
                        align      : 'center',
                        dateFormat : 'MMM YYYY' //Jan 2017
                    }, {
                        unit       : 'week',
                        align      : 'center',
                        dateFormat : 'DD MMM (wW)'
                    }]
                }
            }, {
                value      : 'day',
                text       : 'Day',
                startDate  : new Date(2019, 1, 3),
                endDate    : new Date(2019, 1, 10),
                viewPreset : 'dayAndWeek'
            }],
            onSelect({
                record
            }) {
                scheduler.viewPreset = record.viewPreset;
                scheduler.setTimeSpan(record.startDate, record.endDate);
            }
        },
        // Button to toggle working time on/off
        workingTimeBtn : {
            type    : 'slidetoggle',
            text    : 'Use working time',
            checked : true,
            span    : 2,
            onChange({
                checked
            }) {
                const widgets = tools.widgetMap;
                widgets.fromHour.disabled = widgets.toHour.disabled = widgets.fromDay.disabled = widgets.toDay.disabled = widgets.restore.disabled = !checked;

                // Change the display, but keep the visual center the same to preserve user's context.
                scheduler.preserveViewCenter(() => {
                    if (checked) {
                        refreshWorkingTime();
                    }
                    else {
                        scheduler.workingTime = null;
                        displayInfo();
                    }
                });
            }
        },
        // Fields for configuring working time. Changing a field sets min/max value on the "opposite" field and
        // triggers setting a new working time config on Scheduler.
        fromHour : {
            type      : 'number',
            label     : 'From hour',
            name      : 'fromHour',
            clearable : true,
            min       : 0,
            onChange({
                value,
                userAction
            }) {
                tools.widgetMap.toHour.min = value + 1;
                userAction && refreshWorkingTime();
            }
        },
        toHour : {
            type      : 'number',
            label     : 'To hour',
            name      : 'toHour',
            clearable : true,
            max       : 24,
            onChange({
                value,
                userAction
            }) {
                tools.widgetMap.fromHour.max = value - 1;
                userAction && refreshWorkingTime();
            }
        },
        fromDay : {
            type      : 'number',
            label     : 'From day',
            name      : 'fromDay',
            clearable : true,
            min       : 0,
            onChange({
                value,
                userAction
            }) {
                tools.widgetMap.toDay.min = value + 1;
                userAction && refreshWorkingTime();
            }
        },
        toDay : {
            type      : 'number',
            label     : 'To day',
            name      : 'toDay',
            clearable : true,
            max       : 7,
            onChange({
                value,
                userAction
            }) {
                tools.widgetMap.fromDay.max = value - 1;
                userAction && refreshWorkingTime();
            }
        },
        // Button to restore working time to the initially used values
        restore : {
            type : 'button',
            text : 'Restore defaults',
            flex : 1,
            icon : 'fa fa-sync-alt',
            span : 2,
            onClick() {
                tools.record = scheduler.workingTime = workingTime;
                displayInfo();
            }
        }
    }
});

// Scheduler configured to use working time, with view preset and dates plucked from the combo
const scheduler = new Scheduler({
    appendTo       : elements.container,
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'traced',
    eventColor     : 'green',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    // Zooming feature is not supported!
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    features                  : {
        stripe     : true,
        timeRanges : true
    },
    columns : [{
        type : 'resourceInfo',
        text : 'Staff'
    }],
    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    barMargin  : 10,
    rowHeight  : 60,
    viewPreset : tools.widgetMap.viewPresetCombo.selected.viewPreset,
    startDate  : tools.widgetMap.viewPresetCombo.selected.startDate,
    endDate    : tools.widgetMap.viewPresetCombo.selected.endDate,
    workingTime
});

// Display working time in the configuration fields
tools.record = scheduler.workingTime;

// Update the top info bar to display correct initial info
displayInfo();