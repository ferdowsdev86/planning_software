var {
    Scheduler
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo       : 'container',
    rowHeight      : 60,
    barMargin      : 5,
    eventStyle     : 'colored',
    // Use smooth zooming
    smoothZoom     : true,
    // Don't allow zooming in further than hourAndDay preset
    maxZoomLevel   : 'hourAndDay',
    // Don't allow zooming out further than monthAndYear preset
    minZoomLevel   : 'monthAndYear',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    startDate   : new Date(2026, 0, 1),
    endDate     : new Date(2027, 0, 9),
    visibleDate : new Date(2026, 5, 1),
    viewPreset  : 'weekAndDayLetter',
    features    : {
        stripe    : true,
        eventEdit : {
            items : {
                locationField : {
                    type   : 'text',
                    name   : 'location',
                    label  : 'Location',
                    weight : 200
                }
            }
        }
    },
    columns : [{
        type           : 'resourceInfo',
        text           : 'Staff',
        width          : 170,
        showImage      : true,
        showEventCount : false,
        showRole       : true
    }],
    eventRenderer({
        eventRecord
    }) {
        return [{
            class : 'event-name',
            text  : eventRecord.name
        }, {
            class : 'event-location',
            text  : eventRecord.location
        }];
    },
    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },
    tbar : [{
        type    : 'button',
        ref     : 'zoomInButton',
        icon    : 'fa fa-magnifying-glass-plus',
        tooltip : 'Zoom in',
        onClick() {
            // Zoom in half-way to the next zoom level, with animation
            scheduler.zoomIn(.5, {
                animate : true
            });
        }
    }, {
        type    : 'button',
        ref     : 'zoomOutButton',
        icon    : 'fa fa-magnifying-glass-minus',
        tooltip : 'Zoom out',
        onClick() {
            // Zoom out half-way to the next zoom level, with animation
            scheduler.zoomOut(.5, {
                animate : true
            });
        }
    }, {
        type    : 'button',
        ref     : 'zoomToFitButton',
        icon    : 'fa fa-minimize',
        tooltip : 'Zoom to fit',
        onClick() {
            // Zoom to fit all events in view, with animation
            scheduler.zoomToFit({
                animate : true
            });
        }
    }, {
        type : 'timezoomslider',
        ref  : 'zoomSlider'
    }, '->', {
        type  : 'slider',
        label : 'Zoom sensitivity',
        ref   : 'zoomFactorSlider',
        min   : 1,
        max   : 4,
        step  : .5,
        unit  : 'x',
        onChange({
            value
        }) {
            scheduler.zoomFactor = value;
        }
    }],
    listeners : {
        zoomLevelChange({
            zoomLevel
        }) {
            const {
                zoomInButton,
                zoomOutButton
            } = scheduler.widgetMap;

            // The slider does not cover all zoom levels, so we disable the zoom in/out buttons when the zoom level is
            // within 10 levels of the min/max to prevent trying to zoom beyond the limits
            zoomInButton.disabled = zoomLevel >= scheduler.maxZoomLevel - 10;
            zoomOutButton.disabled = zoomLevel <= scheduler.minZoomLevel + 10;
        }
    }
});
scheduler.widgetMap.zoomFactorSlider.value = scheduler.zoomFactor;