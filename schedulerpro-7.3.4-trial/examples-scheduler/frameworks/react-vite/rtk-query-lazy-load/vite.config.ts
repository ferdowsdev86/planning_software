import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps : {
        include : ['@bryntum/schedulerpro', '@bryntum/schedulerpro-react']
    },
    base   : './',
    server : {
        // Dev-only: forward the client's `/php/...` requests to the Apache-hosted PHP backend.
        // A production build serves `./php/` from the bundled folder, so no proxy is needed.
        proxy : {
            '/php' : {
                target       : 'http://localhost:80',
                changeOrigin : true,
                secure       : false,
                rewrite      : path => path.replace(
                    /^\/php/,
                    '/bryntum-suite/Scheduler/examples/frameworks/react-vite/rtk-query-lazy-load/public/php'
                )
            }
        }
    },
    build : {
        // Bryntum bundles are large; don't warn on chunk size.
        chunkSizeWarningLimit : 10000,

        // Fail the build on any Rollup warning so demo issues can't slip through.
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
    },
    css : {
        preprocessorOptions : {
            scss : {
                silenceDeprecations : [
                ]
            }
        }
    }
});
