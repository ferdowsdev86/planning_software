import mapboxgl from 'mapbox-gl';
import { ButtonConfig, ButtonGroupConfig, DomHelper, EventHelper, GlobalEvents, Panel, PanelConfig, StoreListeners, StringHelper, TimeAxis, Toast, WidgetConfig } from '@bryntum/schedulerpro';
import { constructParams, MarkerConfig, PopupConfig } from './Types';
import { TaskStore } from '../AppConfig';
import Task from './Task';

class CustomTimeAxis extends TimeAxis {
    declare isTimeSpanInAxis: (eventRecord: Task) => boolean;
}

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
    // Class properties
    static override type  = 'mappanel';
    static override $name = 'MapPanel';

    // Instance properties
    declare map: mapboxgl.Map;
    declare popup: mapboxgl.Popup;
    declare lon: number;
    declare lat: number;
    declare zoom: number;
    declare eventStore: TaskStore;
    declare timeAxis: CustomTimeAxis;

    // Configuration
    static get configurable() {
        return {
            monitorResize : true,
            // Some defaults of the initial map display
            zoom          : 11,
            lat           : 40.7128,
            lon           : -74.0060,
            textContent   : false,

            // Toolbar buttons
            tbar : [
                this.createTitleWidget(),
                this.createZoomButtonGroup()
            ]
        } as PanelConfig;
    }

    constructor(args: constructParams) {
        super(args);
    }

    // Initialization methods
    private static createTitleWidget = (): WidgetConfig => ({
        type : 'widget',
        cls  : 'widget-title',
        html : 'Map View',
        flex : 1
    });

    private static createZoomButtonGroup = (): ButtonGroupConfig => ({
        type        : 'buttonGroup',
        ref         : 'zoomGroup',
        toggleGroup : true,
        items       : [
            {
                icon    : 'fa fa-plus',
                onClick : 'up.onZoomIn'
            },
            {
                icon    : 'fa fa-minus',
                onClick : 'up.onZoomOut'
            }
        ] as ButtonConfig[]
    });

    // Lifecycle methods
    override construct(...args: constructParams[]) {
        const me = this;

        super.construct(...args);

        if (!detectWebGL()) {
            Toast.show({
                html    : `ERROR! Can not show show maps. WebGL is not supported!`,
                color   : 'b-red',
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

            me.onStoreChange({
                action  : 'dataset',
                records : me.eventStore.records,
                source  : me.eventStore,
                record  : me.eventStore.records[0],
                changes : {}
            });
        });

        me.eventStore.on('change', me.onStoreChange, me);
        me.timeAxis.on('reconfigure', me.onTimeAxisReconfigure, me);

        // @ts-expect-error EventHelper.addListener typing doesn't support delegate click handler signature
        EventHelper.addListener(mapContainerEl, 'click', me.onMapClick, { delegate : '.mapboxgl-marker', element : mapContainerEl, thisObj : me });
        // Switch to dark maps for dark theme
        GlobalEvents.on({
            theme   : 'onThemeChange',
            thisObj : me
        });
    }

    // Map interaction methods
    onZoomIn() {
        this.map.zoomIn();
    }

    onZoomOut() {
        this.map.zoomOut();
    }

    // Marker management
    addEventMarker(eventRecord: Task) {
        if (!eventRecord.address) return;

        const { lat, lon } = eventRecord.address;
        if (!lat || !lon || (!this.timeAxis.isTimeSpanInAxis(eventRecord) && eventRecord.isScheduled)) return;

        const marker = this.createMarker(eventRecord, lat, lon);
        this.attachMarkerToEvent(marker, eventRecord);
    }

    private createMarker(eventRecord: Task, lat: number, lon: number) {
        const color = eventRecord.eventColor || eventRecord.resource?.eventColor || '#f0f0f0';
        return new mapboxgl.Marker({ color } as MarkerConfig).setLngLat([lon, lat]);
    }

    private attachMarkerToEvent(marker: mapboxgl.Marker, eventRecord: Task) {
        marker.getElement().id      = eventRecord.id.toString();
        eventRecord.marker          = marker;
        (marker as any).eventRecord = eventRecord;
        marker.addTo(this.map);
    }

    removeEventMarker(eventRecord: Task) {
        const marker = eventRecord.marker;
        if (marker) {
            if ((marker as any).popup) {
                (marker as any).popup.remove();
                (marker as any).popup = null;
            }
            marker.remove();
        }
        (eventRecord as any).marker = null;
    }

    removeAllMarkers() {
        this.eventStore.forEach(eventRecord => this.removeEventMarker(eventRecord as Task));
    }

    // Map view methods
    scrollMarkerIntoView(eventRecord: Task) {
        const marker = eventRecord.marker;
        this.map.easeTo({ center : marker.getLngLat() });
    }

    showTooltip(eventRecord: Task, centerAtMarker: boolean) {
        const marker = eventRecord.marker;
        this.popup?.remove();

        if (centerAtMarker) {
            this.scrollMarkerIntoView(eventRecord);
        }

        this.createAndShowPopup(eventRecord, marker);
    }

    private createAndShowPopup(eventRecord: Task, marker: mapboxgl.Marker) {
        const popup = this.popup = (marker as any).popup = new mapboxgl.Popup({
            offset : [0, -21]
        } as PopupConfig);

        popup
            .setLngLat(marker.getLngLat())
            .setHTML(this.createPopupContent(eventRecord))
            .addTo(this.map);
    }

    private createPopupContent = (eventRecord: Task) => StringHelper.xss`
        <span class="event-name">${eventRecord.name}</span>
        <span class="resource"><i class="fa fa-fw fa-user"></i>${eventRecord.resource?.name || 'Unassigned'}</span>
        <span class="location"><i class="fa fa-fw fa-map-marker-alt"></i>${eventRecord.shortAddress}</span>
    `;

    // Event handlers
    onMapClick({ target }: { target: mapboxgl.Marker }) {
        const markerEl = (target as any).closest('.mapboxgl-marker');
        if (!markerEl) return;

        const eventRecord = this.eventStore.getById(markerEl.id) as Task;
        this.showTooltip(eventRecord, true);
        this.trigger('markerclick', {
            marker : eventRecord.marker,
            eventRecord
        });
    }

    override onResize = () => {
        // This widget was resized, so refresh the Mapbox map
        this.map?.resize();
    };

    onThemeChange({ theme }: { theme: string }) {
        const
            buttonIndex = theme.toLowerCase().match('dark') ? 1 : 0,
            button      = (this.tbar.widgetMap['themeGroup'] as ButtonGroupConfig)?.items?.[buttonIndex];

        this.setMapStyle();
        if (button) {
            button.pressed = true;
        }
    }

    onTimeAxisReconfigure() {
        this.eventStore.forEach(eventRecord => {
            this.removeEventMarker(eventRecord as Task);
            this.addEventMarker(eventRecord as Task);
        });
    }

    // Theme handling
    setMapStyle() {
        const
            isDark   = DomHelper.themeInfo?.name?.toLowerCase().match('dark'),
            mapStyle = isDark ? 'dark-v10' : 'streets-v11';

        this.map.setStyle('mapbox://styles/mapbox/' + mapStyle);
    }

    // When data changes in the eventStore, update the map markers accordingly
    async onStoreChange(event: Parameters<NonNullable<Exclude<StoreListeners['change'], string>>>[0]) {
        // await for the project commit to complete to have all data normalized before adding the markers
        await this.eventStore.project.commitAsync();

        switch (event.action) {
            case 'add':
            case 'dataset':
                if (event.action === 'dataset') {
                    this.removeAllMarkers();
                }
                event.records.forEach((eventRecord) => this.addEventMarker(eventRecord as Task));
                break;

            case 'remove':
                event.records.forEach((eventRecord) => this.removeEventMarker(eventRecord as Task));
                break;

            case 'update': {
                const eventRecord = event.record as Task;

                if (!eventRecord) return;
                this.removeEventMarker(eventRecord);
                this.addEventMarker(eventRecord);

                break;
            }

            case 'filter': {
                const
                    renderedMarkers: Task[] = [],
                    tasks                   = this.eventStore.query(record => Boolean((record as Task).marker), true) as Task[];

                tasks.forEach(eventRecord => {
                    if (!event.records.includes(eventRecord)) {
                        this.removeEventMarker(eventRecord);
                    }
                    else {
                        renderedMarkers.push(eventRecord);
                    }
                });

                event.records.forEach(eventRecord => {
                    const task = eventRecord as Task;
                    if (!renderedMarkers.includes(task)) {
                        this.addEventMarker(task);
                    }
                });

                break;
            }
        }
    }
}

// Register this widget type with its Factory
MapPanel.initClass();
