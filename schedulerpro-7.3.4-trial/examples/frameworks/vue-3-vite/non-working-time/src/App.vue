<script setup lang="ts">
import { ref } from 'vue';
import type { CalendarModelConfig, SlideToggleListeners, TimeAxis, TimeSpan } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-vue-3';
import { calendars, calendarsWithIntervals, projectProps, useSchedulerProProps } from './AppConfig';

const onFilter: SlideToggleListeners['change'] = ({ checked }) => {
    const
        instance = schedulerProRef.value.instance.value,
        timeAxis = instance.timeAxis as TimeAxis;
    if (checked) {
        // Filter that keeps working time ticks in time axis
        timeAxis.filter(
            (t : TimeSpan) => instance.project.calendar.isWorkingTime(t.startDate, t.endDate)
        );
    }
    else {
        // Restore all ticks
        timeAxis.clearFilters();
    }
};

const onIntervals: SlideToggleListeners['change'] = ({ checked }) => {
    calendarsRef.value = checked ? calendarsWithIntervals : calendars;
};

const
    schedulerProProps = useSchedulerProProps({ onFilter, onIntervals }),
    projectRef        = ref<typeof BryntumSchedulerProProjectModel>(null),
    schedulerProRef   = ref<typeof BryntumSchedulerPro>(null),
    calendarsRef      = ref<CalendarModelConfig[]>(calendarsWithIntervals);

</script>

<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler-pro-project-model
        ref="projectRef"
        v-bind="{
            ...projectProps,
            calendars : calendarsRef
        }"
    />
    <bryntum-scheduler-pro
        ref="schedulerProRef"
        v-bind="schedulerProProps"
        :project="projectRef"
    />
</template>

<style lang="scss">
@use './App.scss';
</style>
