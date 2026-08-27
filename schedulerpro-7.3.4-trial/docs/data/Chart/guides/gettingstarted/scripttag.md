# Loading using `<script>`

## Include script and CSS

To include Bryntum Chart on your page using a plain old script tag, just include a tag like the following before
including any script that uses the chart:

```html
<script type="text/javascript" src="path-to-chart/chart.umd.js"></script>
```

Also include CSS for the Chart, FontAwesome (used for the built-in icons) and the theme you want to use on page:

```html
<!-- FontAwesome 6 Free, used for the built-in icons -->
<link rel="stylesheet" type="text/css" href="path-to-chart/fontawesome/css/fontawesome.css">
<link rel="stylesheet" type="text/css" href="path-to-chart/fontawesome/css/solid.css">
<!-- Product CSS -->
<link rel="stylesheet" type="text/css" href="path-to-chart/chart.css">
<!-- Bryntum theme -->
<link rel="stylesheet" type="text/css" href="path-to-chart/[theme].css" data-bryntum-theme>
```

## Use it in your code

From your scripts you can access our classes in the global bryntum namespace:

```javascript
var chart = new bryntum.chart.Chart();
```



<p class="last-modified">Last modified on 2026-07-22 10:46:10</p>