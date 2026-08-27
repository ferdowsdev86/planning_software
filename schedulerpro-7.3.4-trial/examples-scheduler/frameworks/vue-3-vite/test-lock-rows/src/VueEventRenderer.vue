<script setup lang="ts">
import { SchedulerEventModel } from '@bryntum/schedulerpro';

defineProps({
    eventRecord : SchedulerEventModel
});

</script>

<template>
    <div class="vue-event-content">
        {{ eventRecord?.name }}
    </div>
</template>

<style scoped>
.vue-event-content {
    background-color: red;
    width: 100%;
    height: 100%;
}
</style>