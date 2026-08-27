<script setup lang="ts">

import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import type { Grid, SchedulerPro, SchedulerResourceModel } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumGrid, BryntumSchedulerPro, BryntumSplitter } from '@bryntum/schedulerpro-vue-3';
import SchedulerToolbar from './components/SchedulerToolbar.vue';
import GridToolbar from './components/GridToolbar.vue';
import { Drag } from './lib/Drag';
import type { Appointment } from './lib/Appointment';
import type { Doctor } from './lib/Doctor';
import { gridProps, projectProps, schedulerProProps } from './AppConfig';

const schedulerProRef         = ref(null);
const gridRef                 = ref(null);
const dragRef                 = ref(null);
const isToggled: Ref<boolean> = ref(false);

onMounted(() => {
    const schedulerPro = schedulerProRef.value.instance.value;
    const grid         = gridRef.value.instance.value;
    const { project }  = schedulerPro;

    if (schedulerPro && grid) {
        // Create a chained version of the event store as our store.
        // It will be filtered to only display events that lack of assignments.
        // Config for grouping requiredRole in ascending mode while webpage loads initially.
        const chainedStore = grid.store = project.eventStore.chain(
            (eventRecord: Appointment) => !eventRecord.assignments.length, undefined, {
                groupers : [
                    {
                        field     : 'requiredRole',
                        ascending : true
                    }
                ]
            }
        );

        // When assignments change, update our chained store to reflect the changes.
        project.assignmentStore.on({
            change : () => {
                chainedStore.fillFromMaster();
            },
            thisObj : grid
        });
    }

    dragRef.value = new Drag({
        grid,
        schedule     : schedulerPro,
        constrain    : false,
        outerElement : grid.element
    });
});

// To destroy Drag instance to avoid potential side effects or memory leaks after component is unmounted
onUnmounted(() => {
    (dragRef as Drag)?.current?.destroy?.();
});

//  The methods to pass a component ref to a child component by passing a function which returns the ref, otherwise the ref instance will be "undefine" in the child component
const schedulerProRefFn = () => schedulerProRef;
const gridRefFn         = () => gridRef;

const onSchedulerSelectionChange = () => {
    const schedulerPro        = schedulerProRef.value.instance.value as SchedulerPro;
    const
        selectedRecords       = schedulerPro.selectedRecords as SchedulerResourceModel[],
        { calendarHighlight } = schedulerPro.features;
    if (selectedRecords.length > 0) {
        calendarHighlight.highlightResourceCalendars(selectedRecords);
    }
    else {
        calendarHighlight.unhighlightCalendars();
    }
};

const onGridSelectionChange = () => {
    const schedulerPro                           = schedulerProRef.value.instance.value as SchedulerPro;
    const grid                                   = gridRef.value.instance.value as Grid;
    const
        selectedRecords                          = grid.selectedRecords as Appointment[],
        { calendarHighlight }                    = schedulerPro.features,
        requiredRoles: { [key: string]: number } = {};
    selectedRecords.forEach((task: Appointment) => requiredRoles[task.requiredRole as string] = 1);

    if (Object.keys(requiredRoles).length === 1) {
        const
            appointment        = selectedRecords[0] as Appointment,
            availableResources = schedulerPro.resourceStore.query(record => (record as Doctor).role === appointment.requiredRole || !appointment.requiredRole) as SchedulerResourceModel[];
        calendarHighlight.highlightResourceCalendars(availableResources);
    }
    else {
        calendarHighlight.unhighlightCalendars();
    }
};

const onToggleLayout = () => {
    isToggled.value = !isToggled.value;
};

</script>

<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header/>
    <div
        id="main"
        :class="[isToggled ? 'demo-app' : 'b-side-by-side demo-app']"
    >
        <div class="b-scheduler-pro">
            <SchedulerToolbar
                :on-toggle-layout="onToggleLayout"
                :scheduler-pro-ref-fn="schedulerProRefFn"
            />
            <bryntum-scheduler-pro
                ref="schedulerProRef"
                v-bind="schedulerProProps"
                :project="projectProps"
                @selection-change="onSchedulerSelectionChange"
            />
        </div>
        <bryntum-splitter/>
        <div class="b-unplanned-grid">
            <GridToolbar
                :grid-ref-fn="gridRefFn"
            />
            <bryntum-grid
                ref="gridRef"
                v-bind="gridProps"
                @selection-change="onGridSelectionChange"
            />
        </div>
    </div>
</template>

<style lang="scss">
@use './App.scss';
</style>
