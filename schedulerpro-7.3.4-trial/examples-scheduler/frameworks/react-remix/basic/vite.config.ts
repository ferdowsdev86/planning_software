import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
    plugins      : [remix(), tsconfigPaths()],
    optimizeDeps : {
        include : ['@bryntum/schedulerpro', '@bryntum/schedulerpro-react']
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
