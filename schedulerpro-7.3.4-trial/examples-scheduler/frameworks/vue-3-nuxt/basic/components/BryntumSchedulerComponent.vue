<script setup lang="ts">
import { BryntumDemoHeader } from '@bryntum/schedulerpro-vue-3';
import { schedulerProps } from './AppConfig.js';

</script>

<template>
  <ClientOnly fallback-tag='span' fallback='Loading Scheduler...'>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler v-bind='schedulerProps' />
  </ClientOnly>
</template>
