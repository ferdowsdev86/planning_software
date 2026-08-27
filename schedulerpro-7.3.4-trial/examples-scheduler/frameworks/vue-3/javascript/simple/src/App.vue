<!-- Application -->
<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <div class="demo-app">
        <div class="demo-toolbar align-right">
            <bryntum-slide-toggle
                text="Stripe Feature"
                :checked="false"
                @action="({ checked }) => (stripe = { disabled: !checked })"
            />
            <bryntum-slide-toggle
                text="Column Lines Feature"
                :checked="true"
                @action="({ checked }) => (columnLines = { disabled: !checked })"
            />
            <bryntum-slider
                v-bind="sliderProps"
                :value="barMargin"
                @input="({ value }) => (barMargin = value)"
            />
        </div>
        <bryntum-scheduler
            ref="scheduler"
            v-bind="schedulerProps"
            :bar-margin="barMargin"
            :stripe-feature="stripe"
            :column-lines-feature="columnLines"
        />
    </div>
</template>

<script>
import { ref, reactive } from 'vue';
import {
    BryntumDemoHeader,
    BryntumScheduler,
    BryntumSlider,
    BryntumSlideToggle
} from '@bryntum/schedulerpro-vue-3';
import { useSchedulerProps, sliderProps } from '@/AppConfig';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumSlider,
        BryntumSlideToggle
    },

    setup() {
        const barMargin = ref(4);
        const stripe = ref({ disabled : true });
        const columnLines = ref({ disabled : false });
        const schedulerProps = reactive(useSchedulerProps());

        return {
            schedulerProps,
            sliderProps,
            barMargin,
            stripe,
            columnLines
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
