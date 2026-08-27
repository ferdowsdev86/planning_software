<!-- Button -->
<template>
    <button class="b-button b-grey" @click="click($event)">
        <span>{{ htmlText }}</span>
    </button>
</template>

<script>
import { Toast, StringHelper } from '@bryntum/schedulerpro';

export default {
    name    : 'AppButton',
    props   : ['record'],
    methods : {
        click() {
            Toast.show(this.htmlText);
        }
    },
    computed : {
        htmlText() {
            return StringHelper.encodeHtml(this.record.city);
        }
    }
};
</script>
