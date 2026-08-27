<script setup lang="ts">
import { BryntumDemoHeader } from '@bryntum/core-vue-3-thin';
import { BryntumScheduler } from '@bryntum/scheduler-vue-3-thin';
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
