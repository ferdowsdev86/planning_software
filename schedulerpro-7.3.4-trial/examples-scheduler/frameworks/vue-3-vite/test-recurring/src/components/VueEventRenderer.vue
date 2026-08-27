<template>
    <div class="vue-event-content">
        {{ eventRecord?.name }}
    </div>
</template>

<script setup lang="ts">
import { SchedulerEventModel } from '@bryntum/schedulerpro';

defineProps({
    eventRecord : SchedulerEventModel
});

</script>
