<script setup lang="ts">
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-vue-3';
import { schedulerProps } from './AppConfig';
</script>

<template>
    <!-- Bryntum-demo-header is used for Bryntum example only. Not required for application -->
    <bryntum-demo-header />
    <bryntum-scheduler
        v-bind="schedulerProps"
    />
</template>

<style lang="scss">
@use "./App.scss";
</style>
