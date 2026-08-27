<!-- Application -->
<template>
    <div id="container">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <div id="content" class="demo-app">
            <div class="demo-toolbar align-right">
                <bryntum-slide-toggle
                    text="Show bar texts"
                    tooltip="Check to show resource allocation in the bars"
                    :checked="false"
                    @change="onCheckbox($event, 'showBarText')"
                />
                <bryntum-slide-toggle
                    text="Show max allocation"
                    tooltip="Check to display max resource allocation line"
                    :checked="true"
                    @change="onCheckbox($event, 'showMaxEffort')"
                />
                <bryntum-slide-toggle
                    text="Enable bar tooltip"
                    tooltip="Check to show tooltips when moving mouse over bars"
                    :checked="true"
                    @change="onCheckbox($event, 'showBarTip')"
                />
                <div class="spacer"></div>
                <bryntum-button
                    icon="b-icon b-icon-search-plus"
                    tooltip="Zoom in"
                    @click="onZoom('zoomIn')"
                    :hidden="true"
                />
                <bryntum-button
                    icon="b-icon b-icon-search-minus"
                    tooltip="Zoom out"
                    @click="onZoom('zoomOut')"
                    :hidden="true"
                />
            </div>
            <bryntum-scheduler-pro
                ref="scheduler"
                v-bind="schedulerProps"
            />
            <bryntum-splitter/>
            <bryntum-resource-histogram
                ref="histogram"
                v-bind="histogramProps"
            />
        </div>
    </div>
</template>

<script>
import {
    BryntumSchedulerPro,
    BryntumSplitter,
    BryntumResourceHistogram,
    BryntumDemoHeader,
    BryntumButton,
    BryntumSlideToggle
} from '@bryntum/schedulerpro-vue';
import { schedulerProps, histogramProps } from '@/AppConfig';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumResourceHistogram,
        BryntumSchedulerPro,
        BryntumSplitter,
        BryntumButton,
        BryntumSlideToggle
    },

    data() {
        return {
            schedulerProps,
            histogramProps
        };
    },

    mounted() {
        // Set partner for histogram to sync timeline
        this.$refs.histogram.instance.addPartner(this.$refs.scheduler.instance);
    },

    methods : {
        onCheckbox({ checked }, action) {
            this.$refs.histogram.instance[action] = checked;
        },
        onZoom(action) {
            this.$refs.scheduler.instance[action]();
        }
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
