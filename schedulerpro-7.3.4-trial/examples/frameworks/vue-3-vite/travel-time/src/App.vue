<script setup lang="ts">
import { ref } from 'vue';
import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { schedulerProProps } from './AppConfig';

const schedulerProRef = ref(null);

</script>

<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler-pro
        ref="schedulerProRef"
        v-bind="schedulerProProps"
    />
</template>

<style lang="scss">
@use './App.scss';
</style>
