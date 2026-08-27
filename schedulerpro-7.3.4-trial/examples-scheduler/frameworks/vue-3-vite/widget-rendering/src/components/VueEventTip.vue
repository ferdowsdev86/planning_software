<template>
    <!-- Event details tooltip layout -->
    <dl class="b-event-tip">
        <!-- Event name -->
        <dt>{{ eventRecord.name }}</dt>
        <!-- Start and End time clocks -->
        <dd class="clocks">
            <div v-if="startDate">
                <!-- Start time clock -->
                <vue-clock :time="startDate" />
                <span class="clock-title">Start</span>
            </div>
            <div v-if="endDate">
                <!-- End time clock -->
                <vue-clock :time="endDate" />
                <span class="clock-title">End</span>
            </div>
        </dd>
        <!-- Assigned resource -->
        <dt><span>Assigned to:</span> {{ resourceRecord.name }}</dt>
        <dd>
            <!-- Resource avatar image -->
            <img
                class="b-resource-image b-resource-avatar big-avatar"
                :src="`users/${resourceRecord.name.toLowerCase()}.png`"
            >
        </dd>
        <!-- Resource experience -->
        <dt><span>Experience:</span> {{ resourceRecord.years }} years</dt>
    </dl>
</template>

<!--
    Vue <script setup> block:
    - Imports required Vue Composition API functions and models.
    - Defines component props for resource, event, and clock data.
    - Gets template refs for clock elements.
    - Uses watchEffect to update analog clock indicators when relevant data changes.
-->
<script setup lang="ts">
import { Developer } from '../lib/Developer';
import { SchedulerEventModel } from '@bryntum/schedulerpro';
import VueClock from './VueClock.vue';

interface Props {
    resourceRecord: Developer;
    eventRecord: SchedulerEventModel;
    startDate: Date | null;
    endDate: Date | null;
}

/**
 * Props:
 * - Define the properties that can be passed to this component from its parent.
 * - Each prop can specify its type, default value, and whether it is required.
 */
withDefaults(defineProps<Props>(), {
    resourceRecord : () => new Developer(),
    eventRecord    : () => new SchedulerEventModel(),
    startDate      : null,
    endDate        : null
});
</script>

<!--
    Vue <style> block:
    - Uses SCSS for styling.
    - Styles the event tooltip layout, including spacing, font weights, and avatar image size.
    - Applies styles to the tooltip content, definition list, terms, descriptions, and images.
-->
<style lang="scss">
$item-spacing : 0.7em;

.vue-event-tip {
    .b-tooltip-content {
        padding : $item-spacing;
    }

    dl.b-event-tip {

        margin-block-start : 0;
        margin-block-end   : 0;

        dt {
            font-weight : bold;

            margin      : $item-spacing auto;
            text-align  : center;

            span {
                font-weight : normal;
                font-style  : italic;
            }

            &:first-child {
                margin-top : 0;
            }

            &:last-child {
                margin-bottom : 0;
            }
        }

        dd {
            margin-inline-start : 0;
            margin              : $item-spacing auto;

            > div {
                margin : calc($item-spacing / 4) auto;
            }

            &.clocks {
                display         : flex;
                flex-direction  : row;
                justify-content : center;
                gap             : $item-spacing;
                text-align      : center;

                .clock-title {
                    line-height : 2em;
                    font-size   : 90%
                }
            }
        }

        img {
            width  : 5em;
            height : 5em;
            margin : $item-spacing auto;
        }
    }
}
</style>
