# Loading using EcmaScript module bundle

## Include CSS

Include CSS for the Core, FontAwesome (used for the built-in icons) and the theme you want to use on page:

```html
<!-- FontAwesome 6 Free, used for the built-in icons -->
<link rel="stylesheet" type="text/css" href="path-to-core/fontawesome/css/fontawesome.css">
<link rel="stylesheet" type="text/css" href="path-to-core/fontawesome/css/solid.css">
<!-- Product CSS -->
<link rel="stylesheet" type="text/css" href="path-to-core/core.css">
<!-- Bryntum theme -->
<link rel="stylesheet" type="text/css" href="path-to-core/[theme].css" data-bryntum-theme>
```

## Import from the module bundle

In your application code, import the classes you need from the bundle:

```javascript
import { Core } from '../build/core.module.js';
```

And then use them:

```javascript
const core = new Core({
    /* Core configuration options */
})
```

## Troubleshooting

If you get a `The Bryntum Core bundle was loaded multiple times by the application` error, it means that
the browser has imported the bundle more than once, but as different modules. 

The way the browser determines whether it is the same module or not is by comparing the URL of the module. If the URL is 
different, the browser will treat the module as a different one. This can lead to unexpected and hard to debug side
effects, so when we detect it happening we throw an error.

Common causes of getting this error are:

1. Imports from different types of the bundle (e.g. *.module.js and *.umd.js)

   **Not ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js';
   // File src/B.js
   import { TextField } from 'core.umd.js';
   ```

   Make sure you use either `module` or `umd` (most likely `module`, `umd` is for legacy applications) consistently.

   **Ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js';
   // File src/B.js
   import { TextField } from 'core.module.js';
   ```

2. Import do not use the shortest relative path to the bundle

   **Not ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js';
   // File src/B.js
   import { Button } from '../src/core.module.js';
   ```

   Make sure a relative path never leads out of a folder and then back in again.

   **Ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js';
   // File src/B.js
   import { Button } from 'core.module.js';
   ```

3. Imports missing file type, some web servers still serve files without file type (does not apply for some frameworks, 
   or when importing from the main module of a node package)

   **Not ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js';
   // File src/B.js
   import { TextField } from 'core.module';
   ```

   Make sure all imports end with `.js`.

   **Ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js';
   // File src/B.js
   import { Button } from 'core.module.js';
   ```

4. Cache busters that differs between imports

   **Not ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js?6781';
   // File src/B.js
   import { Button } from 'core.module.js?9463';
   ```

   Make sure all imports use the same cache buster.

   **Ok**

   ```javascript
   // File src/A.js
   import { Button } from 'core.module.js?6781';
   // File src/B.js
   import { Button } from 'core.module.js?6781';
   ```

5. Imports from both Bryntum sources and bundle

   **Not ok**

   ```javascript
   // File src/A.js
   import Button from 'lib/Core/widget/Button.js';
   // File src/B.js
   import { TextField } from 'core.module.js';
   ```

   Make sure you either import only from sources, or only from the bundle.

   **Ok**

   ```javascript
    // File src/A.js
   import Button from 'lib/Core/widget/Button.js';
   // File src/B.js
   import Button from 'lib/Core/widget/Button.js';
   ```

6. Importing multiple Bryntum products in the same application

   Regular (full) bundles include the entire dependency chain. For example, `core.module.js` includes Core
   and all of its dependencies. If you import two regular bundles that share dependencies, the overlapping code is
   loaded twice, triggering the "loaded multiple times" error.

   **Not ok** — using two regular bundles that share dependencies:

   ```javascript
   // File src/A.js
   import { Grid } from 'grid.module.js';
   // File src/B.js
   import { Scheduler } from 'scheduler.module.js';  // Scheduler bundle also contains Grid + Core
   ```

   To combine multiple Bryntum products, use **thin bundles** instead. Thin bundles contain only product-specific
   code with no overlap. You must install each product and its dependencies as separate thin packages.

   **Ok** — using thin bundles:

   ```javascript
   import 'core.module.thin.js';
   // File src/A.js
   import { Grid } from 'grid.module.thin.js';
   // File src/B.js
   import { Scheduler } from 'scheduler.module.thin.js';
   ```

   When using npm packages, this means installing `@bryntum/{product}-thin` packages instead of the regular ones,
   along with all required dependency packages (e.g. `@bryntum/core-thin`, `@bryntum/engine-thin`).
   For framework wrappers, use the corresponding thin wrapper package (e.g. `@bryntum/grid-react-thin`).

   For CSS, import structural styles from each thin package separately, but fonts and the theme only once from
   `@bryntum/core-thin`:

   ```css
   @import "@bryntum/core-thin/core.css";
   @import "@bryntum/grid-thin/grid.css";
   @import "@bryntum/scheduler-thin/scheduler.css";
   @import "@bryntum/core-thin/[theme].css";
   ```

   See the [Multiple products guide](#Core/guides/integration/javascript/multiple-products.md) for full details and
   dependency tables.


<p class="last-modified">Last modified on 2026-07-22 10:45:55</p>