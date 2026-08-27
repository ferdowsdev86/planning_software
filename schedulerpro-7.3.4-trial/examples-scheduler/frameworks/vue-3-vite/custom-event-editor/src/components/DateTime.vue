<!--
    DateTime component provides a combined date and time picker interface using Vuetify components.
    It displays two fields: one for date selection with a calendar picker, and one for time selection with a clock picker.

    Features:
    - Split date and time selection
    - 24-hour time format
    - Calendar-based date picker
    - Clock-based time picker
    - Automatic value formatting
    - Two-way binding support

    Props:
    - value: Date | null - The datetime value to display and edit
    - label: string - Label prefix for both date and time fields

    Events:
    - update:modelValue - Emitted when date or time changes with new Date value
-->

<template>
    <v-container
        ma-0
        pa-0
    >
        <v-row>
            <v-col
                cols="6"
                class="date-container"
            >
                <v-menu
                    v-model="datePickerShown"
                    :close-on-content-click="false"
                    :nudge-right="100"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                    ,
                >
                    <template #activator="{props}">
                        <v-text-field
                            :value="dateString"
                            :label="dateLabel"
                            :active="true"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="props"
                        />
                    </template>
                    <v-date-picker
                        v-model="dateString"
                        type="date"
                        format="yyyy-MM-dd"
                        @update:model-value="() => datePickerShown=false"
                    />
                </v-menu>
            </v-col>
            <v-col
                cols="6"
                class="time-container"
            >
                <v-menu
                    :close-on-content-click="false"
                    :nudge-right="80"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template #activator="{ props }">
                        <v-text-field
                            :value="timeString"
                            :label="timeLabel"
                            :active="true"
                            prepend-icon="mdi-clock-outline"
                            readonly
                            v-bind="props"
                        />
                    </template>
                    <v-time-picker
                        v-model="timeString"
                        format="24hr"
                    />
                </v-menu>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface Props {
    modelValue: Date | null;
    label: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: Date): void;
}>();

const dateString      = ref<string | null>(null);
const dateLabel       = ref(props.label + ' date');
const datePickerShown = ref(false);
const timeString      = ref<string | null>(null);
const timeLabel       = ref(props.label + ' time');

const setDateStrings = () => {
    const { modelValue } = props;
    if (modelValue) {
        // Format date as YYYY-MM-DD for v-date-picker using local date methods
        const year       = modelValue.getFullYear();
        const month      = (modelValue.getMonth() + 1).toString().padStart(2, '0');
        const day        = modelValue.getDate().toString().padStart(2, '0');
        dateString.value = `${year}-${month}-${day}`;

        // Format time as HH:mm for time picker
        const hours      = modelValue.getHours().toString().padStart(2, '0');
        const minutes    = modelValue.getMinutes().toString().padStart(2, '0');
        timeString.value = `${hours}:${minutes}`;
    }
    else {
        dateString.value = null;
        timeString.value = null;
    }
};

const setDate = (date: Date, parts: string | string[] | Date) => {
    if (typeof parts === 'object') {
        const newDate = parts as Date;
        date.setFullYear(newDate.getFullYear());
        date.setMonth(newDate.getMonth());
        date.setDate(newDate.getDate());
    }
};

const setTime = (date: Date, parts: string | string[]) => {
    if (typeof parts === 'string') {
        parts = parts.split(':');
    }
    date.setHours(parseInt(parts[0]));
    date.setMinutes(parseInt(parts[1]));
};

// Watch for changes to the modelValue prop
watch(() => props.modelValue, () => {
    setDateStrings();
}, { immediate : true });

// Watch for changes to dateString
watch(dateString, newValue => {
    if (!newValue) return;
    // Create a new date or use existing one
    const date = props.modelValue ? new Date(props.modelValue) : new Date();
    setDate(date, newValue);
    emit('update:modelValue', date);
});

// Watch for changes to timeString
watch(timeString, newValue => {
    if (!newValue) return;

    // Create a new date or use existing one
    const date = props.modelValue ? new Date(props.modelValue) : new Date();
    setTime(date, newValue);
    emit('update:modelValue', date);
});
</script>

<style>

.v-col {
  padding: 0 1em !important;
}

.date-container {
    padding-inline-start : 0 !important;
}
.time-container {
    padding-inline-end : 0 !important;
}
</style>
