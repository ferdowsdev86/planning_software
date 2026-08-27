# Calendar editor

## Introduction

Bryntum Scheduler Pro and Gantt ship with a built-in calendar editor - a special widget visualizing a calendar's data
and allowing a user to edit it.

This demo shows the editor, click **Edit project calendar** button to start editing:
<div class="external-example" data-file="SchedulerPro/widget/CalendarEditor.js"></div>

**Please note:** Some data cases are unsupported by the calendar editor, please check the
["Checking that your data is ready for the Calendar editor"](##checking-that-your-data-is-ready-for-the-calendar-editor)
chapter for details.

## Under the hood

The widget is implemented with the [CalendarEditor](#SchedulerPro/widget/CalendarEditor) class. It extends
[Popup](#Core/widget/Popup) so any corresponding configs work for it:

```javascript
const editor = new CalendarEditor({
    // don't display the editor right now
    autoShow  : false,
    // use it as a modal dialog
    modal     : true,
    // clicking outside the editor closes it
    autoClose : true
});
```

And additionally the class has a few new APIs specific to its purposes:

- [calendar](#SchedulerPro/widget/CalendarEditor#config-calendar) - config to load a calendar for editing.
- [activeDate](#SchedulerPro/widget/CalendarEditor#config-activeDate) - date to display on the widget's
  "General" tab (read "Widget Structure" for more details).
- [save](#SchedulerPro/widget/CalendarEditor#function-save) - method to save changes programmatically.

For example:

```javascript
// create calendar editor
const editor = new CalendarEditor({
    modal    : true,
    // don't show it right away
    autoShow : false
});

// Show calendar editor for the project calendar
editor.calendar   = project.calendar;
editor.activeDate = new Date(2023, 11, 7);
editor.show();
```

## Widget structure

The widget is a tab panel that has three tabs: "General", "Exceptions" and "Weeks".

| Tab ref        | Type                                                                                         | Text         | Weight |
|----------------|----------------------------------------------------------------------------------------------|--------------|--------|
| `generalTab`   | [Container](#Core/widget/Container)                                                          | General      | 100    |
| `exceptionTab` | [CalendarEditorExceptionTab](#SchedulerPro/widget/calendareditor/CalendarEditorExceptionTab) | Exceptions   | 200    |
| `weekTab`      | [CalendarEditorWeekTab](#SchedulerPro/widget/calendareditor/CalendarEditorWeekTab)           | Weeks        | 300    |

Besides that there is a bottom toolbar with two `Save` and `Cancel` buttons having (`ref` : `saveButton`,
`weight` : `200`) and (`ref` : `cancelButton`, `weight` : `300`) respectively.

## General tab

The **"General"** tab has fields allowing to change the calendar name, parent
and specify whether its whole time is working by default.

<img src="SchedulerPro/general_tab.png" style="max-width:806px" alt="Grid toolbar">

Besides that the tab allows inspecting certain day ranges with a date picker.
The picker highlights days affected by the calendar with background and color badges.
The meaning of the background and the badges is explained in a legend placed to the left of the picker.

<img src="SchedulerPro/date_picker_legend.png" style="max-width:195px" alt="Date picker legend">

The widget to the right of the picker displays the selected day availability information
(whether the day is working and why). Like here for example user selected **Jan 1st 2019**
and the panel reported that it's a day off owing to the **"X-Mas & New Year!"** exception:

<img src="SchedulerPro/date_info.png" style="max-width:188px" alt="Date information">

When selecting a date or a date range the widget opens a special context menu allowing to add
an exception or a week override for the range.

## Weeks tab

The **"Weeks"** tab allows managing _weeks_ - calendar intervals that specify regular working schedule.
An example of such interval could be a typical work week of 8AM to 5PM work days,
Monday through Friday.

The tab has a grid of weeks and an editor-panel in the left and right parts respectively.
Adding (or removing) weeks can be done with buttons on the grid toolbar:

<img src="SchedulerPro/add_remove_btns.png" alt="Grid toolbar">

After clicking **"Add week"** the editor-panel displays the newly added record data:

<img src="SchedulerPro/new_week.png" style="max-width:800px" alt="New week">

To make a day working one should toggle the slide control next to the day name. That will add
the default availability to it:

<img src="SchedulerPro/new_ranges.png" style="max-width:507px" alt="New ranges">

The time values can be changed in the fields. And ranges can be
added/removed with the buttons next to the fields.

**Note:** A working schedule might change in the middle of the project. In that case one can add
a _week override_ - a _week_ having "To" and "From" dates provided. Then the specified working
schedule will be applied for the provided date range only.
For example here we setup **08AM** till **12PM** working time, **Monday** through **Friday** for the period from
**Dec 7th 2023** till **Dec 31st 2023**:

<img src="SchedulerPro/week_override.png" style="max-width:800px" alt="Week override">

**Please note**
A calendar that doesn't allow working any time by default **must** have at least one week providing some availability.

## Exceptions tab

The **"Exception"** tab allows managing _exceptions_ - calendar intervals that specify changes to the regular working schedule.
An example of such intervals could be a vacation, day-off or a public holiday.

## Adding a vacation

First switch to the **"General"** tab. Then select the vacation range on the date picker widget (use `[SHIFT + left click]` to
select a range). This will display a context menu (it disappears after few seconds but you can open it any time by right
clicking the date picker). Click **"Add exception"** menu entry:

<img src="SchedulerPro/making_exception.png" style="max-width:403px" alt="Adding an exception">

After doing that the widget will make a new exception and switch to the **"Exceptions"** tab where you can specify
its name.

<img src="SchedulerPro/making_exception2.png" style="max-width:800px" alt="Adding an exception">

And that's basically it. The selected range is made non-working. You can check that by switching back
to the **"General"** tab and inspecting the dates there.

## Adding a recurring holiday

As an example of adding a regular holiday let's register Christmas and New Year holidays starting
from Dec 24th till Jan 2nd.
Switch to the **"General"** tab and click Dec 24th of any year on the date picker widget. And then
holding `[SHIFT]` key click the ensuing Jan 1st date and click **"Add exception"** in the appeared
context menu:

<img src="SchedulerPro/holiday1.png" style="max-width:800px" alt="Adding an exception">

After doing that the widget will make a new exception and switch to the **"Exceptions"** tab where
you can specify **"Christmas and New Year"** as its name:

<img src="SchedulerPro/holiday2.png" style="max-width:801px" alt="Setting the exception name">

At this point we've got a static non-working period for the selected dates but we want it to
**repeat every year**. To configure that click **"Repeat"** slide control:

<img src="SchedulerPro/holiday3.png" style="max-width:800px" alt="Enabling start repeat">

In the appeared **"Frequency"** field select **"Yearly"** to specify that it should repeat every year.
And make sure the **"On"** checkbox is selected and the field next to it has **24 December** value:

<img src="SchedulerPro/holiday4.png" style="max-width:800px" alt="Configuring start repeat">

That makes the exception repeat **every year on Dec 24th** and last till **Dec 25th 00:00**.
But we want the exception end to repeat every year on Jan 2nd. To configure that click **"Repeat end"** slide control.
The **"Frequency"** field already has **"Yearly"** selected. So just make sure the **"On"** checkbox is selected
and the field next to it has **2 January** value:

<img src="SchedulerPro/holiday5.png" style="max-width:800px" alt="Enabling end repeat">

After doing that the exception start and end dates will be calculated based on the provided recurrence settings.
And we no longer need **"From"** and **"To"** dates since **they limit the recurrence to run in that concrete
range only**. So let's scroll up and clear the fields:

<img src="SchedulerPro/holiday6.png" style="max-width:801px" alt="Clearing fields">

Now if you switch back to the **"General"** tab and inspect the holiday dates for different years you will
see that they are treated as non-working and repeat every year.

## Exception dates and recurrence combination

Here is a table that explains how the exception start, end dates and recurrence settings work together:

| Start date | End date | Start<br/>recurrence | End<br/>recurrence | Meaning                                                                          |
|------------|----------|----------------------|--------------------|----------------------------------------------------------------------------------|
|  **Yes**   |   -      |   -                  |   -                | All dates starting from the provided start date.                                 |
|     -      | **Yes**  |   -                  |   -                | All dates till the provided end date.                                            |
|  **Yes**   | **Yes**  |   -                  |   -                | All dates starting from the provided start date and till the provided end dates. |
|  **Yes**   | **Yes**  | **Yes**              |   -                | Effective start dates are calculated based on the start recurrence settings. The dates are collected in the provided start/end dates range only. Effective end dates are calculated as the ends of the collected start dates. |
|  **Yes**   | **Yes**  | **Yes**              | **Yes**            | Effective start and end dates are calculated based on the start and end recurrence settings respectively. The dates are collected in the provided start/end dates range only. |

The above fields are responsible for collecting dates only. When the dates are found they are treated as working or not based on the exception availability setting.

## Checking that your data is ready for the Calendar editor

Later JS library (we use under the hood for calendars) syntax is quite rich which is good.
But the downside is it's tricky to cover all its possible configurations in UI. Thus the calendar editor at the moment
supports only the most common cases used by the calendars.

You can check if your calendar data is compatible with the new editor. In order to do that please call `calendarManagerStore`
 [validateAllRecordsForCalendarEditor](#SchedulerPro/data/CalendarManagerStore#function-validateAllRecordsForCalendarEditor)
method after the data is loaded:

```javascript
calendarManagerStore.validateAllRecordsForCalendarEditor();
```

That will report found errors to the browser console. If nothing is reported the data is good.

For instance the calendar editor does not support so called composite schedules (rules looking like
`{rule1} and {rule2}` or `{rule1} except {rule2}`).
Let's say we have a "Working hours" calendar with the following unsupported rules:

```json
{
    "recurrentStartDate" : "at 8:00 except on Saturday and Sunday",
    "recurrentEndDate"   : "at 17:00 except on Saturday and Sunday",
    "isWorking"          : true
},
```

So if we trigger calendars validation:

```javascript
// validate all calendars in the store
calendarManagerStore.validateAllRecordsForCalendarEditor();
```

That will dump a warning in the browser console:

```text
  CalendarEditorStore: The "Working hours" calendar interval cannot be handled. Please copy its data and
  report to  https://bryntum.com/forum :
{
  "id": "_generatedModelClass_9ce06c8d-df47-4d4d-921b-3b51fd806e98",
  "recurrentStartDate": "at 8:00 except on Saturday and Sunday",
  "recurrentEndDate": "at 17:00 except on Saturday and Sunday",
  "isWorking": true,
  "availability": null
}
```

In that exact case the rules can be easily changed to a non-composite look:

```json
{
    "recurrentStartDate" : "every weekday at 8:00",
    "recurrentEndDate"   : "every weekday at 17:00",
    "isWorking"          : true
}
```

And other similar "composite cases" could require breaking an interval into multiple ones with simple rules.
Or you could just try making them manually with the calendar editor.

As always if you face a case you cannot implement report us: [https://bryntum.com/forum](https://bryntum.com/forum)


<p class="last-modified">Last modified on 2026-07-22 10:39:19</p>