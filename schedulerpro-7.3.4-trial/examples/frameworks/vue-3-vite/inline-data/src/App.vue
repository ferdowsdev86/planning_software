<script setup lang="ts">
import { reactive, ref } from 'vue';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-vue-3';
import { useProjectProps, useSchedulerProProps } from './AppConfig';

const
    projectRef        = ref<typeof BryntumSchedulerProProjectModel>(null),
    schedulerProRef   = ref<typeof BryntumSchedulerPro>(null),
    schedulerProProps = reactive(useSchedulerProProps()),
    projectProps      = reactive(useProjectProps());
</script>

<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header/>
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
@use './App.scss';
</style>
