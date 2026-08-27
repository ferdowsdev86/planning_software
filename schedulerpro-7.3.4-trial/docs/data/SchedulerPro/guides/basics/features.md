# Scheduler Pro features

Features are classes that add functionality to the Scheduler Pro. The purpose of this guide is to give an overview of
the features that ships with Scheduler Pro and show how you can configure them.

Bryntum Scheduler Pro is based on the [Bryntum Scheduler](https://bryntum.com/products/scheduler/) and inherits lots of
features from it. The Scheduler, in turn, is based on the [Bryntum Grid](https://bryntum.com/products/grid/),
which provides capabilities like cell editing, column resizing, and many more. Please refer
to [this guide](#Grid/guides/basics/features.md) for general information about using the features in the Bryntum Grid.

If you want to create a custom feature, head over to [GridFeatureManager](#Grid/feature/GridFeatureManager) docs.

## Built-in features

Bryntum Scheduler Pro comes with the following features included:

### AllocationCellEdit ([API docs](#SchedulerPro/feature/AllocationCellEdit))

This is a feature of the ResourceUtilization view that allows editing an assignment's time-phased effort values.

<div class="external-example" data-file="SchedulerPro/feature/AllocationCellEdit.js"></div>

This feature is **disabled** by default.

### AllocationCopyPaste ([API docs](#SchedulerPro/feature/AllocationCopyPaste))

This is a feature of the ResourceUtilization view that allows copy-pasting an assignment's time-phased effort values.

<div class="external-example" data-file="SchedulerPro/feature/AllocationCopyPaste.js"></div>

This feature is **disabled** by default.

### CalendarHighlight ([API docs](#SchedulerPro/feature/CalendarHighlight))

This feature temporarily visualizes calendars for the event or resource calendar (controlled by the calendar config).

<div class="external-example" data-file="SchedulerPro/feature/CalendarHighlight.js"></div>

This feature is **disabled** by default.

### CellEdit ([API docs](#SchedulerPro/feature/CellEdit))

Extends the CellEdit to encapsulate SchedulerPro functionality.

This feature is **enabled** by default.

### Dependencies ([API docs](#SchedulerPro/feature/Dependencies))

This feature implements support for project transactions and is used by default in Scheduler Pro.

This feature is **enabled** by default.

### DependencyEdit ([API docs](#SchedulerPro/feature/DependencyEdit))

Feature that displays a popup containing fields for editing dependency data.

This feature is **disabled** by default.

### EventBuffer ([API docs](#SchedulerPro/feature/EventBuffer))

Feature that allows showing additional time before & after an event, to visualize things like travel time - or the time
you need to prepare a room for a meeting + clean it up after.

<div class="external-example" data-file="SchedulerPro/feature/EventBuffer.js"></div>

This feature is **disabled** by default.

### EventDrag ([API docs](#SchedulerPro/feature/EventDrag))

Drag events to reschedule their start & end dates. Can be configured to snap to certain time intervals.

This feature is **enabled** by default.

### EventResize ([API docs](#SchedulerPro/feature/EventResize))

Feature that allows resizing an event by dragging its end.

This feature is **enabled** by default.

### EventSegmentDrag ([API docs](#SchedulerPro/feature/EventSegmentDrag))

Allows user to drag and drop event segments within the row.

This feature is **enabled** by default.

### EventSegmentResize ([API docs](#SchedulerPro/feature/EventSegmentResize))

Feature that allows resizing an event segment by dragging its end.

This feature is **enabled** by default.

### EventSegments ([API docs](#SchedulerPro/feature/EventSegments))

This feature provides segmented events support. It implements rendering of such events and also adds a entries to the
event context menu allowing to split the selected event and rename segments.

<div class="external-example" data-file="SchedulerPro/feature/EventSegments.js"></div>

This feature is **enabled** by default.

### NestedEvents ([API docs](#SchedulerPro/feature/NestedEvents))

A feature that renders child events nested inside their parent. Requires Scheduler Pro to use a tree event store (
normally handled automatically when events in data has children).

<div class="external-example" data-file="SchedulerPro/feature/NestedEvents.js"></div>

This feature is **disabled** by default.

### PercentBar ([API docs](#SchedulerPro/feature/PercentBar))

This feature visualizes the percentDone field as a progress bar on the event elements. Each progress bar also optionally
has a drag handle which users can drag can change the value.

<div class="external-example" data-file="SchedulerPro/feature/PercentBar.js"></div>

This feature is **disabled** by default.

### ResourceEdit ([API docs](#SchedulerPro/feature/ResourceEdit))

Feature that displays a popup containing widgets for editing resource data.

This feature is **enabled** by default.

### ResourceNonWorkingTime ([API docs](#SchedulerPro/feature/ResourceNonWorkingTime))

Feature that highlights the non-working intervals for resources based on their calendar.

<div class="external-example" data-file="SchedulerPro/feature/ResourceNonWorkingTime.js"></div>

This feature is **disabled** by default.

### TaskEdit ([API docs](#SchedulerPro/feature/TaskEdit))

Feature that displays a Task editor, allowing users to edit task data. The default Task Editor is
[fully customizable](#SchedulerPro/widget/SchedulerTaskEditor#task-editor-customization), allowing you to add
custom fields and tabs to fit your specific requirements.

<div class="external-example" data-file="SchedulerPro/feature/TaskEdit.js"></div>

This feature is **enabled** by default.

### TimeSpanHighlight ([API docs](#SchedulerPro/feature/TimeSpanHighlight))

This feature exposes methods on the owning timeline widget which you can use to highlight one or multiple time spans in
the schedule.

<div class="external-example" data-file="SchedulerPro/feature/TimeSpanHighlight.js"></div>

This feature is **disabled** by default.

### Versions ([API docs](#SchedulerPro/feature/Versions))

Captures versions (snapshots) of the active project, including a detailed log of the changes new in each version.

<div class="external-example" data-file="SchedulerPro/guides/whats-new/5.3.0/versions.js"></div>

This feature is **disabled** by default.

## Importing features from sources

A feature is registered when the application imports it. When using the regular module/umd bundle, this is done
automatically, as the bundle encapsulates all code inside. However, when utilizing sources or thin bundles, a feature
might not be imported by default. For any feature not enabled by default, it is essential to ensure that you have
imported it to be able to use it.

Example:

```javascript
import SchedulerPro from 'PATH_TO_SOURCE/SchedulerPro/view/SchedulerPro.js';
import 'PATH_TO_SOURCE/SchedulerPro/feature/Baselines.js';

const SchedulerPro = new SchedulerPro({
    features : {
        baselines : {
            // feature config
        }
    }
});
```


<p class="last-modified">Last modified on 2026-07-22 10:39:19</p>