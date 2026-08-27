<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSplitter, BryntumGrid, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-vue-3';
import { DateHelper, AssignmentStore } from '@bryntum/schedulerpro';
import type { DateFieldListenersTypes, EventStore, DragHelperConfig, TimeAxis, ProjectModel, SlideToggle, GridListenersTypes, SlideToggleListenersTypes, SchedulerProListenersTypes, FilterFieldListenersTypes, DateField, SubGrid } from '@bryntum/schedulerpro';
import { schedulerProProps, gridProps } from './AppConfig';
import MapPanel from './lib/MapPanel';
import Task from './lib/Task';
import Drag from './lib/Drag';

const schedulerProRef = ref<InstanceType<typeof BryntumSchedulerPro>>();
const gridRef = ref<InstanceType<typeof BryntumGrid>>();
const unplannedSplitterRef = ref<InstanceType<typeof BryntumSplitter>>();
const projectModelRef = ref<InstanceType<typeof BryntumSchedulerProProjectModel>>();

let mapPanel : MapPanel;

// Define event handlers for scheduler components
const onDateFieldChange : DateFieldListenersTypes['change'] = ({ value, userAction }) => {
    if (userAction) {
        const
            startTime = DateHelper.add(value, 8, 'hour'),
            endTime   = DateHelper.add(value, 20, 'hour');

        schedulerProRef.value?.instance.value.setTimeSpan(startTime, endTime);
    }
};

const onNewEventClick = () => {
    const newTask = new schedulerProRef.value.instance.value.eventStore.modelClass({
        startDate : schedulerProRef.value?.instance.value.startDate
    });

    schedulerProRef.value?.instance.value.editEvent(newTask);
};

const onAfterEventSave: SchedulerProListenersTypes['afterEventSave'] = ({ eventRecord }) => {
    const task = eventRecord as Task;
    if (task.marker) {
        mapPanel?.scrollMarkerIntoView(task);
    }
};

const onFilterChange : FilterFieldListenersTypes['change'] = ({ value }) => {
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    schedulerProRef.value?.instance.value.eventStore.filter({
        filters : (record : Task) => new RegExp(escapedValue, 'i').test(record.name),
        replace : true
    });
};

const onToggleUnscheduled: SlideToggleListenersTypes['change'] = ({ value }) => {
    schedulerProRef.value?.instance.value.trigger('toggleUnscheduled', { value });
};

const onEventClick: SchedulerProListenersTypes['eventClick'] = ({ eventRecord }) => {
    const task = eventRecord as Task;
    if (task.marker) {
        mapPanel?.showTooltip(task, true);
    }
};

const onUnplannedSplitterToggle = ({ eventName } : { eventName : string }) => {
    const slideToggle = schedulerProRef.value?.instance.value.widgetMap['toggleUnscheduled'] as SlideToggle;
    slideToggle.value = eventName === 'splitterCollapseClick';
};

const onMarkerClick = async({ eventRecord } : { eventRecord : Task }) => {
    if (eventRecord.resources.length > 0 && schedulerProRef.value?.instance.value) {
        await schedulerProRef.value.instance.value.scrollEventIntoView(eventRecord, { animate : true, highlight : true });
        schedulerProRef.value.instance.value.selectedEvents = [eventRecord];
    }
    else {
        await (gridRef.value?.instance.value as SubGrid).expand(true);
        (schedulerProRef.value?.instance.value.widgetMap['toggleUnscheduled'] as SlideToggle).value = true;
        gridRef.value?.instance.value.scrollRowIntoView(eventRecord, { animate : true, highlight : true });
    }
};

const onCellClick : GridListenersTypes['cellClick'] = ({ record }) => {
    const task = record as Task;
    if (task.marker) {
        mapPanel?.showTooltip(task, true);
    }
};

onMounted(() => {
    mapPanel = new MapPanel({
        ref         : 'map',
        appendTo    : 'main',
        flex        : 2,
        collapsible : true,
        header      : false,
        eventStore  : schedulerProRef.value?.instance.value.eventStore as EventStore,
        timeAxis    : schedulerProRef.value?.instance.value.timeAxis as TimeAxis,
        listeners   : {
            markerclick : onMarkerClick
        }
    });

    const schedulerPro = schedulerProRef.value?.instance.value;
    if (schedulerPro) {
        (schedulerPro.widgetMap['dateField'] as DateField).value = schedulerPro.startDate;
        schedulerPro.widgetMap['dateField'].on('change', onDateFieldChange);
        schedulerPro.widgetMap['newEventButton'].on('click', onNewEventClick);
        schedulerPro.widgetMap['filterByName'].on('change', onFilterChange);
        schedulerPro.widgetMap['toggleUnscheduled'].on('change', onToggleUnscheduled);
        schedulerPro.on('toggleUnscheduled', ({ value } : { value : boolean }) => {
            gridRef.value?.instance.value.toggleCollapsed(!value);
        });

        schedulerPro.project.on('load', ({ source } : { source : ProjectModel }) => {
            if (gridRef.value?.instance.value) {
                gridRef.value.instance.value.store = source.eventStore.chain(eventRecord => !(eventRecord as Task).assignments.length);
                gridRef.value.instance.value.store.sort('name');
            }
        });

        schedulerPro.project.on('change', (props : { store : any, action : string }) => {
            if (props.store instanceof AssignmentStore) {
                if (props.action !== 'dataset') {
                    gridRef.value?.instance.value.store.fillFromMaster();
                }
            }
        });
    }

    const unplannedSplitter = unplannedSplitterRef.value?.instance.value;
    if (unplannedSplitter) {
        unplannedSplitter.on('splitterExpandClick', onUnplannedSplitterToggle);
        unplannedSplitter.on('splitterCollapseClick', onUnplannedSplitterToggle);
    }

    new Drag({
        grid         : gridRef.value?.instance.value,
        schedule     : schedulerProRef.value?.instance.value,
        constrain    : false,
        outerElement : gridRef.value?.instance.value.element
    } as DragHelperConfig);
});
</script>

<template>
    <!-- Bryntum-demo-header is used for Bryntum example only. Not required for application -->
    <bryntum-demo-header />
    <div class="demo-app">
        <div id="main">
            <bryntum-scheduler-pro
                ref="schedulerProRef"
                :project="projectModelRef"
                v-bind="schedulerProProps"
                @event-click="onEventClick"
                @after-event-save="onAfterEventSave"
            />
            <bryntum-splitter :show-buttons="true" />
        </div>
        <bryntum-splitter
            ref="unplannedSplitterRef"
            :show-buttons="'end'"
        />
        <bryntum-grid
            ref="gridRef"
            v-bind="gridProps"
            @cell-click="onCellClick"
        />
    </div>
</template>

<style lang="scss">
@use "./App.scss";
</style>
