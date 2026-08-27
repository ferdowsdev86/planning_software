<script setup lang="ts">
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-vue-3';
import { schedulerProps } from './AppConfig';
import './App.scss';
</script>

<template>
    <!-- BryntumDemoHeader component is used for Bryntum example only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler v-bind="schedulerProps" />
</template>

<style lang="scss">
  @use './App.scss';
</style>
