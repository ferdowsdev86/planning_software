<!-- Application -->
<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler
        v-bind="schedulerProps"
    />
</template>

<script>
import {
    BryntumDemoHeader,
    BryntumScheduler
} from '@bryntum/schedulerpro-vue-3';
import { schedulerProps } from '@/AppConfig';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumScheduler
    },

    setup() {
        return {
            schedulerProps
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
