<!--
 * Custom event editor component
-->
<template>
    <v-dialog
        v-model="editorShown"
        width="500"
    >
        <v-card>
            <v-card-title
                class="headline grey lighten-2"
                primary-title
            >
                Custom event editor
            </v-card-title>

            <v-card-text class="pt-5">
                <v-text-field
                    v-model="eventName"
                    label="Name"
                    prepend-icon="mdi-file-document-edit-outline"
                    class="pb-3 event-name"
                />
                <datetime
                    v-model="startDate"
                    label="Start"
                />
                <datetime
                    v-model="endDate"
                    label="End"
                />
            </v-card-text>

            <v-divider />

            <v-card-actions>
                <div class="flex-grow-1" />
                <v-btn
                    color="primary"
                    variant="tonal"
                    @click="closeHandler"
                >
                    Cancel
                </v-btn>

                <v-btn
                    color="primary"
                    variant="tonal"
                    @click="saveHandler"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Datetime from './DateTime.vue';
import type { SchedulerEventModel, SchedulerEventStore } from '@bryntum/schedulerpro';

export interface Props {
    modelValue: boolean | object | null;
    eventRecord: SchedulerEventModel | null;
    eventStore: SchedulerEventStore | null;
    resourceId: string | number | null;
}

const props = defineProps<Props>();
const emit  = defineEmits(['input', 'close']);

const eventName = ref('');
const startDate = ref<Date | null>(null);
const endDate   = ref<Date | null>(null);

const editorShown = computed({
    get() {
        if (props.modelValue === true && props.eventRecord) {
            eventName.value = props.eventRecord.name;
            startDate.value = new Date(props.eventRecord.startDate);
            endDate.value   = new Date(props.eventRecord.endDate);
        }
        return Boolean(props.modelValue);
    },
    set(value: boolean) {
        if (!props.eventRecord || !props.eventStore) {
            return;
        }

        if (props.eventRecord.isCreating) {
            props.eventStore.remove(props.eventRecord);
            props.eventRecord.isCreating = false;
        }
        emit('input', value);
    }
});

/**
 * Handles saving of event changes
 * Updates existing event or creates a new one with current values
 */
const saveHandler = () => {
    if (!props.eventRecord || !props.eventStore) {
        return;
    }

    props.eventRecord.isCreating = false;
    props.eventRecord.set({ name : eventName.value });
    props.eventRecord.setStartEndDate(startDate.value!, endDate.value!);

    if (!props.eventRecord.eventStore) {
        const copy = props.eventRecord.copy(
            { resourceId : props.resourceId }
        );
        props.eventStore.add(copy);
    }

    closeHandler();
};

const closeHandler = () => {
    editorShown.value = false;
    emit('close');
};

</script>

<style>

.headline {
    background-color : #1878ee;
    color            : white;
}

.date-container {
    padding-inline-start : 0 !important;
}

.time-container {
    padding-inline-end : 0 !important;
}
</style>
