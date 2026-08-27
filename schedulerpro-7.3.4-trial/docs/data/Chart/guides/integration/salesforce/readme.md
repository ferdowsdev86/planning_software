<h1 class="title-with-image">
<img src="Core/logo/salesforce.svg" alt="Bryntum Chart supports Lightning Web Components"/>
Using Bryntum Chart in Salesforce Lightning Applications
</h1>

Salesforce Lightning allows using 3rd party JS libraries to create web applications. In this guide we will briefly
explain our level of support as well as known problems and challenges.

## Lightning Locker

Lightning Locker is a security architecture for Lightning components (see
[here](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/security_code.htm)
for details). Locker Service isolates components in a way which requires us to adapt our library code to this isolated environment.
Starting from API version 40 Lightning Locker is on by default. As of version 4.1.0 of our component suite, we
offer support for it.

Bryntum Chart relies on a number of native Web APIs, some of which are modified (or completely blocked) by Lightning Locker.
We have tested and verified most of the features we support, including:
- grouping
- sorting
- editing
- tooltips
- dragdrop (rows, columns, etc)
- popup editors
- key navigation

If you find a broken feature, please report it to our [forum](https://forum.bryntum.com)
or [GitHub](https://github.com/bryntum/support/issues) and we will investigate it.

## Lightning Web Components

Salesforce recommends to
[always choose Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_lwc_or_aura)
unless you need an unsupported feature. We have prepared a public repository with a Lightning Web Application
featuring all supported products. Please refer to this repo for sources and installation instructions:

[Bryntum Salesforce Showcase](https://github.com/bryntum/bryntum-salesforce-showcase#bryntum-salesforce-showcase)

## Known issues

### Custom bundle built from sources does not work

Sources contain some code which is not compatible with the Locker Service. If you are building your own bundle from the
sources and upload it to Salesforce with disabled LWS, you may see an error. That error is caused by `import` statement
used by `getTestCase` function. To solve this problem you need to configure your bundler to remove code wrapped by
tag-comments:
```

//<remove-on-lwc-release>

//</remove-on-lwc-release>
```

You can find more information in this [forum post](https://forum.bryntum.com/viewtopic.php?t=26976).

### CSS collisions

You may encounter a CSS collision on components when loading static resources for different Bryntum products. Normally
this should not be a problem because each product bundle exports the components it is based on. Scheduler exports Grid, Gantt
exports both Scheduler and Grid. Which means you can use Grid from Gantt's static resource (please note you still need
a license for every Bryntum product you use).

In case you have a static resource for the Grid (having grid.theme.css) and another for Scheduler (having scheduler.theme.css)
you may see some incorrect styles, like the timeline header misplaced by a few pixels.

If you experience this or any other integration issue please let us know in our [forums](https://forum.bryntum.com).

### Changed and missing APIs

Lightning Locker modifies the behavior of some native APIs (and other native APIs are not supported).
We have refactored our code base to allow overriding certain behavior specifically to work with Lightning Locker. As a result
**chart.lwc.module.js only works when Lightning Locker is enabled**, it is not supposed to work in a regular page.

Overrides are organized in a single entry **lib/Chart/override/salesforce/AllOverrides.js** which you will only need
if you want to generate a special bundle (e.g. to achieve minimum size). This entry should be imported first.

## Supported Browsers

The LWC bundle we provide only supports modern browsers since Salesforce dropped support for legacy browsers at the
end of 2020. IE11 and old (non-Chromium based) Edge are not supported.


<p class="last-modified">Last modified on 2026-07-22 10:46:11</p>