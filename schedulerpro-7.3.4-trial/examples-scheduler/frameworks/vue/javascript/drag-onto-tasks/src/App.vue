<!-- Application -->
<template>
    <div id="container">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <div class="content-container demo-app">
            <bryntum-scheduler
                ref="scheduler"
                v-bind="schedulerProps"
            />
            <bryntum-grid
                ref="grid"
                v-bind="gridProps"
            />
        </div>
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumGrid
} from '@bryntum/schedulerpro-vue/';
import { schedulerProps, gridProps } from './AppConfig.js';
import { Toast } from '@bryntum/schedulerpro';
import Drag from './lib/Drag.js';

export default {
    name : 'app',

    // Local components
    components : {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumGrid
    },

    // Function that returns data
    data() {
        return {
            schedulerProps,
            gridProps
        };
    },

    mounted() {
        const grid         = this.$refs.grid.instance,
            schedule       = this.$refs.scheduler.instance,
            outerElement   = grid.element,
            equipmentStore = grid.store,
            // Use a chained Store to avoid its filtering to interfere with scheduler's rendering
            chainedStore   = equipmentStore.chain();
        new Drag({
            grid,
            schedule,
            outerElement
        });

        // <test>
        !document.location.search.includes('test') &&
        // </test>
        Toast.show({
            timeout : 3500,
            html :
                'Please note that this example uses the Bryntum Grid, which is licensed separately.'
        });

        const equipmentCombo = schedule.eventEdit.editor.widgetMap.equipmentCombo;
        // Assign equipment combo items to be same as chainedStore in grid to populate the equipment combo first time editor is shown
        equipmentCombo.items = chainedStore;

        // Event renderer expects equipmentStore to be class property of scheduler, as it is not a default property of scheduler, it is assigned here instead of in scheduler configuration
        schedule.equipmentStore = equipmentStore;

        schedule.onEquipmentStoreLoad = schedulerProps.onEquipmentStoreLoad;

        schedule.equipmentStore.on(
            'load',
            schedule.onEquipmentStoreLoad.bind(schedule)
        );

        equipmentStore.load();
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
