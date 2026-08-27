<!--
 * Tasks component
 -->

<template>
    <div class="home">
        <bryntum-scheduler
            ref="tasks"
            v-bind="tasksProps"
        />
    </div>
</template>

<script>

import { BryntumScheduler } from '@bryntum/schedulerpro-vue';
import { SchedulerResourceModel } from '@bryntum/schedulerpro';
import { tasksProps } from '@/AppConfig';

// The data for this demo (data/data.json) uses the 'clients' property to hold children of resources
SchedulerResourceModel.childrenField = 'clients';

export default {
    data() {
        return {
            tasksProps
        };
    },
    components : {
        BryntumScheduler
    }
};
</script>
