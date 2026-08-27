import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumGridComponent, BryntumSchedulerProComponent, BryntumSchedulerProProjectModelComponent, BryntumSplitterComponent } from '@bryntum/schedulerpro-angular';
import { ButtonListenersTypes, DateField, DateFieldListenersTypes, DateHelper, DragHelperConfig, Grid, GridListenersTypes, ProjectModel, SchedulerPro, SchedulerProListenersTypes, SlideToggle, SlideToggleListenersTypes, Splitter, StoreChainedClass, SubGrid, TextFieldListenersTypes, Toast } from '@bryntum/schedulerpro';
import { gridProps, projectProps, schedulerProProps } from './app.config';
import MapPanel from 'src/lib/MapPanel';
import Task from 'src/lib/Task';
import Drag from 'src/lib/Drag';
import '../assets/vendor/mapbox-gl.js';
import '../lib/AddressSearchField';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {

    projectProps          = projectProps;
    schedulerProProps     = schedulerProProps;
    gridProps             = gridProps;
    tbar                  = [
        {
            text      : 'Add task',
            ref       : 'newEventButton',
            color     : 'b-green',
            minHeight : '2.5em'
        },
        '->',
        {
            type     : 'datefield',
            ref      : 'dateField',
            width    : 190,
            editable : false,
            step     : 1
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
            }
        },
        {
            type   : 'slidetoggle',
            ref    : 'toggleUnscheduled',
            label  : 'Show unscheduled',
            height : 'auto'
        }
    ];

    private schedulerPro!: SchedulerPro;
    private project!: ProjectModel;
    private mapPanel!: MapPanel;
    private grid!: Grid;
    private dragHelper!: Drag;
    private unplannedSplitter!: Splitter;
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
    @ViewChild(BryntumSchedulerProProjectModelComponent) projectComponent!: BryntumSchedulerProProjectModelComponent;
    @ViewChild(BryntumGridComponent) gridComponent!: BryntumGridComponent;
    @ViewChild('unplannedSplitter', { static : false }) unplannedSplitterComponent!: BryntumSplitterComponent;

    ngAfterViewInit() {
        this.initializeComponents();
        this.setupGridStore();
        this.setupEventListeners();
        this.initializeDateField();
        this.showMap();
        this.setupDragHelper();
    }

    private setupGridStore = (): void => {
        this.grid.store = this.project.eventStore.chain(eventRecord => !(eventRecord as Task).assignments.length);
        this.grid.store.sort('name');
    };

    private initializeComponents = (): void => {
        this.schedulerPro      = this.schedulerProComponent.instance;
        this.project           = this.projectComponent.instance;
        this.grid              = this.gridComponent.instance;
        this.unplannedSplitter = this.unplannedSplitterComponent.instance;
    };

    private setupEventListeners = (): void => {
        this.schedulerPro.on({
            eventClick        : this.onEventClick,
            afterEventSave    : this.onAfterEventSave,
            unscheduledToggle : this.onUnscheduledToggle
        });

        this.project.assignmentStore.on({
            change : () => {
                (this.grid.store as StoreChainedClass).fillFromMaster();
            }
        });

        this.schedulerPro.widgetMap['dateField'].on('change', this.onDateFieldChange);
        this.schedulerPro.widgetMap['newEventButton'].on('click', this.onNewEventClick);
        this.schedulerPro.widgetMap['filterByName'].on('change', this.onFilterChange);
        this.schedulerPro.widgetMap['toggleUnscheduled'].on('change', this.onToggleUnscheduled);

        this.grid.on({
            cellClick : this.onCellClick
        });

        this.unplannedSplitter.on({
            splitterExpandClick   : this.onUnplannedSplitterToggle,
            splitterCollapseClick : this.onUnplannedSplitterToggle
        });
    };

    private initializeDateField = (): void => {
        (this.schedulerPro.widgetMap['dateField'] as DateField).value = this.schedulerPro.startDate;
    };

    private setupDragHelper = (): void => {
        this.dragHelper = new Drag({
            grid         : this.grid,
            schedule     : this.schedulerPro,
            constrain    : false,
            outerElement : this.grid.element
        } as DragHelperConfig);
    };

    private detectWebGL = (): boolean => {
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

    private showMap = (): void => {
        if (this.detectWebGL()) {
            this.initializeMapPanel();
            this.showMapboxLicenseToast();
        }
        else {
            this.showWebGLError();
        }
    };

    private initializeMapPanel = (): void => {
        this.mapPanel = new MapPanel({
            ref         : 'map',
            appendTo    : 'content',
            flex        : 3,
            collapsible : true,
            header      : false,
            eventStore  : this.schedulerPro.eventStore,
            timeAxis    : this.schedulerPro.timeAxis,
            listeners   : {
                markerclick : this.onMarkerClick.bind(this)
            }
        });
    };

    private onMarkerClick = async({ eventRecord }: { eventRecord: Task }): Promise<void> => {
        if (eventRecord.resources.length > 0) {
            await this.schedulerPro.scrollEventIntoView(eventRecord, { animate : true, highlight : true });
            this.schedulerPro.selectedEvents = [eventRecord];
        }
        else {
            await (this.grid as unknown as SubGrid).expand(true);
            (this.schedulerPro.widgetMap['toggleUnscheduled'] as SlideToggle).value = true;
            this.grid.scrollRowIntoView(eventRecord, { animate : true, highlight : true });
        }
    };

    onUnplannedSplitterToggle = ({ eventName }: { eventName: string }): void => {
        const slideToggle = this.schedulerPro.widgetMap['toggleUnscheduled'] as SlideToggle;
        slideToggle.value = eventName === 'splitterCollapseClick';
    };

    onEventClick: SchedulerProListenersTypes['eventClick'] = ({ eventRecord }) => {
        const task = eventRecord as Task;
        if (task.marker) {
            this.mapPanel?.showTooltip(task, true);
        }
    };

    onAfterEventSave: SchedulerProListenersTypes['afterEventSave'] = ({ eventRecord }) => {
        const task = eventRecord as Task;
        if (task.marker) {
            this.mapPanel?.scrollMarkerIntoView(task);
        }
    };

    onNewEventClick: ButtonListenersTypes['click'] = () => {
        const newTask = new this.project.eventStore.modelClass({
            startDate : this.schedulerPro.startDate
        });

        this.schedulerPro.editEvent(newTask);
    };

    onDateFieldChange: DateFieldListenersTypes['change'] = ({ value, userAction }) => {
        if (userAction) {
            const
                startTime = DateHelper.add(value, 8, 'hour'),
                endTime   = DateHelper.add(value, 20, 'hour');

            this.schedulerPro.setTimeSpan(startTime, endTime);
        }
    };

    onFilterChange: TextFieldListenersTypes['change'] = ({ value }) => {
        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Typings miss the { replace, filters } overload; cast to avoid excess-property error
        (this.schedulerPro.eventStore.filter as Function)({
            filters : (record : Task) => new RegExp(escapedValue, 'i').test(record.name),
            replace : true
        });
    };

    onToggleUnscheduled: SlideToggleListenersTypes['change'] = ({ value }) => {
        this.schedulerPro.trigger('unscheduledToggle', { value });
    };

    onUnscheduledToggle = ({ value } : { value: boolean }) => {
        this.grid.toggleCollapsed(!value);
    };

    onCellClick: GridListenersTypes['cellClick'] = ({ record }) => {
        const task = record as Task;
        if (task.marker) {
            this.mapPanel?.showTooltip(task, true);
        }
    };

    private showWebGLError = (): void => {
        Toast.show({
            html    : 'ERROR! Can not show show maps. WebGL is not supported!',
            color   : 'b-red',
            style   : 'color:white',
            timeout : 0
        });
    };

    private showMapboxLicenseToast = (): void => {

        Toast.show({
            html : `
                <p>This demo uses the awesome <b>MapBox GL JS</b> library (<a href="https://github.com/mapbox/mapbox-gl-js">GitHub</a>,
                <a href="https://github.com/mapbox/mapbox-gl-js/blob/main/LICENSE.txt">License</a>).</p>
                <p>It is a separately licensed 3rd party library not part of the Bryntum product,<br>if you plan to use it
                in your app you must use your own access token.</p>
            `,
            timeout : 20000
        });
    };
}
