<!-- Application -->
<template>
    <v-app>
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <div class="demo-app">
            <bryntum-scheduler
                ref="scheduler"
                v-bind="schedulerProps"
                @before-event-edit="beforeEventEdit"
            />
            <event-editor
                v-model="showEditor"
                :event-record="eventRecord!"
                :event-store="eventStore!"
                :resource-id="resourceId!"
                @close="onCloseEditor"
            />
        </div>
    </v-app>
</template>

<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue';
import { SchedulerEventModel, SchedulerEventStore, Scheduler, type SchedulerListenersTypes } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-vue-3';
import { schedulerProps } from './AppConfig';
import EventEditor from './components/EventEditor.vue';

const scheduler   = ref<InstanceType<typeof BryntumScheduler> | null>(null);
const showEditor  = ref(false);
const eventRecord = ref(null) as Ref<SchedulerEventModel | null>;
const eventStore  = ref(null) as Ref<SchedulerEventStore | null>;
const resourceId  = ref<string | number | null>(null);

onMounted(() => {
    // Automatically show custom editor after start
    // <test>
    (!document.location.search.includes('test') || document.location.search.includes('screenshot')) &&
    // </test>
    setTimeout(() => {
        const schedulerInstance = scheduler!.value!.instance.value as Scheduler;
        schedulerInstance.editEvent(schedulerInstance.eventStore.first);
    }, 1000);
});

const beforeEventEdit: SchedulerListenersTypes['beforeEventEdit'] = event => {
    const scheduler   = event.source;
    eventStore.value  = scheduler.eventStore;
    resourceId.value  = event.resourceRecord?.id || null;
    eventRecord.value = event.eventRecord;
    showEditor.value  = true;
    return false;
};

const onCloseEditor = () => {
    showEditor.value = false;
};
</script>

<style lang="scss">
@use './App.scss';
</style>
