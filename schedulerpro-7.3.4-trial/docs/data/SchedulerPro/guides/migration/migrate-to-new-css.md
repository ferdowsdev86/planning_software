# Migrate to the new CSS

In Bryntum products start from v7.0, all styling and themes have been rewritten using modern CSS techniques. This guide
will help you migrate your existing custom styles to the new system.

Major differences from previous versions:

- **No more SASS**: The new themes are built using plain CSS with nesting and CSS variables, removing the need for SASS 
  preprocessing.
- **CSS Variables**: The new themes use CSS variables for colors, spacing, and other properties. This allows for easier 
  customization and theming.
- **Kebab-case class names**: Class names have been normalized to use kebab-case (e.g., `.b-button-group` instead of 
  `.b-buttongroup`) for better readability and consistency (previously it was a mix of styles).
- **Structural CSS separated from theme CSS**: The structural styles are now separated from theme-specific styles, 
  allowing for much thinner themes.
- **FontAwesome no longer built in**: It is still included in the packages, but needs to be imported separately. This
  makes it easier to use your own version of FontAwesome Free / Pro, or to use a different icon set entirely with less
  bloat.

## Including the new CSS

How to include the new CSS can be seen in all our demos, but in summary:

1. Include FontAwesome CSS, unless you are replacing it with your own icon set.
2. Include the structural CSS file, e.g. `schedulerpro.css`<sup>*</sup>.
3. Include the theme you want to use, e.g. `svalbard-light.css`.

<sup>*</sup>If you are using thin bundles, there will be multiple structural CSS files to include, one for each product
you are using

**Old index.html**

```html
<!-- The old theme CSS included both structure and theme + FontAwesome -->
<link rel="stylesheet" href="build/schedulerpro.stockholm.css" data-bryntum-theme>
```

**New index.html**

```html
<!-- FontAwesome is now a separate (somewhat optional) include -->
<link rel="stylesheet" href="build/fontawesome/css/fontawesome.css">
<link rel="stylesheet" href="build/fontawesome/css/solid.css">
<!-- Structural CSS is separated from themes -->
<link rel="stylesheet" href="build/schedulerpro.css">
<!-- New themes are lightweight and shared between all Bryntum products -->
<link rel="stylesheet" href="build/stockholm-light.css">
```

## Steps to migrate your custom styles

**This section applies if your app has CSS that overrides Bryntum CSS.**

The changes are so numerous that it is not possible to cover all cases. However, the following steps will help you
migrate your custom styles:

1. Rename any used Bryntum selectors to use kebab-case. For example (inconclusive list):

    - `.b-button-group` instead of `.b-buttongroup`
    - `.b-calendar-row` instead of `.b-calendarrow`
    - `.b-date-picker` instead of `.b-datepicker`
    - `.b-task-board` instead of `.b-taskboard`

    <div class="note">
See the <a href="#SchedulerPro/guides/migration/migrate-to-new-css.md#renamed-selectors">Renamed selectors</a> section below for more information.
</div>

2. Specificity of some selectors may have changed. Our aim has been to reduce where possible, but some have had to 
   increase. If you find your styles are not being applied, you may need to increase the specificity of your selectors.

3. The DOM structure of some core widgets has changed. If you find your styles are not being applied, inspect the DOM to
   ensure your selectors still match the intended elements. Common widgets that can be affected (inconclusive list):

    - `TextField` (and other form fields) - the border is now on a pseudo of the `.b-field-inner` element, instead of 
      directly on the `.b-field-inner` element.
    - `Slider` - Reimplemented, the structure has changed significantly.
    - `List` (and subclasses like `ChipView`) - List items now wrap their text in a `.b-list-item-content` element.

4. The `.b-raised` and `.b-transparent` classes previously used by `Button` should be removed, use the `rendition`
   config option instead. For example:

    **Old code**
    ```javascript
    new Button({
        cls : 'b-raised',
        text: 'Important'
    });
    ```

    **New code**
    ```javascript
    new Button({
        rendition : 'filled',
        text      : 'Important'
    });
    ```

5. Consider using CSS variables instead of overriding specific selectors. While more work initially, this often makes
   for a cleaner solution with less CSS needed and fewer issues with specificity. The API docs list available CSS
   variables for widgets, but you can also inspect the CSS files directly.

