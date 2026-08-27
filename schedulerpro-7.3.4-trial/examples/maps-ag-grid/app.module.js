import shared from '../_shared/shared.module.js';
import { Model, Combo, Panel, GlobalEvents, DomHelper, StringHelper, Toast, DateHelper, DragHelper, SchedulerPro, EventModel, Splitter } from '../../build/schedulerpro.module.js';
//region "lib/Address.js"

// The data model for a task address
class Address extends Model {
    static idField = 'place_id'; // The identifier Mapbox uses for its places
    static fields = [
        'display_name',
        'lat',
        'lon'
    ];
}

//endregion

//region "lib/AddressSearchField.js"

// A custom remote search field, querying OpenStreetMap for addresses.
class AddressSearchField extends Combo {
    // Factoryable type name
    static type = 'addresssearchfield';

    static $name = 'AddressSearchField';

    static configurable = {
        clearWhenInputEmpty : true,
        clearable           : true,
        displayField        : 'display_name',
        // Setting the value field to null indicates we want the Combo to get/set address *records* as opposed to the
        // id of an address record.
        valueField          : null,
        filterOnEnter       : true,
        filterParamName     : 'q',
        store               : {
            modelClass : Address,
            readUrl    : 'https://nominatim.openstreetmap.org/search',
            encodeFilterParams(filters) {
                return filters[0].value;
            },
            params : {
                format : 'json'
            },
            fetchOptions : {
                // Please see MDN for fetch options: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
                credentials : 'omit'
            }
        },
        // Addresses can be long
        pickerWidth    : 450,
        validateFilter : false,
        listCls        : 'address-results',
        // Custom list item template to show a map icon with lat + lon
        listItemTpl    : address => `<i class="fa fa-map-marker-alt"></i>
            <div class="address-container">
                <span class="address-name">${address.display_name}</span>
                <span class="lat-long">${address.lat}°, ${address.lon}°</span>
            </div>
        `
    };
}

AddressSearchField.initClass();

//endregion

//region "lib/MapPanel.js"

/* global mapboxgl */

// NOTE: You must use your own Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWF0c2JyeW50c2UiLCJhIjoiY2tlcHdqd2lrM3hlZjJybHRpeDR0amo1cCJ9.PJc0GY_loGf0iQKlewuL0w';
const detectWebGL = () => {
    try {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const supported = Boolean(canvas.getContext('webgl'));
        canvas.remove();
        return supported;
    }
    catch (e) {
        return false;
    }
};

// A simple class containing a MapboxGL JS map instance
class MapPanel extends Panel {
    // Factoryable type name
    static type = 'mappanel';

    static $name = 'MapPanel';

    static configurable =  {
        monitorResize : true,
        // Some defaults of the initial map display
        zoom          : 11,
        lat           : 40.7128,
        lon           : -74.0060,
        textContent   : false,

        // Toolbar buttons
        tbar : [
            {
                type : 'widget',
                cls  : 'widget-title',
                html : 'Map View',
                flex : 1
            },
            {
                type  : 'buttongroup',
                items : [
                    {
                        icon    : 'fa fa-plus',
                        onClick : 'up.onZoomIn'
                    },
                    {
                        icon    : 'fa fa-minus',
                        onClick : 'up.onZoomOut'
                    }
                ]
            }
        ]
    };

    onZoomIn() {
        this.map.zoomIn();
    }

    onZoomOut() {
        this.map.zoomOut();
    }

    composeBody() {
        const result = super.composeBody();

        result.listeners = {
            click    : 'onMapClick',
            delegate : '.mapboxgl-marker'
        };

        return result;
    }

