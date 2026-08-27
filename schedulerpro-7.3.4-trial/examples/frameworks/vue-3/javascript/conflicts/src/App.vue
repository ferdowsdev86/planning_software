<!-- Application -->
<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler-pro
        ref="schedulerRef"
        v-bind="schedulerProps"
    />
</template>

<script>
import { onMounted, ref } from 'vue';

import {
    BryntumDemoHeader,
    BryntumSchedulerPro
} from '@bryntum/schedulerpro-vue-3';
import { schedulerProps } from '@/AppConfig';

// App
export default {
    name : 'App',

    // local components
    components : {
        BryntumDemoHeader,
        BryntumSchedulerPro
    },

    setup() {
        const schedulerRef = ref(null);

        const onAddInvalidDependencyClick = () => {
            const scheduler = schedulerRef.value.instance.value;

            // Here we add an invalid dependency linking "Arrive" event to itself
            // which naturally building a cycle..
            // This action triggers event rescheduling which then detects the cycle
            // and informs user about it.

            scheduler.dependencyStore.add({ fromEvent : 1, toEvent : 1 });
        };

        const onAddInvalidCalendarClick = () => {
            const scheduler = schedulerRef.value.instance.value;

            // Here we add an invalid calendar and assign it to "Arrive #2" event.
            // The calendar has no working intervals and thus cannot be used for scheduling,
            // Assigning of the calendar triggers event rescheduling which then detects the issue
            // and informs user about it.

            const [calendar] = scheduler.calendarManagerStore.add({
                name                     : 'Foo',
                // we setup a global not working interval on the calendar but
                // not provide any single working one so the calendar has zero working periods
                unspecifiedTimeIsWorking : false
            });

            scheduler.eventStore.getById(5).calendar = calendar;
        };

        onMounted(() => {
            const scheduler = schedulerRef.value.instance.value;
            const { addInvalidDependencyButton, addInvalidCalendarButton } = scheduler.widgetMap;
            addInvalidDependencyButton.on({ click : onAddInvalidDependencyClick, thisObj : this });
            addInvalidCalendarButton.on({ click : onAddInvalidCalendarClick, thisObj : this });
        });

        return {
            schedulerProps,
            schedulerRef
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
