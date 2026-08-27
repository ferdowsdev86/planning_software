<!--
/**
 * This is a simple wrapper around Bryntum button
 */
-->
<template><div></div></template>

<script>
import { Button } from '@bryntum/schedulerpro';
import { eventBus } from '../main';

export default {
    props : {
        text    : { type : String, default : 'Button' },
        tooltip : String,
        color   : { type : String, default : 'b-orange' },
        action  : { type : String, default : 'action' }
    },

    mounted() {
        const props = this.$props;

        new Button({
            action   : props.action,
            appendTo : this.$el,
            color    : props.color,
            text     : props.text,
            tooltip  : props.tooltip,
            onAction : ({ source }) => eventBus.$emit('click', source.action)
        });
    }
};
</script>
