# Bryntum Color system

Bryntum CSS includes a basic color system used throughout the UI. It is based on CSS variables and can be easily
customized to fit your design. It consists of three major parts:

* A set of colors
* Two main color scales
* Two "utility" color scales used for border colors and text colors

## Color set

Bryntum CSS defines a set of colors as CSS variables. These are used throughout the UI for various purposes, but can 
also be used directly in your own CSS for consistent coloring. The colors are:

<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-red)"></div>Red,&nbsp;<code>--b-color-red</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-pink)"></div>Pink,&nbsp;<code>--b-color-pink</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-magenta)"></div>Magenta,&nbsp;<code>--b-color-magenta</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-purple)"></div>Purple,&nbsp;<code>--b-color-purple</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-violet)"></div>Violet,&nbsp;<code>--b-color-violet</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-deep-purple)"></div>Deep Purple,&nbsp;<code>--b-color-deep-purple</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-indigo)"></div>Indigo,&nbsp;<code>--b-color-indigo</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-blue)"></div>Blue,&nbsp;<code>--b-color-blue</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-light-blue)"></div>Light Blue,&nbsp;<code>--b-color-light-blue</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-cyan)"></div>Cyan,&nbsp;<code>--b-color-cyan</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-teal)"></div>Teal,&nbsp;<code>--b-color-teal</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-green)"></div>Green,&nbsp;<code>--b-color-green</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-light-green)"></div>Light Green,&nbsp;<code>--b-color-light-green</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-lime)"></div>Lime,&nbsp;<code>--b-color-lime</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-yellow)"></div>Yellow,&nbsp;<code>--b-color-yellow</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-amber)"></div>Amber,&nbsp;<code>--b-color-amber</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-orange)"></div>Orange,&nbsp;<code>--b-color-orange</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-deep-orange)"></div>Deep Orange,&nbsp;<code>--b-color-deep-orange</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-brown)"></div>Brown,&nbsp;<code>--b-color-brown</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-lighter-gray)"></div>Lighter Gray,&nbsp;<code>--b-color-lighter-gray</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-light-gray)"></div>Light Gray,&nbsp;<code>--b-color-light-gray</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-gray)"></div>Gray,&nbsp;<code>--b-color-gray</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-color-black)"></div>Black,&nbsp;<code>--b-color-black</code></div>

You can easily override a color you want to change in your own CSS:

```css
:root {
    --b-color-blue : #123456;
}
```

## Main color scales

Starting from v7, Bryntum CSS includes two main color scales that are used throughout the refreshed UI:

* A neutral color scale for backgrounds, borders, text and similar - `--b-neutral-xx`
* A primary color scale for highlights, accents and similar - `--b-primary-xx`

Both scales range from `--b-*-0` to `--b-*-100`, in steps of 5 with more steps (in 1) towards the higher extreme. In a
light theme, 0 will be the darkest color and 100 the lightest, while in a dark theme it is the opposite.

### Neutral color scale

These squares show the neutral color scale in the theme currently used in this documentation (you can flip between light
and dark themes using the button in the top right corner):

