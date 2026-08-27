# Importing EcmaScript modules from sources

Please note that this is not possible with the trial, sources are only included in the paid version.

## Include CSS

Include structural CSS for the Scheduler, FontAwesome (used for the built-in icons) and the theme you want to use on page:

```html
<!-- FontAwesome 6 Free, used for the built-in icons -->
<link rel="stylesheet" type="text/css" href="path-to-scheduler/fontawesome/css/fontawesome.css">
<link rel="stylesheet" type="text/css" href="path-to-scheduler/fontawesome/css/solid.css">
<!-- Product structural CSS -->
<link rel="stylesheet" type="text/css" href="path-to-scheduler/scheduler.css">
<!-- Bryntum theme -->
<link rel="stylesheet" type="text/css" href="path-to-scheduler/[theme].css" data-bryntum-theme>
```

Note that in our demos that use sources, we do not include the structural CSS in the HTML. Instead, it is dynamically 
loaded when sources are imported. This approach requires us to programmatically wait for all CSS to be loaded before 
creating the component instance in the app. For production apps, we recommend including the CSS in the HTML as shown 
above (or in whichever way the framework you use supports including CSS).

## Import the classes you need

In your application code, import the classes you need from their source file. All source files are located under `lib/`
and they all offer a default export. Please note that if you want to support older browsers you need to transpile and
bundle your code since ES modules are only supported in modern browsers.

```javascript
import Scheduler from '../lib/Scheduler/view/Scheduler.js';
```

And then use them:

```javascript
const scheduler = new Scheduler({
    /* Scheduler configuration options */
})
```



<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>