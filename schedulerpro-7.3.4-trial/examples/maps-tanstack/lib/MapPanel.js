/* global mapboxgl */
import Panel from '../../../lib/Core/widget/Panel.js';
import GlobalEvents from '../../../lib/Core/GlobalEvents.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import Toast from '../../../lib/Core/widget/Toast.js';

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
export default class MapPanel extends Panel {
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