<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-0)"></div>Neutral 0,&nbsp;<code>--b-neutral-0</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-1)"></div>Neutral 1,&nbsp;<code>--b-neutral-1</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-2)"></div>Neutral 2,&nbsp;<code>--b-neutral-2</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-5)"></div>Neutral 5,&nbsp;<code>--b-neutral-5</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-10)"></div>Neutral 10,&nbsp;<code>--b-neutral-10</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-15)"></div>Neutral 15,&nbsp;<code>--b-neutral-15</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-20)"></div>Neutral 20,&nbsp;<code>--b-neutral-20</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-25)"></div>Neutral 25,&nbsp;<code>--b-neutral-25</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-30)"></div>Neutral 30,&nbsp;<code>--b-neutral-30</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-35)"></div>Neutral 35,&nbsp;<code>--b-neutral-35</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-40)"></div>Neutral 40,&nbsp;<code>--b-neutral-40</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-45)"></div>Neutral 45,&nbsp;<code>--b-neutral-45</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-50)"></div>Neutral 50,&nbsp;<code>--b-neutral-50</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-55)"></div>Neutral 55,&nbsp;<code>--b-neutral-55</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-60)"></div>Neutral 60,&nbsp;<code>--b-neutral-60</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-65)"></div>Neutral 65,&nbsp;<code>--b-neutral-65</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-70)"></div>Neutral 70,&nbsp;<code>--b-neutral-70</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-75)"></div>Neutral 75,&nbsp;<code>--b-neutral-75</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-80)"></div>Neutral 80,&nbsp;<code>--b-neutral-80</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-85)"></div>Neutral 85,&nbsp;<code>--b-neutral-85</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-90)"></div>Neutral 90,&nbsp;<code>--b-neutral-90</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-91)"></div>Neutral 91,&nbsp;<code>--b-neutral-91</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-92)"></div>Neutral 92,&nbsp;<code>--b-neutral-92</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-93)"></div>Neutral 93,&nbsp;<code>--b-neutral-93</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-94)"></div>Neutral 94,&nbsp;<code>--b-neutral-94</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-95)"></div>Neutral 95,&nbsp;<code>--b-neutral-95</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-96)"></div>Neutral 96,&nbsp;<code>--b-neutral-96</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-97)"></div>Neutral 97,&nbsp;<code>--b-neutral-97</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-98)"></div>Neutral 98,&nbsp;<code>--b-neutral-98</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-99)"></div>Neutral 99,&nbsp;<code>--b-neutral-99</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-neutral-100)"></div>Neutral 100,&nbsp;<code>--b-neutral-100</code></div>

The neutral color scale is "hard coded" for performance reasons, it is defined something like this (depending on theme): 

```css
:root {
    --b-neutral-100 : hsl(0 0 100%);
    --b-neutral-99  : hsl(0 0 99%);
    --b-neutral-98  : hsl(0 0 98%);
    ...
}
```

The scale can be overridden by changing the values of the variables (see the source for any dark theme).

### Primary color scale

And this is the primary color scale (using the primary color used here in the documentation):

<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-0)"></div>Primary 0,&nbsp;<code>--b-primary-0</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-1)"></div>Primary 1,&nbsp;<code>--b-primary-1</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-2)"></div>Primary 2,&nbsp;<code>--b-primary-2</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-5)"></div>Primary 5,&nbsp;<code>--b-primary-5</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-10)"></div>Primary 10,&nbsp;<code>--b-primary-10</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-15)"></div>Primary 15,&nbsp;<code>--b-primary-15</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-20)"></div>Primary 20,&nbsp;<code>--b-primary-20</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-25)"></div>Primary 25,&nbsp;<code>--b-primary-25</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-30)"></div>Primary 30,&nbsp;<code>--b-primary-30</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-35)"></div>Primary 35,&nbsp;<code>--b-primary-35</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-40)"></div>Primary 40,&nbsp;<code>--b-primary-40</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-45)"></div>Primary 45,&nbsp;<code>--b-primary-45</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-50)"></div>Primary 50,&nbsp;<code>--b-primary-50</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-55)"></div>Primary 55,&nbsp;<code>--b-primary-55</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-60)"></div>Primary 60,&nbsp;<code>--b-primary-60</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-65)"></div>Primary 65,&nbsp;<code>--b-primary-65</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-70)"></div>Primary 70,&nbsp;<code>--b-primary-70</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-75)"></div>Primary 75,&nbsp;<code>--b-primary-75</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-80)"></div>Primary 80,&nbsp;<code>--b-primary-80</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-85)"></div>Primary 85,&nbsp;<code>--b-primary-85</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-90)"></div>Primary 90,&nbsp;<code>--b-primary-90</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-91)"></div>Primary 91,&nbsp;<code>--b-primary-91</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-92)"></div>Primary 92,&nbsp;<code>--b-primary-92</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-93)"></div>Primary 93,&nbsp;<code>--b-primary-93</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-94)"></div>Primary 94,&nbsp;<code>--b-primary-94</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-95)"></div>Primary 95,&nbsp;<code>--b-primary-95</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-96)"></div>Primary 96,&nbsp;<code>--b-primary-96</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-97)"></div>Primary 97,&nbsp;<code>--b-primary-97</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-98)"></div>Primary 98,&nbsp;<code>--b-primary-98</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-99)"></div>Primary 99,&nbsp;<code>--b-primary-99</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-100)"></div>Primary 100,&nbsp;<code>--b-primary-100</code></div>

