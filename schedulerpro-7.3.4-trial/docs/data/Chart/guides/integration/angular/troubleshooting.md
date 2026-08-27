# Troubleshooting Bryntum Chart with Angular

## Version requirements

Minimum supported:

 * Angular: `9.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * Angular: `12.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

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

When using Angular 9+ lazy-loading with dynamic imports you may also get runtime error, but with a different cause. The
solution for this issue is to change target from `ESNext` to `CommonJS` in the `compilerOptions` section of the
`tsconfig.json` file.

### Vite application

When using Vite with Angular 17+ to run a Bryntum application in development mode (`npm run dev`), in order to fix 
loading bundles multiple times and avoid runtime error, it is recommended to include Bryntum packages in the
[optimizeDeps](https://vitejs.dev/config/dep-optimization-options.html) in **vite.config.js** as shown below.

**vite.config.ts**:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-angular';

// https://vitejs.dev/config/
export default defineConfig({
    plugins      : [react()],
    optimizeDeps : {
        include : ['@bryntum/chart', '@bryntum/chart-angular']
    }
});
```

## A property added to chartProps has no effect

If you have added a new property, for example `listeners` to the configuration object, make sure that you also have
added it to the component template, for example:

```html
<bryntum-chart>
    [listeners] = "chartProps.listeners!"
</bryntum-chart>
```

Angular does not process `chartProps` file as a whole, but we need to use individual properties in the template.

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

## Package subpath error 

To fix this error with Node 18+:

```bash
Package subpath './package.json' is not defined by "exports"
```

Run this command in project folder and rebuild project:
```

npm install --save-dev postcss@8.2.15
```


<p class="last-modified">Last modified on 2026-07-22 10:46:11</p>