import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins      : [vue()],
    optimizeDeps : {
        include : ['@bryntum/schedulerpro', '@bryntum/schedulerpro-vue-3']
    },
    base   : '',
    server : {
        // The PHP backend is served by Apache. In dev, the client requests `./php/...`
        // (which the browser resolves to `/php/...`); this proxy forwards those to the
        // PHP files Apache hosts. In a production build, `./php/` resolves to the demo's
        // own bundled `php/` folder, so no proxy is needed there.
        proxy : {
            '/php' : {
                target       : 'http://localhost:80',
                changeOrigin : true,
                secure       : false,
                rewrite      : path => path.replace(
                    /^\/php/,
                    '/bryntum-suite/Scheduler/examples/frameworks/vue-3-vite/tanstack-query-lazy-load/public/php'
                )
            }
        }
    },
    build : {
        // Suppress warning for chunk size
        chunkSizeWarningLimit : 10000,

        // Turn warnings into errors
        // https://rollupjs.org/configuration-options/#onlog
        rollupOptions : {
            onLog(level, log, handler) {
                if (level === 'warn') {
                    handler('error', log);
                }
                else {
                    handler(level, log);
                }
            }
        }
    }
});