This scale uses the `color-mix()` CSS function to dynamically create the scale steps based on the primary color used
(can be any color you want). To specify which primary color to use, set the `--b-primary` variable where you want it to 
apply from (it will cascade):

```css
/* Make all buttons use Bryntum orange as their primary color */
.b-button {
    --b-primary : var(--b-color-orange);
}
```

<div class="note">Note that you can use any color, it does not have to be a color from the Bryntum color set.</div>

These boxes show the same scale as above, but with the primary color changed to `--b-color-orange`:

<div class="b-colorize" style="--b-primary: var(--b-color-orange)">
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-0)"></div>Primary 0,&nbsp;<code>--b-primary-0</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-1)"></div>Primary 1,&nbsp;<code>--b-primary-1</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-2)"></div>Primary 2,&nbsp;<code>--b-primary-2</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-5)"></div>Primary 5,&nbsp;<code>--b-primary-5</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-10)"></div>Primary 10,&nbsp;<code>--b-primary-10</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-15)"></div>Primary 15,&nbsp;<code>--b-primary-15</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-20)"></div>Primary 20,&nbsp;<code>--b-primary-20</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-25)"></div>Primary 25,&nbsp;<code>--b-primary-25</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-30)"></div>Primary 30,&nbsp;<code>--b-primary-30</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-35)"></div>Primary 35,&nbsp;<code>--b-primary-35</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-40)"></div>Primary 40,&nbsp;<code>--b-primary-40</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-45)"></div>Primary 45,&nbsp;<code>--b-primary-45</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-50)"></div>Primary 50,&nbsp;<code>--b-primary-50</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-55)"></div>Primary 55,&nbsp;<code>--b-primary-55</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-60)"></div>Primary 60,&nbsp;<code>--b-primary-60</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-65)"></div>Primary 65,&nbsp;<code>--b-primary-65</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-70)"></div>Primary 70,&nbsp;<code>--b-primary-70</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-75)"></div>Primary 75,&nbsp;<code>--b-primary-75</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-80)"></div>Primary 80,&nbsp;<code>--b-primary-80</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-85)"></div>Primary 85,&nbsp;<code>--b-primary-85</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-90)"></div>Primary 90,&nbsp;<code>--b-primary-90</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-91)"></div>Primary 91,&nbsp;<code>--b-primary-91</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-92)"></div>Primary 92,&nbsp;<code>--b-primary-92</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-93)"></div>Primary 93,&nbsp;<code>--b-primary-93</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-94)"></div>Primary 94,&nbsp;<code>--b-primary-94</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-95)"></div>Primary 95,&nbsp;<code>--b-primary-95</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-96)"></div>Primary 96,&nbsp;<code>--b-primary-96</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-97)"></div>Primary 97,&nbsp;<code>--b-primary-97</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-98)"></div>Primary 98,&nbsp;<code>--b-primary-98</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-99)"></div>Primary 99,&nbsp;<code>--b-primary-99</code></div>
<div style="display: flex; align-items: center"><div class="b-color-box" style="background: var(--b-primary-100)"></div>Primary 100,&nbsp;<code>--b-primary-100</code></div>
</div>

