import shared from '../_shared/shared.module.js';
import { Model, Combo, Panel, GlobalEvents, DomHelper, StringHelper, Toast, DateHelper, DragHelper, SchedulerPro, EventModel, Splitter } from '../../build/schedulerpro.module.js';
//region "lib/Address.js"

// The data model for a task address
class Address extends Model {
    // The identifier Mapbox uses for its places
    static idField = 'place_id';

    static fields =  [
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
                <a href="https://github.com/mapbox/mapbox-gl-js/blob/main/LICENSE.txt">License</a>) and 
                <b>TanStack Table</b> (<a href="https://github.com/TanStack/table">GitHub</a>, 
                <a href="https://github.com/TanStack/table/blob/main/LICENSE">License</a>).</p> 
                <p>These are separately licensed 3rd party libraries not part of the Bryntum product.<br>If you plan to use MapBox 
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

// Handles dragging unscheduled task from the HTML table onto the schedule
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
        // Only allow drag of table rows inside the unplanned grid
        targetSelector     : '.b-unplanned-row'
    };

    afterConstruct() {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement) {
        const
            { context, schedule, grid }         = this,
            { timeAxisViewModel, isHorizontal } = schedule,
            // Get record from table row's data-id attribute
            recordId                            = grabbedElement.dataset.id,
            draggedTask                         = grid.store.getById(recordId),
            durationInPixels                    = timeAxisViewModel.getDistanceForDuration(draggedTask.durationMS),
            proxy                               = document.createElement('div'),
            preambleWidth                       = timeAxisViewModel.getDistanceForDuration(draggedTask.preamble.milliseconds),
            postambleWidth                      = timeAxisViewModel.getDistanceForDuration(draggedTask.postamble.milliseconds),
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
            <div class="b-sch-event-wrap b-colorize b-color-gray b-style-bordered b-unassigned-class b-sch-${schedule.mode} b-event-buffer ${axisSize < durationInPixels ? 'b-exceeds-axis-width' : '' }" role="presentation" style="${sizeProp}:${durationInPixels + preambleWidth + postambleWidth}px;${maxSizeProp}:${axisSize}px;${crossSizeProp}:${crossSize}px">
                <div class="b-sch-event-buffer b-sch-event-buffer-before" role="presentation" style="${sizeProp}: ${preambleWidth}px;"><span class="b-buffer-label" role="presentation">${draggedTask.preamble.toString()}</span></div>
                <div class="b-sch-event-buffer b-sch-event-buffer-after" role="presentation" style="${sizeProp}: ${postambleWidth}px;"><span class="b-buffer-label" role="presentation">${draggedTask.postamble.toString()}</span></div>
                <div class="b-sch-event b-has-content b-sch-event-with-icon">
                    <div class="b-sch-event-content">
                        <span class="event-name">${draggedTask.name}</span>
                        <span class="location"> <i class="fa fa-map-marker-alt"></i>${draggedTask.shortAddress || ''}</span>
                    </div>
                </div>
            </div>
        `;

        context.totalDuration = draggedTask.duration;

        return proxy;
    }
    onDragStart({ context }) {
        const
            me                 = this,
            { schedule, grid } = me,
            // Get task from table row's data-id attribute
            recordId           = context.grabbed.dataset.id,
            task               = grid.store.getById(recordId);

        context.task = task;
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
            endDate                 = newStartDate && DateHelper.add(newStartDate, totalDuration, task.durationUnit),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resourceRecord          = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]),
            calendar                = resourceRecord?.effectiveCalendar;

        // Only allow drops on the timeaxis
        context.valid = Boolean(resourceRecord && newStartDate &&
            // Ensure we don't break allowOverlap config
            (schedule.allowOverlap || schedule.isDateRangeAvailable(newStartDate, endDate, null, resourceRecord) &&
                // Respect resource's working time, if any
                (!calendar || calendar.isWorkingTime(newStartDate, endDate, true))));

        // Save reference to the resourceRecord so we can use it in onDrop
        context.resourceRecord = resourceRecord;
        context.startDate      = newStartDate;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            { schedule } = this;

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
                eventRecord : task,
                startDate   : dropDate,
                // Assign to the resourceRecord (resource) it was dropped on
                resourceRecord,
                element
            });
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
            eventMenu : {
                items : {
                // Add export option
                    unassign : {
                        text   : 'Unassign',
                        icon   : 'fa fa-user-times',
                        weight : 200,
                        onItem({ eventRecord }) {
                            // Remove all assignments from this event
                            eventRecord.assignments.forEach(assignment => assignment.remove());
                        }
                    }
                }
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
                width    : 190,
                editable : false,
                step     : 1,
                onChange : 'up.onDateFieldChange'
            },
            {
                type                 : 'textfield',
                ref                  : 'filterByName',
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

//region "lib/UnplannedGrid.js"

// Access TanStack Table from global scope (loaded via UMD)
const { createTable, getCoreRowModel, getSortedRowModel } = window.TableCore;

// Custom table widget using TanStack Table that displays unassigned appointments
class UnplannedGrid extends Panel {
    static type = 'unplannedgrid';
    static $name = 'UnplannedGrid';

    static configurable = {
        cls         : 'b-unplanned-grid no-demo-app-style', // Opt out of shared demo app styling
        flex        : '0 1 400px',
        collapsible : true,
        minHeight   : 0,
        header      : false,
        html        : `
            <div class="b-unplanned-grid-wrapper">
                <table class="b-unplanned-table">
                    <thead class="b-unplanned-table-head"></thead>
                    <tbody class="b-unplanned-table-body"></tbody>
                </table>
            </div>
        `,
        // Column definitions: accessorKey points to raw data, cell renderer formats for display
        columns : [
            {
                id          : 'name',
                header      : 'Unscheduled tasks',
                accessorKey : 'name',
                cell        : info => StringHelper.xss`<i class="fa fa-grip-vertical"></i> ${info.getValue()}`
            },
            {
                id          : 'location',
                header      : 'Location',
                accessorKey : 'address',
                cell        : info => StringHelper.encodeHtml(info.getValue()?.display_name || '')
            },
            {
                id          : 'duration',
                header      : 'Duration',
                accessorKey : 'fullDuration',
                cell        : info => {
                    const { fullDuration, durationUnit } = info.row.original;
                    return fullDuration ? DateHelper.formatDelta(fullDuration, durationUnit) : '';
                }
            },
            {
                id          : 'travelTime',
                header      : 'Travel time',
                accessorKey : 'preamble',
                cell        : info => {
                    const { preamble, durationUnit } = info.row.original;
                    return preamble ? DateHelper.formatDelta(preamble, durationUnit) : '';
                }
            },
            {
                id          : 'returnTime',
                header      : 'Return time',
                accessorKey : 'postamble',
                cell        : info => {
                    const { postamble, durationUnit } = info.row.original;
                    return postamble ? DateHelper.formatDelta(postamble, durationUnit) : '';
                }
            }
        ],
        tableState : {
            columnPinning : { left : [], right : [] },
            sorting       : []
        }
    };

    onPaint({ firstPaint }) {
        if (firstPaint) {
            // Set up event delegation for header clicks (only once)
            const thead = this.contentElement.querySelector('.b-unplanned-table-head');
            thead.addEventListener('click', (event) => {
                // Find the clicked TH element (bubble up from actual target)
                const th = event.target.closest('th');
                if (th) {
                    // Get the column from TanStack Table using the column ID
                    const column = this._table?.getColumn(th.dataset.columnId);
                    if (column) {
                        // Toggle sort direction (none → asc → desc → none)
                        column.toggleSorting();
                        // Re-render the table with new sort state
                        this.renderTable();
                    }
                }
            });

            this.renderTable();
        }
    }

    set project(project) {
        const me = this;
        me._project = project;

        // Chained store filters events with no assignments (unscheduled)
        me.store = project.eventStore.chain(eventRecord => !eventRecord.assignments.length);

        project.assignmentStore.on({
            change : () => {
                me.store.fillFromMaster();
                me.renderTable();
            },
            thisObj : me
        });

        me.store.fillFromMaster();
        me.renderTable();
    }

    renderTable() {
        const me = this;

        if (!me.rendered || !me.store || !me.columns) return;

        // Create TanStack Table instance (headless - provides logic, we render DOM manually)
        const table = createTable({
            data              : me.store.allRecords,
            columns           : me.columns,
            getCoreRowModel   : getCoreRowModel(),
            getSortedRowModel : getSortedRowModel(),
            state             : me.tableState,
            onStateChange     : updater => {
                me.tableState = updater(me.tableState);
            },
            renderFallbackValue : null
        });

        // Store table instance for event delegation
        me._table = table;

        const
            thead   = me.contentElement.querySelector('.b-unplanned-table-head'),
            headers = table.getFlatHeaders(),
            tbody   = me.contentElement.querySelector('.b-unplanned-table-body');

        // Render column headers
        thead.innerHTML = '<tr class="b-unplanned-row">' +
            // For each header
            headers.map(({ column }) => {
                let sortIconClass = 'fa-sort';
                // Pick sorting icon class
                switch (column.getIsSorted()) {
                    case 'asc':
                        sortIconClass = 'fa-sort-up';
                        break;
                    case 'desc':
                        sortIconClass = 'fa-sort-down';
                }
                return `
                    <th data-column-id="${column.id}">
                        <span>${StringHelper.encodeHtml(column.columnDef.header)}</span>
                        <i class="sort-icon fa ${sortIconClass}"></i>
                    </th>`;
            }).join('') +
            '</tr>';

        // Render table body rows
        tbody.innerHTML = table.getRowModel().rows.map(row => {
            return `<tr class="b-unplanned-row" data-id="${row.original.id}">` +
                // Render each visible cell of the row
                row.getVisibleCells().map(cell => {
                    const
                        renderFn = cell.column.columnDef.cell,
                        // If "cell" function is provided - call it, otherwise use the cell value
                        content  = renderFn ? renderFn(cell.getContext()) : StringHelper.encodeHtml(cell.getValue());
                    return `<td class="b-unplanned-cell">${content}</td>`;
                }).join('') +
                '</tr>';
        }).join('');
    }

}

UnplannedGrid.initClass();

//endregion

//region "lib/Task.js"

// Simple task class with an extra address field (which can be edited with the AddressSearchField)
class Task extends EventModel {
    static fields = [
        { name : 'address' },
        // in this demo, default duration for tasks will be 1 hour (instead of days)
        { name : 'duration', defaultValue : 1 },
        { name : 'durationUnit', defaultValue : 'h' }
    ];

    get shortAddress() {
        return (this.address?.display_name || '').split(',')[0];
    }
}

//endregion

// This simple demo consists of two main classes, a schedule and a map. Open the 'lib' folder to see the application
// classes used.
const
    schedule = new Schedule({
        ref         : 'schedule',
        insertFirst : 'main',
        // Enables smoother wheel and pinch zooming
        smoothZoom  : true,
        startDate   : new Date(2026, 11, 1, 8),
        endDate     : new Date(2026, 11, 1, 20),
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
                unplannedGrid.toggleCollapsed(!value);
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

// Holds unplanned sessions, that can be dragged to the schedule
const unplannedGrid = new UnplannedGrid({
    ref       : 'unplanned',
    appendTo  : 'content',
    project   : schedule.project,
    collapsed : true,
    listeners : {
        cellClick : ({ record }) => {
            // When an event bar is clicked, bring the marker into view and show a tooltip
            if (record.marker) {
                mapPanel?.showTooltip(record, true);
            }
        }
    }
});

// Handles dragging
new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    // Restrict dragging to the table body so the header row cannot initiate a drag
    outerElement : unplannedGrid.element.querySelector('.b-unplanned-table-body')
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
