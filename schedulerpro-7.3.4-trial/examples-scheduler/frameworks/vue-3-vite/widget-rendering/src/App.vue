<script setup lang="ts">
import { ref } from 'vue';
import { type CrudManagerListenersTypes, type SchedulerEventModel } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-vue-3';
import { useSchedulerProps } from './AppConfig';

const schedulerRef = ref<InstanceType<typeof BryntumScheduler> | null>(null);
const beforeLunch  = ref(-1);
const afterLunch   = ref(-1);

const calcEvents: CrudManagerListenersTypes['load'] = () => {
    const scheduler   = schedulerRef.value!.instance.value!;
    const events      = scheduler.eventStore.allRecords as SchedulerEventModel[];
    const lunchHour   = 12; // 12:00 PM
    beforeLunch.value = events.filter(event => (event.startDate as Date).getHours() < lunchHour).length;
    afterLunch.value  = events.filter(event => (event.startDate as Date).getHours() >= lunchHour).length;
};

const schedulerProps = useSchedulerProps(calcEvents, beforeLunch, afterLunch);

</script>

<template>
    <!-- Bryntum-demo-header is used for Bryntum example only. Not required for application -->
    <bryntum-demo-header />
    <bryntum-scheduler
        ref="schedulerRef"
        v-bind="schedulerProps"
    />
</template>

<style lang="scss">
@use "./App.scss";
</style>
