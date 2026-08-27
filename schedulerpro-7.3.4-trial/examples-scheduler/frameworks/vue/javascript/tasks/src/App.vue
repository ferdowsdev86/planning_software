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
import {
    SchedulerResourceModel,
    EventHelper
} from '@bryntum/schedulerpro';
import { schedulerProps, colors } from './AppConfig.js';

// The data for this demo (data/data.json) uses the 'clients' property to hold children of resources
SchedulerResourceModel.childrenField = 'clients';

export default {
    name : 'App',

    components : {
        BryntumScheduler,
        BryntumDemoHeader
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