## Steps to migrate your custom themes

**This section applies if you have created a custom theme using SASS.**

The new themes are built using plain CSS with nesting and CSS variables, removing the need for SASS preprocessing. You
can still use SASS for your own theme if you wish, but you will need to rewrite your theme to use the new CSS variables
instead of the old SASS variables.

Our new themes are represented by a single CSS file each, which covers all Bryntum products. Each theme only consists of
changed CSS variable values, making them fairly thin.

In many cases, the CSS variables are named similarly to the old SASS variables, but this is not always the case. You
will have to consult the API documentation and/or inspect the CSS files to find the correct variables to override.

As an example, this is an excerpt from the old `stockholm-vars.scss` file for the Grid:

```scss
$grid-cell-border-color  : #e9eaeb;
$grid-header-font-weight : $stockholm-font-weight;
```

And this is what it looks like in the new `stockholm-light.css` file:

```css
:root:not(.b-nothing), :host(:not(.b-nothing)) {
    --b-grid-cell-border-color  : var(--b-neutral-85);
    --b-grid-header-font-weight : 400;
}
```

The somewhat strange-looking `:root:not(.b-nothing)` selector is to increase the specificity of the variable assignments,
to ensure they override the default values in the structural CSS no matter the import order in your app.

<div class="note">
For information on the <code>var(--b-neutral-85)</code> variable and other color variables, see the new 
<a href="#Grid/guides/customization/colorsystem.md">Color system</a> guide.
</div>

If you run into trouble migrating, please reach out on our support forum! This guide will be improved over time based on
the posted questions.

## Renamed selectors

The list below covers most of the renamed selectors for all Bryntum products, in a "starts with" manner (for example
`.b-dayview` covers `.b-dayview`, `.b-dayview-content`, `.b-dayview-header`, etc.).

The distribution includes a Node script called `migrate.js` in the root of the product folder. You can run it to 
automatically rename the selectors listed below in your CSS files. It will not handle all cases, but should help with 
the majority of them. 

```bash
> node migrate.js path/to/your/styles.css
```

<div class="warning">
Make sure to verify the output before committing any changes.
</div>

