# Troubleshooting Bryntum Chart with Vue

## Version requirements

Minimum supported:

 * Vue: `3.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)
 * Vite: `4.0.0` or higher (for Vite application)

Recommended:

 * Vue: `3.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)
 * Vite: `5.0.0` or higher (for Vite application)

<div class="note">

Please note that since Vue 2 has reached end of life, we no longer maintain guides or components for it. We recommend
upgrading to Vue 3 for continued support and compatibility.

</div>

## Installing, building or running

If you encounter issues with installing or building your application, they can often be resolved by clearing the npm
cache for the project and global npm packages.

Optionally first clean the global npm/yarn cache:

**npm**

```shell
npm cache clean --force
```

**yarn**

```shell
yarn cache clean
```

Run the following commands in your application folder to remove installed packages and reinstall all project
dependencies:

<div class="docs-tabs" data-name="os">
<div>
    <a>MacOS/Linux</a>
    <a>Windows</a>
</div>
<div>

<strong>npm</strong>

```shell
rm -rf node_modules
rm package-lock.json
npm install
```

<strong>yarn</strong>

```shell
rm -rf node_modules
rm package-lock.json
yarn install
```

</div>
<div>

<strong>npm</strong>

```shell
rmdir node_modules /s /q
del package-lock.json
npm install
```

<strong>yarn</strong>

```shell
rmdir node_modules /s /q
del package-lock.json
yarn install
```
</div>
</div>

### Transpiling dependencies
If you use Vue CLI, you can also try adding the following to your `vue.config.js`:

```javascript
module.exports = {
...
    transpileDependencies: [
        '@bryntum/chart'
    ],
};
```

## Custom Configurations

[Vue CLI](https://cli.vuejs.org/) is the default tooling for creating, developing and managing Vue applications so it
has been chosen for our examples. It also provides an abstraction level between the application and Webpack and easy
configurability of the project through `vue.config.js` file.

While this approach would be best in majority of cases, you can still have a custom Webpack configuration that is not
managed by Vue CLI. Although it is not feasible for us to support all possible custom configurations we have some
guidelines to make the Bryntum Calendar integration easier and smoother.

If you face any issues, executing one or more of the following steps should resolve the problem.

## Add or edit `.eslintignore` file

It may also be necessary to ignore linter for some files. If you do not have `.eslintignore` in your project root create
it (edit it otherwise) so that it has at least the following content:

```javascript
chart.module.js
```

## The Bryntum Chart bundle was loaded multiple times

```text
The Bryntum Chart bundle was loaded multiple times by the application.
```

The error above usually means that somewhere you have imported both the module and UMD versions of the Bryntum Chart 
package. Inspect the code and import from a single version of the Bryntum Chart bundle. We recommend using the default
module of the `@bryntum/chart` package (points to the module bundle):

```javascript
import { Chart } from '@bryntum/chart';
```

For more information on other causes of the error, please see
[this guide](#Chart/guides/gettingstarted/es6bundle.md#troubleshooting).

### Vite application

### Optimize dependencies

When using Vite with Vue to run a Bryntum application in development mode (`npm run dev`), in order to fix loading
bundles multiple times and avoid runtime error, it is recommended to include Bryntum packages in
the [optimizeDeps](https://vitejs.dev/config/dep-optimization-options.html) in **vite.config.js** as shown below.

<div class="note">

This is only recommended for full Bryntum npm packages (<strong>@bryntum/chart</strong>). Don't use this for <strong>thin</strong> packages
(<strong>@bryntum/chart-thin</strong>)

</div>

<div class="docs-tabs" data-name="vue">
<div>
    <a>Vue 2</a>
    <a>Vue 3</a>
</div>
<div>

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins      : [react()],
    optimizeDeps : {
        include : ['@bryntum/chart', '@bryntum/chart-vue']
    }
});
```

</div>
<div>

```

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-vue';

export default defineConfig({
    plugins      : [vue()],
    optimizeDeps : {
        include : ['@bryntum/chart', '@bryntum/chart-vue-3']
    }
});
```
</div>
</div>

### Circular dependencies

During a Vite Rollup production build with Bryntum **thin** packages, you may see "Circular dependency" warnings. This
occurs because the Bryntum API relies on the ES6 specification, which permits certain circular dependencies.

To suppress these warnings, configure your Vite application `build` as shown below. For more information, refer to the 
[Rollup documentation](https://rollupjs.org/configuration-options/#onlog).

Example `vite.config.ts` or `vite.config.mts` file:

```javascript
// https://vitejs.dev/config/
export default defineConfig({
    build        : {
        rollupOptions : {
            onLog(level, log, handler) {
                if (log.code === 'CIRCULAR_DEPENDENCY') {
                    return; // Ignore circular dependency warnings
                }
            }
        }
    }
});
```

## JavaScript heap out of memory

"JavaScript heap out of memory" error occurs on large projects where the default amount of memory allocated by node is
not sufficient to complete the command successfully.

You can increase this amount by running the following command:

**For Linux/macOS:**

```shell
export NODE_OPTIONS=--max-old-space-size=8192
```

**For Windows powershell:**

```shell
$env:NODE_OPTIONS="--max-old-space-size=8192"
```

Alternatively you can increase the amount of memory by adding the following
`NODE_OPTIONS='--max-old-space-size=8192'` config to `scripts` section in **package.json** file:

**For example change used build script:**

```json
{
  "scripts": {
    "build": "your-build-script"
  }
}
```

**to:**

```json
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS='--max-old-space-size=8192' your-build-script"
  }
}
```

To apply this environment config you need `cross-env` npm library which can be installed to devDependencies with:

```shell
nmp install cross-env --save-dev
```

## Legacy peer dependencies

When you use **npm** v7 or above to install application, it checks that application dependencies have valid versions
compared to the other packages used.

If you want change some dependency version you may use
[npm-shrinkwrap](https://docs.npmjs.com/cli/v9/commands/npm-shrinkwrap) for this to set the valid version you want.

Another approach is to install other dependency packages for new **npm** versions above v7 with the
`--legacy-peer-deps` config flag enabled. Please read information in
[npm documentation](https://docs.npmjs.com/cli/v9/using-npm/config#legacy-peer-deps).

**Example:**

Create **.npmrc** in application folder with the following code:
```
legacy-peer-deps=true
```

This will allow using `npm install` without errors.

<div class="note">

We recommend upgrading your application to use a newer framework version instead of working around it. This will help to resolve issues with outdated
peer dependencies

</div>

## Openssl legacy provider 

When using Node 18+ for application which uses legacy dependencies, you may receive this error during compilation:

```bash
Error: error:0308010C:digital envelope routines::unsupported
```

To resolve this issue create `.npmrc` file in the application folder and put this inside:

```txt
node-options="--openssl-legacy-provider"
```

Alternate solution is to open a terminal and export the environment variable before running your Node.js application:

**Mac, Ubuntu (and other Linux distributions):**

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

**Windows (command prompt)**

```bash
set NODE_OPTIONS=--openssl-legacy-provider
```

**Windows (PowerShell)**

```bash
$env:NODE_OPTIONS="--openssl-legacy-provider"
```



<p class="last-modified">Last modified on 2026-07-22 10:46:11</p>