# Build a production grade application with the licensed distribution

Bryntum offers trial distributions for you to experience our products and build your own demos.

However, to use the full potential of our products and use them legitimately, you will be required to acquire a licensed
distribution.

If you have not done so, please visit the [Bryntum Customer Zone](https://customerzone.bryntum.com).

## Migrate to the licensed distribution

Download a licensed version of your product distribution from your
[Bryntum Customer Zone](https://customerzone.bryntum.com). You'll notice the distribution contains source files and
additional interesting material that we will describe in detail further down.

If you are using npm, you will need to login to our private registry with your customer details.
Visit our [Npm Repository Guide](#Chart/guides/npm/repository/private-repository-access.md) For more information.

## Performance Optimization

There are many techniques to further improve both the loading time and execution time of your application and as a
consequence, the User Experience.
Some techniques described below require a fully licensed distribution but not all of them.

### Vanilla Javascript applications

#### Using thin files

If you are using multiple Bryntum products on the same page, you want to import them to avoid downloading the shared
code and styling more than once. We recommend using thin bundles for JavaScript and CSS to reduce the amount of code and
CSS to download. Just replace your `*.js` and `*.` files with `*.thin.js` and `*.thin.css` files.

#### Using minified files

The fully licensed version of the product comes with minified versions of Javascript and CSS files. Just replace your 
`*.js` and `*.css` files with `*.min.js` and `*.min.css` files.

<div class="note">

thin files are also available in a minified format. See the min-thin folder provided in the distribution.

</div>

#### Importing EcmaScript modules from sources

The fully licensed distribution also provides you with the opportunity to build your Vanilla JS application using the
component source files directly.

This is the most efficient way from a code size perspective, as your bundle will only include the JS modules actually
used by the Chart codebase.

In your application code, just import the classes you need from their source file. All source files are located
under `lib/` and they all offer a default export. Please note that if you want to support older browsers you may need to
transpile and bundle your code since ES modules are only supported in modern browsers.

```javascript
import Chart from '../lib/Chart/view/Chart.js';

const chart = new Chart({/*...*/})
```

For more information about using source files, please visit the
[dedicated guide](#Chart/guides/gettingstarted/sources.md).

<div class="note">

You can also have a look at the code of our examples since almost all use this technique.

</div>

#### Use a module bundler

We strongly recommend that you build your application using your favorite module bundler so it can be loaded from a web
browser with no reference to your local environment. If you don't have any, we suggest you learn more
about [Webpack](https://webpack.js.org/) for example.

### React applications

#### Loading components dynamically with Next.js

Bryntum components are client-side only, they do not support server-side rendering. Therefore they must be loaded
with `ssr` turned off. Furthermore, the life cycle of dynamically loaded components is different from normal React
components hence the following steps are needed.

The `BryntumChart` must be wrapped in another component so that React `refs` will continue to work. To implement it,
create a folder outside of Next.js `pages`, for example `components`, and put this extra wrapper there.

Sample code for `components/Chart.js`:

```javascript
/**
 * A simple wrap around BryntumChart for ref to work
 */
import { BryntumChart } from '@bryntum/chart-react';

export default function Chart({ChartRef, ...props }) {
    return <BryntumChart {...props} ref={ChartRef} />
}
```

The above component can then be loaded dynamically with this code:

```javascript
import dynamic from "next/dynamic";
import { useRef } from 'react';

const Chart = dynamic(
  () => import("../components/Chart.js"), {ssr: false}
);

const MyComponent = () => {
  const ChartRef = useRef();

  const clickHandler = function(e) {
    // This will log the Bryntum Chart native instance after it has been loaded
    console.log(ChartRef.current?.instance);
  }

  return (
    <>
      <button onClick={clickHandler}>ref test</button>
      <Chart
        ChartRef={ChartRef}
        // other props
      />
    </>
```


<p class="last-modified">Last modified on 2026-07-22 10:46:10</p>