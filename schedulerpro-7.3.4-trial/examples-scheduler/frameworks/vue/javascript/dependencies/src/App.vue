<!-- Application -->
<template>
    <div id="container">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <bryntum-scheduler
            ref="scheduler"
            v-bind="schedulerProps"
        />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader
} from '@bryntum/schedulerpro-vue';
import { schedulerProps } from './AppConfig';

export default {
    name : 'app',

    components : {
        BryntumDemoHeader,
        BryntumScheduler
    },

    data() {
        return {
            schedulerProps
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
