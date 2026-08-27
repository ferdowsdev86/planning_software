<script setup lang="ts">
import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { schedulerProProps } from './AppConfig';
</script>

<template>
    <!-- Bryntum-demo-header is used for Bryntum example only. Not required for application -->
    <bryntum-demo-header />
    <bryntum-scheduler-pro
        v-bind="schedulerProProps"
    />
</template>

<style lang="scss">
@use "./App.scss";
</style>
