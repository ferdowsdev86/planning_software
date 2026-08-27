<!-- Application -->
<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler
        ref="schedulerRef"
        v-bind="schedulerProps"
        :event-renderer="eventRenderer"
    />
</template>

<script>
import { ref, onMounted } from 'vue';
import {
    BryntumDemoHeader,
    BryntumScheduler
} from '@bryntum/schedulerpro-vue-3';
import { StringHelper } from '@bryntum/schedulerpro';
import { schedulerProps } from '@/AppConfig';

export default {
    name : 'App',

    components : {
        BryntumDemoHeader,
        BryntumScheduler
    },

    setup() {
        const schedulerRef = ref(null);

        // Custom eventRenderer, applying color based on event duration
        function eventRenderer({ eventRecord, renderData }) {
            const hours = eventRecord.duration * 24;
            if (hours > 8) {
                renderData.eventColor = 'red';
            }
            else if (hours > 4) {
                renderData.eventColor = 'orange';
            }
            else if (hours > 2) {
                renderData.eventColor = 'lime';
            }

            return StringHelper.xss`${eventRecord.name}<span>(${hours} hour${hours > 1 ? 's' : ''})</span>`;
        }

        function onAddClick() {
            const scheduler = schedulerRef.value.instance.value;
            // scheduler.columns is a store, it supports the normal Store CRUD operations
            scheduler.columns.insert(1, { text : 'Accessible', field : 'accessible', region : 'left', type : 'check' });
            scheduler.widgetMap.addButton.disable();
            scheduler.widgetMap.removeButton.enable();
        }

        function onRemoveClick() {
            const scheduler = schedulerRef.value.instance.value;
            scheduler.columns.getAt(1).remove();
            scheduler.widgetMap.addButton.enable();
            scheduler.widgetMap.removeButton.disable();
        }

        onMounted(() => {
            const scheduler = schedulerRef.value.instance.value;

            scheduler.widgetMap.addButton.on({ click : onAddClick });
            scheduler.widgetMap.removeButton.on({ click : onRemoveClick });
        });

        return {
            schedulerRef,
            eventRenderer,
            schedulerProps
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
