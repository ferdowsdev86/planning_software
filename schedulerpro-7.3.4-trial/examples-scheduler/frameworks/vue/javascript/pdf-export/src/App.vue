<!-- Application -->
<template>
    <div id="app">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <div class="demo-app">
            <div class="demo-toolbar align-right">
                <bryntum-button
                    text="Export"
                    @click="exportHandler"
                />
            </div>
            <bryntum-scheduler
                ref="scheduler"
                v-bind="schedulerProps"
            />
        </div>
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumButton
} from '@bryntum/schedulerpro-vue';
import { schedulerProps } from './AppConfig.js';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumButton
    },

    data() {
        return {
            schedulerProps
        };
    },

    methods : {
        exportHandler() {
            this.$refs.scheduler.instance.features.pdfExport.showExportDialog();
        }
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
