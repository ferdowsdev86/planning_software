# AI integration

<div class="note">

The AI feature and all its related components are marked as <strong>experimental</strong> and are subject to change.

</div>

The Scheduler and SchedulerPro ship with an AI feature that lets users interact with scheduling data using natural
language through a chat panel. Users can filter events, reschedule tasks, assign resources, and more — all using
conversational commands.

Before reading this guide, please read the [Grid AI integration guide](#Grid/guides/advanced/ai-integration.md) which
covers all the basics: setup, backend configuration, API plugins, custom tools, voice features, user settings, and more.
All of those configurations apply to the Scheduler and SchedulerPro as well.

## Minimum configuration

```javascript
import { Scheduler, OpenAIPlugin } from '@bryntum/scheduler';

const scheduler = new Scheduler({
    features : {
        ai : {
            promptUrl  : '/api/ai/prompt',
            apiPlugin  : OpenAIPlugin,
            model      : 'gpt-4-1',
            chatButton : true
        }
    }
});
```

## Default date range

The Scheduler adds a `defaultRange` config that controls which date range the AI uses when the user doesn't specify
one in their prompt:

| Value | Description |
|-------|-------------|
| `'timeline'` | Use the current timeline date range (default) |
| `'in-view'` | Use the currently visible (scrolled) date range |
| `'all'` | Use the entire date range |

```javascript
features : {
    ai : {
        defaultRange : 'timeline'
    }
}
```

## Additional tools

In addition to the [Grid tools](#Grid/guides/advanced/ai-integration.md), the Scheduler adds event-specific tools:

| Tool | Description |
|------|-------------|
| `getEvents` | Retrieves events from the event store |
| `updateEvents` | Updates events |
| `deleteEvents` | Deletes events |
| `addEvent` | Adds a new event |
| `filterEvents` / `unfilterEvents` | Filters/unfilters the event store |
| `selectEvents` | Selects events in the timeline |
| `highlightEvents` / `unhighlightAll` | Highlights/unhighlights events |
| `copyEvents` | Copies events to new resource/date |
| `assignEvents` / `unassignEvents` | Assigns/unassigns events to resources |
| `changeTimeSpan` | Changes the visible time range |
| `scrollToDate` | Scrolls the timeline to a date |
| `showCurrentTimeLine` | Shows/hides the current time indicator |
| `getNextAvailableSlot` | Finds the next open time slot |
| `changeTimeRangeContext` | Changes the data scope for operations (timeline, in-view, or all) |
| `reloadScheduler` | Reloads data (if the Scheduler can be reloaded) |

The Grid tools (`getRecords`, `updateRecords`, etc.) are also available but named according to the `ResourceModel`'s
`$name` property (or `Resource` if not defined).

The base tools (`changeTheme`, `askUser`, `createPlan`, `completePlanSteps`, `undo`, `endVoiceConversation`) are
also available. See the [Grid AI guide](#Grid/guides/advanced/ai-integration.md) for details on planning and base tools.

<div class="note">

Tool names are dynamic and change based on your model class names. For example, if your <code>EventModel</code> is named
<code>Meeting</code>, the tools become <code>getMeetings</code>, <code>updateMeetings</code>, etc.

</div>

## API docs

* [Scheduler AI feature](#Scheduler/feature/AI)
* [AIBase (base class)](#Core/feature/ai/AIBase)
* [AIHelper (tool utilities)](#Core/feature/ai/AIHelper)

## Demo

* [AI Skill Matching](https://bryntum.com/products/schedulerpro/examples/ai-skillmatching/) — SchedulerPro with AI task assignment


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>