# Exporting to PDF (Angular)

This example uses Bryntum Scheduler Pro wrapped in the provided BryntumSchedulerProComponent wrapper.
This example shows how you can export the Angular Scheduler content into PDF/PNG in Angular.

This application was generated with:

* [Angular](https://angular.io/) [15.2.0]

# Bryntum Repository access setup

**IMPORTANT NOTE!** These access instructions are mandatory when using the private Bryntum NPM repositories only.

If application uses npm packages from the Bryntum private NPM repository, you must be logged in to this repository as
licensed or trial user to access the packages.

For detailed information on the sign-up and login process, please refer to the 
[Online npm repository guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/npm/repository/private-repository-access).

# Angular integration guide

Please check the [Bryntum Angular integration online guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/integration/angular/guide) for detailed
integration information and help.

# Installation

Use the following command to install the example packages after the successful login.

Using **npm**:

```shell
npm install
```

Using **yarn**:

```shell
yarn install
```

# Start PDF export server

This demo shows how to use export to PDF/PNG feature with Scheduler. It requires a special
[PDF export server](https://github.com/bryntum/pdf-export-server) to run.

## Setup

1. Setup the server

   Please refer to [Getting Started](https://github.com/bryntum/pdf-export-server#getting-started) section of the PDF
   Export server repo for steps

2. Configure example to use your server

   By default, the example is configured to use `localhost:8080` as export host.

3. Open this example in the browser, press `Export` and check various export options

## Loading resources

To export Scheduler to the PDF we collect HTML/styles on the client and send it to the server, which launches headless
puppeteer, open page and puts HTML directly to the page.

React development server has pretty strict CORS policy out of the box, unless you have it ejected, you cannot configure
response headers. Neither puppeteer allows to disable web security in headless mode. Thus in order to make export server
to work with demo's dev server, we added config `clientURL` which will first navigate puppeteer to the
page and then will
try to load content provided by the client.

### Dev mode

In dev mode all styles are loaded inside `<style>` tags and app itself is hosted on `localhost:3000`. It means that we
need to point all `url()` to correct URL, e.g.

Change this

```css
font : url('/static/media/myfont.eot')
```

to

```css
font : url('http://localhost:3000/static/media/myfont.eot')
```

Below config does just that

```javascript
// Main.js
pdfExportFeature    = {{
    exportServer            : 'http://localhost:8080',
    translateURLsToAbsolute : 'http://localhost:3000',
    clientURL               : 'http://localhost:3000',
    keepPathName            : false // ignores window location, uses translateURLsToAbsolute value
}}
```

Export server wouldn't require more configs:

```shell
node ./src/server.js -h 8080
```

## Prod mode

In production mode there could be a combination of `<style>` and `<link>` tags, which means we need to also
process `<link>` hrefs. Also there is no default server run, so config would depend on your environment.

First, use this config:

```typescript
// Main.ts
pdfExportFeature    = {{
    exportServer            : 'http://localhost:8080',
    translateURLsToAbsolute : 'http://localhost:8080/resources/',
    keepPathName            : false // ignores window location, uses translateURLsToAbsolute value
}}
```

Then run this from example's folder `examples-scheduler/frameworks/angular/pdf-export`:

Build for production:

```shell
npm run build
```

Serve the app using `serve` npm package:

```shell
$ serve -l 8081 build
```

# Running a development server

To build example and start development server run this command:

Using **npm**:

```shell
npm run start
```

Using **yarn**:

```shell
yarn run start
```

Navigate to `http://localhost:4200/` or `http://127.0.0.1:4200/` in your browser. We recommend to use latest versions of
modern browsers like Chrome, FireFox, Safari or Edge (Chromium). The app will automatically reload if you change any of
the source files.

# Creating a production build

To build production code for the example run this command:

Using **npm**:

```shell
npm run build
```

Using **yarn**:

```shell
yarn run build
```

The build artifacts will be stored in the `dist/` directory.

# Distribution zip references

* Bryntum API docs. Open `docs/index.html` in your browser.
* Bryntum Repository guide `docs/guides/npm-repository.md`.
* Bryntum Angular integration guide `docs/guides/integration/angular/guide.md`.

# Online References

* [Angular Framework](https://angular.io)
* [Bryntum Angular integration guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/integration/angular/guide)
* [Bryntum Scheduler Pro documentation](https://bryntum.com/products/schedulerpro/docs/)
* [Bryntum Scheduler Pro examples](https://bryntum.com/products/schedulerpro/examples/)
* [Bryntum npm repository guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/npm-repository)
* [Bryntum support Forum](https://forum.bryntum.com/)
* [Contacts us](https://bryntum.com/contact/)
