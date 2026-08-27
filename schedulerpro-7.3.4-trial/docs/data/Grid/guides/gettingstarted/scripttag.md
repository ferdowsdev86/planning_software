# Loading using `<script>`

## Include script and CSS

To include Bryntum Grid on your page using a plain old script tag, just include a tag like the following before
including any script that uses the grid:

```html
<script type="text/javascript" src="path-to-grid/grid.umd.js"></script>
```

Also include CSS for the Grid, FontAwesome (used for the built-in icons) and the theme you want to use on page:

```html
<!-- FontAwesome 6 Free, used for the built-in icons -->
<link rel="stylesheet" type="text/css" href="path-to-grid/fontawesome/css/fontawesome.css">
<link rel="stylesheet" type="text/css" href="path-to-grid/fontawesome/css/solid.css">
<!-- Product CSS -->
<link rel="stylesheet" type="text/css" href="path-to-grid/grid.css">
<!-- Bryntum theme -->
<link rel="stylesheet" type="text/css" href="path-to-grid/[theme].css" data-bryntum-theme>
```

## Use it in your code

From your scripts you can access our classes in the global bryntum namespace:

```javascript
var grid = new bryntum.grid.Grid();
```

For a complete example, check out the <a href="../examples/scripttag/" target="_blank">scripttag example</a>.



<p class="last-modified">Last modified on 2026-07-22 10:46:47</p>