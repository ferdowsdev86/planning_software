<!--
 * Colors combo Component
 -->
<template>
    <div></div>
</template>

<script>
import { Scheduler, Combo } from '@bryntum/schedulerpro';
import { mapActions } from 'vuex';

// export the combo
export default {
    name : 'colors-combo',

    methods : {
        ...mapActions(['setEventColor'])
    },

    mounted() {

        const
            me = this,
            combo = new Combo({
                appendTo    : this.$el,
                items       : ['mixed'].concat(Scheduler.eventColors),
                value       : 'mixed',
                label       : 'Color',
                editable    : false,
                listItemTpl : item => `<div class="color-box b-color-${item.value}"></div><div>${item.value}</div>`,
                onChange    : ({ value }) => {
                    me.setEventColor(value);
                }
            });

        this.combo = combo;

        me.$store.subscribe(mutation => {
            if (mutation.type === 'setEventColor') {
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
