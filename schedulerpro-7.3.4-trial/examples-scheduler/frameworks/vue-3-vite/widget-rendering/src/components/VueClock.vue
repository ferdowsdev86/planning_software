<template>
    <div class="container">
        <div class="clock">
            <div
                ref="hour"
                class="hand hour"
            >
                <i />
            </div>
            <div
                ref="min"
                class="hand minute"
            >
                <i />
            </div>

            <span style="--i: 1"><b>1</b></span>
            <span style="--i: 2"><b>2</b></span>
            <span style="--i: 3"><b>3</b></span>
            <span style="--i: 4"><b>4</b></span>
            <span style="--i: 5"><b>5</b></span>
            <span style="--i: 6"><b>6</b></span>
            <span style="--i: 7"><b>7</b></span>
            <span style="--i: 8"><b>8</b></span>
            <span style="--i: 9"><b>9</b></span>
            <span style="--i: 10"><b>10</b></span>
            <span style="--i: 11"><b>11</b></span>
            <span style="--i: 12"><b>12</b></span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

interface Props {
    time: Date;
}

const props = withDefaults(defineProps<Props>(), {
    time : () => new Date()
});

const hour = ref<HTMLElement | null>(null);
const min  = ref<HTMLElement | null>(null);

watchEffect(() => {
    const hours   = props.time.getHours() % 12;
    const minutes = props.time.getMinutes();

    // Update hour hand
    if (hour.value) {
        hour.value.style.transform = `rotate(${(hours + minutes / 60) * 30}deg)`;
    }

    // Update minute hand
    if (min.value) {
        min.value.style.transform = `rotate(${minutes * 6}deg)`;
    }
});
</script>

<style lang="scss">
$clock-size : 5em;

.container {
    position : relative;
    width    : $clock-size;
    height   : $clock-size;
}

.clock {
    width            : $clock-size;
    height           : $clock-size;
    border-radius    : 50%;
    background-color : rgba(255, 255, 255, 0.1);
    border           : 2px solid rgba(0, 0, 0, 0.2);
    box-shadow       : 0px 0px 5px rgba(0, 0, 0, 0.2);
    display          : flex;
    justify-content  : center;
    align-items      : center;
}

.clock span {
    position    : absolute;
    transform   : rotate(calc(30deg * var(--i)));
    inset       : 0; //calc($clock-size / 30);
    line-height : 0.7em;
    text-align  : center;
}

.clock span b {
    transform : rotate(calc(-30deg * var(--i)));
    display   : inline-block;
    font-size : calc($clock-size / 10);
}

.clock::before {
    content          : '';
    position         : absolute;
    width            : calc($clock-size / 17);
    height           : calc($clock-size / 17);
    border-radius    : 50%;
    background-color : #555;
    z-index          : 2;
}

.hand {
    position        : absolute;
    display         : flex;
    justify-content : center;
    align-items     : flex-end;
}

.hand i {
    position         : absolute;
    background-color : #555;
    width            : calc($clock-size / 40);
    border-radius    : 8px;
}

.hand.hour i {
    height : calc($clock-size / 5);
}

.hand.minute i {
    height : calc($clock-size / 3);
}
</style>
