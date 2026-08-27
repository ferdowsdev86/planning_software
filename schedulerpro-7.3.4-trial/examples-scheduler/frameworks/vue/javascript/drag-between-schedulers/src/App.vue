<!-- Application -->
<template>
    <div id="container">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <bryntum-scheduler
            ref="scheduler1"
            cls="top-scheduler"
            v-bind="scheduler1Props"
        />
        <bryntum-splitter />
        <bryntum-scheduler
            ref="scheduler2"
            cls="bottom-scheduler"
            v-bind="scheduler2Props"
        />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumSplitter,
    BryntumDemoHeader
} from '@bryntum/schedulerpro-vue';
import { scheduler1Props, scheduler2Props } from './AppConfig';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumSplitter
    },

    mounted() {
        // make schedulers partnered so that they scroll together
        this.$refs.scheduler2.instance.addPartner(this.$refs.scheduler1.instance);
    },

    data() {
        return {
            scheduler1Props,
            scheduler2Props
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
