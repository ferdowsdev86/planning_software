# Upgrade Font Awesome icons to Pro version

By default, all icons in Bryntum products are based on the [Font Awesome 6 Free](https://fontawesome.com/icons?d=gallery&m=free) 
solid font. But, if you have a Font Awesome Pro license, you can upgrade the shipped FREE font to one of your Pro fonts.

## Font Awesome fonts

Here is the table of FREE and Pro font's specification. It is valid for Font Awesome v6.7.2 and might be changed in the 
future. For the latest values consult with official Font Awesome [guide](https://docs.fontawesome.com/web/add-icons/how-to).

| Style          | Availability      | @font-face weight | @font-face font-family                                    |
|----------------|-------------------|-------------------|-----------------------------------------------------------|
| Solid          | Free Plan         | 900               | Font Awesome 6 Free or Font Awesome 6 Pro (for pro users) |
| Regular        | Pro Plan Required | 400               | Font Awesome 6 Pro                                        |
| Light          | Pro Plan Required | 300               | Font Awesome 6 Pro                                        |
| Thin           | Pro Plan Required | 100               | Font Awesome 6 Pro                                        |

FontAwesome also offers multiple other styles, such as Duotone, Sharp and Brands.

## Replace FREE icons with Pro icons

Let's say you want to replace our `Font Awesome 6 Free / Solid` font with `Font Awesome 6 Pro / Regular` font.
Download the new Pro font and copy it into your project. Then set the `--b-widget-icon-font-family` CSS variable to 
`'Font Awesome 6 Pro'` in your CSS file:

```css
:root:not(.b-nothing) {
    --b-widget-icon-font-family : 'Font Awesome 6 Pro';
}
```

## Using different Font Awesome fonts in one application

If you need to combine two and more types of icon fonts in one application, you can override `font-weight` styles for 
specific icons using CSS selectors. For example:

```css
/* Use Font Awesome 6 Pro / 400 (Regular) by default */
.fa:before,
.b-icon:before {
    font-weight : 400;
}

/* Use Font Awesome 6 Pro / 900 (Solid) for specific widget */
.my-widget .fa:before,
.my-widget .icon:before {
    font-weight : 900;
}
```


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>