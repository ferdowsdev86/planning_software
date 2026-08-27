# Source and demos

## Distribution

### Trial distribution

Please visit [Download Free Trial](https://bryntum.com/download/?product=core) page to request distribution zip with product
packages and demos for Bryntum Core.

### Licensed distribution

Licensed distribution zip with product packages, sources and demos for Bryntum Core can be downloaded from
[Bryntum Customer Zone](https://customerzone.bryntum.com/).

Bryntum Customer Zone contains nightly builds for Bryntum Core with the latest changes.

### Distribution archive

Distribution archive has the following folder structure:

| Folder       | Contents                                                                                                            |
|--------------|---------------------------------------------------------------------------------------------------------------------|
| `/build`     | Distribution folder, contains JS bundles, CSS themes, locales and fonts.                                            |
| `/docs`      | Documentation, open this in a browser (needs to be on a web server) to view guides & API docs.                      |
| `/examples`  | Demos, open this in a browser (needs to be on a web server)                                                         |
| `/lib`       | Source code, can be included in your ES6+ project using `import`.                                                   |
| `/resources` | SCSS files to build our themes or your own custom theme.                                                            |

## Bundles

The Bryntum Core distribution provides pre-build JavaScript bundles.
All bundles are transpiled with `chrome: 88` babel preset.

In distribution zip they are located under the `/build` folder.

| File                    | Contents                                                        |
|-------------------------|-----------------------------------------------------------------|
| `core.module.js`     | Modules format bundle without WebComponents                     |
| `core.lwc.module.js` | Modules format bundle with Lightning WebComponents (Salesforce) |
| `core.wc.module.js`  | Modules format bundle with WebComponents                        |
| `core.umd.js`        | UMD format bundle with WebComponents                            |

Typings for TypeScripts can be found in files with a `.d.ts` file extension.

Minified bundles are available for Licensed product version and delivered with `.min.js` suffix.

## Themes

Distribution zip contains Bryntum Core themes which can be found in **/build** folder

| File                              | Contents                      |
|-----------------------------------|-------------------------------|
| `core.css`                     | Structural CSS                |
| `svalbard-light.css`              | Svalbard Light theme          |
| `svalbard-dark.css`               | Svalbard Dark theme           |
| `visby-light.css`                 | Visby Light theme             |
| `visby-dark.css`                  | Visby Dark theme              |
| `stockholm-light.css`             | Stockholm Light theme         |
| `stockholm-dark.css`              | Stockholm Dark theme          |
| `material3-light.css`             | Material3 Light theme         |
| `material3-dark.css`              | Material3 Dark theme          |
| `fluent2-light.css`               | Fluent2 Light theme           |
| `fluent2-dark.css`                | Fluent2 Dark theme            |
| `fontawesome/css/fontawesome.css` | Font Awesome Free base CSS    |
| `fontawesome/css/solid.css`       | Font Awesome Free solid icons |

## JavaScript demos

All vanilla JavaScript demos for Bryntum Core are located in the **/examples** folder in the distribution zip.

We recommend unzipping the package and configuring your preferred webserver to serve the contents of the unzipped
folder. For example you may configure your webserver to serve the Bryntum Core folder as 
`http://localhost`.

When this is done you can view the demos in your browser locally at 
`http://localhost/examples/`.

## Framework demos

Framework demos are located in the **/examples/frameworks** folder.

| Framework            | Demo folder location               |
|----------------------|------------------------------------|
| Angular              | /examples/frameworks/angular/      |
| React                | /examples/frameworks/react/        |
| React + NextJS       | /examples/frameworks/react-nextjs/ |
| React + Vite         | /examples/frameworks/react-vite/   |
| Vue 2                | /examples/frameworks/vue/          |
| Vue 3                | /examples/frameworks/vue-3/        |
| Vue 3 + Vite         | /examples/frameworks/vue-3-vite/   |

We recommend unzip package and configure your preferred webserver to serve the contents of unzipped folder.
For example you may configure webserver to serve Bryntum Core folder as `http://localhost`.
When this is done you will see demos in your local browser at this URL
`http://localhost/examples/frameworks/`.

<div class="note">

Before viewing a demo it requires building. Please check the <strong>README.md</strong> file in each demo's folder for instructions.

</div>



<p class="last-modified">Last modified on 2026-07-22 10:45:55</p>