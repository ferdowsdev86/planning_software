# Loading using `<script>`

## Include script and CSS

To include Bryntum Core on your page using a plain old script tag, just include a tag like the following before
including any script that uses the core:

```html
<script type="text/javascript" src="path-to-core/core.umd.js"></script>
```

Also include CSS for the Core, FontAwesome (used for the built-in icons) and the theme you want to use on page:

```html
<!-- FontAwesome 6 Free, used for the built-in icons -->
<link rel="stylesheet" type="text/css" href="path-to-core/fontawesome/css/fontawesome.css">
<link rel="stylesheet" type="text/css" href="path-to-core/fontawesome/css/solid.css">
<!-- Product CSS -->
<link rel="stylesheet" type="text/css" href="path-to-core/core.css">
<!-- Bryntum theme -->
<link rel="stylesheet" type="text/css" href="path-to-core/[theme].css" data-bryntum-theme>
```

## Use it in your code

From your scripts you can access our classes in the global bryntum namespace:

```javascript
var core = new bryntum.core.Core();
```



<p class="last-modified">Last modified on 2026-07-22 10:45:55</p>