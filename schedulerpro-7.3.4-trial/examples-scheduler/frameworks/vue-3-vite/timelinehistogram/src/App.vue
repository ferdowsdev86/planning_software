<script setup lang="ts">
import { BryntumDemoHeader, BryntumTimelineHistogram } from '@bryntum/schedulerpro-vue-3';
import { histogramProps } from './AppConfig';

import './App.scss';

</script>

<template>
    <bryntum-demo-header />
    <bryntum-timeline-histogram
        ref="histogram"
        v-bind="histogramProps"
    />
</template>

<style lang="scss">
</style>
