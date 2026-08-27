<script setup lang="ts">
import type { ButtonListenersTypes } from '@bryntum/schedulerpro';
import { BryntumToolbar, type BryntumToolbarProps } from '@bryntum/schedulerpro-vue-3';

const onExpandAll: ButtonListenersTypes['action'] = () => {
    const grid = props.gridRefFn().value.instance.value;
    grid!.expandAll();
};

const onCollapseAll: ButtonListenersTypes['action'] = () => {
    const grid = props.gridRefFn().value.instance.value;
    grid!.collapseAll();
};

const toolbarProps : BryntumToolbarProps = {
    items : [
        {
            type : 'widget',
            tag  : 'strong',
            html : 'Unplanned appointments',
            flex : 1
        },
        {
            type     : 'button',
            icon     : 'fa fa-angle-double-down',
            ref      : 'expand-all', // for testing purpose
            cls      : 'b-transparent',
            tooltip  : 'Expand all groups',
            onAction : onExpandAll
        },
        {
            type     : 'button',
            icon     : 'fa fa-angle-double-up',
            ref      : 'collapse-all', // for testing purpose
            cls      : 'b-transparent',
            tooltip  : 'Collapse all groups',
            onAction : onCollapseAll
        }
    ]
};

const props = defineProps({
    gridRefFn : {
        type    : Function,
        default : () => {}
    }
});

</script>

<template>
    <bryntum-toolbar
        v-bind="toolbarProps"
    />
</template>
