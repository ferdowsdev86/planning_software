<template>
    <div class="top-bar">
        <button
            class="b-widget b-button b-button-text b-text b-bryntum"
            style="flex: 0 0 10em"
            @click="handleClick"
        >
            Update summary
        </button>
        <div
            v-if="beforeLunch > -1"
            class="summary"
        >
            <b>{{ props.beforeLunch }} events starting before lunch, {{ props.afterLunch }} after</b>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    beforeLunch: number;
    afterLunch: number;
}>();

const emit = defineEmits<{
    (e: 'myClick'): void;
}>();

function handleClick() {
    emit('myClick');
}
</script>
