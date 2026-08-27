/* global defineNuxtConfig */
// https://nuxt.com/docs/api/configuration/nuxt-config

// Importing demo config for this Bryntum Demo index page. Not required for your application
import { title, description } from './app.config.json';

export default defineNuxtConfig({
    ssr               : false,
    compatibilityDate : '2025-06-25',
    devtools          : { enabled : true },
    app               : {
        cdnURL : './',
        head   : {
            title,
            meta : [
                { name : 'description', content : description }
            ],
            link : [
                {
                    rel  : 'icon',
                    type : 'image/png',
                    href : './favicon.png'
                },
                { rel : 'stylesheet', href : 'themes/svalbard-light.css', 'data-bryntum-theme' : '' }
            ]
        }
    },

    experimental : {
        // Disables extraction of payloads of pages generated with nuxt generate.
        // https://nuxt.com/docs/guide/going-further/experimental-features#payloadextraction
        payloadExtraction : false
    },

    nitro : {
        // Enable static site generation
        preset : 'static',
        output : {
            // Output folder for static site generation
            publicDir : 'dist'
        }
    },

    plugins : [
        { src : '~/plugins/bryntum-scheduler.js', mode : 'client' }
    ],

    vite : {
        optimizeDeps : {
            include : ['@bryntum/schedulerpro', '@bryntum/schedulerpro-vue-3']
        },
        build : {
            // Suppress warning for chunk size
            chunkSizeWarningLimit : 10000,

            // Turn warnings into errors. For build testing purposes
            // https://rollupjs.org/configuration-options/#onlog
            rollupOptions : {
                onLog(level, log, handler) {
                    if (level === 'warn' && log.code !== 'CIRCULAR_DEPENDENCY') {
                        handler('error', log);
                    }
                    else {
                        handler(level, log);
                    }
                }
            }
        }
    }
});