#### Explainer for a color-mix quirk

Because of how `color-mix()` works, the scale has to be defined where it is used. Consider this example:

```html
<body>
<style>
    :root {
        --color       : red;
        --mixed-color : color-mix(in srgb, var(--color), #fff 50%);
    }
</style>
<div style="background: var(--mixed-color)"></div>
<div style="--color: blue; background: var(--mixed-color)"></div>
</body>
```

In the example, although counter-intuitive, both divs will have the same (pale red) background color, because 
`--mixed-color` is defined in `:root` where `--color` is `red`. To make the second div blue, we need to define
`--mixed-color` there:

```html
<body>
<style>
    :root {
        --color       : red;
        --mixed-color : color-mix(in srgb, var(--color), #fff 50%);
    }
</style>
<div style="background: var(--mixed-color)"></div>
<div style="--color: blue; --mixed-color: color-mix(in srgb, var(--color), #fff 50%); background: var(--mixed-color)"></div>
</body>
```

A bit unfortunate, but that is how CSS variables and `color-mix()` works. To work around this, we define the color mixes
in a `.b-colorize` class, that you can use to wrap any element where you want to use a different primary color:

```html
<div class="b-colorize" style="--b-primary: red">
    <div style="background: var(--b-primary-50)"></div>
    <div style="background: var(--b-primary-80)"></div>
</div>
```

These boxes use a lime primary color, but are not wrapped in a `.b-colorize`:

<div style="--b-primary: var(--b-color-lime); display: flex">
<div class="b-color-box" style="background: var(--b-primary-50)"></div>
<div class="b-color-box" style="background: var(--b-primary-80)"></div>
</div>

These are wrapped:

<div class="b-colorize" style="--b-primary: var(--b-color-lime); display: flex">
<div class="b-color-box" style="background: var(--b-primary-50)"></div>
<div class="b-color-box" style="background: var(--b-primary-80)"></div>
</div>

## Utility color scales

To keep text colors and border colors consistent, Bryntum CSS includes two utility color scales:

* A text color scale - `--b-text-xx`
* A border color scale - `--b-border-xx`

Both scales use a limited set of steps, taken from the neutral color scale.

### Text color scale

These lines show the text color scale, which ranges from `--b-text-1` (most prominent text) to `--b-text-5` (least
prominent text):

<div style="display: flex; flex-direction: column; gap: 0.5em">
<div style="color: var(--b-text-1)">Text 1,&nbsp;<code>--b-text-1</code></div>
<div style="color: var(--b-text-2)">Text 2,&nbsp;<code>--b-text-2</code></div>
<div style="color: var(--b-text-3)">Text 3,&nbsp;<code>--b-text-3</code></div>
<div style="color: var(--b-text-4)">Text 4,&nbsp;<code>--b-text-4</code></div>
<div style="color: var(--b-text-5)">Text 5,&nbsp;<code>--b-text-5</code></div>
</div>

### Border color scale

These boxes show the border color scale, which ranges from `--b-border-1` (most prominent borders) to `--b-border-10`
(least prominent borders):

<div style="display: flex; flex-direction: column; gap: 0.5em">
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-1); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 1,&nbsp;<code>--b-border-1</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-2); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 2,&nbsp;<code>--b-border-2</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-3); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 3,&nbsp;<code>--b-border-3</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-4); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 4,&nbsp;<code>--b-border-4</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-5); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 5,&nbsp;<code>--b-border-5</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-6); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 6,&nbsp;<code>--b-border-6</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-7); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 7,&nbsp;<code>--b-border-7</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-8); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 8,&nbsp;<code>--b-border-8</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-9); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 9,&nbsp;<code>--b-border-9</code></div>
    <div style="display: flex; align-items: center"><div style="border: 1px solid var(--b-border-10); width: 1em; height: 1em; margin-inline-end: .5em"></div>Border 10,&nbsp;<code>--b-border-10</code></div>
</div>


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>