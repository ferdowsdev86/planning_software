<template>
  <BryntumSchedulerComponent />
</template>

<script setup>
import BryntumSchedulerComponent from '~/components/BryntumSchedulerComponent.vue';

/* FontAwesome is not built-in, but used for icons */
import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
import "@bryntum/schedulerpro/fontawesome/css/solid.css";

/* Bryntum structural CSS */
import "@bryntum/schedulerpro/schedulerpro.css";

/* Bryntum theme is included in nuxt.config.ts to enable runtime theme switching, but it could instead be included here if you want to use a single theme */
// import "@bryntum/schedulerpro/svalbard-light.css";

/* Bryntum shared demo styling, not needed in your app */
import "@bryntum/demo-resources/scss/example.scss";

</script>

<style>
#__nuxt {
  height: 100vh;
}
</style>
