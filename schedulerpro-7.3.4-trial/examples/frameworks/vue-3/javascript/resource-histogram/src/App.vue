<!-- Application -->
<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <div id="content" class="demo-app">
        <div class="demo-toolbar align-right">
            <bryntum-slide-toggle
                id="feature-status-bar"
                text="Show bar texts"
                tooltip="Check to show resource allocation in the bars"
                :checked="false"
                @change="onCheckboxAction($event, 'showBarText')"
            />
            <bryntum-slide-toggle
                id="feature-max-effort"
                text="Show max allocation"
                tooltip="Check to display max resource allocation line"
                :checked="true"
                @change="onCheckboxAction($event, 'showMaxEffort')"
            />
            <bryntum-slide-toggle
                id="feature-bar-tip"
                text="Enable bar tooltip"
                tooltip="Check to show tooltips when moving mouse over bars"
                :checked="true"
                @change="onCheckboxAction($event, 'showBarTip')"
            />
            <div class="spacer" />
            <bryntum-button
                icon="b-icon b-icon-search-plus"
                tooltip="Zoom in"
                :hidden="true"
                @click="onZoom('zoomIn')"
            />
            <bryntum-button
                icon="b-icon b-icon-search-minus"
                tooltip="Zoom out"
                :hidden="true"
                @click="onZoom('zoomOut')"
            />
        </div>
        <bryntum-scheduler-pro
            ref="scheduler"
            :project="project"
            v-bind="schedulerProps"
        />
        <bryntum-splitter />
        <bryntum-resource-histogram
            ref="histogram"
            :project="project"
            v-bind="histogramProps"
        />
        <div class="demo-toolbar" />
    </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue';

import {
    BryntumButton,
    BryntumSlideToggle,
    BryntumDemoHeader,
    BryntumResourceHistogram,
    BryntumSchedulerPro,
    BryntumSplitter
} from '@bryntum/schedulerpro-vue-3';
import { useHistogramProps, useSchedulerProps, project } from '@/AppConfig';

// App
export default {
    name : 'App',

    // local components
    components : {
        BryntumDemoHeader,
        BryntumSchedulerPro,
        BryntumResourceHistogram,
        BryntumButton,
        BryntumSplitter,
        BryntumSlideToggle
    },

    setup() {
        const scheduler = ref(null);
        const histogram = ref(null);

        const onZoom = action => {
            scheduler.value.instance.value[action]();
        };

        const onCheckboxAction = ({ source }, option) => {
            histogram.value.instance.value[option] = source.checked;
        };

        onMounted(() => {
            histogram.value.instance.value.addPartner(scheduler.value.instance.value);
        });

        return {
            schedulerProps : reactive(useSchedulerProps()),
            histogramProps : reactive(useHistogramProps()),
            scheduler,
            histogram,
            onZoom,
            onCheckboxAction,
            project
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
