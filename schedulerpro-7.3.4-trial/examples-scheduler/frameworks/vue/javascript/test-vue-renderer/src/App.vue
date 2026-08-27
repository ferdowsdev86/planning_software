<!-- Application -->
<template>
    <div id="container">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <bryntum-scheduler
            v-bind="schedulerProps"
        />
    </div>
</template>

<script>
import {
    BryntumDemoHeader,
    BryntumScheduler
} from '@bryntum/schedulerpro-vue';
import { schedulerProps } from './AppConfig';

export default {
    name : 'App',

    components : {
        BryntumScheduler,
        BryntumDemoHeader
    },

    data() {
        return { schedulerProps };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
