<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { SlideToggle, type EventStoreListenersTypes } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumGrid, BryntumScheduler, BryntumSplitter } from '@bryntum/schedulerpro-vue-3';
import { Drag } from './lib/Drag';
import { Task } from './lib/Task';
import { TaskStore } from './lib/TaskStore';
import { gridProps, useSchedulerProps } from '@/AppConfig';

const
    schedulerRef   = ref<typeof BryntumScheduler>(),
    getScheduler   = () => schedulerRef.value!.instance.value,
    gridRef        = ref<typeof BryntumGrid>(),
    getGrid        = () => gridRef.value!.instance.value;

// specific to this example - reschedules the tasks
const onEventStoreUpdate : EventStoreListenersTypes['update'] = ({
    record,
    changes
}) => {
    const
        scheduler = getScheduler(),
        grid      = getGrid();

    if (scheduler.autoRescheduleTasks) {
        (scheduler.eventStore as TaskStore).rescheduleOverlappingTasks((record as Task));
    }

    if ('resourceId' in changes && !(record as Task).resourceId) {
        scheduler.eventStore.remove(record);
        grid.store.add(record);
    }
};

// specific to this example - reschedules the tasks
const onEventStoreAdd : EventStoreListenersTypes['add'] = ({
    records
}) => {
    const scheduler = getScheduler();

    if (scheduler.autoRescheduleTasks) {
        (records as Task[]).forEach((eventRecord) =>
            (scheduler.eventStore as TaskStore).rescheduleOverlappingTasks(
                eventRecord
            )
        );
    }
};
onMounted(() => {
    const
        scheduler                  = getScheduler(),
        grid                       = getGrid(),
        { widgetMap }              = scheduler,
        autoRescheduleSlideToggle  = widgetMap['autoRescheduleTasks'] as SlideToggle;

    new Drag({
        grid,
        schedule     : scheduler,
        constrain    : false,
        outerElement : grid.element
    });

    autoRescheduleSlideToggle.onChange = ({ checked }) => {
        scheduler.autoRescheduleTasks = checked;
    };
});

const schedulerProps = reactive(useSchedulerProps({ onEventStoreAdd, onEventStoreUpdate }));

</script>

<template>
    <bryntum-demo-header />
    <div id="main" class="demo-app">
        <bryntum-scheduler
            ref="schedulerRef"
            v-bind="schedulerProps"
        />
        <bryntum-splitter />
        <bryntum-grid
            ref="gridRef"
            v-bind="gridProps"
        />
    </div>
</template>

<style lang="scss">
@use "./App.scss";
</style>