    construct() {
        const me = this;

        super.construct(...arguments);

        if (!detectWebGL()) {
            Toast.show({
                html    : `ERROR! Can not show maps. WebGL is not supported!`,
                color   : 'b-red',
                style   : 'color:white',
                timeout : 0
            });
            return;
        }


        Toast.show({
            html : `<p>This demo uses the awesome <b>MapBox GL JS</b> library (<a href="https://github.com/mapbox/mapbox-gl-js">GitHub</a>, 
                <a href="https://github.com/mapbox/mapbox-gl-js/blob/main/LICENSE.txt">License</a>).</p> 
                <p>It is a separately licensed 3rd party library not part of the Bryntum product,<br>if you plan to use it 
                in your app you must use your own access token.</p>
            `,
            timeout : 10000
        });

        const mapContainerEl = me.contentElement;

        // NOTE: You must use your own Mapbox access token
        me.map = new mapboxgl.Map({
            container : mapContainerEl,
            style     : 'mapbox://styles/mapbox/streets-v11',
            center    : [me.lon, me.lat],
            zoom      : me.zoom
        });

        // First load the map and then set up our event listeners for store CRUD and time axis changes
        me.map.on('load', async() => {
            // Demo code editor destroys created Widgets on editing code
            if (me.isDestroying) {
                return;
            }

            mapContainerEl.classList.add('maploaded');

            // await for the project commit to complete to have all data normalized before adding the markers
            // otherwise the `this.timeAxis.isTimeSpanInAxis(eventRecord)` check may fail in the
            // `addEventMarker()` method, because of the missing end date in the record
            await me.eventStore.project.commitAsync();

            me.onStoreChange({ action : 'dataset', records : me.eventStore.records });
        });

        me.eventStore.on('change', me.onStoreChange, me);
        me.timeAxis.on('reconfigure', me.onTimeAxisReconfigure, me);

        // Switch to dark maps for dark theme
        GlobalEvents.on({
            theme   : 'onThemeChange',
            thisObj : me
        });

        me.setMapStyle();
    }

    setMapStyle() {
        const mapStyle = DomHelper.isDarkTheme ? 'dark-v10' : 'streets-v11';

        this.map.setStyle('mapbox://styles/mapbox/' + mapStyle);
    }

    // When data changes in the eventStore, update the map markers accordingly
    async onStoreChange(event) {
        // await for the project commit to complete to have all data normalized before adding the markers
        await this.eventStore.project.commitAsync();

        switch (event.action) {
            case 'add':
            case 'dataset':
                if (event.action === 'dataset') {
                    this.removeAllMarkers();
                }
                event.records.forEach(eventRecord => this.addEventMarker(eventRecord));
                break;

            case 'remove':
                event.records.forEach(event => this.removeEventMarker(event));
                break;

            case 'update': {
                const eventRecord = event.record;

                this.removeEventMarker(eventRecord);
                this.addEventMarker(eventRecord);
                break;
            }

            case 'filter': {
                const renderedMarkers = [];

                this.eventStore.query(rec => rec.marker, true).forEach(eventRecord => {
                    if (!event.records.includes(eventRecord)) {
                        this.removeEventMarker(eventRecord);
                    }
                    else {
                        renderedMarkers.push(eventRecord);
                    }
                });

                event.records.forEach(eventRecord => {
                    if (!renderedMarkers.includes(eventRecord)) {
                        this.addEventMarker(eventRecord);
                    }
                });

                break;
            }
        }
    }

    // Only show markers for events inside currently viewed time axis
    onTimeAxisReconfigure({ source : timeAxis }) {
        this.eventStore.forEach(eventRecord => {
            this.removeEventMarker(eventRecord);
            this.addEventMarker(eventRecord);
        });
    }

    // Puts a marker on the map, if it has lat/lon specified + the timespan intersects the time axis
    addEventMarker(eventRecord) {
        if (!eventRecord.address) return;

        const { lat, lon } = eventRecord.address;

        if (lat && lon && (!eventRecord.isScheduled || this.timeAxis.isTimeSpanInAxis(eventRecord))) {
            const
                color  = eventRecord.eventColor || eventRecord.resource?.eventColor || 'var(--b-neutral-90)',
                marker = new mapboxgl.Marker({
                    color
                }).setLngLat([lon, lat]);

            marker.getElement().id = eventRecord.id;

            eventRecord.marker = marker;
            marker.eventRecord = eventRecord;
            marker.addTo(this.map);
        }
    }

    removeEventMarker(eventRecord) {
        const marker = eventRecord.marker;

        if (marker) {
            marker.popup && marker.popup.remove();
            marker.popup = null;
            marker.remove();
        }
        eventRecord.marker = null;
    }

    removeAllMarkers() {
        this.eventStore.forEach(eventRecord => this.removeEventMarker(eventRecord));
    }

    scrollMarkerIntoView(eventRecord) {
        const marker = eventRecord.marker;

        this.map.easeTo({
            center : marker.getLngLat()
        });
    }

    showTooltip(eventRecord, centerAtMarker) {
        const
            me     = this,
            marker = eventRecord.marker;

        me.popup?.remove();

        if (centerAtMarker) {
            me.scrollMarkerIntoView(eventRecord);
        }

        const popup = me.popup = marker.popup = new mapboxgl.Popup({
            offset : [0, -21]
        });

        popup.setLngLat(marker.getLngLat());
        popup.setHTML(StringHelper.xss`<span class="event-name">${eventRecord.name}</span>
        <span class="resource"><i class="fa fa-fw fa-user"></i>${eventRecord.resource?.name || 'Unassigned'}</span>
        <span class="location"><i class="fa fa-fw fa-map-marker-alt"></i>${eventRecord.shortAddress}</span>
        `);
        popup.addTo(me.map);
    }

