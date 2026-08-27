<!-- Application -->
<template>
    <div id="app">
        <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
        <bryntum-demo-header />
        <div class="demo-app">
            <demo-header />
            <keep-alive>
                <router-view />
            </keep-alive>
        </div>
    </div>
</template>

<script>
import 'bootstrap/scss/bootstrap.scss';
// Bootstrap css forces page and body size
// https://github.com/twbs/bootstrap/issues/25629
import './bootstrap-fix.css';

import DemoHeader from './components/header/Header';
import { BryntumDemoHeader } from '@bryntum/schedulerpro-vue';

export default {
    components : {
        DemoHeader,
        BryntumDemoHeader
    }
};
</script>

<style lang="scss">
    @import './App.scss';
</style>
