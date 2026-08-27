<!-- Application -->
<template>
    <div id="container">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <div class="demo-app">
            <div class="demo-toolbar align-right">
                <bryntum-checkbox
                    text="Stripe Feature"
                    :checked="false"
                    @action="handleToggle($event, 'stripe')"
                />
                <bryntum-checkbox
                    text="Column Lines Feature"
                    :checked="true"
                    @action="handleToggle($event, 'columnLines')"
                />
            </div>
            <bryntum-scheduler
                ref="scheduler"
                v-bind="schedulerProps"
                :stripeFeature="stripe"
                :columnLinesFeature="columnLines"
            />
        </div>
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumCheckbox
} from '@bryntum/schedulerpro-vue';
import { schedulerProps } from './AppConfig.js';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumCheckbox
    },

    methods : {
        handleToggle({ checked }, feature) {
            this[feature] = { disabled : !checked };
        }
    },

    data() {
        return {
            schedulerProps,
            stripe      : { disabled : true },
            columnLines : { disabled : false }
        };
    }
};
</script>

<style lang="scss">
@import "./App.scss";
</style>