| Old                                         | New                                             |
|---------------------------------------------|-------------------------------------------------|
| .b-buttongroup                              | .b-button-group                                 |
| .b-calendarpanel                            | .b-calendar-panel                               |
| .b-chipview                                 | .b-chip-view                                    |
| .b-colorfield                               | .b-colorfield                                   |
| .b-colorbox                                 | .b-color-box                                    |
| .b-nonworkingday                            | .b-non-working-day                              |
| .b-colorpicker                              | .b-color-picker                                 |
| .b-uses-chipview                            | .b-uses-chip-view                               |
| .b-confirmationbar                          | .b-confirmation-bar                             |
| .b-datefield                                | .b-date-field                                   |
| .b-fieldcontainer                           | .b-field-container                              |
| .b-daterangefield                           | .b-date-range-field                             |
| .b-daterangepicker                          | .b-date-range-picker                            |
| .b-daterangefield-picker                    | .b-date-range-field-picker                      |
| .b-datetimefield                            | .b-date-time-field                              |
| .b-displayfield                             | .b-display-field                                |
| .b-numberfield                              | .b-number-field                                 |
| .b-textfield                                | .b-text-field                                   |
| .b-textareafield                            | .b-text-area-field                              |
| .b-fieldfilterpicker                        | .b-field-filter-picker                          |
| .b-fieldfilterpickergroup                   | .b-field-filter-picker-group                    |
| .b-fieldset                                 | .b-field-set                                    |
| .b-radiogroup                               | .b-radio-group                                  |
| .b-multiselect                              | .b-multi-select                                 |
| .b-menuitem                                 | .b-menu-item                                    |
| .b-messagedialog                            | .b-message-dialog                               |
| .b-multidatepicker                          | .b-multi-date-picker                            |
| .b-datepicker                               | .b-date-picker                                  |
| .b-pagingtoolbar                            | .b-paging-toolbar                               |
| .b-pickerfield                              | .b-picker-field                                 |
| .b-slidetoggle                              | .b-slide-toggle                                 |
| .b-draghelper                               | .b-drag-helper                                  |
| .b-durationfield                            | .b-duration-field                               |
| .b-monthpicker                              | .b-month-picker                                 |
| .b-yearpicker                               | .b-year-picker                                  |
| .b-richtextfield                            | .b-rich-text-field                              |
| .b-tabbar                                   | .b-tab-bar                                      |
| .b-tabpanel                                 | .b-tab-panel                                    |
| .b-textareapickerfield                      | .b-text-area-picker-field                       |
| .b-timefield                                | .b-time-field                                   |
| .b-timepicker                               | .b-time-picker                                  |
| .b-hide-othermonth-cells                    | .b-hide-other-month-cells                       |
| .b-checkboxgroup                            | .b-checkbox-group                               |
| .b-fieldtrigger                             | .b-field-trigger                                |
| .b-filepicker                               | .b-file-picker                                  |
| .b-sftimepicker                             | .b-sftime-picker                                |
| .b-undoredo                                 | .b-undo-redo                                    |
| .b-actioncolumn                             | .b-action-column                                |
| .b-grid-subgrid                             | .b-grid-sub-grid                                |
| .b-gridbase                                 | .b-grid-base                                    |
| .b-columnresize                             | .b-column-resize                                |
| .b-exportdialog                             | .b-export-dialog                                |
| .b-grid-treegroup                           | .b-grid-tree-group                              |
| .b-stickycells                              | .b-sticky-cells                                 |
| .b-rowresize                                | .b-row-resize                                   |
| .b-rownumber-cell                           | .b-row-number-cell                              |
| .b-rowexpander                              | .b-row-expander                                 |
| .b-singlepageunscaled                       | .b-single-page-unscaled                         |
| .b-mergecells                               | .b-merge-cells                                  |
| .b-columndragtoolbar                        | .b-column-drag-toolbar                          |
| .b-chartdesigner                            | .b-chart-designer                               |
| .b-celltooltip                              | .b-cell-tooltip                                 |
| .b-percentdone                              | .b-percent-done                                 |
| .b-checklistfiltercombo                     | .b-checklist-filter-combo                       |
| .b-groupbar                                 | .b-group-bar                                    |
| .b-timeaxissubgrid                          | .b-time-axis-sub-grid                           |
| .b-autoheight                               | .b-auto-height                                  |
| .b-grid-notextselection                     | .b-grid-no-text-selection                       |
| .b-resourcecollapse                         | .b-resource-collapse                            |
| .b-schedulerbase                            | .b-scheduler-base                               |
| .b-sch-timeaxis-cell                        | .b-sch-time-axis-cell                           |
| .b-timeline-subgrid                         | .b-timeline-sub-grid                            |
| .b-columnlines                              | .b-column-lines                                 |
| .b-dependencyeditor                         | .b-dependency-editor                            |
| .b-eventdrag                                | .b-event-drag                                   |
| .b-timelinebase                             | .b-timeline-base                                |
| .b-dragcreating                             | .b-drag-creating                                |
| .b-dragselect                               | .b-drag-select                                  |
| .b-eventeditor                              | .b-event-editor                                 |
| .b-eventresize                              | .b-event-resize                                 |
| .b-eventtip                                 | .b-event-tip                                    |
| .b-timeranges                               | .b-time-ranges                                  |
| .b-sch-nonworkingtime                       | .b-sch-non-working-time                         |
| .b-sch-resourcetimerange                    | .b-sch-resource-time-range                      |
| .b-sch-scheduletip                          | .b-sch-schedule-tip                             |
| .b-scrollbuttons                            | .b-scroll-buttons                               |
| .b-eventclickeditor                        | .b-simple-event-editor                          |
| .b-stickyevents                             | .b-sticky-events                                |
| .b-sch-summmarybar                          | .b-sch-summary-bar                              |
| .b-sch-timeaxis-menu-daterange-popup        | .b-sch-time-axis-menu-date-range-popup          |
| .b-eventfilter                              | .b-event-filter                                 |
| .b-sch-timerange                            | .b-sch-time-range                               |
| .b-dragging-timerange                       | .b-dragging-time-range                          |
| .b-sch-timeranges-with-headerelements       | .b-sch-time-ranges-with-header-elements         |
| .b-treesummary                              | .b-tree-summary                                 |
| .b-sch-clockwrap                            | .b-sch-clock-wrap                               |
| .b-recurrenceconfirmationpopup              | .b-recurrence-confirmation-popup                |
| .b-recurrenceeditor                         | .b-recurrence-editor                            |
| .b-recurrencedayscombo                      | .b-recurrence-days-combo                        |
| .b-recurrencepositionscombo                 | .b-recurrence-positions-combo                   |
| .b-recurrencedaysbuttongroup                | .b-recurrence-days-button-group                 |
| .b-recurrencemonthsbuttongroup              | .b-recurrence-months-button-group               |
| .b-recurrencemonthdaysbuttongroup           | .b-recurrence-month-days-button-group           |
| .b-recurrencelegendbutton                   | .b-recurrence-legend-button                     |
| .b-sch-header-timeaxis-cell                 | .b-sch-header-time-axis-cell                    |
| .b-horizontaltimeaxis                       | .b-horizontal-time-axis                         |
| .b-resourceheader                           | .b-resource-header                              |
| .b-eventbuffer                              | .b-event-buffer                                 |
| .b-verticaltimeaxiscolumn                   | .b-vertical-time-axis-column                    |
| .b-verticaltimeaxis                         | .b-vertical-time-axis                           |
| .b-timelinehistogram                        | .b-timeline-histogram                           |
| .b-daybuttons                               | .b-day-buttons                                  |
| .b-resourcecombo                            | .b-resource-combo                               |
| .b-sch-timeaxiscolumn                       | .b-sch-time-axis-column                         |
| .b-sch-tooltip-startdate                    | .b-sch-tooltip-start-date                       |
| .b-sch-tooltip-enddate                      | .b-sch-tooltip-end-date                         |
| .b-timeaxis                                 | .b-time-axis                                    |
| .b-sch-event-withicon                       | .b-sch-event-with-icon                          |
| .b-verticaltimeaxis-row                     | .b-vertical-time-axis-row                       |
| .b-eventlayout                              | .b-event-layout                                 |
| .b-resourcefilter                           | .b-resource-filter                              |
| .b-versiongrid                              | .b-version-grid                                 |
| .b-sch-resourcenonworkingtime               | .b-sch-resource-non-working-time                |
| .b-percentbar                               | .b-percent-bar                                  |
| .b-schedulerprobase                         | .b-scheduler-pro-base                           |
| .b-nestedevents                             | .b-nested-events                                |
| .b-resourcehistogram                        | .b-resource-histogram                           |
| .b-resourceutilization                      | .b-resource-utilization                         |
| .b-calendareditoravailabilityrangecontainer | .b-calendar-editor-availability-range-container |
| .b-calendareditorbasetab                    | .b-calendar-editor-base-tab                     |
| .b-calendareditorexceptiontab               | .b-calendar-editor-exception-tab                |
| .b-calendareditordatepicker                 | .b-calendar-editor-date-picker                  |
| .b-calendareditordateinfo                   | .b-calendar-editor-date-info                    |
| .b-calendareditorlegend                     | .b-calendar-editor-legend                       |
| .b-calendareditorweekgrid                   | .b-calendar-editor-week-grid                    |
| .b-calendareditorweektab                    | .b-calendar-editor-week-tab                     |
| .b-calendareditor                           | .b-calendar-editor                              |
| .b-dependencytab                            | .b-dependency-tab                               |
| .b-notestab                                 | .b-notes-tab                                    |
| .b-resourcestab                             | .b-resources-tab                                |
| .b-calendarfield                            | .b-calendar-field                               |
| .b-resourceeditorratetablestab              | .b-resource-editor-rate-tables-tab              |
| .b-resourceeditor                           | .b-resource-editor                              |
| .b-resourcegrid                             | .b-resource-grid                                |
| .b-resource-rate-table-editor               | .b-resource-rate-table-editor                   |
| .b-schedulerpro-issueresolutionpopup        | .b-scheduler-pro-issue-resolution-popup         |
| .b-taskeditorbase                           | .b-task-editor-base                             |
| .b-taskeditor                               | .b-task-editor                                  |
| .b-schedulerpro-taskeditor                  | .b-scheduler-pro-task-editor                    |
| .b-timeline-startdate                       | .b-timeline-start-date                          |
| .b-timeline-enddate                         | .b-timeline-end-date                            |
| .b-taskboardbase                            | .b-task-board-base                              |
| .b-taskboardfieldfilterpickergroup          | .b-task-board-field-filter-picker-group         |
| .b-columnlock                               | .b-column-lock                                  |
| .b-taskboard-column-filterbar               | .b-task-board-column-filter-bar                 |
| .b-resourcescombo                           | .b-resources-combo                              |
| .b-taskboard-taskitem                       | .b-task-board-task-item                         |
| .b-tagcombo                                 | .b-tag-combo                                    |
| .b-todolistfield                            | .b-todo-list-field                              |
| .b-taskboard                                | .b-task-board                                   |
| .b-ganttbase                                | .b-gantt-base                                   |
| .b-gantt-taskdrag                           | .b-gantt-task-drag                              |
| .b-projecteditor                            | .b-project-editor                               |
| .b-resourceassignment                       | .b-resource-assignment                          |
| .b-tasknonworkingtime                       | .b-task-non-working-time                        |
| .b-assignmentfield                          | .b-assignment-field                             |
| .b-assignmentgrid                           | .b-assignment-grid                              |
| .b-assignmentpicker                         | .b-assignment-picker                            |
| .b-monthview                                | .b-month-view                                   |
| .b-yearview                                 | .b-year-view                                    |
| .b-calendarmixin                            | .b-calendar-mixin                               |
| .b-expand-allday-button                     | .b-expand-all-day-button                        |
| .b-agendaview-dayselector                   | .b-agenda-view-day-selector                     |
| .b-agendaview                               | .b-agenda-view                                  |
| .b-cal-timerange                            | .b-cal-time-range                               |
| .b-weekexpander                             | .b-week-expander                                |
| .b-resourceview                             | .b-resource-view                                |
| .b-resource-dayview-timeaxis                | .b-resource-day-view-time-axis                  |
| .b-resource-dayview-scroller                | .b-resource-day-view-scroller                   |
| .b-dayview-timeaxis                         | .b-day-view-time-axis                           |
| .b-dayview-allday                           | .b-day-view-all-day                             |
| .b-dayview-with-dayselector                 | .b-day-view-with-day- selector                  |
| .b-dayview-hourheight                       | .b-day-view-hour-height                         |
| .b-dayview                                  | .b-day-view                                     |
| .b-eventlist                                | .b-event-list                                   |
| .b-resourcedayviewtimeaxis                  | .b-resource-day-view-time-axis                  |
| .b-resourcechipview                         | .b-resource-chip-view                           |
| .b-overflowpopup                            | .b-overflow-popup                               |
| .b-daycellcollecter                         | .b-day-cell-collecter                           |
| .b-disable-othermonth                       | .b-disable-other-month                          |
| .b-monthgrid                                | .b-month-grid                                   |
| .b-monthagendaview                          | .b-month-agenda-view                            |
| .b-calendar-fullweek                        | .b-calendar-full-week                           |
| .b-modeselector                             | .b-mode-selector                                |
| .b-calendarevents                           | .b-calendar-events                              |
| .b-calendarrow                              | .b-calendar-row                                 |
| .b-dayselector                              | .b-day-selector                                 |
| .b-weekview-with-dayselector                | .b-week-view-with-day-selector                  |
| .b-weekview                                 | .b-week-view                                    |
| .b-has-allday                               | .b-has-all-day                                  |
| .b-dayresourceview                          | .b-day-resource-view                            |
| .b-dayresource-allday                       | .b-day-resource-all-day                         |
| .b-dayresourcecalendarrow                   | .b-day-resource-calendar-row                    |
| .b-resourcecalendarrow                      | .b-resource-calendar-row                        |
| .b-dayname-date                             | .b-day-name-date                                |
| .b-dayagendaview                            | .b-day-agenda-view                              |
| .b-multidayview                             | .b-multi-day-view                               |
| .b-hide-timeaxis                            | .b-hide-time-axis                               |
| .b-calendardatepicker                       | .b-calendar-date-picker                         |
| .b-agendacolumn                             | .b-agenda-column                                |
| .b-calendar-viewcontainer                   | .b-calendar-view-container                      |


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>