import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins      : [vue()],
    server       : {
        port : 5173
    },
    // Keep Vite's dependency scanner out of the extracted trial distribution
    optimizeDeps : {
        entries : ['index.html'],
        include : ['@bryntum/schedulerpro', '@bryntum/schedulerpro-vue-3']
    }
});
