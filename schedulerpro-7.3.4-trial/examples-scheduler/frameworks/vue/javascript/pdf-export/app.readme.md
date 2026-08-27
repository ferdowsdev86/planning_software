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
page and then will try to load content provided by the client.

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

Then run this from example's folder `<%= data.demo %>`:

Build for production:

```shell
npm run build
```

Serve the app using `serve` npm package:

```shell
$ serve -l 8081 build
```
