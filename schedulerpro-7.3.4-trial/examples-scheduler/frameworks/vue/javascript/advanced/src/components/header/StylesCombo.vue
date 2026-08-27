<!--
 * Styles Combo component
 -->
<template>
    <div></div>
</template>

<script>
import { Scheduler, Combo } from '@bryntum/schedulerpro';
import { mapActions } from 'vuex';

// export the combo
export default {
    name : 'styles-combo',

    methods : {
        ...mapActions(['setEventStyle'])
    },

    mounted() {
        const
            me = this,
            combo = new Combo({
                appendTo    : this.$el,
                items       : ['mixed'].concat(Scheduler.eventStyles),
                value       : 'mixed',
                label       : 'Style',
                listCls     : 'style-list',
                editable    : false,
                listItemTpl : item => `<div class="b-sch-event-wrap b-style-${item.value} b-color-red"><div class="b-sch-event">${item.value}</div></div>`,
                onChange    : ({ value }) => {
                    me.setEventStyle(value);
                }
            });

        this.combo = combo;

        me.$store.subscribe(mutation => {
            if (mutation.type === 'setEventStyle') {
                combo.value = mutation.payload;
            }
        });

    },

    beforeUnmount() {
        if (this.combo) {
            this.combo.destroy();
        }
    }
};
</script>
