<script setup lang="ts">
import { ref } from 'vue';
import { BryntumDemoHeader } from '@bryntum/core-vue-3-thin';
import { BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-vue-3-thin';
import { projectProps, schedulerProProps } from './AppConfig';

const
    projectRef      = ref<typeof BryntumSchedulerProProjectModel | null>(null),
    schedulerProRef = ref<typeof BryntumSchedulerPro | null>(null);

</script>

<template>
    <!-- Bryntum-demo-header is used for Bryntum example only. Not required for application -->
    <bryntum-demo-header />

    <bryntum-scheduler-pro-project-model
        ref="projectRef"
        v-bind="projectProps"
    />
    <bryntum-scheduler-pro
        ref="schedulerProRef"
        v-bind="schedulerProProps"
        :project="projectRef"
    />
</template>

<style lang="scss">
@use "./App.scss";
</style>