    onMapClick({ target }) {
        const markerEl = target.closest('.mapboxgl-marker');

        if (markerEl) {
            const eventRecord = this.eventStore.getById(markerEl.id);

            this.showTooltip(eventRecord);
            this.trigger('markerclick', { marker : eventRecord.marker, eventRecord });
        }
    }

    onResize() {
        // This widget was resized, so refresh the Mapbox map
        this.map?.resize();
    }

    onThemeChange() {
        this.setMapStyle();
    }
}

// Register this widget type with its Factory
MapPanel.initClass();

//endregion

//region "lib/Drag.js"

// Handles dragging unscheduled task from the grid onto the schedule
class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        autoSizeClonedTarget : false,
        unifiedProxy         : true,

        // Prevent removing proxy on drop, we adopt it for usage in the Schedule
        removeProxyAfterDrop : false,

        // Don't drag the actual row element, clone it
        cloneTarget        : true,
        // Only allow drops on the schedule area
        dropTargetSelector : '.b-timeline-sub-grid',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector     : '.ag-row'
    };

    afterConstruct(config) {
    // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement) {
        const
            { context, schedule }               = this,
            { timeAxisViewModel, isHorizontal } = schedule,
            rowId                               = grabbedElement.getAttribute('row-id'),
            draggedTask                         = this.grid.getRowNode(rowId || ''),
            durationInPixels                    = timeAxisViewModel.getDistanceForDuration(draggedTask.data.durationMS),
            proxy                               = document.createElement('div'),
            preambleWidth                       = timeAxisViewModel.getDistanceForDuration(draggedTask.data.preamble.milliseconds),
            postambleWidth                      = timeAxisViewModel.getDistanceForDuration(draggedTask.data.postamble.milliseconds),
            sizeProp                            = isHorizontal ? 'width' : 'height',
            maxSizeProp                         = isHorizontal ? 'max-width' : 'max-height',
            crossSizeProp                       = isHorizontal ? 'height' : 'width',
            // In horizontal mode resource lanes are rows (cross size = row height); in vertical mode they
            // are columns (cross size = resource column width)
            crossSize                           = (isHorizontal ? schedule.rowHeight : schedule.resourceColumnWidth) - 2 * schedule.resourceMargin,
            // In horizontal mode the time axis runs along the width; in vertical mode along the height
            axisSize                            = isHorizontal ? schedule.timeAxisSubGrid.width : schedule.timeAxisSubGrid.height;

        proxy.classList.add(`b-sch-${schedule.mode}`, 'b-event-buffer');

        // Fake an event bar
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event-wrap b-colorize b-color-gray b-style-bordered b-unassigned-class b-sch-${schedule.mode} b-event-buffer ${axisSize < durationInPixels ? 'b-exceeds-axis-width' : ''}" role="presentation" style="${sizeProp}:${durationInPixels + preambleWidth + postambleWidth}px;${maxSizeProp}:${axisSize}px;${crossSizeProp}:${crossSize}px">
                <div class="b-sch-event-buffer b-sch-event-buffer-before" role="presentation" style="${sizeProp}: ${preambleWidth}px;"><span class="b-buffer-label" role="presentation">${draggedTask.data.preamble.toString()}</span></div>
                <div class="b-sch-event-buffer b-sch-event-buffer-after" role="presentation" style="${sizeProp}: ${postambleWidth}px;"><span class="b-buffer-label" role="presentation">${draggedTask.data.postamble.toString()}</span></div>
                <div class="b-sch-event b-has-content b-sch-event-with-icon">
                    <div class="b-sch-event-content">
                        <span class="event-name">${draggedTask.data.name}</span>
                        <span class="location"> <i class="fa fa-map-marker-alt"></i>${
                          draggedTask.data.shortAddress || ''
                        }</span>
                    </div>
                </div>
            </div>
        `;

        context.totalDuration = (draggedTask.data.durationMS + draggedTask.data.preamble.milliseconds + draggedTask.data.postamble.milliseconds) / (1000 * 60 * 60); // in hours
        context.task = draggedTask;

        return proxy;
    }

    onDragStart({ context }) {
        const { schedule } = this;
        context.tasks = [context.task];

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule }            = this,
            { task, totalDuration } = context,
            coordinate              = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            newStartDate            = schedule.getDateFromCoordinate(coordinate, 'round'),
            endDate                 = newStartDate && DateHelper.add(newStartDate, totalDuration, task.data.durationUnit),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resourceRecord          = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]),
            calendar                = resourceRecord?.effectiveCalendar;

        // Only allow drops on the timeaxis
        context.valid = Boolean(resourceRecord && newStartDate &&
        // Ensure we don't break allowOverlap config
        (schedule.allowOverlap || (schedule.isDateRangeAvailable(newStartDate, endDate, null, resourceRecord) &&
            // Respect resource's working time, if any
            (!calendar || calendar.isWorkingTime(newStartDate, endDate, true))))
        );

        // Save reference to the resourceRecord so we can use it in onDrop
        context.resourceRecord = resourceRecord;
        context.startDate      = newStartDate;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const { schedule, grid } = this;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const
                { task, element, resourceRecord } = context,
                coordinate                        = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
                bufferSizeProp                    = schedule.isHorizontal ? 'offsetWidth' : 'offsetHeight',
                dropDate                          = schedule.getDateFromCoordinate(coordinate + element.querySelector('.b-sch-event-buffer-before')[bufferSizeProp], 'round', false);

            schedule.suspendAnimations();
            // We hand over the data + existing element to the Scheduler so it do the scheduling
            // await is used so that we have a reliable end date in the case of multiple event drag
            await schedule.scheduleEvent({
                eventRecord : task.data,
                startDate   : dropDate,
                // Assign to the resourceRecord (resource) it was dropped on
                resourceRecord,
                element
            });

            // Remove from AG Grid
            const gridRowNode = grid.getRowNode(
                task.id.toString()
            );

            if (gridRowNode?.data) {
                grid.applyTransaction({ remove : [gridRowNode.data] });
            }

            schedule.resumeAnimations();
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}

//endregion

//region "lib/Schedule.js"

class Schedule extends SchedulerPro {
    static type = 'schedule';
    static $name =  'Schedule';

    static configurable = {
        allowOverlap : false,
        // Custom view preset with header configuration
        viewPreset   : {
            tickWidth         : 20,
            displayDateFormat : 'LST',
            shiftIncrement    : 1,
            shiftUnit         : 'day',
            timeResolution    : {
                unit      : 'minute',
                increment : 30
            },
            headers : [{
                unit       : 'hour',
                dateFormat : 'LST'
            }]
        },
        features : {
            stripe      : true,
            eventBuffer : {
                // The event buffer time spans are considered as unavailable time
                bufferIsUnavailableTime : true
            },
            taskEdit : {
                items : {
                    generalTab : {
                        items : {
                            resourcesField : {
                                required : true
                            },
                            // For this demo we add an extra remote address search field
                            addressField : {
                                type   : 'addresssearchfield',
                                label  : 'Address',
                                name   : 'address',
                                weight : 100
                            },
                            preambleField : {
                                label : 'Travel to'
                            },
                            postambleField : {
                                label : 'Travel from'
                            }
                        }
                    }
                }
            }
        },

        rowHeight  : 80,
        barMargin  : 4,
        eventStyle : 'traced',

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Name',
                width          : 200,
                showEventCount : false,
                showRole       : true
            }
        ],

        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },

        tbar : [
            {
                text    : 'Add task',
                icon    : 'fa fa-plus',
                color   : 'b-green',
                onClick : 'up.onNewEventClick'
            },
            '->',
            {
                type     : 'datefield',
                ref      : 'dateField',
                width    : 180,
                editable : false,
                step     : 1,
                onChange : 'up.onDateFieldChange'
            },
            {
                type                 : 'textfield',
                ref                  : 'filterByName',
                width                : 180,
                placeholder          : 'Filter tasks',
                clearable            : true,
                keyStrokeChangeDelay : 100,
                triggers             : {
                    filter : {
                        align : 'start',
                        cls   : 'fa fa-filter'
                    }
                },
                onChange : 'up.onFilterChange'
            },
            {
                type     : 'slidetoggle',
                ref      : 'toggleUnscheduled',
                label    : 'Show unscheduled',
                value    : true,
                height   : 'auto',
                onChange : 'up.onToggleUnscheduled'
            }
        ]
    };

    construct(...args) {
        super.construct(...args);

        this.widgetMap.dateField.value = this.startDate;
    }

    onFilterChange({ value }) {
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Replace all previous filters and set a new filter
        this.eventStore.filter({
            filters : event => new RegExp(value, 'i').test(event.name),
            replace : true
        });
    }

    onDateFieldChange({ value, userAction }) {
        userAction && this.setTimeSpan(DateHelper.add(value, 8, 'hour'), DateHelper.add(value, 20, 'hour'));
    }

    onNewEventClick() {
        const newTask = new this.eventStore.modelClass({
            startDate : this.startDate
        });

        this.editEvent(newTask);
    }

    onPrevious() {
        this.shiftPrevious();
    }

    onNext() {
        this.shiftNext();
    }

    onToggleUnscheduled({ value }) {
        this.trigger('unscheduledToggle', { value });
    }

    // Custom event renderer showing the task name + location icon with a shortened address text
    eventRenderer({ eventRecord }) {
        return [
            {
                tag       : 'span',
                className : 'event-name',
                html      : StringHelper.encodeHtml(eventRecord.name)
            },
            {
                tag       : 'span',
                className : 'location',
                children  : [
                    eventRecord.shortAddress ? {
                        tag       : 'i',
                        className : 'fa fa-map-marker-alt'
                    } : null,
                    eventRecord.shortAddress || '⠀'
                ]
            }
        ];
    }
}

Schedule.initClass();

//endregion

//region "lib/Task.js"

// Simple task class with an extra address field (which can be edited with the AddressSearchField)
class Task extends EventModel {
    static get fields() {
        return [
            { name : 'address' },
            // in this demo, default duration for tasks will be 1 hour (instead of days)
            { name : 'duration', defaultValue : 1 },
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    get shortAddress() {
        return (this.address?.display_name || '').split(',')[0];
    }
}

//endregion

//region "lib/AgGridPanel.js"

const agGrid = window.agGrid;

class AgGridPanel extends Panel {
    // Factoryable type name
    static type = 'aggridpanel';

    static $name = 'AgGridPanel';

    construct({ gridProps }) {
        const me = this;

        super.construct(...arguments);

        // Create the AG Grid instance
        me.agGrid = agGrid.createGrid(me.contentElement, gridProps);

        // Switch theme for AG Grid when Bryntum theme changes
        GlobalEvents.on({
            theme   : 'onThemeChange',
            thisObj : me
        });

        me.setThemeStyle();


        Toast.show({
            html : `<p>This demo uses the <b>AG Grid Community Edition</b> 
                (<a href="https://github.com/ag-grid/ag-grid" target="_blank">GitHub</a>, 
                <a href="https://github.com/ag-grid/ag-grid/blob/latest/LICENSE.txt" target="_blank">License</a>).</p> 
                <p>It is a separately licensed 3rd party library not part of the Bryntum product.<br>
                If you plan to use AG Grid in your app, please review their licensing terms.</p>
            `,
            timeout : 10000
        });
    }

    setThemeStyle() {
        const colorScheme = DomHelper.isDarkTheme ? 'colorSchemeDark' : 'colorSchemeLight';

        this.agGrid.setGridOption('theme', agGrid.themeQuartz.withParams({
            fontFamily : 'inherit'
        }).withPart(agGrid[colorScheme]));
    }

    onThemeChange() {
        this.setThemeStyle();
    }
}

// Register this widget type with its Factory
AgGridPanel.initClass();

//endregion

// This simple demo consists of two main classes, a schedule and a map. Open the 'lib' folder to see the application
// classes used.
const schedule = new Schedule({
    ref         : 'schedule',
    insertFirst : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2025, 11, 1, 8),
    endDate     : new Date(2025, 11, 1, 20),
    minHeight   : 0,
    flex        : 5,
    collapsible : true,
    header      : false,
    // Configure the Project with a path, and the Store or Model to use for the loaded data.
    project     : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        loadUrl : 'data/data.json'
    },
    listeners : {
        eventClick : ({ eventRecord }) => {
            // When an event bar is clicked, bring the marker into view and show a tooltip
            if (eventRecord.marker) {
                mapPanel?.showTooltip(eventRecord, true);
            }
        },

        afterEventSave : ({ eventRecord }) => {
            if (eventRecord.marker) {
                mapPanel?.scrollMarkerIntoView(eventRecord);
            }
        },

        unscheduledToggle({ value }) {
            agGridPanel.toggleCollapsed(!value);
        }
    }
});

// A draggable splitter between the Scheduler and map widgets
new Splitter({
    appendTo    : 'main',
    showButtons : true
});

// A draggable splitter between the Scheduler and unplanned grid
new Splitter({
    appendTo    : 'content',
    showButtons : 'end',
    listeners   : {
        splitterCollapseClick : () => {
            schedule.tbar.widgetMap.toggleUnscheduled.value = true;
        },
        splitterExpandClick : () => {
            schedule.tbar.widgetMap.toggleUnscheduled.value = false;
        }
    }
});

const
    valueFormatter = ({ value }) => value?.toString() ?? '0 minutes',
    // Create the AG Grid to show unplanned tasks
    agGridPanel    = new AgGridPanel({
        gridProps : {
            // Data to be displayed
            rowData    : [],
            // Columns to be displayed (Should match rowData properties)
            columnDefs : [
                {
                    headerName   : 'Unscheduled tasks',
                    flex         : 1,
                    field        : 'name',
                    cellRenderer : ({ value }) => `<i style="margin-inline-end: 10px;" class="fa fa-grip"></i>${StringHelper.encodeHtml(value) || ''}`
                },
                {
                    headerName : 'Location',
                    flex       : 1,
                    field      : 'address.display_name',
                    editable   : false
                },
                {
                    width : 120,
                    field : 'fullDuration',
                    valueFormatter
                },
                {
                    width : 120,
                    field : 'preamble',
                    valueFormatter
                },
                {
                    width : 120,
                    field : 'postamble',
                    valueFormatter
                }
            ],
            rowSelection : {
                mode                 : 'singleRow',
                // Enable the row selection on row click
                enableClickSelection : true,
                // Remove the selection column
                checkboxes           : false
            },
            // Do not focus cells when selecting rows
            suppressCellFocus  : true,
            // Highlight the location in maps when a row is selected
            onSelectionChanged : ({ selectedNodes }) => {
                const eventRecord = selectedNodes[0]?.data;
                if (eventRecord) {
                    mapPanel?.showTooltip(eventRecord, true);
                }
            }
        },
        collapsible : true,
        header      : false,
        minHeight   : 0,
        flex        : '0 1 300px',
        appendTo    : 'content',
        // Prevent demo styles from affecting the grid
        cls         : 'no-demo-app-style'
    });

const unplannedGrid = agGridPanel.agGrid;

// Handles dragging
new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : document.querySelector('#content')
});

// A custom MapPanel wrapping the MapboxGL JS map. We provide it with the timeAxis and the eventStore
// So the map can show the same data as seen in the schedule
const mapPanel = new MapPanel({
    ref         : 'map',
    appendTo    : 'main',
    flex        : 2,
    minHeight   : 0,
    collapsible : true,
    header      : false,
    eventStore  : schedule.eventStore,
    timeAxis    : schedule.timeAxis,
    listeners   : {
        // When a map marker is clicked, scroll the event bar into view and highlight it
        markerclick : async({ eventRecord }) => {
            if (eventRecord.resources.length > 0) {
                await schedule.scrollEventIntoView(eventRecord, { animate : true, highlight : true });
                schedule.selectedEvents = [eventRecord];
            }
            else {
                await unplannedGrid.expand();
                schedule.tbar.widgetMap.toggleUnscheduled.value = true;
                // If the event is not assigned to a resource, scroll the unplanned grid row into view
                unplannedGrid.scrollRowIntoView(eventRecord, { animate : true, highlight : true });
            }
        }
    }
});

// Handle data sync between AG Grid and SchedulerPro

// Method to check for unassigned tasks
const formatUnplannedEvents = (eventStore, assignmentStore) => {
    if (!eventStore || !assignmentStore) return [];

    const unplannedEvents = eventStore.records.filter((event) => {
        // Check if event has any assignments
        const hasAssignments = (assignmentStore.records).some((assignment) =>
            assignment.eventId === event.id || assignment.event === event.id
        );
        return !hasAssignments;
    });

    return unplannedEvents;
};

// Method to update the unplanned tasks grid
const updateTasks = () => {
    try {
        const formattedTasks = formatUnplannedEvents(
            schedule.project.eventStore,
            schedule.project.assignmentStore
        );
        unplannedGrid.setGridOption('rowData', formattedTasks);
    }
    catch {
    }
};

// Listen to store changes for automatic updates
Object.entries({
    add    : updateTasks,
    remove : updateTasks,
    update : updateTasks
}).forEach(([event, handler]) => {
    schedule.project.assignmentStore.on(event, handler);
    schedule.project.eventStore.on(event, handler);
});

// Listen for project load completion
schedule.project.on('load', updateTasks);