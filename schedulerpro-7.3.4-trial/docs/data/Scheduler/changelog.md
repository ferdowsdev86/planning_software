# Bryntum Scheduler version history

## 7.3.4 - 2026-07-22

### DEMOS

* `TinyMceField` now uses forced inline mode in Firefox to prevent errors ([#13291](https://github.com/bryntum/support/issues/13291))

### BUG FIXES

* [#12305](https://github.com/bryntum/support/issues/12305) - `ResourceTimeRanges` not displaying for resources in collapsed groups
* [#13109](https://github.com/bryntum/support/issues/13109) - Scheduler does not start on current date if `startDate` is omitted
* [#13137](https://github.com/bryntum/support/issues/13137) - `highlightEvents()` now flashes every highlighted event, not only the one scrolled into view
* [#13161](https://github.com/bryntum/support/issues/13161) - Max zoom level doesn't work with `smoothZoom`
* [#13266](https://github.com/bryntum/support/issues/13266) - [REACT] Drag in the scheduler causes a blank rendered element with React elements
* [#13328](https://github.com/bryntum/support/issues/13328) - Accordions from the function sections cannot be opened
* [#13340](https://github.com/bryntum/support/issues/13340) - [DOCS] Missing visual guidance docs and rendering snippets in TimeAxis
* [#13349](https://github.com/bryntum/support/issues/13349) - [HIGH PRIO] Sticky Cells behaving unexpectedly in Scheduler's locked row
* [#13363](https://github.com/bryntum/support/issues/13363) - Sometimes text is being rendered under the bar in resource histogram
* [#13379](https://github.com/bryntum/support/issues/13379) - Day of month numbers in the recurrence editor were cropped in some themes and locales
* [#13381](https://github.com/bryntum/support/issues/13381) - `zoomToSpan` should scroll to the dates provided when `zoomLevel` is the same
* [#13426](https://github.com/bryntum/support/issues/13426) - `Store.insert(n, existingRecord)` does not correctly update the data order

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.3.3 - 2026-06-25

### DEMOS

* [REACT-VITE] New `Lazy loading` demo (RTK Query) - resources (vertical) and events (horizontal) loaded on demand. The
  demo is located in `frameworks/react-vite/rtk-query-lazy-load` folder ([#9763](https://github.com/bryntum/support/issues/9763))
* [VUE-3-VITE] New `Lazy loading` demo (TanStack Query) - resources (vertical) and events (horizontal) loaded on demand.
  The demo is located in `frameworks/vue-3-vite/tanstack-query-lazy-load` folder
* [ANGULAR] New `Lazy loading` demo (NgRx) - resources (vertical) and events (horizontal) loaded on demand. The demo is
  located in `frameworks/angular/ngrx-lazy-load` folder

### BUG FIXES

* [#5284](https://github.com/bryntum/support/issues/5284) - [TypeScript] `initials` on `ResourceModelMixin` now typed as accessor (`get initials(): string`)
  allowing subclass override
* [#6481](https://github.com/bryntum/support/issues/6481) - [TypeScript] Added `Promise<CrudManagerLoadResult>` / `Promise<CrudManagerSyncResult>` generic
  parameters to `AbstractCrudManagerMixin.load()` and `sync()` return types
* [#9577](https://github.com/bryntum/support/issues/9577) - [TypeScript] `getCoordinateFromDate` `ignoreRTL` option now in the TypeScript definitions
* [#9598](https://github.com/bryntum/support/issues/9598) - [HIGH PRIO] Overlapping events are not correctly rendered in Vertical Mode
* [#12697](https://github.com/bryntum/support/issues/12697) - Dependency arrow moves incorrectly when dragging an event with `EventBuffer`
* [#12764](https://github.com/bryntum/support/issues/12764) - Milestone dependency lines misaligned when exporting to PDF
* [#12932](https://github.com/bryntum/support/issues/12932) - [HIGH PRIO] Focus event bar should optionally not trigger selection change
* [#13276](https://github.com/bryntum/support/issues/13276) - `zoomToSpan` is not working when range is out of view and `zoomLevel` didn't change
* [#13292](https://github.com/bryntum/support/issues/13292) - Recurring event customization error
* [#13293](https://github.com/bryntum/support/issues/13293) - [REACT] `headerRenderer` content disappears on column resize in vertical mode

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.3.2 - 2026-06-09

### API CHANGES

* [DEPRECATED] The timezone handling is being reworked on top of the Temporal API. In `8.0` the new implementation
  becomes the default and a `useLegacyTimeZoneMode` config will be added to opt back into the current (legacy)
  timezone behavior. The legacy timezone mode will be removed in `9.0`. Full details will follow in the `8.0`
  changelog and What's New
* [DEPRECATED] `Chart` configs `legendScale`, `titlePadding`, `subtitlePadding`, `minTickLabelRotation`,
  `maxTickLabelRotation`, `bubbleScaleFactor`, and `chartTooltip` have been deprecated in preparation for an
  upcoming switch from Chart.js to AG Charts, to occur in version `8.0`

### BUG FIXES

* [#261](https://github.com/bryntum/support/issues/261) - Vertical-mode events with working-time exclusions could be missing or overflow the time-axis start
* [#1616](https://github.com/bryntum/support/issues/1616) - Custom preset header tick boundaries shifted after zoom out and zoom in
* [#12984](https://github.com/bryntum/support/issues/12984) - `rowHeight` property does not affect resource height when using `resourceCollapse` column type
* [#13229](https://github.com/bryntum/support/issues/13229) - Vertical Scheduler drag & drop issues in RTL direction with vertical mode

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.3.1 - 2026-05-28

### FEATURES / ENHANCEMENTS

* Added the `preserveHoursAcrossDST` config on `ViewPreset` which keeps an hour-based view preset symmetric across DST
  transitions

### API CHANGES

* [DEPRECATED] [ANGULAR] Support for Angular 14 and older will be dropped in `8.0.0`. If you plan on upgrading
  to version 8, please make sure to update to Angular 15 or newer before then

### BUG FIXES

* [#4996](https://github.com/bryntum/support/issues/4996) - [TypeScript] Made `projectModelClass` config public in typings
* [#8162](https://github.com/bryntum/support/issues/8162) - [TypeScript] Added missing `context.eventRecord`, `context.resourceRecord`, `context.startDate`, and
  `context.endDate` params to `beforeEventDropFinalize` event
* [#10238](https://github.com/bryntum/support/issues/10238) - [TypeScript] `zoomToLevel` param type was too narrow, now accepts `Number`, `String`, or
  `ViewPresetConfig`
* [#10244](https://github.com/bryntum/support/issues/10244) - Non-async preventable events incorrectly typed with `Promise<boolean>` return
* [#11782](https://github.com/bryntum/support/issues/11782) - Event not graphically duplicated using CTRL + Drag on multigroup
* [#12920](https://github.com/bryntum/support/issues/12920) - [HIGH PRIO] Row resizing with expanded resource collapse column is glitchy
* [#12927](https://github.com/bryntum/support/issues/12927) - The dependency points with `milestoneTextPosition` not `always-outside` are not correctly positioned
* [#13016](https://github.com/bryntum/support/issues/13016) - [TypeScript] Type Errors `allowCrossGridDrag.transferData`, `traverse`, `traverseWhile`, `query`
* [#13210](https://github.com/bryntum/support/issues/13210) - Zooming broken when Gantt partnered with Scheduler Pro

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.3.0 - 2026-05-05

### FEATURES / ENHANCEMENTS

* Added `showMouseIndicatorLine` config to `TimeRanges` feature. When enabled, a 1px line follows the mouse on the
  timeline, displaying the date/time in the header based on the current zoom level. Supports custom `headerRenderer`
  and `showHeaderElements` options ([#12995](https://github.com/bryntum/support/issues/12995))
* `TimelineHistogram` was refactored to render to a single shared SVG canvas to improve UX and performance
* `clickWidth` on the `Dependencies` feature now defaults to 5 for improved click/hover UX ([#12925](https://github.com/bryntum/support/issues/12925))
* `ResourceTimeRanges` now supports a `drawThreshold` config to hide ranges with a width below a pixel threshold, to
  declutter zoomed out views and increase draw performance ([#2988](https://github.com/bryntum/support/issues/2988))
* New AI time range context chip below the message input for switching between `Timeline`, `In view`, and `All` ranges
* New AI agent tools for column visibility: `getColumns`, `showColumn`, `hideColumn`
* New AI agent `askUser` tool presents clickable options when a decision is needed before proceeding
* New AI agent grouping tool groups records by a field (requires the `Group` feature)
* New AI agent `createPlan` and `completePlanSteps` tools break multi-step requests into a tracked plan
* AI confirmation dialogs now render inline within the chat panel instead of as floating modal popups
* AI tool responses now use a structured `AIToolCallResult` format
* The AI chat panel stop button now interrupts read-aloud playback
* New `stopAudioOnHide` config on the AI feature stops recording and audio playback when the chat panel is hidden
* The `autoRecord` config on the AI feature now defaults to `false`
* The AI chat input now supports `@` mentions for referencing records from configured data models
* Added `smoothZoom` config for fluid zooming that interpolates between view presets. Opt-in, but from v8 it will be the
  new default ([#5037](https://github.com/bryntum/support/issues/5037))
* Added two new view presets, to fill gaps in the zoom levels: `amPm` and `fifteenMinutesAndHour`. Also note that some
  presets have had their tick size adjusted for a better zooming experience
* To facilitate easy agentic onboarding, Bryntum structural and theme CSS are now loaded from CDN when not present,
  while also logging a console warning. This can be disabled with `detectCSSCompatibilityIssues: false`. For production
  use, include the CSS in your app

### STYLING CHANGES

* Removed `content: var(--fa)` convenience CSS rule from `.b-icon::before` / `.b-fw-icon::before`. Font Awesome icon
  classes like `fa-book` now require the `fa` base class (e.g., `fa fa-book`) ([#12790](https://github.com/bryntum/support/issues/12790))

### DEMOS

* [ANGULAR] Added theme switching support to all demos ([#12129](https://github.com/bryntum/support/issues/12129))
* [VUE-3-NUXT] "Basic" (NUXT) demo shows using Scheduler in NUXT. The demo is located in
  `frameworks/vue-3-nuxt/basic` folder ([#10220](https://github.com/bryntum/support/issues/10220))
* [VUE-3] Added theme switching support to all demos ([#12905](https://github.com/bryntum/support/issues/12905))
* Added a new `zooming` demo showcasing the new smooth zooming system
* Removed legacy Ionic demos and guides. Ionic remains supported via the existing React, Angular, and Vue demos.

### BUG FIXES

* [#9705](https://github.com/bryntum/support/issues/9705) - Add `start`/`end` date properties to documentation of `eventRenderer`'s `renderData`
* [#12451](https://github.com/bryntum/support/issues/12451) - [TypeScript] `ViewPresetHeaderRow.renderer` return type missing, typed as `void` instead of
  `DomConfig|string|void`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.2.4 - 2026-04-27

### STYLING CHANGES

* Hardcoded `z-index` values now use CSS custom properties for easy overriding ([#13035](https://github.com/bryntum/support/issues/13035))

### BUG FIXES

* [#12559](https://github.com/bryntum/support/issues/12559) - [DOCS] Scroll buttons could navigate to filtered out events when clicking
* [#12866](https://github.com/bryntum/support/issues/12866) - Nested events lazy load demo crash on zoom out
* [#12902](https://github.com/bryntum/support/issues/12902) - Event bar content regression
* [#12956](https://github.com/bryntum/support/issues/12956) - [VUE] Events disappear after show/hide Scheduler
* [#12965](https://github.com/bryntum/support/issues/12965) - [HIGH PRIO] Drag selection misses events when auto-scrolling horizontally and cursor is outside
  scheduler element
* [#13000](https://github.com/bryntum/support/issues/13000) - `scrollEventIntoView` crashes when `TreeGroup` is configured with empty `levels`
* [#13003](https://github.com/bryntum/support/issues/13003) - Changing specific resource column width does not refresh view
* [#13045](https://github.com/bryntum/support/issues/13045) - Vertical mode scheduler refreshes once per record during engine propagation

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.2.3 - 2026-04-09

### BUG FIXES

* [#6408](https://github.com/bryntum/support/issues/6408) - `beforeEventSelectionChange` listener doesn't have the right parameters
* [#12319](https://github.com/bryntum/support/issues/12319) - `onInput` listener on `DateTimeField` was not triggered when typing in the field
* [#12524](https://github.com/bryntum/support/issues/12524) - Time axis header clips first label in vertical mode
* [#12671](https://github.com/bryntum/support/issues/12671) - Recurrence repeat dropdown options not updating when event start date is changed
* [#12780](https://github.com/bryntum/support/issues/12780) - `LockRows` `filterFn` config caused excessive re-rendering
* [#12831](https://github.com/bryntum/support/issues/12831) - [ANGULAR] Crash during event drag & drop when drag reset occurs during async finalize
* [#12842](https://github.com/bryntum/support/issues/12842) - Timeline header rendering breaks after zooming in, scrolling vertically, then zooming out
* [#12843](https://github.com/bryntum/support/issues/12843) - Vertical drag with multiple elements outside of the timeline leaves DOM artifacts
* [#12856](https://github.com/bryntum/support/issues/12856) - Recurring events disappear on zoom in/out
* [#12877](https://github.com/bryntum/support/issues/12877) - Event drag drops on wrong resource in vertical RTL mode with horizontal scroll
* [#12879](https://github.com/bryntum/support/issues/12879) - Switching direction from RTL to LTR breaks header and scroll
* [#12882](https://github.com/bryntum/support/issues/12882) - Inline event editor disappears when Scheduler has horizontal overflow
* [#12915](https://github.com/bryntum/support/issues/12915) - Selected dependency should float above other dependencies
* [#12920](https://github.com/bryntum/support/issues/12920) - Row resizing and resource collapse features conflict

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.2.2 - 2026-03-19

### LOCALE UPDATES

* Added new locale key `duplicateAssignmentDrag` to `EventDrag`

### BUG FIXES

* [#10411](https://github.com/bryntum/support/issues/10411) - Time span is not respected after setting timespan and zoom
* [#11093](https://github.com/bryntum/support/issues/11093) - [HIGH PRIO] Expanding a splitter with maxWidth messes up timeAxis header position
* [#12132](https://github.com/bryntum/support/issues/12132) - Scheduler's paste event doesn't provided the pasted resource when pasting multiple events
* [#12301](https://github.com/bryntum/support/issues/12301) - Range picker not usable in demo
* [#12404](https://github.com/bryntum/support/issues/12404) - [HIGH PRIO] `TimeAxis` header render bug after switching view presets
* [#12439](https://github.com/bryntum/support/issues/12439) - [HIGH PRIO] Multi Event drag issue such that one falls on the resource which already contains that
* [#12461](https://github.com/bryntum/support/issues/12461) - [HIGH PRIO] Toggling tree nodes with the timeline subgrid collapsed no longer causes errors
* [#12473](https://github.com/bryntum/support/issues/12473) - `ResourceStore` `group` event stops firing when `LockRows` feature used
* [#12648](https://github.com/bryntum/support/issues/12648) - `recurrenceRule` should not contain `TZID` parameter per RFC 5545
* [#12655](https://github.com/bryntum/support/issues/12655) - [HIGH PRIO] `TimeAxis` header disappears while zooming out with `zoomKeepsOriginalTimespan`
* [#12666](https://github.com/bryntum/support/issues/12666) - Resource highlight after scrolling not working
* [#12685](https://github.com/bryntum/support/issues/12685) - [HIGH PRIO] Recurring `ResourceTimeRanges` disappear when using `infiniteScroll`
* [#12713](https://github.com/bryntum/support/issues/12713) - New data series config option `barWidth` now allows controlling the size of bars in bar charts
* [#12724](https://github.com/bryntum/support/issues/12724) - Event tooltip showed immediately on SHIFT+click despite configured hoverDelay
* [#12735](https://github.com/bryntum/support/issues/12735) - `scrollResourceEventIntoView` ignored explicit `block` option
* [#12751](https://github.com/bryntum/support/issues/12751) - [HIGH PRIO] Issue with Large Resource Time Range Data Set
* [#12765](https://github.com/bryntum/support/issues/12765) - Drop event assigns incorrect resource in Vertical mode with RTL enabled
* [#12766](https://github.com/bryntum/support/issues/12766) - Event resize handle positioned incorrectly in vertical mode with RTL
* [#12768](https://github.com/bryntum/support/issues/12768) - `EventDrag` wrote wrong resource ID to DOM in `TreeGroup` mode causing crash during drag
* [#12772](https://github.com/bryntum/support/issues/12772) - `scheduleMenuBeforeShow` event returns incorrect resource in vertical mode with RTL
* [#12783](https://github.com/bryntum/support/issues/12783) - Dynamic `cls` prop not being set correctly when using `LockRows`
* [#12792](https://github.com/bryntum/support/issues/12792) - Event background color while dragging is not consistent with `LockRows` enabled/disabled
* [#12798](https://github.com/bryntum/support/issues/12798) - HSL color definitions missing `%` on saturation broke colors on older Safari/iOS
* [#12807](https://github.com/bryntum/support/issues/12807) - Crash when cutting a task in gantt-schedulerpro demo

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.2.1 - 2026-02-26

### FEATURES / ENHANCEMENTS

* Horizontal scrolling combined with lazy loading of events has been optimized to not relayout the events unless
  necessary (when new events arrive), improving performance when scrolling through large datasets ([#12683](https://github.com/bryntum/support/issues/12683))

### BUG FIXES

* [#12689](https://github.com/bryntum/support/issues/12689) - Display bug with the striped effect and infinite scroll
* [#12696](https://github.com/bryntum/support/issues/12696) - [DOCS] Renderer docs does not mention JSX
* [#12704](https://github.com/bryntum/support/issues/12704) - RecurrenceEditorPanel month date buttons not updated after first edit

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.2.0 - 2026-02-24

### FEATURES / ENHANCEMENTS

* We've added a new AI feature which provides an AI agent for the Scheduler. By using the provided chat panel, the user
  can ask the agent to interact with the Scheduler in different ways. For example, the user can ask the agent to filter
  the data, sort it, or select specific records. The agent can also perform data manipulation operations such as adding,
  updating, deleting records. The feature and all its related components are marked as **experimental** and are subject
  to change
* The `partner` config now accepts string selectors (widget type, `#id`, or `[attr=value]`) in addition to
  widget instances ([#1979](https://github.com/bryntum/support/issues/1979))
* Added `allowedDependencyTypes` config to `DependencyStore` to restrict which dependency types can be created
  ([#548](https://github.com/bryntum/support/issues/548))
* Any column type can now be used as a tree column by adding `tree: true` to the column config. For example,
  `{ type: 'resourceInfo', tree: true }` creates a `ResourceInfoColumn` with tree functionality. This uses a new
  mixin-based system that provides flexibility without needing separate tree-specific column classes ([#3602](https://github.com/bryntum/support/issues/3602))
* New `ResourceColumnReorder` feature for reordering resource columns in vertical mode by drag and drop. Supports
  grouped `resourceStore` with automatic group field updates when moving between groups ([#12228](https://github.com/bryntum/support/issues/12228))

### DEMOS

* Added a new Kitchen Sink demo showcasing all the various widgets included in the Bryntum Scheduler package. The demo
  is located in the `examples/kitchen-sink` folder ([#3961](https://github.com/bryntum/support/issues/3961))

### BUG FIXES

* [#12668](https://github.com/bryntum/support/issues/12668) - Moving columns in vertical mode did not trigger auto-scroll

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.1.3 - 2026-02-18

### BUG FIXES

* [#7209](https://github.com/bryntum/support/issues/7209) - Docked panel overlay not working in RTL mode
* [#11893](https://github.com/bryntum/support/issues/11893) - When increasing the time range the scheduler does not render the headers correctly
* [#11945](https://github.com/bryntum/support/issues/11945) - [HIGH PRIO] [VUE 3] Disappearing events when lock rows feature is enabled
* [#12448](https://github.com/bryntum/support/issues/12448) - Error when dragging events between schedulers if `timeAxis` is filtered
* [#12495](https://github.com/bryntum/support/issues/12495) - `Pan` feature cursor missing
* [#12582](https://github.com/bryntum/support/issues/12582) - `ResourceTimeRanges` mouse events cause console error in vertical mode
* [#12590](https://github.com/bryntum/support/issues/12590) - `ResourceTimeRange` elements not removed from DOM in vertical mode
* [#12623](https://github.com/bryntum/support/issues/12623) - [BUG] Print feature for multi assignments in Scheduler
* [#12657](https://github.com/bryntum/support/issues/12657) - Setting `eventRenderer` at runtime does not trigger a view refresh

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.1.2 - 2026-02-09

### BUG FIXES

* [#872](https://github.com/bryntum/support/issues/872) - `dependencyValidationStart` and `dependencyValidationComplete` events now include `fromSide` and `toSide`
  as top-level parameters
* [#3183](https://github.com/bryntum/support/issues/3183) - Style in event renderer cannot be configured with object in vertical mode
* [#10544](https://github.com/bryntum/support/issues/10544) - Crash when zooming rapidly in TimelineHistogram with async data
* [#11093](https://github.com/bryntum/support/issues/11093) - Expanding a splitter with maxWidth messes up timeAxis header position
* [#11556](https://github.com/bryntum/support/issues/11556) - `EventStore` changes incorrectly rejected when canceling `SimpleEventEdit` after
  `onBeforeStart` prevented edit
* [#11725](https://github.com/bryntum/support/issues/11725) - [ANGULAR] Switching direction from RTL to LTR breaks header and scroll
* [#11728](https://github.com/bryntum/support/issues/11728) - [TypeScript] Promote `minDate`/`maxDate` configs to properties
* [#11824](https://github.com/bryntum/support/issues/11824) - Dependency Edit menu automatically closes immediately after opening
* [#11837](https://github.com/bryntum/support/issues/11837) - Scheduler crash with tree-grouping and scroll buttons feature
* [#11865](https://github.com/bryntum/support/issues/11865) - Filtering `resourceStore` incorrectly triggers `noChanges` event when other stores have changes
* [#11911](https://github.com/bryntum/support/issues/11911) - [NPM] Incorrect source maps in npm packages (`@bryntum/scheduler`, `@bryntum/scheduler-trial`)
* [#11926](https://github.com/bryntum/support/issues/11926) - Current timeline should not be draggable when `enableResizing` is enabled
* [#11940](https://github.com/bryntum/support/issues/11940) - TimeSelection not working correctly with LockRows feature
* [#12150](https://github.com/bryntum/support/issues/12150) - Dependencies updates are not cleared from the project.changes after sync
* [#12507](https://github.com/bryntum/support/issues/12507) - Scheduler crashes after combining `eventDrag` `cloneTarget` config and `snap` feature
* [#12538](https://github.com/bryntum/support/issues/12538) - Milestone has unwanted background color
* [#12543](https://github.com/bryntum/support/issues/12543) - `emptyText` shown in wrong subGrid for Scheduler in vertical mode
* [#12545](https://github.com/bryntum/support/issues/12545) - [HIGH PRIO] [REACT] Events with JSX elements disappear in tree on second render
* [#12550](https://github.com/bryntum/support/issues/12550) - "element.focus is not a function" error when scrolling to unrendered event with focus: true
* [#12557](https://github.com/bryntum/support/issues/12557) - [HIGH PRIO] `getResourceHeight()` subtracts row border when using striping (no border)
* [#12559](https://github.com/bryntum/support/issues/12559) - [DOCS] Scroll buttons are visible when event store is filtered to empty
* [#12579](https://github.com/bryntum/support/issues/12579) - `getEventsForResource` throws runtime error when EventStore is empty

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.1.1 - 2026-01-22

### FEATURES / ENHANCEMENTS

* Made `TimeRanges.dragTipTemplate` config public and added comprehensive documentation with usage examples for
  customizing the drag tooltip display ([#12416](https://github.com/bryntum/support/issues/12416))

### BUG FIXES

* [#6466](https://github.com/bryntum/support/issues/6466) - [TypeScript] `responsiveLevels` type now allows configuration objects with scheduler properties
* [#7921](https://github.com/bryntum/support/issues/7921) - Selection change events missing `source` property in TypeScript types
* [#8127](https://github.com/bryntum/support/issues/8127) - [DOCS] [TypeScript] Added missing properties to various typedefs (`SchedulerMenuContext.date`,
  `EventResize.tooltipTemplate.valid`)
* [#12363](https://github.com/bryntum/support/issues/12363) - Copy paste of events makes duration grow
* [#12403](https://github.com/bryntum/support/issues/12403) - [HIGH PRIO] Scheduler crashes with `scheduleContext` feature enabled in vertical mode
* [#12418](https://github.com/bryntum/support/issues/12418) - Strange look with few resources not filling vertical scheduler
* [#12426](https://github.com/bryntum/support/issues/12426) - `ScrollButtons` feature cannot be disabled
* [#12427](https://github.com/bryntum/support/issues/12427) - Scheduler print feature breaks when printing multiple pages
* [#12428](https://github.com/bryntum/support/issues/12428) - `ResourceCombo`'s resource color icon not the correct color
* [#12429](https://github.com/bryntum/support/issues/12429) - Shortcut copy/paste events on resource time ranges with mouse events not working
* [#12496](https://github.com/bryntum/support/issues/12496) - When the initial value of a remotely loaded `Combo` is resolved, the field should not fire
  a change event
* [#12517](https://github.com/bryntum/support/issues/12517) - Setting `maxDate` before `minDate` could result in `maxDate` being unexpectedly nullified

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.1.0 - 2025-12-19

### FEATURES / ENHANCEMENTS

* Clicking the dependency line delete icon now fires a preventable `beforeDependencyDelete` event ([#12413](https://github.com/bryntum/support/issues/12413))

### STYLING CHANGES

* Added a new `fluent2` theme, available in both a light and dark variant ([#10338](https://github.com/bryntum/support/issues/10338))

### BUG FIXES

* [#9004](https://github.com/bryntum/support/issues/9004) - [HIGH PRIO] Collapsed group header state is not restored
* [#10465](https://github.com/bryntum/support/issues/10465) - Crash when using `custom` locale without explicit `startDate` and `endDate`
* [#12388](https://github.com/bryntum/support/issues/12388) - `ChatButton`'s panel is misaligned

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.0.2 - 2025-12-16

### API CHANGES

* Added new config `continueEditingOnEventClick` to the `EventEdit` feature. When enabled, clicking another event while
  the editor is open will immediately continue editing the second event instead of first closing and then reopening it.
  (See `examples/docked-editor` example)

### DEMOS

* [REACT-VITE] New `Print` React demo added showing the use of `Print` feature with JSX component. The demo is located
  in `frameworks/react-vite/print` folder

### BUG FIXES

* [#10595](https://github.com/bryntum/support/issues/10595) - [REACT] JSX rendered recurrent events content disappear on scroll
* [#12135](https://github.com/bryntum/support/issues/12135) - [REACT] Print not using JSX renderer
* [#12170](https://github.com/bryntum/support/issues/12170) - Fixed blocked time cell hover styling in Scheduler validation example
* [#12195](https://github.com/bryntum/support/issues/12195) - [HIGH PRIO] Event resize in vertical mode is wrong while there is a global scroll on page
* [#12207](https://github.com/bryntum/support/issues/12207) - [HIGH PRIO] `zoomTo` with the same date range shows different `viewPreset` depending on
  initial zoom before change
* [#12351](https://github.com/bryntum/support/issues/12351) - Inconsistent dependency type labels between `DependencyType` and `DependencyEdit`
* [#12366](https://github.com/bryntum/support/issues/12366) - [HIGH PRIO] Event jumps one day forward when dragging with `fillTicks` and `snap` enabled
* [#12370](https://github.com/bryntum/support/issues/12370) - Hide `toPasteValue` config from `TaskCopyPaste` and `EventCopyPaste`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.0.1 - 2025-12-05

### BUG FIXES

* [#11899](https://github.com/bryntum/support/issues/11899) - Deleting dependency with edit dialog doesn't remove `[x]` button from UI
* [#11962](https://github.com/bryntum/support/issues/11962) - Grouping divider behaves strangely in vertical mode
* [#12257](https://github.com/bryntum/support/issues/12257) - The column headers are not rendered as intended
* [#12297](https://github.com/bryntum/support/issues/12297) - Fixed Event won't be assigned if pass resource on creation
* [#12312](https://github.com/bryntum/support/issues/12312) - Promise chain breaks in `scrollEventIntoView` when scrolling to an event on a non-visible day

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 7.0.0 - 2025-11-25

* We are proud to announce version `7.0` of our products. In this update we have overhauled the look and feel of all
  products, introducing a new CSS variable based theming system with the following new themes available:
    * Svalbard - our new default theme, flat and modern
    * Visby - inspired by the town's old ring wall, uses more borders
    * Material3 - newer material, up from v1
    * Stockholm - a refreshed classic
    * High contrast - more contrast between text and backgrounds
* A special thanks to everyone who helped us by testing our alpha and beta versions. Your feedback and support have been
  invaluable

### FEATURES / ENHANCEMENTS

* All Bryntum products have had a major visual overhaul, modernizing not only their look but also the underlying CSS.
  See the "Styling changes" section below for more details, and be sure to check out our updated demos
* Updated versioning scheme: for Alpha and Beta pre-releases now follow semantic versioning format (e.g.,
  `7.0.0-alpha.1`, `7.0.0-beta.1`)
* Added support for selecting and deselecting a single dependency using the new `selectDependency` and
  `deselectDependency` methods available on the Dependencies feature. ([#11996](https://github.com/bryntum/support/issues/11996))
* TimeRange record instances are now updated live while being dragged (try it out in the Scheduler or Gantt `timeranges`
  demo).
* [TypeScript] Improved TypeScript definitions to support function parameters in typedef declarations

### API CHANGES

* [BREAKING] `DatePicker`'s `cellRenderer` is now passed the cell element as the `cell` property of its render context.
  The inner element into which new content can be added is passed as `innerCell`. Previously the inner element was
  passed in the `cell` property. This will only affect your apps if you have implemented a `cellRenderer` in any
  `DatePicker`
* Added a new parameter `clearChanges` to the store's `applyChangeset` method which, when passed as `false`, applies
  changes to the store without committing them, keeping the store dirty. By default, it is `true`. ([#11089](https://github.com/bryntum/support/issues/11089))
* The `DependencyMenu` feature is now enabled by default
* In a Scheduler configured with `snap: true`, dragged events now also snaps to resources by default
* [DEPRECATED] The `enabledEventAnimations` config has been deprecated in favor of the new `transition.changeEvent`
  config
* [BREAKING] The default value for Scheduler's `resourceImageExtension` config has been changed from `.jpg` to `.png`
* [BREAKING] The following previously deprecated API's have been removed:
    * `Scheduler.stepUnit`
    * `Scheduler.createEventOnDblClick`
    * `RecurrenceDaysButtonGroup`
    * `EventColorPicker.record`

### STYLING CHANGES

* A selected dependency line now gets the `b-selected` class added, previously `b-sch-dependency-selected`.
* [BREAKING] The styling of all Bryntum products has been migrated from SASS to nested CSS with custom properties (CSS
  variables). This change makes it much easier to create custom themes, and to change styling settings at runtime. But
  the change is not backwards compatible, any custom themes will have to be remade using the new system. The built-in
  themes and how they are applied to an app have also changed, we now ship 4 themes: Material3, Stockholm, Svalbard &
  Visby + a high contrast theme. Each theme has a light and dark variant. Check out the what's new guide and the updated
  styling guides for more information
* [BREAKING] Bryntum CSS selectors have been normalized to use consistent hyphenated names (kebab-casing). For example,
  the `TabPanel` class used to have the `b-tabpanel` class, but is now `b-tab-panel`. This change is not backwards
  compatible, so any custom CSS will have to be updated
* [BREAKING] FontAwesome Free is no longer built into the Bryntum CSS, you will have to include it in your app for the
  default icons to show up as intended. This also means that the `b-fa-` prefix no longer exists, any icons in your app
  relying on that has to be changed to FontAwesome's default `fa-` prefix. This change was done to reduce bloat for
  anyone using another icon set, and also makes it easier for apps to use a different version of FontAwesome
* The `.b-sch-event-selected` CSS class applied to the selected event bar has been shortened to `.b-selected`. The
  class is now applied to the `b-sch-event-wrap` element, not the `b-sch-event` element. This change is to make it
  easier to style other event parts on selection (for example, labels)`
* [DEPRECATED] The built-in event styles has been overhauled, and the following styles are now available: `filled`
  (similar to old `plain`), `tonal`, `traced`, `bordered` (similar to old `border`), `outlined` (similar to old
  `hollow`), `intended` (similar to old `colored`), `rounded`, `line`, `dashed` & `minimal`. The old styles have been
  deprecated and will be removed in a future release
* [BREAKING] Colors have been normalized, Scheduler now uses same set of predefined colors as core widgets like Buttons.
  Event colors are now applied using `b-color-red` instead of `b-sch-color-red` for example
* When highlighting events (using `scheduler.highlightEvents()`), the `b-highlighted` class is now applied to the event
  wrapper element instead of the event bar element. This change allows for it to also affect labels, travel time, etc.
* [BREAKING] The default event style has been changed to `'tonal'`. If your app overrides the colors of the default
  event style, you might need to tweak that CSS and/or change the event style

### DEMOS

* [REACT-VITE] "Using React components in tooltips" demo has been upgraded to use React + Vite with TypeScript. Demo is
  located in `frameworks/react-vite/react-tooltips` folder

### BUG FIXES

* [#12109](https://github.com/bryntum/support/issues/12109) - `DateRangeField` dropdown misplaced
* [#12139](https://github.com/bryntum/support/issues/12139) - Drag drop tooltip keeps changing size after width changes
* [#12188](https://github.com/bryntum/support/issues/12188) - Tick lines missing in vertical mode
* [#12196](https://github.com/bryntum/support/issues/12196) - `EventDrag` not working when using `singleDirection` config
* [#12197](https://github.com/bryntum/support/issues/12197) - Tooltip opens/closes infinitely when hovering event bar edge where tooltip anchor is positioned
* [#12198](https://github.com/bryntum/support/issues/12198) - Group rows in scheduler sub grid get a hover effect when using `Stripe` feature
* [#12210](https://github.com/bryntum/support/issues/12210) - Not possible to set `timeResolution` in a Scheduler subclass
* [#12243](https://github.com/bryntum/support/issues/12243) - Rows disappear when quickly collapsing and expanding a grouped section of rows

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Remix: `>= 2.15.0`

## 6.3.4 - 2025-11-20

### FEATURES / ENHANCEMENTS

* [VUE-3] Vue 3 npm wrapper package now includes `types` declaration in `package.json`

### BUG FIXES

* [#10969](https://github.com/bryntum/support/issues/10969) - Error when setting visible date and max date in the past
* [#11419](https://github.com/bryntum/support/issues/11419) - `TimeZoneHelper` ignores milliseconds
* [#11968](https://github.com/bryntum/support/issues/11968) - [HIGH PRIO] Max date is not updated
* [#12011](https://github.com/bryntum/support/issues/12011) - [DOCS] Docs for `ResourceTimeRanges` needs to add `exceptionDates`
* [#12134](https://github.com/bryntum/support/issues/12134) - Conflicting mouse events when using resource non working time and resource time ranges simultaneously

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.3.3 - 2025-10-06

### FEATURES / ENHANCEMENTS

* Setting `createOnUnmatched` to `true` on a `Combo` will now create a record for the initial value, or a value
  programmatically set later, if the value does not exist in the store for the combo ([#11781](https://github.com/bryntum/support/issues/11781))

### DEMOS

* Our new [Salesforce Community page](https://bryntum-dev-ed.develop.my.site.com/demo/scheduler) is up and running. It
  solves the problem caused by recent change in Salesforce policy regarding Non-Revenue Orgs. Look up "Device Activation
  Is Always Required for Non-Revenue Orgs"

### BUG FIXES

* [#11716](https://github.com/bryntum/support/issues/11716) - `GroupSummary`'s renderer called multiple times

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.3.2 - 2025-09-15

### FEATURES / ENHANCEMENTS

* A new experimental `minPackSize` config has been added to the Scheduler, which limits how small events can become when
  using `pack` layout. If events are packed to become smaller than the limit, the row will grow in height instead
  ([#11906](https://github.com/bryntum/support/issues/11906))

### DEMOS

* Added new ExtJS Classic demo showing how to integrate the Scheduler in an ExtJS Classic app. Demo is located in
  `examples/extjsclassic` folder ([#6440](https://github.com/bryntum/support/issues/6440))

### BUG FIXES

* [#4192](https://github.com/bryntum/support/issues/4192) - `isValidDependencyToCreate` is documented as an injectable validation function but is never called
* [#9269](https://github.com/bryntum/support/issues/9269) - [RTL] Printing with visible schedule range vanishes the events when infinite scroll enabled
* [#11733](https://github.com/bryntum/support/issues/11733) - Lazy loading events not working correctly when `useResourceIds` is `true`
* [#11818](https://github.com/bryntum/support/issues/11818) - Lazy loaded Scheduler does not respect `readOnly: true`
* [#11871](https://github.com/bryntum/support/issues/11871) - Race condition with scroll buttons rendering when using lazy loaded store

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.3.1 - 2025-08-07

### DEMOS

* [ANGULAR] Added new Angular `eventeditor-combos` demo showing use of event editor with cascading combos. Demo is
  located in `examples/frameworks/angular/eventeditor-combos` folder

### BUG FIXES

* [#9822](https://github.com/bryntum/support/issues/9822) - [HIGH PRIO] Replacing `eventTooltip template` to return `JSX` at runtime not working
* [#11592](https://github.com/bryntum/support/issues/11592) - [HIGH PRIO] `RTL` mode breaks drag drop events when `TimeAxis filter` is applied

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.3.0 - 2025-07-21

### FEATURES / ENHANCEMENTS

* It is now possible to exclude records from timezone conversion. Set the `timeZone` field to `false` on each record
  that should not be affected by the timeZone config ([#11610](https://github.com/bryntum/support/issues/11610))
* PdfExport feature now supports exporting large datasets by streaming data to the export server using WebSocket
  connection ([#3953](https://github.com/bryntum/support/issues/3953))
* Added `Charts` feature, which leverages the new `Chart` and `ChartDesigner` widgets to enable developers and end users
  to easily create charts and visualize data directly from selected cells in a Grid ([#8442](https://github.com/bryntum/support/issues/8442))
* New Single Page Unscaled exporter is added. It allows exporting content to a single page without limiting to a
  specific paper size. PDF export server upgrade to version `2.1.0` is required ([#11397](https://github.com/bryntum/support/issues/11397))
* Bryntum now ships a `Chart` module (`chart.module.thin.js`), to easier integrate `Chart.js`-based charts with our
  products. Used in the new `charts` demo
* Bryntum npm repository provides charts thin package `@bryntum/chart-thin` and wrapper packages for major frameworks:
  Angular (`@bryntum/chart-angular-thin`), React (`@bryntum/chart-react-thin`) and Vue 3 (`@bryntum/chart-vue-3-thin`)
* Bryntum now ships a `Chart` module (`chart.module.thin.js`), to easier integrate `Chart.js`-based charts with our
  products. Used in the new `calendar-chart` demo
* To pave the way for future improvements, Grid cells are now absolutely positioned inside the rows. A cell size is
  matched with the size of its column's header using a `ResizeObserver`. If you see any side effect of this change in
  your app, please report it to us
* The `ScheduleContext` feature now triggers a `beforeContextShow` event when showing the widget/element in the hovered
  tick, allowing apps to mutate shown element/widget ([#11646](https://github.com/bryntum/support/issues/11646))

### API CHANGES

* [DEPRECATED] The `eventsData`, `resourcesData`, `assignmentsData`, `dependenciesData`, `timeRangesData` and
  `resourceTimeRangesData` configs and properties on the `ProjectModel` have been deprecated. Use `events`, `resources`,
  `assignments`, `dependencies`, `timeRanges` and `resourceTimeRanges` instead ([#9778](https://github.com/bryntum/support/issues/9778))

### LOCALE UPDATES

* The following locale keys added `SinglePageExporterVertical.verticalsinglepage`,
  `SinglePageUnscaledExporterVertical.verticalsinglepageunscaled` and
  `MultiPageVerticalExporterVertical.verticalmultipagevertical`

### DEMOS

* New `eventeditor-tinymce` demo, showcasing how to use TinyMCE editor in the event editor
* New `charts` demo, showcasing how to use the new `Charts` feature
* New `sparklines` demo, showcasing how to use the new `SparklineColumn`
* New `scheduler-chart` demo, showcasing how to combine the new `Chart` module with the `Scheduler`

### BUG FIXES

* [#11180](https://github.com/bryntum/support/issues/11180) - Data and `scroll` position jumps when change `resourceTimeRanges` or reassign event
* [#11457](https://github.com/bryntum/support/issues/11457) - Add an option to export task store range
* [#11608](https://github.com/bryntum/support/issues/11608) - Error when dragging event outside the view with `snapRelativeToEventStartDate` is `true`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.2.5 - 2025-07-09

### FEATURES / ENHANCEMENTS

* The `multiEventSelect` setting now accepts an object, letting the app decide which modifier keys to use for
  multi-event selection (by default it is `[Сtrl]` on Windows and `[Cmd]` on Mac)

### DEMOS

* The `infinite-scroll-tree` demo, which demonstrates the lazy loading support of a tree Scheduler, has been ported to
  Angular. It is located in the `examples/frameworks/angular/infinite-scroll-tree` folder
* The `infinite-scroll-tree` demo, which demonstrates the lazy loading support of a tree Scheduler, has been ported to
  Vue. It is located in the `examples/frameworks/vue-3-vite/infinite-scroll-tree` folder
* The `infinite-scroll-tree` demo, which demonstrates the lazy loading support of a tree Scheduler, has been ported to
  React. It is located in the `examples/frameworks/react-vite/infinite-scroll-tree` folder

### BUG FIXES

* [#10870](https://github.com/bryntum/support/issues/10870) - Thin dependency markers are not thin
* [#11462](https://github.com/bryntum/support/issues/11462) - [HIGH PRIO] `ScheduleContext` and `ScheduleMenu` features not compatible
* [#11562](https://github.com/bryntum/support/issues/11562) - Exception thrown with `timeRanges` and `fillTicks`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.2.4 - 2025-06-18

### FEATURES / ENHANCEMENTS

* `showDirty` can be configured now to show red tag for all the cells for the new records. Set `newRecord : true`
  on `showDirty` to enable it ([#10344](https://github.com/bryntum/support/issues/10344))
* The loading indicator displayed when the `EventStore` is loading can now be configured away by setting
  `lazyLoadingIndicator` to `false` on the Scheduler config ([#9989](https://github.com/bryntum/support/issues/9989))
* When lazy loading, the `EventStore` and AssignmentStore now support using `resourceIds` as params instead of a
  resource `startIndex` and a `count`. Configure `useResourceIds` on the store's `lazyLoad` config object to activate
  ([#9297](https://github.com/bryntum/support/issues/9297))
* A `CrudManager` configured with `lazyLoad` now supports implementing a `requestData` function, instead of using the
  built-in fetch mechanisms ([#11342](https://github.com/bryntum/support/issues/11342))
* Added a `drawOnEventInteraction` config to the `Dependencies` feature, which allows opting out of drawing
  dependencies on event interactions (dragging, resizing, animating). Useful in apps that display a lot of dependencies
  on the screen at the same time to make those interactions smoother ([#11448](https://github.com/bryntum/support/issues/11448))

### DEMOS

* [REACT-VITE] Added new React `eventeditor-combos` demo showing use of event editor with cascading combos. Demo is
  located in `examples/frameworks/react-vite/eventeditor-combos` folder ([#11124](https://github.com/bryntum/support/issues/11124))
* New `infinite-scroll-tree` demo, which demonstrates the lazy loading support of a tree Scheduler. The new demo is
  located in the `examples/infinite-scroll-tree` folder
* [REACT-VITE] "React JSX component as event renderer" demo has been upgraded to use React + Vite framework with
  TypeScript. The new demo is located in `frameworks/react-vite/react-events` folder

### BUG FIXES

* [#9689](https://github.com/bryntum/support/issues/9689) - [HIGH PRIO] Filtering timeAxis with Infinite scroll enabled and zoom in/out results in the error
* [#11464](https://github.com/bryntum/support/issues/11464) - Scheduler Pro Events has some dead zones on right-clicked to activate a context menu
* [#11468](https://github.com/bryntum/support/issues/11468) - Drag/drop event crashes when a multi-group resource with a group collapsed
* [#11475](https://github.com/bryntum/support/issues/11475) - `Highlight` callback function not called in `scrollEventIntoView` and `scrollResourceEventIntoView`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.2.3 - 2025-05-27

### FEATURES / ENHANCEMENTS

* The `PDF Export` and `Print` feature has a new paper format `A0` ([#11083](https://github.com/bryntum/support/issues/11083))

### STYLING CHANGES

* Major tick lines in the Material theme was adjusted to use same color rule as the other themes, making them less
  prominent (the override of the `$columnlines-major-color` scss variable was removed)

### DEMOS

* [VUE 3 + VITE] "Custom event editor" Vue 2 demo has been upgraded to use Vue 3 + Vite framework with TypeScript. New
  demo is located in `frameworks/vue-3-vite/custom-event-editor` folder

### BUG FIXES

* [#10093](https://github.com/bryntum/support/issues/10093) - Lazy loading breaks `CrudManager` load method contract
* [#10957](https://github.com/bryntum/support/issues/10957) - `Summary`'s renderer called 3 times on an initial load
* [#11081](https://github.com/bryntum/support/issues/11081) - `scrollEventIntoView` does not scroll to the center of the event
* [#11313](https://github.com/bryntum/support/issues/11313) - [HIGH PRIO] SharePoint demos across Bryntum Suite are broken
* [#11328](https://github.com/bryntum/support/issues/11328) - [HIGH PRIO] Infinite Scroll Causes Endless Scrolling and Error When Using `scrollEventIntoView`
* [#11336](https://github.com/bryntum/support/issues/11336) - Icon overlaps with text in material theme
* [#11358](https://github.com/bryntum/support/issues/11358) - `TimeSelection` displayed incorrectly when selection is in future outside the configured time span
* [#11359](https://github.com/bryntum/support/issues/11359) - Selected item ignored when `selectAllItem` is `true`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.2.2 - 2025-05-13

### FEATURES / ENHANCEMENTS

* TreeSummary cells now support event listeners including `tickCellMouseDown`, `tickCellMouseUp`, `tickCellClick`,
 `tickCellDblClick`, and `tickCellContextMenu` ([#11187](https://github.com/bryntum/support/issues/11187))
* When reloading a lazy-loaded `Store` (including remote filtering and sorting) the current dataset will be kept
  until the load request finishes. Previously, it was cleared upon starting the reload and populated with new data
  later. If an `AjaxStore` is being used (a `Store` configured with a `readUrl`) a load mask will be displayed during
  the reload operation ([#11261](https://github.com/bryntum/support/issues/11261))

### BUG FIXES

* [#10462](https://github.com/bryntum/support/issues/10462) - [REACT] Tooltip with `JSX` component does not render on first call
* [#11138](https://github.com/bryntum/support/issues/11138) - [HIGH PRIO] Events show up only after scroll/refresh/resize
* [#11235](https://github.com/bryntum/support/issues/11235) - [REACT] Async cell renderer can throw if the row being rendered is destroyed during the await
* [#11236](https://github.com/bryntum/support/issues/11236) - [HIGH PRIO] [React] Events flicker on event store filter
* [#11237](https://github.com/bryntum/support/issues/11237) - [HIGH PRIO] Minutes limit doesn't update in `endDate` when change `startDate` if it was filtered
* [#11242](https://github.com/bryntum/support/issues/11242) - Tooltips misplaced and hidden instantly for nested events
* [#11260](https://github.com/bryntum/support/issues/11260) - Performance issue with large dataset
* [#11286](https://github.com/bryntum/support/issues/11286) - [HIGH PRIO] Using `resourceId` approach to manage assignment shouldn't leave uncommitted changes in
  assignment store
* [#11302](https://github.com/bryntum/support/issues/11302) - [ANGULAR] SchedulerPro, Lazy Load, Resource Tree Store observes infinite load calls when creating new
  phantom record
* [#11303](https://github.com/bryntum/support/issues/11303) - Delete key on selected `readOnly` task deletes the task

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.2.1 - 2025-04-23

### BUG FIXES

* [#10991](https://github.com/bryntum/support/issues/10991) - Scheduler `Timeline` shows 53 weeks for 2025 if week start day is Monday
* [#11075](https://github.com/bryntum/support/issues/11075) - [DOCS] Incorrect type for `DependencyModel.LagUnit` when retrieving changes
* [#11076](https://github.com/bryntum/support/issues/11076) - `TreeSummary` feature doesn't work with `TreeGroup` feature

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.2.0 - 2025-04-10

### FEATURES / ENHANCEMENTS

* Event highlighting has been added to the Scheduler API. You can programmatically highlight any available event or
  events in the timeline by calling `highlightEvents` ([#9873](https://github.com/bryntum/support/issues/9873))
* Readonly events now consistently display a non-editable information modal, that can be invoked by double-click or
  context menu. The associated menu item `Edit` is no longer disabled, but replaced by `Show details` when the event
  item cannot be edited
* We've improved search in the documentation with new context-aware algorithms, delivering more accurate and relevant
  results from the API, guides & examples
* To make the event editor a docked panel sliding in from the end of the viewport, configure the `EventEdit` feature
  with `{ editorConfig : { drawer : true } }`
* A new config for `Panel`, `drawer` marks a Panel as a docked, slide-in panel, which by default slides in over the
  contents of the browser viewport
* New `TreeSummary` feature added, which allows you to roll up and display values in the time axis cell for each parent
  row in a tree scheduler. Check it out in the new `tree-summary` and `tree-summary-custom` demos ([#8044](https://github.com/bryntum/support/issues/8044))
* [ACCESSIBILITY] Higher contrast for event bar text color in `rounded` event style
* You can now delete dependencies quickly by clicking the line to reveal a delete icon. This is a more intuitive way to
  delete dependencies than the previous method of right-clicking the line and selecting `Delete`. You can toggle this
  new behavior with the `enableDelete` config option ([#10786](https://github.com/bryntum/support/issues/10786))
* [BREAKING] Since most apps have a build process that includes a transpilation step, starting with `v6.2.0` we use the
  minimum possible transpile polyfills for the source code inside the `@bryntum/scheduler-thin` npm package to ensure
  that it works for all currently supported frameworks. Previously, each source file was transpiled with more polyfills,
  which introduced unnecessary overhead from transpilation helper functions. After this change, the size of your built
  app should be reduced. If you encounter issues with your framework's builder parsing the code, consider upgrading to a
  newer framework version that supports the latest ECMAScript specification ([#10797](https://github.com/bryntum/support/issues/10797))

### API CHANGES

* [DEPRECATED] Previously, the `EventColorPicker` accepted a single `record` for updating `eventColor`. Now, it
  accepts `records` so that `eventColor` can be updated for all the selected `records`
* [BREAKING] The `AjaxHelper.fetch()` utility function no longer applies `credentials: 'include'` by default, to better
  match how the native `fetch` API works. This change also affects `AjaxStore` and `CrudManager`, if used by your app to
  handle remote data ([#10886](https://github.com/bryntum/support/issues/10886))
* The `TreeSummary` API introduced in the alpha releases was found too inconvenient and was changed. It now only
  requires implementing a `renderer`, which handles both the calculations and the formatting of tree summary
  values (`summaryRenderer` & `generateTickValues` were removed)

### LOCALE UPDATES

* Added translation keys `Object.information` and `Object.showDetails`, `EventEdit.startTime`, `EventEdit.endTime`
* New locale key `ResourceCollapseColumn.toggleResourceLayout` added for the `ResourceCollapseColumn` column header
  tooltip
* New locale key `SchedulerBase.eventAriaLabel` describing an event

### DEMOS

* New `tree-summary` demo showing how to rollup and summarize tree data. The new demo is located in the
  `examples/tree-summary` folder
* New `tree-summary-custom` demo showing how to rollup and summarize tree and customize the way the rollup data is
  shown. The new demo is located in the `examples/tree-summary-custom` folder

### BUG FIXES

* [#10592](https://github.com/bryntum/support/issues/10592) - Not possible to reach events using keyboard from Scheduler column header in vertical mode
* [#10728](https://github.com/bryntum/support/issues/10728) - Blank tooltips in Tree Summary Demo for Material theme
* [#10841](https://github.com/bryntum/support/issues/10841) - Highlight resources while dragging event into another scheduler

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.1.9 - 2025-04-07

### BUG FIXES

* [#8782](https://github.com/bryntum/support/issues/8782) - [Salesforce] LWS support in Firefox
* [#11023](https://github.com/bryntum/support/issues/11023) - Unexpected behaviors with lazy loading and tree feature when filtering

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.1.8 - 2025-04-01

### FEATURES / ENHANCEMENTS

* We've launched nightly npm package builds on our Bryntum npm server. Versions follow the format
  `X.Y.Z-nightly.YYYYMMDD` (e.g. `6.1.8-nightly.20250330`), reflecting the current version and publish date
* A new config, `autoCreate` takes the place of the `createEventOnDblClick` config (though that will still work until
  version `7.0`). `autoCreate` allows you to configure the DOM event name, which creates an event. This defaults to
  `dblclick` as before. It also allows other parameters of the new event to be specified ([#4399](https://github.com/bryntum/support/issues/4399))
* A `Scheduler` resource store filter, which results in only removal of a contiguous block of resources within the
  visible viewport will now update the UI in the same way as a store `remove` operation ([#10706](https://github.com/bryntum/support/issues/10706))
* `CrudManager` now includes a `rawResponse` reference to the native response object, when firing `requestDone`, `load`
  `loadFail` and `requestFail` events ([#10863](https://github.com/bryntum/support/issues/10863))
* `Scheduler` now supports sticky resource group headers in vertical mode ([#10894](https://github.com/bryntum/support/issues/10894))
* The `EventCopyPaste` feature will now paste multiple events into the same pattern they were copied. To revert to the
  previous behaviour of pasting all copied events to the same target resource and date, set `unifiedPaste` on the
  feature config object to `false` ([#10948](https://github.com/bryntum/support/issues/10948))
* The `EventDragSelect` feature now triggers `eventDragSelect` and `afterEventDragSelect` events on the Scheduler as the
  user drags to select events

### API CHANGES

* [DEPRECATED] The `responseOptions` event param in `CrudManager` load/sync events was renamed to `requestOptions`.
* The `rtl` config property of widgets is now public. By default, widgets conform to the writing direction of the
  element they are rendered to. But with the now public `rtl` property, you can force a widget, and all descendant
  widgets to lay out from right to left ([#10859](https://github.com/bryntum/support/issues/10859))
* [DEPRECATED] The `createEventOnDblClick` config has been replaced by the `autoCreate` config. While
  `createEventOnDblClick` will still work until version `7.0`, it is recommended to use `autoCreate` for configuring the
  DOM event name and other parameters for creating events

### DEMOS

* We have introduced UI localization for our Vanilla JavaScript demos, supporting all 45 currently available locales
* `examples/fieldfilters` demo was updated to show filtering of the event store as well as the resource store
* [SHAREPOINT] Added a new demo showing drag from grid to scheduler for SharePoint Framework (SPFx) in the
  `frameworks/react/typescript/sharepoint-fabric-drag-from-grid` folder ([#9478](https://github.com/bryntum/support/issues/9478))

### BUG FIXES

* [#7603](https://github.com/bryntum/support/issues/7603) - `infiniteScroll` feature should be possible to enable at runtime
* [#10595](https://github.com/bryntum/support/issues/10595) - [REACT] JSX rendered recurrent events content disappear on scroll
* [#10795](https://github.com/bryntum/support/issues/10795) - [SALESFORCE] Remove `Map`/`Set` polyfills
* [#10821](https://github.com/bryntum/support/issues/10821) - `getDateConstraints` with only a start constraint does not work
* [#10831](https://github.com/bryntum/support/issues/10831) - `scrollEventIntoView` error when using TreeGroup Feature
* [#10842](https://github.com/bryntum/support/issues/10842) - Events not clickable after filtering resource in vertical mode
* [#10873](https://github.com/bryntum/support/issues/10873) - [VUE] Recurring Vue-rendered events scroll bug
* [#10887](https://github.com/bryntum/support/issues/10887) - [HIGH PRIO] Scheduler `multi-treegroups` demo failing on creating an event
* [#10920](https://github.com/bryntum/support/issues/10920) - Multi event resize breaks when selected event is out of view
* [#10938](https://github.com/bryntum/support/issues/10938) - [HIGH PRIO] Incorrect CSS `sourceMappingURL` in Bryntum thin npm packages
* [#10988](https://github.com/bryntum/support/issues/10988) - `Scheduler` in `Calendar` moving to different week when setting `Date`
* [#10999](https://github.com/bryntum/support/issues/10999) - Selected event unassigned while attempt to remove another event
* [#11001](https://github.com/bryntum/support/issues/11001) - Suppress promise rejection message when canceling load requests

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.1.7 - 2025-02-21

### FEATURES / ENHANCEMENTS

* `Group` feature can now function in vertical mode too ([#10749](https://github.com/bryntum/support/issues/10749))

### API CHANGES

* Tree stores got a new `keepExpandedOnLoad` config in v6.1.4, but it fell out of the changelog. When set to `true`,
  the tree will restore matching nodes expansion state after a reload ([#10017](https://github.com/bryntum/support/issues/10017))
* `EventDrag` feature has a new config `alwaysCopy`. When set to `true`, it will always `copy` the event on drag-drop
  operation ([#10402](https://github.com/bryntum/support/issues/10402))

### BUG FIXES

* [#5705](https://github.com/bryntum/support/issues/5705) - [DOCS] Error in vertical scheduler `eventLayout` config docs
* [#10422](https://github.com/bryntum/support/issues/10422) - Wrong row snapping when dragging event over tall row with overlapping events
* [#10605](https://github.com/bryntum/support/issues/10605) - [HIGH PRIO] `finalize` function doesn't work after async operation in `beforeEventResizeFinalize`
* [#10705](https://github.com/bryntum/support/issues/10705) - Event not being dropped correctly when dragging in infinite scroll with `lazyloading` enabled
* [#10736](https://github.com/bryntum/support/issues/10736) - `TimeAxis` Date Range Picker does not work
* [#10744](https://github.com/bryntum/support/issues/10744) - `loadMask` getting disabled too early
* [#10769](https://github.com/bryntum/support/issues/10769) - RTL scrolling does not make the timeaxis header sticky

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.78.0`
* Remix: `>= 2.15.0`

## 6.1.6 - 2025-01-31

### FEATURES / ENHANCEMENTS

* New `eventReleaseThreshold` setting, for advanced use cases where you want to limit the amount of event bar elements
  that are kept in the DOM for faster re-usage on scroll

### API CHANGES

* [DEPRECATED] Setting the `Scheduler` `stepUnit` property has been deprecated. This is a read-only property, which
  produces a human-readable version of the `shiftIncrement` for UIs. Set the `shiftIncrement` instead

### DEMOS

* [REACT] Legacy React JavaScript `drag-from-grid` demo has been removed
* [REACT] Legacy React TypeScript `drag-from-grid` demo has been updated to use React + Vite. New demo is located in
  `examples/frameworks/react-vite/drag-from-grid` folder
* [REACT] Legacy React JavaScript `vertical` demo has been updated to use React + Vite. New demo is located in
  `examples/frameworks/react-vite/vertical` folder

### BUG FIXES

* [#8483](https://github.com/bryntum/support/issues/8483) - After `clearFilters`, calling `scrollResourceIntoView` immediately doesn't scroll the resource into
  view
* [#10542](https://github.com/bryntum/support/issues/10542) - Keyboard focus rendition shown when using mouse
* [#10548](https://github.com/bryntum/support/issues/10548) - Column resize crashes when lockRows and `showCheckAll` enabled
* [#10627](https://github.com/bryntum/support/issues/10627) - Error when resizing multiple events outside the view
* [#10655](https://github.com/bryntum/support/issues/10655) - Scheduler's stepUnit is not flexible. And it should be a private property
* [#10657](https://github.com/bryntum/support/issues/10657) - `ExceptionDates` not cleared on UI when event becomes non-recurrent
* [#10658](https://github.com/bryntum/support/issues/10658) - Calendar unresponsive if all days set as `nonWorkingDays` and `hideNonWorkingDays` is `true`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.38.0`

## 6.1.5 - 2024-12-25

### API CHANGES

* `TimeRange` elements are now stretched the same way events are when using the `fillTicks` mode

### DEMOS

* [VUE-3] New demo showing use of vue components in widgets & tooltips. Demo is located in
  `examples/frameworks/vue-3-vite/widget-rendering` folder ([#946](https://github.com/bryntum/support/issues/946))

### BUG FIXES

* [#9993](https://github.com/bryntum/support/issues/9993) - [HIGH PRIO] [SALESFORCE] Scheduler Pro / Gantt task editor loses focus and cancels on click
* [#10143](https://github.com/bryntum/support/issues/10143) - [ACCESSIBILITY] Issue with keyboard accessibility in event navigation
* [#10454](https://github.com/bryntum/support/issues/10454) - `PDFExport` feature - error in date field when it's cleared
* [#10460](https://github.com/bryntum/support/issues/10460) - [REACT] `constrainDragToResource` and `constrainDragToTimeSlot` not working properly with `lockRows`
  enabled
* [#10482](https://github.com/bryntum/support/issues/10482) - Project clears child records added collection when applying a record sync response
* [#10520](https://github.com/bryntum/support/issues/10520) - Events are not clickable in mixed layout
* [#10521](https://github.com/bryntum/support/issues/10521) - `RecurrenceFrequencyCombo` default values not restored after custom set used
* [#10526](https://github.com/bryntum/support/issues/10526) - English (Gb) locale uses AM/PM for a view preset

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.38.0`

## 6.1.4 - 2024-12-09

### FEATURES / ENHANCEMENTS

* Starting with the `6.1.4` release, there are now trial versions of thin NPM packages available on our NPM server.
  These can be used to evaluate combining multiple products before purchasing a license. Please check the "What's new"
  guide for the details

### STYLING CHANGES

* The header element of `TimeRange` lines are no longer given a specific height, and will shrinkwrap

### DEMOS

* [ANGULAR] Added new Angular `basic-thin` demo showing use of thin NPM packages. Demo is located in
  `examples/frameworks/angular/basic-thin` folder
* [REACT] Added new React `basic-thin` demo showing use of thin NPM packages. Demo is located in
  `examples/frameworks/react-vite/basic-thin` folder
* [VUE-3] Added new Vue-3 `basic-thin` demo showing use of thin NPM packages. Demo is located in
  `examples/frameworks/vue-3-vite/basic-thin` folder
* [WEBPACK] Added new Webpack `basic-thin` demo showing use of thin NPM packages. Demo is located in
  `examples/frameworks/webpack/basic-thin` folder

### BUG FIXES

* [#10359](https://github.com/bryntum/support/issues/10359) - `DurationColumn` drops decimal digits when editing
* [#10372](https://github.com/bryntum/support/issues/10372) - LockRows feature not compatible with showCurrentTimeline of TimeRanges
* [#10387](https://github.com/bryntum/support/issues/10387) - `ResourceFilter` `onChange` handler not firing
* [#10401](https://github.com/bryntum/support/issues/10401) - Dragging `TimeRange` close to viewport edge does not trigger scrolling timeline
* [#10404](https://github.com/bryntum/support/issues/10404) - Event Drag Create doesn't complete when crossing over dates twice to change drag direction
* [#10417](https://github.com/bryntum/support/issues/10417) - [HIGH PRIO] Remote filtering of the `EventStore` also filter the store locally
* [#10448](https://github.com/bryntum/support/issues/10448) - [REACT] JSX renderers are not supported with `React 19`

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.38.0`

## 6.1.3 - 2024-11-18

### FEATURES / ENHANCEMENTS

* Salesforce LWC build now using generators instead of async/await as a workaround for
  [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1663090). LWC bundle is now compiled with `"chrome": "54"`
  babel target ([#7849](https://github.com/bryntum/support/issues/7849))

### API CHANGES

* [VUE 2] reached end of life on December 31, 2023. As a result, we will no longer be updating our Vue 2 components.
  While the components will continue to exist, we will remove them in a future release and recommend that you upgrade to
  Vue 3 for continued support

### STYLING CHANGES

* Certain color adjustment functions in SASS has been deprecated and will be removed from SASS in a future version. To
  be prepared for that, we have replaced our usages of these functions with the new ones. In general, this should not
  affect the look of components, with reservation for minor color variations (for more information, see
  https://sass-lang.com/documentation/breaking-changes/color-functions)

### DEMOS

* Renamed "theme" demo to "custom-theme". The updated demo is located in `examples/custom-theme` folder ([#10155](https://github.com/bryntum/support/issues/10155))

### BUG FIXES

* [#9018](https://github.com/bryntum/support/issues/9018) - [HIGH PRIO] Localization doesn't work for Microsoft Dynamics CRM Online
* [#10065](https://github.com/bryntum/support/issues/10065) - [HIGH PRIO] Milestone outside text overlaps with event when ticks removed
* [#10135](https://github.com/bryntum/support/issues/10135) - [HIGH PRIO] Fix horizontal dragging of editor in RTL viewports
* [#10139](https://github.com/bryntum/support/issues/10139) - Event bars stop selecting after moving timeline using `Pan` feature
* [#10165](https://github.com/bryntum/support/issues/10165) - [HIGH PRIO] `ScrollResourceIntoView` and `ScrollEventIntoView` is not working with `LockRows`
* [#10192](https://github.com/bryntum/support/issues/10192) - [HIGH PRIO] Drag from grid/list demos not working in touch devices
* [#10195](https://github.com/bryntum/support/issues/10195) - [HIGH PRIO] [Salesforce] Drag from grid doesn't work in LWS on touchscreen
* [#10198](https://github.com/bryntum/support/issues/10198) - `RecurrenceConfirmationPopup` buttons text should be configurable
* [#10200](https://github.com/bryntum/support/issues/10200) - Make `beforeAssignmentDelete` async
* [#10202](https://github.com/bryntum/support/issues/10202) - Drag & Drop from unplanned grid not working correctly with `LockRows` feature
* [#10225](https://github.com/bryntum/support/issues/10225) - [HIGH PRIO] Incorrect type for `beforeAssignmentDelete` listener
* [#10271](https://github.com/bryntum/support/issues/10271) - Setting `allowOverlap` to `false` not working when `showExactResizePosition` enabled
* [#10300](https://github.com/bryntum/support/issues/10300) - [HIGH PRIO] `EventMenu` doesn't work on Android touch device

### VERSIONS SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 3.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`
* Sass: `>= 1.38.0`

## 6.1.2 - 2024-10-11

### DEMOS

* [REACT-VITE] "Basic" React demo has been updated to use React + Vite. New demo is located in
 `examples/frameworks/react-vite/basic` folder ([#9932](https://github.com/bryntum/support/issues/9932))
* [VUE-3-VITE] New "Basic" (Vue 3 + Vite) demo shows how to use Bryntum Scheduler in Vue 3 project with TypeScript.
  The demo is located in `examples/frameworks/vue-3-vite/basic` folder ([#9808](https://github.com/bryntum/support/issues/9808))

### BUG FIXES

* [#9708](https://github.com/bryntum/support/issues/9708) - [HIGH PRIO] `infiniteScroll` and horizontal `split` not working
* [#9992](https://github.com/bryntum/support/issues/9992) - [HIGH PRIO] Not clear docs in part of adding new event in `resourceId` notation used
* [#10115](https://github.com/bryntum/support/issues/10115) - [HIGH PRIO] BryntumTimeField not working in React
* [#10160](https://github.com/bryntum/support/issues/10160) - Top Scheduler does not scroll of there are no locked rows in it
* [#10163](https://github.com/bryntum/support/issues/10163) - Tree-grouping ignores sorting

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.1.1 - 2024-09-27

### BUG FIXES

* [#9978](https://github.com/bryntum/support/issues/9978) - Column auto adjustment for Multiple linked Schedulers when hiding/showing a column
* [#9990](https://github.com/bryntum/support/issues/9990) - [HIGH PRIO] New added event stay in changes when call `applyChangeset` for `resourceStore`
* [#10044](https://github.com/bryntum/support/issues/10044) - `eventDragSelect` should exclude the events based on `isEventSelectable`
* [#10091](https://github.com/bryntum/support/issues/10091) - Events flickering when updating events that uses JSX in `eventRenderer`

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.1.0 - 2024-09-18

### FEATURES / ENHANCEMENTS

* Support for paging has now been added to the Scheduler ([#69](https://github.com/bryntum/support/issues/69))
* The regular non-Ajax `Store` now has the ability to accept remote paging, sorting and filtering ([#6860](https://github.com/bryntum/support/issues/6860),
  [#8180](https://github.com/bryntum/support/issues/8180), [#9363](https://github.com/bryntum/support/issues/9363))
* The Scheduler can now lazy load events, assignments and/or resource time ranges when scrolling vertically when using
  a ResourceStore that is not lazy loaded ([#9709](https://github.com/bryntum/support/issues/9709))
* New `DependencyMenu` feature, allowing deleting + editing a dependency using right click ([#9733](https://github.com/bryntum/support/issues/9733))
* `EventEditor` now supports `autoUpdateRecord` to apply changes to the underlying record (updating the UI) while editor
  is open ([#9841](https://github.com/bryntum/support/issues/9841))
* You can now set boundaries for the timeline using two new properties: `minDate` and  `maxDate`.
  Actions such as timeline scrolling, all types of timeline zooms, and shifts will respect these limits ([#3870](https://github.com/bryntum/support/issues/3870))
* With some configurations, zooming in and out of the Scheduler could lead to a very long time axis, which degraded
  performance. To prevent this, it now limits how many ticks (the bottommost unit) its time axis can contain to 10,000
  (which will give a very long scroll range even with small tick sizes)
* `ExcelExport` feature got a minor refactoring, and now uses more feature-rich `write-excel-file` library ([#6089](https://github.com/bryntum/support/issues/6089))

### BUG FIXES

* [#9154](https://github.com/bryntum/support/issues/9154) - Partnered schedulers scroll lags when using iPad
* [#9562](https://github.com/bryntum/support/issues/9562) - Make resource and assignment data available in EventTooltip
* [#9641](https://github.com/bryntum/support/issues/9641) - Partial animation on scroll with lazy loading
* [#9710](https://github.com/bryntum/support/issues/9710) - [HIGH PRIO] Lazy loading of `EventStore` creates `STM` transactions

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.6 - 2024-09-13

### STYLING CHANGES

* Predefined colors available as `eventColor` has been normalized between `Scheduler`, `Calendar` and `TaskBoard`

### DEMOS

* [VUE-3] New demo showing implementation of dragging unplanned tasks from a Grid to a Scheduler. The demo is
  located in `frameworks/vue-3-vite/drag-from-grid` folder ([#9722](https://github.com/bryntum/support/issues/9722))
* [VUE-3-VITE] Event rendering demo (Vue 3 + Vite) shows using Vue components as event renderers. The demo is located
  in `frameworks/vue-3-vite/event-rendering` folder (Partially fixed [#946](https://github.com/bryntum/support/issues/946))

### BUG FIXES

* [#284](https://github.com/bryntum/support/issues/284) - Shift by whole calendar month when shift unit is month
* [#1230](https://github.com/bryntum/support/issues/1230) - `rowHeight` set on `ViewPreset` is ignored
* [#9909](https://github.com/bryntum/support/issues/9909) - Moving an infinitely weekly repeating event by drag & drop fails
* [#9921](https://github.com/bryntum/support/issues/9921) - Zooming the timeline with touchpad scales the entire page
* [#9949](https://github.com/bryntum/support/issues/9949) - Repeat event error when selecting option first day in month
* [#9951](https://github.com/bryntum/support/issues/9951) - Scheduler crashes when clicking on splitter and no resources exist

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.5 - 2024-08-30

### FEATURES / ENHANCEMENTS

* You can now opt out of focus-related renditions while keyboard is used, using `DomHelper.enableKeyboardCssModifiers`
  ([#5271](https://github.com/bryntum/support/issues/5271))
* The `EventDrag` feature has a new property: `snapToResource`. Set it to `true` to be able to snap events to resources
  while dragging events, i.e., vertical row snap in horizontal mode and vice versa ([#3624](https://github.com/bryntum/support/issues/3624))

### BUG FIXES

* [#3784](https://github.com/bryntum/support/issues/3784) - `visibleDate` config does not work when `autoHeight` is set to `true`
* [#5233](https://github.com/bryntum/support/issues/5233) - [ANGULAR] Frameworks wrappers components not triggering some events
* [#7066](https://github.com/bryntum/support/issues/7066) - Event drop context data conflict
* [#7263](https://github.com/bryntum/support/issues/7263) - Bug when using split and panel
* [#8042](https://github.com/bryntum/support/issues/8042) - [HIGH PRIO] Drag drop tooltip shown with empty content
* [#8263](https://github.com/bryntum/support/issues/8263) - `CrudManager` loses changes when applying sync response
* [#8283](https://github.com/bryntum/support/issues/8283) - Scheduler header date is not sticky
* [#8359](https://github.com/bryntum/support/issues/8359) - [HIGH PRIO] Export scheduler view with custom component as `eventRenderer`
* [#9150](https://github.com/bryntum/support/issues/9150) - [HIGH PRIO] [REACT] Bug with Recurring Events + Timezones
* [#9212](https://github.com/bryntum/support/issues/9212) - Crash when splitting a child event inside a nested event
* [#9378](https://github.com/bryntum/support/issues/9378) - [HIGH PRIO] `RecurrenceConfirmationPopup` reconfiguration should be easy
* [#9438](https://github.com/bryntum/support/issues/9438) - [TYPESCRIPT] Update types for the keys in `KeyMap` to allow `null`
* [#9647](https://github.com/bryntum/support/issues/9647) - Crash when enabling `LockRows` and dragging selected events from both splits
* [#9663](https://github.com/bryntum/support/issues/9663) - The validation is still shown when closing and reopening event edit pop up
* [#9677](https://github.com/bryntum/support/issues/9677) - Splitter misrendered after removing all rows
* [#9692](https://github.com/bryntum/support/issues/9692) - Multi-assignment event dragging leaves a copy of the dragged event when `LockRows` feature enabled
* [#9695](https://github.com/bryntum/support/issues/9695) - [HIGH PRIO] `TaskEditor` unexpectedly jumps when editing occurrences
* [#9718](https://github.com/bryntum/support/issues/9718) - [VUE-3] Preventable events don't work in Vue wrapper
* [#9723](https://github.com/bryntum/support/issues/9723) - Setting `hideHorizontalScrollbar` to `false` causes errors
* [#9737](https://github.com/bryntum/support/issues/9737) - Should calculate `ResourceTimeRanges` in the original time zone
* [#9795](https://github.com/bryntum/support/issues/9795) - [HIGH PRIO] beforeEventDropFinalize should include new `startDate`/`endDate` values of the dragged event
* [#9803](https://github.com/bryntum/support/issues/9803) - Missing event object in `beforeAdd` and strange effects when copy/paste Events
* [#9824](https://github.com/bryntum/support/issues/9824) - `Tooltip` not showing for dynamically added summaries
* [#9850](https://github.com/bryntum/support/issues/9850) - Cannot when clicking empty area in the Scheduler
* [#9852](https://github.com/bryntum/support/issues/9852) - Crash when moving mouse in Firefox

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.4 - 2024-08-02

### FEATURES / ENHANCEMENTS

* The `PdfExport` feature now supports exporting scheduler in vertical mode ([#2007](https://github.com/bryntum/support/issues/2007))
* The `ColumnLines` feature now supports a `renderer` function letting you add CSS classes and custom styles to each
  line ([#6016](https://github.com/bryntum/support/issues/6016))
* The `TimeRanges` feature now fires a `currentTimelineUpdate` event every time the current timeline is updated
  ([#9654](https://github.com/bryntum/support/issues/9654))

### BUG FIXES

* [#9674](https://github.com/bryntum/support/issues/9674) - Overlap detection broken when dragging multiple events assigned to the same resource

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.3 - 2024-07-26

### FEATURES / ENHANCEMENTS

* The TimeRanges feature now fires a `currentTimelineUpdate` event every time the current timeline is updated
  ([#9654](https://github.com/bryntum/support/issues/9654))
* The plugin processing has been updated to correctly handle multiple plugin configurations

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.2 - 2024-07-24

### FEATURES / ENHANCEMENTS

* `TimelineHistogram` view got two new hooks providing more control over the rendered charts DOM elements. Please
  check "What's new" guide for more details ([#9037](https://github.com/bryntum/support/issues/9037))
* Bumped the built-in version of FontAwesome Free to `v6.6.0`, which includes a new
  [table-cells-row-unlock](https://fontawesome.com/icons/table-cells-row-unlock) icon sponsored by Bryntum

### API CHANGES

* [DEPRECATED] `TimelineHistogram.getRectClass` config in favor of new `getBarClass` config to make naming more
  consistent

### STYLING CHANGES

* The `font-weight` for event bars in the classic themes was increased to 400 (up from 300) to improve readability. The
  `hollow` event style was also slightly tweaked in the `classic-dark` theme for the same reason ([#9605](https://github.com/bryntum/support/issues/9605))

### DEMOS

* [REACT-REMIX] "Basic" (React + Remix) demo shows using Scheduler component in Remix. The demo is located in
  `frameworks/react-remix/basic` folder ([#4912](https://github.com/bryntum/support/issues/4912))
* [SHAREPOINT] Added a new demo for SharePoint Framework (SPFx) in the `frameworks/react/typescript/sharepoint-fabric`
  folder ([#9224](https://github.com/bryntum/support/issues/9224))

### BUG FIXES

* [#4823](https://github.com/bryntum/support/issues/4823) - Changing `showCurrentTimeLine` value doesn't trigger stateful event
* [#6310](https://github.com/bryntum/support/issues/6310) - `allowOverlap` = false not working when dragging multiple events
* [#8619](https://github.com/bryntum/support/issues/8619) - [HIGH PRIO] Event drag does not work on iPad - it triggers timeline scrolling
* [#9294](https://github.com/bryntum/support/issues/9294) - [HIGH PRIO] `applyChangeset` in event store triggers a sync
* [#9309](https://github.com/bryntum/support/issues/9309) - [HIGH PRIO] Multi-event resize issue when resizing to edge
* [#9370](https://github.com/bryntum/support/issues/9370) - [HIGH PRIO] [REACT] custom eventRenderer which return JSX, cause a significant delay in rendering events
* [#9504](https://github.com/bryntum/support/issues/9504) - [HIGH PRIO] Resource header blank after collapse expand vertical time axis column
* [#9530](https://github.com/bryntum/support/issues/9530) - `LoadMask` only masks top grid section when using `LockRows` feature
* [#9560](https://github.com/bryntum/support/issues/9560) - `snapRelativeToEventStartDate` trigger error when event drag create action
* [#9575](https://github.com/bryntum/support/issues/9575) - [TYPESCRIPT] `selectedTimeSpan` type definition
* [#9576](https://github.com/bryntum/support/issues/9576) - [HIGH PRIO] `EventDrag` is broken in RTL with `constrainDragToTimeline` set to `false`
* [#9580](https://github.com/bryntum/support/issues/9580) - [HIGH PRIO] Mouse does not detach from the timeline with `Pan` Feature
* [#9625](https://github.com/bryntum/support/issues/9625) - Wrong time axis column width when switching demo to vertical mode

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.1 - 2024-07-05

### BUG FIXES

* [#6015](https://github.com/bryntum/support/issues/6015) - [HIGH PRIO] Poor UX when creating new event with `allowOverlap` set to false
* [#9379](https://github.com/bryntum/support/issues/9379) - Merge cells rendering issues
* [#9477](https://github.com/bryntum/support/issues/9477) - Not possible to configure `generateNewName` in `EventCopyPaste` feature
* [#9493](https://github.com/bryntum/support/issues/9493) - [HIGH PRIO] `forceSync: true` not triggering sync call correctly
* [#9505](https://github.com/bryntum/support/issues/9505) - Crash during keyboard navigation in Scheduler vertical mode
* [#9512](https://github.com/bryntum/support/issues/9512) - `getDateConstraints` blocks horizontal movement in vertical mode

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 6.0.0 - 2024-06-28

* We are thrilled to announce version `6.0` of our Scheduler product. This release marks a significant milestone for us
  after more than two years of dedicated development. In this update, we are excited to bring you:
  * **Lazy loading of rows as you scroll, for huge datasets**
  * **Support for freezing rows**
  * **New `ScrollButtons` feature to easily scroll events into view**
  * **Support for resizing multiple events simultaneously**
  * **Improved TypeScript typings**
  * **A new code editor in the examples for easy fiddling**
  * **Cool new demos**
  * **Bug fixes and other enhancements requested by our community**
* A special thanks to everyone who helped us by testing our alpha and beta versions. Your feedback and support have been
  invaluable

### FEATURES / ENHANCEMENTS

* `EventEdit` now shows an error tooltip when saving is not possible due to overlapping events ([#2841](https://github.com/bryntum/support/issues/2841))
* The `LockRows` feature allows records, which satisfy a certain condition to be locked at the top of the scheduler.
  By default, the condition is that a certain named field has a truthy value. The field, which decides
  this status defaults to `'fixed'`, but that is configurable using the `fieldName` property ([#4831](https://github.com/bryntum/support/issues/4831))
* The `EventCopyPaste` feature has been enhanced. It now creates clones of the copied records immediately on a copy
  action. This makes the copied data unaffected by any Store changes between the time of copying and the time of
  pasting. It also makes it possible to modify the copied data in the `beforePaste` event. Additionally, when
  copy-pasting between different Scheduler instances, the complete record will be copied, not just a predefined set of
  fields, as it was previous ([#6692](https://github.com/bryntum/support/issues/6692))
* PDF export server has been moved from `examples/_shared/server` folder to its own GitHub repository:
  https://github.com/bryntum/pdf-export-server ([#6820](https://github.com/bryntum/support/issues/6820))
* The default format for `NumberField` and `NumberColumn` now includes all numeric-related configs from the current
  locale, like decimals separator, grouping separator etc. ([#6948](https://github.com/bryntum/support/issues/6948))
* `EventResize` feature now supports resizing multiple events simultaneously ([#7218](https://github.com/bryntum/support/issues/7218))
* The `TimeSelection` feature now supports using a drag-drop gesture to select a time span via the new
  `enableDragSelect` property ([#7828](https://github.com/bryntum/support/issues/7828));
* The new `ScrollButtons` feature will show arrow buttons at both sides of each row, which lets the user scroll to the
  next out-of-view event easily. Showcased in the new `scroll-buttons` demo ([#7965](https://github.com/bryntum/support/issues/7965))
* Stores now have support for lazy loading of data, which when used in the Scheduler, loads new data while scrolling
  (both vertically and horizontally) ([#8001](https://github.com/bryntum/support/issues/8001))
* To allow for better control of the `z-index` of different layers in the schedule, elements from the
  `ResourceTimeRanges` and `ResourceNonWorkingTime` features are now rendered to separate parent elements in the DOM.
  Previously, they were both rendered into the same parent as event bars. If you have adjusted the z-index of the
  different elements in the schedule, please verify that they are as you expect after upgrading ([#8043](https://github.com/bryntum/support/issues/8043))
* Scheduler now supports drag-drop of events in a single direction via the new `singleDirection` property ([#8262](https://github.com/bryntum/support/issues/8262))
* New `allowOverlap` field on `ResourceModel` to allow per-resource overlap behavior ([#9010](https://github.com/bryntum/support/issues/9010))
* When setting recurrence on a non-recurring event, the choice of recurrence types is now pre-populated with choices
  contextualized to the day of week and week of month of the event's start date. To disable this, configure the event
  edit feature with `useContextualRecurrenceRules : false`
* Milestones at the same date no longer overlap when using pack layout and milestones that take part in layout (using
  `milestoneLayoutMode`) when packing is now correctly positioned
* The code editor in examples is now implemented with the VS Code engine. Code folding, search and replace, full
  undo/redo is now available when editing examples
* [TypeScript] Class configs `*Config` (e.g. `ButtonConfig`) now provide type declarations for `listeners` parameter in
  `*.d.ts` files
* [TypeScript] Class configs `*Config` (e.g. `ButtonConfig`) types now have optional parameters in `*.d.ts` files.
  `*Config` type can be used instead of `Partial<*Config>` declaration
* Event bars, resource time ranges and time ranges all now use the direction neutral `inset-block-start` and
  `inset-inline-start` styles for positioning, rather than `top` and `left`. This puts them in the same place in LTR and
  RTL directions without additional processing
* Bumped the built-in version of FontAwesome Free to `v6.5.2`, which includes a new
  [table-cells-row-lock](https://fontawesome.com/icons/table-cells-row-lock) icon sponsored by Bryntum
* [Angular] Bryntum Angular wrapper now exports `Bryntum...Props` types (e.g. `BryntumSchedulerProps`) which match the
  configs available for a wrapper component (e.g. `BryntumSchedulerComponent`). Wrappers code is now delivered with
  documentation inside, that helps in setting up the components
* `EventHelper` no longer mutates the DOM event object to fix browser quirks and add utility properties. It now wraps
  the DOM event with a Proxy, which exposes all the properties of the DOM event and also accepts any new properties
  added to it. The original DOM event is available in the `browserEvent` property

### API CHANGES

* [VUE-3] Bryntum Vue-3 wrapper now exports `Bryntum...Props` types (e.g. `BryntumSchedulerProps`) which match the
  configs available for a wrapper component (e.g. `<bryntum-scheduler>`). Wrappers code is now delivered with
  documentation and TypeScript sources inside ([#3085](https://github.com/bryntum/support/issues/3085))
* [DEPRECATED] The `WidgetHelper` utility class has been deprecated and will be removed in a future release. Use the
  corresponding widget class instead - `Widget`, `Toast` or `Mask` ([#6103](https://github.com/bryntum/support/issues/6103))
* In previous versions, a call to `project.commitAsync()` caused a UI refresh even if nothing was changed by the commit.
  This has been fixed so that the UI is only refreshed if the commit actually changed something. This is a slight
  behavioral change (for the better), which we think should have minimal impact on apps ([#7924](https://github.com/bryntum/support/issues/7924))
* [BREAKING] Store search method `findByField` now uses exact match for number values ([#8041](https://github.com/bryntum/support/issues/8041))
* [BREAKING] The `useRawData` setting on `Store` is now enabled by default, but with all sub-settings disabled. This
  means that the incoming data object will be used as is, without being cloned. Which will boost data loading
  performance, but is potentially a breaking change if the data object is reused / used in other parts of the
  application ([#8335](https://github.com/bryntum/support/issues/8335))
* [BREAKING] The `copyKey` property of the `EventDrag` feature now defaults to the default copy key of the native OS
  (`[Meta-key]` for Mac and `[Ctrl]` for Windows) ([#9245](https://github.com/bryntum/support/issues/9245))
* [BREAKING] In `6.0.0-alpha-2` we changed the default value for `useRawData` on stores to `true`. This boosted record
  creation performance by not cloning the incoming data object. However, this change has lead to some issues, and we are
  now taking a step back. It will once again default to `false` when supplying data inline, and instead only to `true`
  when data is loaded remotely using an `AjaxStore` or a `CrudManager` ([#9289](https://github.com/bryntum/support/issues/9289))
* [STYLING] The bottom border styling of the Grid header was moved from the `.b-grid-header-container` element to
  `.b-grid-headers` in non-timeline sub-grids and `.b-horizontaltimeaxis` in the timeline subgrid
* [BREAKING] `ExcelExport` now exports only events in the current time axis by default. Controlled by the
  `includeEventsOutsideTimeAxis` config
* Some of the `EventCopyPaste` feature's events has gotten their parameters changed slightly. For the `copy` event, the
  `eventRecords` and `assignmentRecords` has been specified as copies of the original copied records. For the `paste`
  event, the `pastedEventRecords` parameter has been deprecated, and its content is now available in the `eventRecords`
  parameter. For the events `copy`, `beforePaste` and `paste`, the original records that were copied are now available
  in the `originalEventrecords` and `originalAssignmentRecords` parameters
* With the recent introduction of individual layers for positioned elements, z-indexes have now been normalized. If you
  have overridden z-index of the layers, please adjust your CSS to ensure it looks as you expect
* The nonworking-time layer has been moved up in the z-index stack to float above the time axis tick lines
* Read-only events are now rendered the same way as normal events (previously used opacity)
* [DEPRECATED] `@bryntum/babel-preset-react-app`, `@bryntum/cra-template-typescript-scheduler`,
  `@bryntum/cra-template-javascript-scheduler` npm packages are deprecated, and will not get any further updates.
  Versions prior to `6.0.0` are still accessible
* [BREAKING] In addition to the APIs mentioned in Grid's changelog, the following previously deprecated APIs were
  removed:
  * The `event` property of the `timeRangeHeaderClick`, `timeRangeHeaderDblClick`,  `timeRangeHeaderContextMenu`,
    `beforeEventDrag` and `eventDragStart` events (v5.2.7, v5.3.0)
  * `CrudManager.transport.load.fetchOptions` (v5.0.0)
  * `CrudManager.transport.load.requestConfig` (v5.0.0)
  * `CrudManager.transport.sync.fetchOptions` (v5.0.0)
  * `CrudManager.transport.sync.requestConfig` (v5.0.0)
  * `Dependencies.drawForEvent()` (v5.1.0)
  * `EventResize.handleSize` (v5.2.7)
  * `EventResize.touchHandleSize` (v5.2.7)
  * `NonWorkingTime.highlightWeekends` (v5.2.0)
  * `ResourceInfoColumn.validNames` (v4.3.5)
  * `ResourceModel.getEvents()` (v5.3.6)
  * `Scheduler.horizontalEventSorterFn` (v5.0.0)
  * `Scheduler.eventBodyTemplate` (v5.6.2)
  * `TimelineHistogramBase.getBarTip()` (v5.0.0)
* [BREAKING] The documented order of the arguments of `TimeSpan.shift()` (`EventModel` and `TaskModel` extends it) has
  been incorrect since `v2.0.0`. Docs were updated to reflect the correct order (`amount, unit`, not `unit, amount`) and
  the code that handled the incorrect order has been removed
* [BREAKING] The following default values were changed:
  * `EventResize.lockLayout` and `EventDragCreate.lockLayout` both now defaults to `true`
  * `Scheduler.passStartEndParameters` now defaults to `true`
  * The `trigger` argument of `Scheduler.resumeRefresh()` now defaults to `true`
* [BREAKING] In addition to the APIs mentioned in Grid's changelog, the following previously deprecated APIs were
  removed:
  * The `eventRecord` and `assignmentRecord` properties of Scheduler's `eventKeyDown` and `eventKeyUp` events
* [BREAKING] When using `fillTicks` and dragging events, the temporal data on the event that is smaller than the lowest
  timeaxis header tick is now kept intact when drag-dropping events
* `EventMenu` menu item texts for `Copy event`, `Delete event` etc. were simplified to omit `event` word. Menu options
  will now just say "Copy, Cut, Delete"
* [DEPRECATED] The `context` and its nested params of `beforeEventResizeFinalize` has been deprecated

### STYLING CHANGES

* The Stockholm theme got some slight tweaks to panel header (removed bottom border) and tab panel styling (replaced
  active tab background with thick bottom border) for a more modern look ([#8440](https://github.com/bryntum/support/issues/8440))

### DEMOS

* [REACT-VITE] New demo showing booking application, using `ResourceTimeRanges` and the `Summary` feature. The demo is
  located in `frameworks/react-vite/booking` folder ([#8531](https://github.com/bryntum/support/issues/8531))
* [VUE-3-VITE] New demo showing booking application, using `ResourceTimeRanges` and the `Summary` feature. The demo is
  located in `frameworks/vue-3-vite/booking` folder ([#8532](https://github.com/bryntum/support/issues/8532))
* The `crudmanager` demo PHP backend has been improved

### BUG FIXES

* [#7276](https://github.com/bryntum/support/issues/7276) - Move border from headers elements to allow time range header elements to render above
* [#7760](https://github.com/bryntum/support/issues/7760) - [HIGH PRIO] [TypeScript] Type intersection with `any` might be wrong
* [#7872](https://github.com/bryntum/support/issues/7872) - `allowOverlap` set to `false` only checks first occurrence, not other occurrences
* [#8208](https://github.com/bryntum/support/issues/8208) - Remove call to `refreshRows` as part of drag creation
* [#8309](https://github.com/bryntum/support/issues/8309) - Duration column decimal separator is not localized
* [#8363](https://github.com/bryntum/support/issues/8363) - Scheduler - `ScheduleContext` should allow interaction
* [#8493](https://github.com/bryntum/support/issues/8493) - Events in the locked row disappears upon opening and closing the `EventEditor`
* [#8509](https://github.com/bryntum/support/issues/8509) - [HIGH PRIO] Recurring time ranges not display in RTL
* [#8567](https://github.com/bryntum/support/issues/8567) - [HIGH PRIO] `LockRows` event drag drop issue
* [#8568](https://github.com/bryntum/support/issues/8568) - Cannot delete event in locked row
* [#8574](https://github.com/bryntum/support/issues/8574) - Date range field not working in "Property booking" demo
* [#8580](https://github.com/bryntum/support/issues/8580) - Event disappears if dropped on locked row
* [#8587](https://github.com/bryntum/support/issues/8587) - Event bar duplicated when assigning a resource from a backlog section using task editor
* [#8599](https://github.com/bryntum/support/issues/8599) - [HIGH PRIO] "Infinite scroll" demo crashes on event drag create
* [#8813](https://github.com/bryntum/support/issues/8813) - [HIGH PRIO] `Toolbar` items lose their value when moved into toolbar overflow menu
* [#8957](https://github.com/bryntum/support/issues/8957) - [HIGH PRIO] `LockRows` clone Schedulers are not kept synced with date range and scroll state of original
* [#9104](https://github.com/bryntum/support/issues/9104) - Scheduler `backlog` demo - remove the lock/unlock row from context menu
* [#9112](https://github.com/bryntum/support/issues/9112) - Scheduler crashes sometimes when event is hovered
* [#9113](https://github.com/bryntum/support/issues/9113) - Crash while applying zoom from `timeAxis` header in `Infinite scroll` demo
* [#9117](https://github.com/bryntum/support/issues/9117) - `Infinite scroll` demo backend runs out of memory
* [#9310](https://github.com/bryntum/support/issues/9310) - [HIGH PRIO] Resize tooltip displays incorrect dates while multi-resizing
* [#9311](https://github.com/bryntum/support/issues/9311) - [HIGH PRIO] Multi-resize shouldn't allow resizing `readOnly` event

### FRAMEWORK SUPPORT

* NodeJS: `>= 20.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.13 - 2024-06-26

### FEATURES / ENHANCEMENTS

* The `EventResize` & `EventDragCreate` features has a new option for the `lockLayout` config. By specifying it
  as `minimal-updates`, only the resized / drag created event will be refreshed during the operation, instead of all
  events assigned to the affected resource. This can boost performance for the action when having many events assigned
  to a resource, at the cost of not being possible to visually indicate anything on other events until the operation is
  finished

### BUG FIXES

* [#7392](https://github.com/bryntum/support/issues/7392) - [ANGULAR] Zoom to span not show correct view span when RTL used
* [#9128](https://github.com/bryntum/support/issues/9128) - [REACT] Drag from grid framework demos - Fix bg color for invalid target for drag proxy
* [#9356](https://github.com/bryntum/support/issues/9356) - [HIGH PRIO] Infinite scroll feature - scroll resets too close to the left edge of the new date range

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.12 - 2024-06-13

### FEATURES / ENHANCEMENTS

* Added a new `refreshResources()` method to the Scheduler, that lets you update specific resources when for example
  some external setting unknown to the Scheduler is changed ([#9179](https://github.com/bryntum/support/issues/9179))

### API CHANGES

* [VUE] [REACT] When using wrappers for Vue or React, `syncDataOnLoad` is by default set to `true` on all stores
  configured on the wrapped Widget. Starting from `5.6.12`, stores with a configured `readUrl` or that belongs to
  a `CrudManager` configured with a `loadUrl`, will have their `syncDataOnLoad` default to `null`

### DEMOS

* [ANGULAR] Updated "Booking" Angular demo to use Angular components as renderers, which is located in the
  "examples/frameworks/angular/booking" folder ([#9270](https://github.com/bryntum/support/issues/9270))

### BUG FIXES

* [#8769](https://github.com/bryntum/support/issues/8769) - [HIGH PRIO] Resizing event weirdly behaving on `WeekView`
* [#8852](https://github.com/bryntum/support/issues/8852) - Clearing initial filters doesn't render the `ResourceTimeRanges`
* [#9213](https://github.com/bryntum/support/issues/9213) - Project `timeZone` config errors out
* [#9231](https://github.com/bryntum/support/issues/9231) - Disable recurring event confirmation pop-up does not work
* [#9278](https://github.com/bryntum/support/issues/9278) - Export to PDF hangs on scaled page
* [#9349](https://github.com/bryntum/support/issues/9349) - Scheduler crashes when state is updated

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.11 - 2024-05-21

### FEATURES / ENHANCEMENTS

* A new static boolean property, `Widget.accessibility` was added, which, when set to `true` causes tooltips to
  be activated on `focus` in addition to `mouseover` ([#5539](https://github.com/bryntum/support/issues/5539))
* Vanilla JavaScript documentation has a new section on Multiple Products, showing how to use multiple components in a
  single page using `thin` components ([#8756](https://github.com/bryntum/support/issues/8756))
* The `beforeDragCreateFinalize` event now includes the dates that the event will be created with ([#9125](https://github.com/bryntum/support/issues/9125))
* `CrudManager` has a new config called `includeChildrenInRemoveRequest`, that controls if a remove request includes the
  id of a removed parent and all its children, or just the id of the removed parent ([#8099](https://github.com/bryntum/support/issues/8099))

### API CHANGES

* After a docs regression, several APIs flagged to be hidden in subclasses were still visible in the docs. These APIs
  are now correctly hidden ([#9140](https://github.com/bryntum/support/issues/9140))

### BUG FIXES

* [#1048](https://github.com/bryntum/support/issues/1048) - Safari: Overscrolling timeline
* [#7719](https://github.com/bryntum/support/issues/7719) - Annual event recurrence is not set up correctly
* [#8978](https://github.com/bryntum/support/issues/8978) - [HIGH PRIO] Gantt ASPNET frontend example not building
* [#9097](https://github.com/bryntum/support/issues/9097) - Dragging event with snap doesn't seem to snap to correct time
* [#9115](https://github.com/bryntum/support/issues/9115) - Unexpected row highlight in `drag-from-tree` demo
* [#9211](https://github.com/bryntum/support/issues/9211) - Crash "Method cannot be called at this state" when drag-creating

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.10 - 2024-04-24

### FEATURES / ENHANCEMENTS

* You can now render custom HTML content inside a `GroupSummary` tooltip using the `tooltipTemplate` function. Try it
  out in the updated `groupsummary` example. ([#8752](https://github.com/bryntum/support/issues/8752))

### BUG FIXES

* [#3025](https://github.com/bryntum/support/issues/3025) - Resizing a column with preceding flexed columns moves the column being resized
* [#8533](https://github.com/bryntum/support/issues/8533) - [HIGH PRIO] [ANGULAR] Scheduler does not load if `direction: rtl` and `infiniteScroll: true` is set
* [#8934](https://github.com/bryntum/support/issues/8934) - Persist the event selection while the user is scrolling using dragging with the mouse
* [#8979](https://github.com/bryntum/support/issues/8979) - Creating event causing the auto zoom in timeline when no start date set to the scheduler
* [#8985](https://github.com/bryntum/support/issues/8985) - [HIGH PRIO] Smarter `EventStore` sync behavior for start / end dates
* [#8992](https://github.com/bryntum/support/issues/8992) - [ANGULAR] implement support of `ViewEncapsulation.ShadowDom`
* [#9004](https://github.com/bryntum/support/issues/9004) - Collapsed Group Header State is not Restored
* [#9027](https://github.com/bryntum/support/issues/9027) - `eventCopyPasteAction: clone` not working when `resourceIds` field is configured on `EventModel`

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.9 - 2024-04-09

### LOCALE UPDATES

* Added Brazilian Portuguese translation (`'PtBr'`) ([#8747](https://github.com/bryntum/support/issues/8747))

### BUG FIXES

* [#7267](https://github.com/bryntum/support/issues/7267) - Request for improved API for custom cell editors
* [#8259](https://github.com/bryntum/support/issues/8259) - [HIGH PRIO] Animated region collapse polish
* [#8508](https://github.com/bryntum/support/issues/8508) - Demo navigation buttons should be rotated in RTL
* [#8571](https://github.com/bryntum/support/issues/8571) - Drag from tree demo not working correctly
* [#8572](https://github.com/bryntum/support/issues/8572) - [HIGH PRIO] [REACT] Events disappear when scrolling and using JSX `eventRenderer` and
  `resourceTimeRanges`
* [#8667](https://github.com/bryntum/support/issues/8667) - [HIGH PRIO] Renderer Context demo event percentage circle showing undefined with new created event
* [#8728](https://github.com/bryntum/support/issues/8728) - Dates not serialized correctly when a `timeZone` is configured
* [#8729](https://github.com/bryntum/support/issues/8729) - Changing `timeZone` and updating event dates multiple time causes event to get incorrect dates
* [#8744](https://github.com/bryntum/support/issues/8744) - [HIGH PRIO] Events not rendering on drag scroll
* [#8768](https://github.com/bryntum/support/issues/8768) - Tooltip for a selector should not show if over a child of a delegate which has its own `data-btip`
  attribute
* [#8786](https://github.com/bryntum/support/issues/8786) - `EventMouseLeave` fires multiple times when multiple events are selected
* [#8919](https://github.com/bryntum/support/issues/8919) - Clicking `x` to close `EventEditor` popup does not trigger `afterEventEdit` event

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.8 - 2024-03-04

### BUG FIXES

* [#7297](https://github.com/bryntum/support/issues/7297) - Not navigable to next month if selected date is next month
* [#8635](https://github.com/bryntum/support/issues/8635) - Crash when pressing close button in event editor

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.7 - 2024-02-22

### FEATURES / ENHANCEMENTS

* If Scheduler is not provided with the viewport start date on creation, it now tries to use the project's start date,
  or calculates the earliest start date among all events
* The `renderer` of time axis header rows now includes a param letting you reference the Scheduler / Gantt instance in
  your header renderer. Useful when you want to add summary row to the header ([#8527](https://github.com/bryntum/support/issues/8527))

### BUG FIXES

* [#7046](https://github.com/bryntum/support/issues/7046) - Non working time ranges doesn't render properly on vertical mode
* [#7920](https://github.com/bryntum/support/issues/7920) - Fix `getAssignmentsForEvent` param type inside `AssigmentStoreMixin`
* [#8199](https://github.com/bryntum/support/issues/8199) - Events disappear when change window size with very varying row heights
* [#8209](https://github.com/bryntum/support/issues/8209) - App crashing when moving multiple JSX events and some aren't in view
* [#8268](https://github.com/bryntum/support/issues/8268) - Weekends disabled not reflected on Split view
* [#8372](https://github.com/bryntum/support/issues/8372) - Lift batching state of event and task records during the event/task partial resize events
* [#8423](https://github.com/bryntum/support/issues/8423) - [LWC] Engine performance is too low with LWS enabled
* [#8436](https://github.com/bryntum/support/issues/8436) - Returning `false` from `beforeAdd` when creating event by drag or double click resulting in crash
* [#8464](https://github.com/bryntum/support/issues/8464) - [REACT] - All events "flicker" when ever an event is dragged or created or resized
* [#8503](https://github.com/bryntum/support/issues/8503) - Event start time after drag drop when `fillTicks` is used
* [#8505](https://github.com/bryntum/support/issues/8505) - Row highlighted after pressing Enter in event edit
* [#8506](https://github.com/bryntum/support/issues/8506) - Event buttons not hidden after mouseout
* [#8528](https://github.com/bryntum/support/issues/8528) - [RTL] Events not visible when printing
* [#8537](https://github.com/bryntum/support/issues/8537) - Make private `cls` configs on `CalendarPanel` public
* [#8546](https://github.com/bryntum/support/issues/8546) - Missing row hover effect on event drag
* [#8558](https://github.com/bryntum/support/issues/8558) - Dependency is missing on the exported page
* [#8594](https://github.com/bryntum/support/issues/8594) - Resizing time-selection from both side produces error
* [#8597](https://github.com/bryntum/support/issues/8597) - `TimeAxisHeaderMenu`'s zoom slider disappear while zooming with it
* [#8609](https://github.com/bryntum/support/issues/8609) - End date field marked as invalid / red after changing event start date

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.6 - 2024-01-31

### FEATURES / ENHANCEMENTS

* Scheduler now stores its `startDate` and `endDate` values as part of its State storing mechanism.
* All frameworks demo applications have been verified and updated to be compatible with Node.js 20
* Bumped built-in FontAwesome Free to version `6.5.1`
* When editing very long events where the event bar extends outside the visible viewport, only the nearest 100 pixels of
  the bar are scrolled into the viewport rather than attempting to scroll the whole width into view. The minimum width
  to scroll in may be configured in the `eventEdit` feature using the `minEditSize` config property ([#8315](https://github.com/bryntum/support/issues/8315))
* Grid now saves the collapsed state of groups in its default state saving mechanism ([#8103](https://github.com/bryntum/support/issues/8103))

### API CHANGES

* To boost record creation performance, records now cache their `id` (it is accessed very frequently, helps performance
  a bit) and join their store(s) in a more efficient way. As a side effect, a record no longer has a `stores` array
  prior to joining a store, previously it was there as an empty array from start. We don't think this will affect any
  code, but wanted to share the change in case it does

### BUG FIXES

* [#7469](https://github.com/bryntum/support/issues/7469) - Wrong value of `expanded` when calling store `toJSON` method
* [#7707](https://github.com/bryntum/support/issues/7707) - [TYPESCRIPT] Update `timeAxisColumn` to be a property
* [#7720](https://github.com/bryntum/support/issues/7720) - `scrollResourceEventIntoView` not working for collapsed tasks
* [#7821](https://github.com/bryntum/support/issues/7821) - Issue with rendering recurring events with multi assign
* [#8000](https://github.com/bryntum/support/issues/8000) - Crash when right-clicking before drag creating in Booking demo
* [#8022](https://github.com/bryntum/support/issues/8022) - Hide validation tooltips in Popups as soon as the popup closes
* [#8102](https://github.com/bryntum/support/issues/8102) - State doesn't store to `localeStorage` on `shiftNext`/`shiftPrevious`
* [#8200](https://github.com/bryntum/support/issues/8200) - Webpack build failed with `.min.css` file
* [#8210](https://github.com/bryntum/support/issues/8210) - [HIGH PRIO] Strange row expansion when drag creating in `embedded-chart` demo
* [#8216](https://github.com/bryntum/support/issues/8216) - [HIGH PRIO] Error in summaries when expanding / collapsing resources
* [#8220](https://github.com/bryntum/support/issues/8220) - Exporting current view should not reset the time span
* [#8233](https://github.com/bryntum/support/issues/8233) - [HIGH PRIO] Dependencies to nested parent events, cause all child events to have an `offset`
* [#8240](https://github.com/bryntum/support/issues/8240) - `EventDragSelect` ignores selection after `close-to-edge-scroll`
* [#8282](https://github.com/bryntum/support/issues/8282) - `EventDragSelect` does not select milestones
* [#8288](https://github.com/bryntum/support/issues/8288) - Event content `overflow` not hidden in Firefox
* [#8291](https://github.com/bryntum/support/issues/8291) - [HIGH PRIO] Events are not visible when exporting infinitely scrollable scheduler
* [#8300](https://github.com/bryntum/support/issues/8300) - [HIGH PRIO] [ANGULAR] Html custom element can not be rendered inside `eventTooltip.template`
* [#8310](https://github.com/bryntum/support/issues/8310) - Timeline histogram with current timeline config triggering error
* [#8343](https://github.com/bryntum/support/issues/8343) - Focused tooltip throws errors when re-invoked by a new target
* [#8344](https://github.com/bryntum/support/issues/8344) - Event preamble/postamble element sizing/positioning doesn't change for RTL mode
* [#8373](https://github.com/bryntum/support/issues/8373) - `Cannot read properties of undefined (reading 'button')`

### FRAMEWORK SUPPORT

* NodeJS: `>= 14.0.0`
* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.5 - 2024-01-09

### BUG FIXES

* [#1480](https://github.com/bryntum/support/issues/1480) - Issue with Repeat event dialog on cancel changes
* [#7372](https://github.com/bryntum/support/issues/7372) - Improve performance of region resize
* [#7403](https://github.com/bryntum/support/issues/7403) - Make a guide on how to make a theme selector in frameworks
* [#7818](https://github.com/bryntum/support/issues/7818) - [TypeScript] Incorrect `RecurrenceModel` typing in typings
* [#7850](https://github.com/bryntum/support/issues/7850) - [Salesforce] Multi event select not selecting events in Salesforce
* [#7964](https://github.com/bryntum/support/issues/7964) - [REACT] JSX doesn't work in Popups
* [#8112](https://github.com/bryntum/support/issues/8112) - Drag not working between schedulers on responsive/mobile devices
* [#8119](https://github.com/bryntum/support/issues/8119) - Print dialog button should say `Print`
* [#8134](https://github.com/bryntum/support/issues/8134) - Dragging event close to edge does not trigger timeline scrolling
* [#8143](https://github.com/bryntum/support/issues/8143) - Group icon stopped handling click when `resourceCollapse` column added
* [#8153](https://github.com/bryntum/support/issues/8153) - Crash when right-clicking vertical time axis
* [#8177](https://github.com/bryntum/support/issues/8177) - `TimeAxisSubGrid` throws `"queueMicrotask is not a function"` exception
* [#8179](https://github.com/bryntum/support/issues/8179) - `ascending` config not working in `Group` feature

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.4 - 2023-12-21

### FEATURES / ENHANCEMENTS

* The `Labels` feature now skips rendering unnecessary elements for labels without content.

### API CHANGES

* `resourceTimeRangeRenderer` method from `ResourceTimeRanges` feature is now a config on the Scheduler, making it
  available in framework wrappers ([#8035](https://github.com/bryntum/support/issues/8035))

### DEMOS

* [ANGULAR] Added new "Timeline histogram" Angular demo which is located in the
  "examples/frameworks/angular/timelinehistogram" folder
* [REACT + VITE] Added new "Timeline histogram" React + Vite demo which is located in the
  "examples/frameworks/react-vite/timelinehistogram" folder
* [VUE 3 + VITE] Added new "Timeline histogram" Vue 3 + Vite demo which is located in the
  "examples/frameworks/vue-3-vite/timelinehistogram" folder

### BUG FIXES

* [#6224](https://github.com/bryntum/support/issues/6224) - Add event for `ColumnResize` to catch user resize action
* [#7542](https://github.com/bryntum/support/issues/7542) - Removing partner does not break the `timeAxis` link
* [#7958](https://github.com/bryntum/support/issues/7958) - Property `type` is missing in `DataFieldConfig`
* [#7973](https://github.com/bryntum/support/issues/7973) - `Timezone` wrong behavior when using `applyChangeset`
* [#8024](https://github.com/bryntum/support/issues/8024) - Event editor bottom toolbar missing top padding
* [#8027](https://github.com/bryntum/support/issues/8027) - Skip rendering empty labels
* [#8071](https://github.com/bryntum/support/issues/8071) - If `visibleDate` is set multiple times before paint, Scheduler goes into infinite loop
* [#8080](https://github.com/bryntum/support/issues/8080) - Missing `TimelineHistogram` component in Angular / React / Vue packages
* [#8081](https://github.com/bryntum/support/issues/8081) - Missing `TreeGrid` component in Angular / React / Vue packages
* [#8084](https://github.com/bryntum/support/issues/8084) - Hide `scrollable` config from Menu docs

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.3 - 2023-12-13

### FEATURES / ENHANCEMENTS

* Timeline zooming as enabled by the `zoomOnMouseWheel` config property now also responds to pinch-zoom touch gestures
  on touch devices
* [ANGULAR] New "Property booking" demo (Angular) showing a demo booking application, using `ResourceTimeRanges` and the
  `Summary` feature. The demo is located in `frameworks/angular/booking` folder ([#7769](https://github.com/bryntum/support/issues/7769))
* [REACT] Documentation in "Quick start", "Guide" and "React Tutorial" is now updated with how to build React
  application in Vite for higher efficiency and better performance in development

### API CHANGES

* [DEPRECATED] Please kindly note that `@bryntum/babel-preset-react-app` and
  `@bryntum/cra-template-typescript-scheduler`, `@bryntum/cra-template-javascript-scheduler` packages will not get any
  updates after `6.0.0` version

### BUG FIXES

* [#880](https://github.com/bryntum/support/issues/880) - Tabbing to partially visible event breaks event navigation
* [#1458](https://github.com/bryntum/support/issues/1458) - Tooltip jumps trying to follow by the `TimeRange` element
* [#7698](https://github.com/bryntum/support/issues/7698) - Remove overnesting from framework demos
* [#7716](https://github.com/bryntum/support/issues/7716) - Link is created to a task when trying to abort building the link
* [#7779](https://github.com/bryntum/support/issues/7779) - Dragging event in hidden resource causes exception
* [#7889](https://github.com/bryntum/support/issues/7889) - Adding a new event via `applyChangeSet` triggers auto sync
* [#7903](https://github.com/bryntum/support/issues/7903) - Dependencies arrows not working when set `fromSide`/`toSide` = `'top'`
* [#7929](https://github.com/bryntum/support/issues/7929) - PDF Export event bars not correctly rendered when dependencies enabled
* [#7946](https://github.com/bryntum/support/issues/7946) - Console error when use not adjusted `timeAxis` with specific configs
* [#7952](https://github.com/bryntum/support/issues/7952) - Can resize event out of original bounds
* [#7967](https://github.com/bryntum/support/issues/7967) - React Events with custom content disappearing during resize
* [#7970](https://github.com/bryntum/support/issues/7970) - Non-working days are not highlighted in an exported PDF
* [#7972](https://github.com/bryntum/support/issues/7972) - Event not shown when drag&drop between scheduler in fullscreen Mode
* [#7992](https://github.com/bryntum/support/issues/7992) - Crash after destroying scheduler and setting `timeZone` on the project when using `TimeRanges` features
* [#8006](https://github.com/bryntum/support/issues/8006) - [TypeScript] `ResourceModel` missing timeRanges in Docs/TS definition
* [#8015](https://github.com/bryntum/support/issues/8015) - Scheduler booking demo issues
* [#8017](https://github.com/bryntum/support/issues/8017) - Current timeline color is incorrect
* [#8020](https://github.com/bryntum/support/issues/8020) - Scheduler Stress Test Demo broken
* [#8036](https://github.com/bryntum/support/issues/8036) - Copy to clipboard doesn't work in some code blocks

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.2 - 2023-11-24

### FEATURES / ENHANCEMENTS

* Tooltips such as the one shown by the `EventTooltip` feature can now stay visible when mouse exits the target element
  which triggered the tooltip to show via the new `autoHide` config ([#4882](https://github.com/bryntum/support/issues/4882))
* `TimeRange` feature now offers to configure its `hoverTooltip` shown when hovering a range header element
* A CSS change (`max-width` on `.b-sch-event-content`) in the previous release that was meant to simplify making event
  content sticky in some scenarios turned out to mess styling up in others, and have now been reverted. It needs to be
  handled by the application where applicable instead

### API CHANGES

* The `year` `viewPreset` now renders a full year if not date range has been provided
* [DEPRECATED] The `eventBodyTemplate` function was deprecated in favor of returning the desired markup from an
  `eventRenderer` function. It will be removed in 6.0 ([#7288](https://github.com/bryntum/support/issues/7288))

### BUG FIXES

* [#7092](https://github.com/bryntum/support/issues/7092) - Feature mixin on-owner events are not exposed on class
* [#7716](https://github.com/bryntum/support/issues/7716) - Link is created to a task when trying to abort building the link
* [#7730](https://github.com/bryntum/support/issues/7730) - Scrollbar presence not synced correctly for partners in FF
* [#7839](https://github.com/bryntum/support/issues/7839) - `TooltipTemplate` not working in time selection feature
* [#7851](https://github.com/bryntum/support/issues/7851) - 0-duration TimeRange lines should float above event bars
* [#7883](https://github.com/bryntum/support/issues/7883) - Make column renderer more efficient
* [#7891](https://github.com/bryntum/support/issues/7891) - [REACT] `bigdataset` demo broken rendering

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.1 - 2023-11-17

### FEATURES / ENHANCEMENTS

* A new config property, `hideRowHover` may be set to `false` to indicate that the row hover background effect should
  also apply in the Scheduler.
* Event content elements (`.b-sch-event-content`) now use a `max-width` by default in horizontal mode, that prevents
  overflow in more scenarios when using sticky events ([#7812](https://github.com/bryntum/support/issues/7812))
* The `beforeEventDropFinalize` event now includes a new property `dropData` in the `context` argument, please consult
  the docs for details ([#7367](https://github.com/bryntum/support/issues/7367)).
* [REACT] Added new React Context demo that shows how to use state together with React renderers. The demo is located
  in `examples/frameworks/react-vite/renderer-context` folder ([#7747](https://github.com/bryntum/support/issues/7747))

### BUG FIXES

* [#3865](https://github.com/bryntum/support/issues/3865) - Conflicts when using both `RowCopyPaste` and `EventCopyPaste` features with Scheduler
* [#4838](https://github.com/bryntum/support/issues/4838) - Vertical mode missing top padding for rounded event style
* [#5719](https://github.com/bryntum/support/issues/5719) - [YARN] Can not install `@bryntum` product packages using yarn v2/v3
* [#6035](https://github.com/bryntum/support/issues/6035) - Scheduler with filter not doing Excel Export correctly
* [#6726](https://github.com/bryntum/support/issues/6726) - Events near the right edge of timeline disappear when scroll
* [#7454](https://github.com/bryntum/support/issues/7454) - Scheduler crashes when setting both `timeRanges` and onChange prop on `BryntumProjectModel`
* [#7457](https://github.com/bryntum/support/issues/7457) - `onChange` function becomes field in Scheduler Pro `ProjectModel`
* [#7585](https://github.com/bryntum/support/issues/7585) – [REACT] Start and end date is not updating in event content
* [#7711](https://github.com/bryntum/support/issues/7711) - `ScheduleTooltip` showing wrong time across DST changes
* [#7750](https://github.com/bryntum/support/issues/7750) - Vite error `@charset must precede all other statements`
* [#7754](https://github.com/bryntum/support/issues/7754) - [Frameworks] Thin packages not working with `pnpm`
* [#7764](https://github.com/bryntum/support/issues/7764) - Grid row hover effect lost when mouseovering events
* [#7773](https://github.com/bryntum/support/issues/7773) - Crash when dragging event with connected non-rendered event
* [#7793](https://github.com/bryntum/support/issues/7793) - Error thrown in Nested Events example when dragging an event
* [#7820](https://github.com/bryntum/support/issues/7820) - `globalThis` should be defined in locales to support LWC
* [#7841](https://github.com/bryntum/support/issues/7841) - The header menu's "Show current timeline" does not work

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.0 - 2023-10-26

### FEATURES / ENHANCEMENTS

* This release introduces a new set of npm packages and framework components, that allows combining multiple Bryntum
  products in the same application. These packages contain the product specific code only, as opposed to the current
  packages that has all code for the products each product builds upon (for example Scheduler contains Grid & Core).
  The new packages are called `thin` packages, and moving forward it will be the recommended way of using Bryntum
  products in npm based applications (for all supported frameworks). See the "What's new" guide for more information
* `ResourceTimeRanges` feature now support rendering custom html into its range elements, via the new
  `resourceTimeRangeRenderer` method available on the Scheduler class ([#4922](https://github.com/bryntum/support/issues/4922))
* The `Dependencies` feature now allow configuring the size (`terminalSize`) and offset (`terminalOffset`) from the
  event bar for terminals (connection points shown when hovering the bar). This lets you position the terminals fully
  inside or fully outside the bar. It also allows configuring delays before showing (`terminalShowDelay`, to require an
  intentional hover on an event bar) and hiding (`terminalHideDelay`, to allow hide animations, and to be more
  forgiving) them. The `dependencies` demo was updated to allow experimenting with these new options
* CSS for milestones was slightly simplified thanks the conversion to use grid layout for event bars back in 5.0. If you
  use custom styling for milestones, you might need to update it
* Time ranges now support recurrence out of the box, you no longer have to subclass and mix `RecurringTimeSpan` manually
  ([#7217](https://github.com/bryntum/support/issues/7217))
* Milestone rendering was slightly tweaked for better visuals, milestones that overlap an events end date are now moved
  to the next band, although technically they do not overlap (since end dates are exclusive)
* [TypeScript] Functions and events declarations in typings were improved to contain all available parameters and return
  type ([#6961](https://github.com/bryntum/support/issues/6961), [#4456](https://github.com/bryntum/support/issues/4456))
* Added a `Print` feature based on `PdfExport` feature which allows using browser print dialog and not rely on backend
  ([#6218](https://github.com/bryntum/support/issues/6218))
* `@bryntum/scheduler-thin` bundle includes scss theme files in `sass/themes` folder ([#7445](https://github.com/bryntum/support/issues/7445))
* It is now possible to use asymmetrical `resourceMargin` by assigning an object with `start` (margin top in horizontal
  mode, margin left in vertical mode) and `end` (margin bottom / margin right) properties ([#6185](https://github.com/bryntum/support/issues/6185))
* `ResourceHeader.headerRenderer` can now return a JSX with the React component which will do the actual rendering. The
  demo is located in `examples/frameworks/react/javascript/vertical` ([#762](https://github.com/bryntum/support/issues/762), [#5808](https://github.com/bryntum/support/issues/5808))
* The `Group` feature may now group by multi-value fields meaning that rows may be a member of more than one group.
  See the new `multi-groups` example for a demonstration ([#7349](https://github.com/bryntum/support/issues/7349))
* The `TreeGroup` feature may now group by multi-value fields meaning that rows may be a member of more than one group.
  See the new `multi-treegroups` example for a demonstration ([#7365](https://github.com/bryntum/support/issues/7365))
* New `RowResize` feature allowing user to drag bottom row border to change row height ([#2843](https://github.com/bryntum/support/issues/2843))

### API CHANGES

* [BREAKING] `Core.util.helper.Point` class has been moved to solve circular module dependencies. It is now a named
  export of the `Core.util.helper.Rectangle` module. Check upgrading guide for the details
* `visibleDate` config now aligns the passed date with `block : start` by default during instantiation time
* The behavior of the `DateTimeField` has changed when it is used with `StartDateField` as its date component.
  If the value of the date field will be changed with the increment buttons, the result of the increment will update
  both date and time fields. Previously the value of time field was always preserved. This is only a breaking change if
  you are using calendars with non-working time ([#7038](https://github.com/bryntum/support/issues/7038))
* [BREAKING] [TypeScript] `ScrollOptions` typedef has been renamed to `BryntumScrollOptions` to not interfere with
  TypeScript interface `ScrollOptions`. Check upgrading guide for the details ([#7385](https://github.com/bryntum/support/issues/7385))
* [FRAMEWORKS] New `BryntumSchedulerProjectModel` wrapper component has been added. Please check "Data binding"
  framework guides for the details
* The behaviour of the `ViewPresetCombo` has been changed to better align with the functionality of "zooming".
  Additionally, there is a new config, `useFixedDuration`, that defaults to `true`. This will ensure that a `ViewPreset`
  always starts and ends with its default `mainUnit` ([#7448](https://github.com/bryntum/support/issues/7448))
* [STYLING] Default style of `TimeRange` border-lines was changed from `dotted` to `solid`
* [STYLING] Default `text-transform` style of TimeAxis text in the Stockholm theme was changed from `uppercase` to
  `unset`
* [STYLING] The DOM placement of the various canvas layers (time ranges, column lines, etc.) were changed. If you
  have styled time range elements using location specific CSS selectors, you should review and ensure that your custom
  styling is applied

### BUG FIXES

* [#3212](https://github.com/bryntum/support/issues/3212) - Destroyed scheduler still handles events
* [#7327](https://github.com/bryntum/support/issues/7327) - Milestone overlaps milestone doesn't get detected
* [#7497](https://github.com/bryntum/support/issues/7497) - Layers demo issues

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.5.5 - 2023-10-23

### API CHANGES

* TimeSpan `setStartEndDate` will now throw an Error if passing a `start` value greater than `end`
* `resumeRefresh()` will trigger a repaint by default as of `6.0.0`
* [PERFORMANCE] Using `syncDataOnLoad` will now only yield a single repaint of events
* [DEPRECATED] The `PickerField.autoClose` config is no longer meaningful, it has been deprecated and will be removed
  in `6.0.0`
* Added `lockLayout` config on event resize feature to prevent events moving vertically during resize. This will be the
  default behaviour from version `6.0.0` ([#7058](https://github.com/bryntum/support/issues/7058))
* `processItems` method now allows async validation to fix up the menu items ([#4855](https://github.com/bryntum/support/issues/4855))

### BUG FIXES

* [#928](https://github.com/bryntum/support/issues/928) - [React] `onPaint` does not work whereas paint listener does
* [#1978](https://github.com/bryntum/support/issues/1978) - Setting `scheduler.partner` to `undefined` fails
* [#3744](https://github.com/bryntum/support/issues/3744) - Drop location invalid if start date is before schedule start when dragging from grid
* [#4870](https://github.com/bryntum/support/issues/4870) - Packed events overlap when `fillTicks` is `true` and times don't overlap
* [#6654](https://github.com/bryntum/support/issues/6654) - Issues combining `infiniteScroll` with zoom
* [#7462](https://github.com/bryntum/support/issues/7462) - Resource combo doesn't close when event editor closed
* [#7626](https://github.com/bryntum/support/issues/7626) - Hard to reach dependency handlers with adjacent events
* [#7631](https://github.com/bryntum/support/issues/7631) - Mapping of `startDate` not respected by time zone calculation
* [#7635](https://github.com/bryntum/support/issues/7635) - Event styling broken in Vue demo
* [#7678](https://github.com/bryntum/support/issues/7678) - `titleRenderer` not honoured if editor is not floating
* [#7687](https://github.com/bryntum/support/issues/7687) - Scheduler Drag selection & click outside does not deselect the events properly
* [#7704](https://github.com/bryntum/support/issues/7704) - Highlight timespan bug on scroll

## 5.5.4 - 2023-10-05

### FEATURES / ENHANCEMENTS

* A warning is now shown on console if an event is initially assigned to the same resource multiple times. That scenario
  is not supported and may lead to visual glitches

### BUG FIXES

* [#7479](https://github.com/bryntum/support/issues/7479) - Events are disappearing on vertical scroll
* [#7516](https://github.com/bryntum/support/issues/7516) - Subsequent filter actions only consider initially filtered events
* [#7534](https://github.com/bryntum/support/issues/7534) - Aligning tooltip to a Point, with `[x, y]` offsets should work
* [#7563](https://github.com/bryntum/support/issues/7563) - Combo value not updated in the input is some cases
* [#7583](https://github.com/bryntum/support/issues/7583) - `TimeZonedDatesMixin` `timeZone` field missing null typing

## 5.5.3 - 2023-09-15

### FEATURES / ENHANCEMENTS

* All records that is added (not loaded) to a Store which belongs to a Project that has a `timeZone` configured, is
  treated as "in" the configured time zone which means no time zone conversion will be applied to these record's dates.
  It is now possible to change this behaviour by setting the `timeZone` field on a record before adding it to the Store.
  Set it to another `IANA time zone` or `null` to apply time zone conversion to the added records
* New `fieldfilters` demo showing how to add multi-filter UI working with a Scheduler. Demo is located in
  `examples/fieldfilters` folder
* [React][Vite] New big dataset demo with enabled JSX event rendering. Demo is located in
  `examples/frameworks/react-vite/bigdataset` folder

### BUG FIXES

* [#6332](https://github.com/bryntum/support/issues/6332) - Double-clicking on the timeaxis cell open and close the task editor immediately
* [#6373](https://github.com/bryntum/support/issues/6373) - Change Resource's Recurring Events not updating Scheduler
* [#6823](https://github.com/bryntum/support/issues/6823) - Next event always scrolled into view after focused event deletion
* [#6869](https://github.com/bryntum/support/issues/6869) - Wrong `endDate` when create event in DST change date
* [#7012](https://github.com/bryntum/support/issues/7012) - `syncDataOnLoad` breaks time zone conversion
* [#7076](https://github.com/bryntum/support/issues/7076) - Scheduler zoomIn/zoomOut doesn't keep center well
* [#7305](https://github.com/bryntum/support/issues/7305) - Error when drag invisible events when `managedEventSizing` is `false` in `dragselection`
* [#7355](https://github.com/bryntum/support/issues/7355) - `ResourceTimeRanges` not showing if `ResourceStore` has filters
* [#7398](https://github.com/bryntum/support/issues/7398) - `CrudManager` allows a load operation to append records. But they are then syncable
* [#7412](https://github.com/bryntum/support/issues/7412) - Compress non-working time example on bryntum is crashing on zoom
* [#7428](https://github.com/bryntum/support/issues/7428) - Changing timeZone doesn't move recurring `ResourceTimeRange`

## 5.5.2 - 2023-08-30

### FEATURES / ENHANCEMENTS

* You can now prevent row selection when clicking an event bar with the new `selectResourceOnEventNavigate` flag
  ([#7337](https://github.com/bryntum/support/issues/7337))
* You can now prevent row selection when clicking the empty area of a time axis cell bar with the new
  `selectResourceOnScheduleClick` flag ([#7317](https://github.com/bryntum/support/issues/7317))

### BUG FIXES

* [#1491](https://github.com/bryntum/support/issues/1491) - `TaskEdit` resets end time when user changes `startDate`
* [#2900](https://github.com/bryntum/support/issues/2900) - Adding to `resourceStore` and `resourceTimeRangeStore` doesn't update reference
* [#3773](https://github.com/bryntum/support/issues/3773) - Center date is moved when partner is added
* [#7244](https://github.com/bryntum/support/issues/7244) - Adding recurring events - only first event is selectable
* [#7283](https://github.com/bryntum/support/issues/7283) - `SchedulerTooltip` `mouseOffset` stack overflow
* [#7312](https://github.com/bryntum/support/issues/7312) - `scrollEventIntoView` not working correctly
* [#7316](https://github.com/bryntum/support/issues/7316) - Event bar disappears on drop when async listener used
* [#7346](https://github.com/bryntum/support/issues/7346) - Reordering column added at runtime makes split scheduler crash
* [#7379](https://github.com/bryntum/support/issues/7379) - Support showing `EventTooltip` on click
* [#7380](https://github.com/bryntum/support/issues/7380) - Inconsistent event firing of `beforeEventSelectionChange` and `eventSelectionChange`
* [#7381](https://github.com/bryntum/support/issues/7381) - Hiding dependency creation tooltip causes crash

## 5.5.1 - 2023-08-16

### API CHANGES

* We added two public methods - `suspendChangeTracking` and `resumeChangeTracking` to suspend and resume
  `hasChanges`/`noChanges` events on a `CrudManager`
* The icon element inside `TimeRange` elements was moved outside the label to simplify styling

### BUG FIXES

* [#6456](https://github.com/bryntum/support/issues/6456) - Event bar jumps to past when drag-n-drop in 5 year zoom level
* [#6994](https://github.com/bryntum/support/issues/6994) - Error when zoom change when `infiniteScroll`is enabled
* [#7168](https://github.com/bryntum/support/issues/7168) - Bug in exporting PDF when non-working time is filtered
* [#7203](https://github.com/bryntum/support/issues/7203) - `onVisibleDateRangeChange` is not subscriber on `visibleDateRangeChange` event but separated method
* [#7207](https://github.com/bryntum/support/issues/7207) - Wrong typing for `record.setAsync` method
* [#7212](https://github.com/bryntum/support/issues/7212) - `MultiAssignments` with `resourceIds` clone issue
* [#7224](https://github.com/bryntum/support/issues/7224) - `isCreating` flag gets "stuck" if the edit is vetoed
* [#7247](https://github.com/bryntum/support/issues/7247) - Splitting a read-only Scheduler does not make splits read-only
* [#7254](https://github.com/bryntum/support/issues/7254) - Renderer method of Group Summary doesn't trigger properly on smaller screen
* [#7259](https://github.com/bryntum/support/issues/7259) - Missing typings in `ResourceUtilizationFeaturesConfigType` after upgrading to version `5.4.0`
* [#7272](https://github.com/bryntum/support/issues/7272) - Time range header element out of sync with its body after element after resize is cancelled
* [#7280](https://github.com/bryntum/support/issues/7280) - Only one listener per event is relayed to splits
* [#7284](https://github.com/bryntum/support/issues/7284) - Event drag proxy misplaced when body has margin
* [#7289](https://github.com/bryntum/support/issues/7289) - `deselectAllOnScheduleClick` set to `false` not working as expected
* [#7293](https://github.com/bryntum/support/issues/7293) - Row animation visible during PDF Export

## 5.5.0 - 2023-07-31

* This release is a replacement for the 5.4.3 patch release. It was changed to a minor version because of some larger
  changes behind the scenes to pave the way for future support for live updates in Scheduler Pro and Gantt.

### FEATURES / ENHANCEMENTS

* Scheduler now extends `Grid.feature.RowReorder` feature. You do not need to make any changes unless you were extending
  it or imported from sources. If you did, you need to change base class to the new one
* New `custom-event-rendering` demo showing how to render custom elements into the event bar
* New `custom-event-buttons` demo showing how to render custom buttons into the event bar
* New `airport` demo showing custom event bar styling for an airport

### BUG FIXES

* [#7205](https://github.com/bryntum/support/issues/7205) - Events not displaying with `eventStore.applyChangeset`
* [#7221](https://github.com/bryntum/support/issues/7221) - [VUE] Vue vite app doesn't compile with Bryntum vue wrappers
* [#7229](https://github.com/bryntum/support/issues/7229) - Assignments not saved correctly while create new event when use store's URLs to save data

## 5.4.2 - 2023-07-26

### FEATURES / ENHANCEMENTS

* The `Split` feature now relays listeners to all splits, and it also relays a (configurable) subset of the scheduler's
  configs at runtime ([#7200](https://github.com/bryntum/support/issues/7200), [#7201](https://github.com/bryntum/support/issues/7201))

### BUG FIXES

* [#6268](https://github.com/bryntum/support/issues/6268) - ApplyChangeset On Event Store Not Change Custom Fields
* [#6995](https://github.com/bryntum/support/issues/6995) - [VUE] An exception when use `workingTime` config in calendar timeline view
* [#7162](https://github.com/bryntum/support/issues/7162) - `EventDrag` copy enabled even when disabled
* [#7173](https://github.com/bryntum/support/issues/7173) - `Tooltip` clocks do not update while dragging `TimeRange` header element
* [#7180](https://github.com/bryntum/support/issues/7180) - Event dragged from split gets stuck on header
* [#7197](https://github.com/bryntum/support/issues/7197) - `scrollEventIntoView` sometimes do not return a result to promise

## 5.4.1 - 2023-07-13

### FEATURES / ENHANCEMENTS

* We have created a public repository to showcase Salesforce demos. All previous demos are merged into one Lightning
  Application which is easy to install to a new scratch org. You can find more information in updated guides and in this
  repository: https://github.com/bryntum/bryntum-salesforce-showcase#bryntum-salesforce-showcase
* We have created a public Salesforce org where this app is preinstalled. You can find link to it and login credentials
  on the updated examples page

### BUG FIXES

* [#1751](https://github.com/bryntum/support/issues/1751) - Group renderer for timeaxis column duplicates content on group collapse
* [#6077](https://github.com/bryntum/support/issues/6077) - [TypeScript] `Model` constructors should allow second param
* [#6987](https://github.com/bryntum/support/issues/6987) - [REACT] React component is not rendered correctly on expand / collapse
* [#7040](https://github.com/bryntum/support/issues/7040) - `nonWorkingTime` has an offset when `timeZone` used
* [#7043](https://github.com/bryntum/support/issues/7043) - `enableMouseEvents` state for `resourceNonWorkingTime` affects on event drop behaviour
* [#7099](https://github.com/bryntum/support/issues/7099) - Dependency creation validates not correct when move cursor fast
* [#7104](https://github.com/bryntum/support/issues/7104) - `scheduleMouseEnter` & `scheduleMouseLeave` incorrectly fired & documented
* [#7105](https://github.com/bryntum/support/issues/7105) - `startDate` and `endDate` not correct when pasting from other Scheduler
* [#7114](https://github.com/bryntum/support/issues/7114) - Should rewrite the label of current time from initial config
* [#7117](https://github.com/bryntum/support/issues/7117) - When splitting horizontally outside resource row, split feature splits vertically
* [#7118](https://github.com/bryntum/support/issues/7118) - Splitting while event is selected throws console error
* [#7132](https://github.com/bryntum/support/issues/7132) - Calendar `ResourceFilter` change listener has wrong 'oldValue' on select

## 5.4.0 - 2023-06-30

### FEATURES / ENHANCEMENTS

* This release introduces a new `TimelineHistogram` class which implements a grid with histogram charts displayed
  for rows in the timeaxis section. Please check the new
  [Timeline histogram demo](https://bryntum.com/examples/scheduler/timelinehistogram/) and the "Timeline histogram"
  guide for more details
* The `EventCopyPaste` feature has been enhanced to use a page-global internal clipboard and also supports the browser's
  native Clipboard API if accessible. This means that it is possible to copy and paste events between multiple instances
  of Scheduler or other Grid-based components. It is also possible to copy an event and paste it inside a Spreadsheet
  app like Excel ([#5308](https://github.com/bryntum/support/issues/5308))
* `Widget` has a new config, `maximizeOnMobile` which takes effect only on `floating` widgets on a mobile device. It
  causes the widget to be maximized instead of positioned in order to accommodate the mobile virtual keyboard. This will
  make event editing much easier to use on mobile devices ([#6522](https://github.com/bryntum/support/issues/6522))
* On mobile devices, `type : 'checkbox'` is rendered as a `slidetoggle` widget. The API and value is the same, it is
  just a more appropriate UI for the platform
* We have added default editors for the `eventColor` field. There is one in the `EventMenu` feature's context menu
  and one in the `EventEdit` feature's event editing panel. Just set `showEventColorPickers` to true and the editors
  will appear
* There is also a new `EventColorColumn` which can be added to any Scheduler. It renders a colored element which the
  user can click and select a new color for each event
* Schedule has a new `Split` feature, that allows splitting the schedule into multiple parts (horizontally, vertically
  or both ways). Try it out in the new `split` demo ([#3917](https://github.com/bryntum/support/issues/3917))
* `EventModel` has a new `resourceIds` field, that can be used to assign multiple resources
  to the event without having to use assignment records ([#6502](https://github.com/bryntum/support/issues/6502))
* For a slightly better docs experience for most users, the docs browser now by default hides some more obscure APIs
  normally only used when implementing own widgets and features. Advanced users in need of these APIs can still opt in
  to see them using the `Show` menu in the docs browser
* Added new `multiassign-resourceids` demo showing event `resourceIds` field usage ([#6936](https://github.com/bryntum/support/issues/6936))

### API CHANGES

* The `EventCopyPaste` feature's `copyEvents` and `pasteEvents` has been made asynchronous due to the enhancements
  mentioned above
* The `EventCopyPaste` feature's `beforeCopy` and `beforePaste` events is now asynchronously preventable

### BUG FIXES

* [#5553](https://github.com/bryntum/support/issues/5553) - `reapplyFilterOnAdd` doesn't work when adding resources before loading
* [#6717](https://github.com/bryntum/support/issues/6717) - `EventEditor` bottom padding missing when setting scheduler to `readOnly = true`
* [#7077](https://github.com/bryntum/support/issues/7077) - Splitting scheduler with scrolled timeline leads to broken header
* [#7078](https://github.com/bryntum/support/issues/7078) - Paste Event menu option is visible without copying anything

## 5.3.8 - 2023-06-28

### FEATURES / ENHANCEMENTS

* [PERFORMANCE] Scheduler now offers a `ignoreDomEventsWhileScrolling` config which you can set to `true` to ignore DOM
  events fired while scrolling to maximize scroll performance

### BUG FIXES

* [#7034](https://github.com/bryntum/support/issues/7034) - STM exception when double-clicking in partly visible resource
* [#7060](https://github.com/bryntum/support/issues/7060) - [PERFORMANCE] Prevent partnering header that is hidden

## 5.3.7 - 2023-06-20

### FEATURES / ENHANCEMENTS

* `EventSelection` now offers a `deselectAllOnScheduleClick` flag to control if selection should be cleared when
  clicking the empty schedule area ([#6964](https://github.com/bryntum/support/issues/6964))

### BUG FIXES

* [#3530](https://github.com/bryntum/support/issues/3530) - State tracking manager logs incorrect steps when adding new event
* [#6389](https://github.com/bryntum/support/issues/6389) - Drag-and-Drop bug when `constrainDragToTimeSlot` set to true
* [#6589](https://github.com/bryntum/support/issues/6589) - Touch moving event to the edge of the scheduler does not scroll the view on some browsers
* [#6641](https://github.com/bryntum/support/issues/6641) - Zooming with mouse wheel broken in RTL
* [#6757](https://github.com/bryntum/support/issues/6757) - Event wrongly positioned when some specific dates used with workingTime setting
* [#6801](https://github.com/bryntum/support/issues/6801) - Paste event doesn't contain the pasted records in eventRecords
* [#6874](https://github.com/bryntum/support/issues/6874) - Fix docs and typing for `eventColor` field
* [#6875](https://github.com/bryntum/support/issues/6875) - Resource headers not rendered in vertical mode if no events exist in the initial time span
* [#6876](https://github.com/bryntum/support/issues/6876) - Preset switching in Vertical mode issue
* [#6889](https://github.com/bryntum/support/issues/6889) - Phantom event element after dragging event holding shift
* [#6908](https://github.com/bryntum/support/issues/6908) - Console error when `eventDrag` feature disabled but `dependencies` used
* [#6940](https://github.com/bryntum/support/issues/6940) - [REACT] Tooltip shows wrong time
* [#6982](https://github.com/bryntum/support/issues/6982) - [REACT] `renderEvent` not triggering
* [#7016](https://github.com/bryntum/support/issues/7016) - Context menu event creation adds the event even when canceling the event editor with `[Cancel]` button

## 5.3.6 - 2023-05-26

### API CHANGES

* [DEPRECATED] Deprecated the `getEvents()` function of `ResourceModel`, in favor of using the `events` property

### BUG FIXES

* [#6132](https://github.com/bryntum/support/issues/6132) - ScrollTo functionality does not work with `infiniteScroll` enabled
* [#6689](https://github.com/bryntum/support/issues/6689) - Setting `startDate` in EventEditor to null corrupts dates
* [#6693](https://github.com/bryntum/support/issues/6693) - Multi assigned events not rendering properly when scrolling fast
* [#6707](https://github.com/bryntum/support/issues/6707) - It deletes the two events instead one when undo after a shift copy
* [#6719](https://github.com/bryntum/support/issues/6719) - Bad styling
* [#6723](https://github.com/bryntum/support/issues/6723) - Broken rendering after changing resource column width with grouping enabled
* [#6759](https://github.com/bryntum/support/issues/6759) - [LWC] Exception is triggered when creating a dependency
* [#6777](https://github.com/bryntum/support/issues/6777) - Method cannot be called at this state!
* [#6782](https://github.com/bryntum/support/issues/6782) - Displaying a tooltip while the data is being updated throws errors
* [#6785](https://github.com/bryntum/support/issues/6785) - `eventDragSelect` does not clear previous selection
* [#6816](https://github.com/bryntum/support/issues/6816) - [REACT] `TypeError: _a.features may be undefined`

## 5.3.5 - 2023-05-11

### FEATURES / ENHANCEMENTS

* The `ResourceFilter` widget may now be configured to also filter the `resourceStore` by configuring `filterResources`
  as `true` ([#6698](https://github.com/bryntum/support/issues/6698))
* New demo showing drag from external grid onto a Tree Scheduler. Demo is located in `examples/drag-from-grid-to-tree`
  folder
* Added `eventClick` for nested events in the scheduler example called 'Nested events' ([#6412](https://github.com/bryntum/support/issues/6412))
* Column widths and hide/show state are synced between partnered schedulers with identical column sets ([#6682](https://github.com/bryntum/support/issues/6682))

### BUG FIXES

* [#6384](https://github.com/bryntum/support/issues/6384) - Inconsistent tool order in header of inline collapsed panel
* [#6659](https://github.com/bryntum/support/issues/6659) - Artefact in web sockets demo
* [#6663](https://github.com/bryntum/support/issues/6663) - Bad colors for selected event in react event renderer demo
* [#6664](https://github.com/bryntum/support/issues/6664) - Flicker when event resize starts
* [#6680](https://github.com/bryntum/support/issues/6680) - `TimeAxisViewModel` should round calculated start date to top header increment if possible
* [#6681](https://github.com/bryntum/support/issues/6681) - `DatePicker`'s `activeDate` should persist while it is focused
* [#6699](https://github.com/bryntum/support/issues/6699) - Should record only 1 STM transaction for drag-create and following task edit user actions
* [#6701](https://github.com/bryntum/support/issues/6701) - [IONIC] `Scrollbar` width could not be determined under Ionic framework
* [#6730](https://github.com/bryntum/support/issues/6730) - Multiple events are draggable even when `multiEventSelect` is `false`

## 5.3.4 - 2023-04-28

### FEATURES / ENHANCEMENTS

* CrudManager now optionally includes the owning Scheduler's `startDate` and `endDate` as params in its load requests,
  via the `passStartEndParameters` config flag in Scheduler ([#6552](https://github.com/bryntum/support/issues/6552))

### BUG FIXES

* [#6403](https://github.com/bryntum/support/issues/6403) - Dropping events past noon gives unexpected results
* [#6438](https://github.com/bryntum/support/issues/6438) - Support `stickyEvents` feature in RTL mode
* [#6584](https://github.com/bryntum/support/issues/6584) - Row select blinking on mobile after first select
* [#6645](https://github.com/bryntum/support/issues/6645) - Rendering breaks having two schedulers using different viewpresets
* [#6647](https://github.com/bryntum/support/issues/6647) - Tooltip offset increase on every show when dependencies feature enabled
* [#6652](https://github.com/bryntum/support/issues/6652) - Minified UMD bundle does not export `bryntum` namespace

## 5.3.3 - 2023-04-21

### FEATURES / ENHANCEMENTS

* New `state` demo showing how to implement saving of UI state in the Scheduler
* `EventDragSelect` now offer to extend selections by pressing CTRL or CMD-key ([#6536](https://github.com/bryntum/support/issues/6536))
* Scheduler now shows a group divider line between resource groups in vertical mode ([#6568](https://github.com/bryntum/support/issues/6568))
* `ResourceTimeRanges` can now be recurring out of the box, without the need for mixing in recurrence support on the
  store and model classes ([#6611](https://github.com/bryntum/support/issues/6611))
* [ANGULAR] Bryntum Scheduler now ships with two npm Angular wrapper packages to support different versions of Angular
  framework. Existing `@bryntum/scheduler-angular` package is now designed to work with Angular 12 and newer versions,
  which use the IVY rendering engine. New `@bryntum/scheduler-angular-view` package is designed to work with Angular 11
  and older versions, which use the View Engine rendering. Check Upgrading and Angular integration guides in
  documentation for more information ([#6270](https://github.com/bryntum/support/issues/6270))
* [ANGULAR] `angular-11-routing` demo has been upgraded to show use of `@bryntum/scheduler-angular-view` package with
  Angular 11. Demo is located in `examples/frameworks/angular/angular-11-routing/` folder
* [ANGULAR] `basic`, `dependencies`, `drag-between-schedulers`, `drag-onto-tasks`, `filtering`, `localization`,
  `pdf-export`, `recurring-events` and `tasks` demos have been upgraded to use Angular 15. Demos are located in
  subfolders inside `examples/frameworks/angular/` folder
* [ANGULAR] legacy `angular-6`, `angular-7` and `angular-8` demos has been removed

### API CHANGES

* Time axis filters that produce an empty timeline are now temporarily disabled while you zoom. Filters should ideally
  check the `scheduler.timeaxis.unit` property to only apply it to relevant zoom levels

### BUG FIXES

* [#6070](https://github.com/bryntum/support/issues/6070) - Filtering `timeAxis` to exclude weekends produces wrong results
* [#6411](https://github.com/bryntum/support/issues/6411) - Dependencies not redrawn when filtering rows in tree view
* [#6415](https://github.com/bryntum/support/issues/6415) - `zoomIn`/`zoomOut` doesn't work properly with RTL + `zoomPosition`
* [#6426](https://github.com/bryntum/support/issues/6426) - [REACT] Portals are re-created while resizing event
* [#6436](https://github.com/bryntum/support/issues/6436) - `ZoomIn`/`zoomOut` does not keep center when RTL direction used
* [#6439](https://github.com/bryntum/support/issues/6439) - Timeline jumps to wrong dates when change direction to RTL at runtime with `infiniteScroll` enabled
* [#6547](https://github.com/bryntum/support/issues/6547) - `TimeSpan` timeZone-field missing in types
* [#6551](https://github.com/bryntum/support/issues/6551) - Drag create shows invalid when using `showExactResizePosition` in 1 month increment resolution
* [#6555](https://github.com/bryntum/support/issues/6555) - Nothing is displayed when having a single resource with variable resource widths
* [#6567](https://github.com/bryntum/support/issues/6567) - Scheduler should only respond to `datachange` when visible
* [#6569](https://github.com/bryntum/support/issues/6569) - Dependencies feature disables `eventTooltip`'s offset config
* [#6592](https://github.com/bryntum/support/issues/6592) - The tooltip does not display well and is cut off on the right side
* [#6593](https://github.com/bryntum/support/issues/6593) - Toggling `EventResize` disabled state does not show resize handles

## 5.3.2 - 2023-04-04

### FEATURES / ENHANCEMENTS

* [REACT] Added new TypeScript demo "Drag from Grid". Demo is located in
  `examples/frameworks/react/typescript/drag-from-grid` ([#4891](https://github.com/bryntum/support/issues/4891))
* The `crudmanager` demo was updated to use a more extensive PHP + MySQL backend, based on the backend from the `php`
  demo in Gantt

### API CHANGES

* The time resolution increment for the `minuteAndHour` view preset was changed from 30 minutes to 15 minutes, plus
  the zoom order was slightly adjusted to prevent resolution increment from increasing when zooming in ([#6446](https://github.com/bryntum/support/issues/6446))

### BUG FIXES

* [#3789](https://github.com/bryntum/support/issues/3789) – `UndoRedo` widget doesn't catch the project if configured standalone in Angular
* [#5546](https://github.com/bryntum/support/issues/5546) - Event drag create when using `showExactResizePosition` doesn't show invalid rendition for `0` duration
  event
* [#6037](https://github.com/bryntum/support/issues/6037) - Inconsistent event menu actions when multiple events are selected
* [#6058](https://github.com/bryntum/support/issues/6058) - Widget's `showAnimation` config not working properly
* [#6064](https://github.com/bryntum/support/issues/6064) - Incorrect rendering of a timeaxis when `forceFit` enabled
* [#6105](https://github.com/bryntum/support/issues/6105) - Inconsistent event menu copy/cut/paste actions when multiple events are selected
* [#6150](https://github.com/bryntum/support/issues/6150) - `scrollToDate` with animation does not work at edges of date buffer
* [#6321](https://github.com/bryntum/support/issues/6321) - Built-in `DateField` validation not working properly
* [#6349](https://github.com/bryntum/support/issues/6349) - Optimize dependency hovering performance
* [#6392](https://github.com/bryntum/support/issues/6392) - Tree Scheduler with initial filters on the resource store renders too early
* [#6395](https://github.com/bryntum/support/issues/6395) - Fixed angular production build of `StateProvider` helper classes
* [#6407](https://github.com/bryntum/support/issues/6407) - Start and end date is incorrect in `timeAxisHeaderContextMenu`
* [#6434](https://github.com/bryntum/support/issues/6434) - Syncing added events redraws multiple times
* [#6437](https://github.com/bryntum/support/issues/6437) - Touch moving event to the edge of the scheduler does not scroll the view
* [#6484](https://github.com/bryntum/support/issues/6484) - Invisible cells repainted with wrong data
* [#6511](https://github.com/bryntum/support/issues/6511) - Should not allow dropping events completely out of view

## 5.3.1 - 2023-03-17

### API CHANGES

* `ProjectModel` convenience getter methods (`events`, `resources` etc) now returns `allRecords` instead of `records`
* Date parsing was made more forgiving in regard to character used to separate date parts. For example these strings are
  now all acceptable as `HH:mm`: `10:20`, `10 20`, `10-20`, `10/20` ([#6344](https://github.com/bryntum/support/issues/6344))

### BUG FIXES

* [#5711](https://github.com/bryntum/support/issues/5711) - Infinite scrolling doesn't work in RTL mode
* [#6057](https://github.com/bryntum/support/issues/6057) - Copy-paste allow overlapping when `allowOverlap` is disabled
* [#6108](https://github.com/bryntum/support/issues/6108) - Crashes after clicking on time axis header cell
* [#6228](https://github.com/bryntum/support/issues/6228) - `timeAxisHeaderMenuBeforeShow` is not documented
* [#6248](https://github.com/bryntum/support/issues/6248) - Context menus in vertical mode doesn't work as expected
* [#6293](https://github.com/bryntum/support/issues/6293) - Multi event drag produces invalid results
* [#6299](https://github.com/bryntum/support/issues/6299) - `scheduleContext` feature is throwing error when using with `fillTicks`
* [#6302](https://github.com/bryntum/support/issues/6302) - `5.3.0` TypeScript typing issues
* [#6309](https://github.com/bryntum/support/issues/6309) - Error on `CrudManager.revertChanges()`
* [#6311](https://github.com/bryntum/support/issues/6311) - Crash when adding new resource in grouped vertical mode
* [#6339](https://github.com/bryntum/support/issues/6339) - `scrollEventIntoView()` does not scroll with `extendTimeAxis : false`
* [#6343](https://github.com/bryntum/support/issues/6343) - Events empty after scrolling
* [#6345](https://github.com/bryntum/support/issues/6345) - Tooltip doesn't show overlap error when trying to overlap by `eventResize`
* [#6351](https://github.com/bryntum/support/issues/6351) - Components do not render into containers not already in DOM
* [#6354](https://github.com/bryntum/support/issues/6354) - Timeline disappears if removing Scheduler from DOM then putting it back
* [#6356](https://github.com/bryntum/support/issues/6356) - Event overlap not prevented on resize with multi assigned events
* [#6366](https://github.com/bryntum/support/issues/6366) - `selectEvent` doesn't work as expected for recurring instances

## 5.3.0 - 2023-03-02

### FEATURES / ENHANCEMENTS

* The CSS used to support `eventStyle` and `eventColor` was changed, reducing the size of the unminified Scheduler
  specific CSS from just below 500kB down to 110kB, while also making it easier for us to add more colors and styles
  in the future
* Support for Time zone conversion has been added to all Bryntum scheduling products. Simply set a IANA time zone
  identifier as value for the `timeZone` config and that's it. But, since time zones is not supported natively in
  JavaScript we strongly recommend to read our Time zone guide ([#1533](https://github.com/bryntum/support/issues/1533))
* Scheduler now does less processing of already visible events when scrolling, boosting scroll performance with large
  number of events on screen simultaneously ([#5651](https://github.com/bryntum/support/issues/5651))
* Localization demos updated to show up-to-date localization approach
* `AjaxHelper.fetch` now supports using request body to pass parameters for non-GET requests. Please check
  `addQueryParamsToBody` argument in the method documentation ([#2855](https://github.com/bryntum/support/issues/2855))
* Vertical mode now supports grouping resources ([#1395](https://github.com/bryntum/support/issues/1395))
* [REACT] React components can now be used in event renderers ([#763](https://github.com/bryntum/support/issues/763))
* [REACT] New example that shows how to use React components in event renderers. Demo is localed in
  `examples/frameworks/react/javascript/react-events` folder.
* Lots (but not all) of the not so informative `object` types in our TypeScript typings have been replaced with more
  specific types. Objects that in our JavaScript are used as maps are now declared as `Record<keyType, valueType>`, and
  for functions that accept object arguments many are replaced with anonymous type declarations, such as
  `{ foo: string, bar: number }` (Partially fixed [#5176](https://github.com/bryntum/support/issues/5176))
* Tooltips in the `react-tooltips` demo are now rich, with resource avatar and event times ([#6184](https://github.com/bryntum/support/issues/6184))

### API CHANGES

* [DEPRECATED] `LocaleManager.registerLocale` and `LocaleManager.extendLocale` are deprecated.
  `LocaleHelper.publishLocale` should be used instead.
* [BREAKING] The `syncEventRecord()` function of the `RecurrenceEditor` was made private, it was unintentionally public
  before and there is no reason to use it directly.
* When configuring a Scheduler with a time zone at initialization, and there's also a `startDate` and/or a `endDate`
  initially, those days will be treated as in local system time zone and will therefore be converted to the configured
  time zone. Previously (in `5.3.0-alpha-1` and `5.3.0-beta-1`) those dates was treated as in the provided time zone

### LOCALE UPDATES

* Locales format and process for applying locales have been simplified
* New locales for 31 languages have been added. Currently available languages are listed in the localization guide
  (Guides/Customization/Localization)

### BUG FIXES

* [#5856](https://github.com/bryntum/support/issues/5856) - `Intl.supportedValuesOf` fallback in time zone demos
* [#5889](https://github.com/bryntum/support/issues/5889) - Events are not rendered according to the timezone when scheduler has a timezone
* [#5968](https://github.com/bryntum/support/issues/5968) - Scroll To Date In RTL not working correctly
* [#5986](https://github.com/bryntum/support/issues/5986) - `eventStyle: 'line'` broken
* [#6139](https://github.com/bryntum/support/issues/6139) - Wrong behavior with `fillTicks` and `snapRelativeToEventStartDate`
* [#6216](https://github.com/bryntum/support/issues/6216) - Event elements lost after reverting changes
* [#6217](https://github.com/bryntum/support/issues/6217) - `toggleNode` event doesn't get triggered for parent with `children : true`
* [#6234](https://github.com/bryntum/support/issues/6234) - Event bar disappears on drop with filtered timeaxis, `snapRelativeToEventStart` & `fillTicks`
* [#6250](https://github.com/bryntum/support/issues/6250) - `showCurrentTimeLine` not working on filtered timeaxis
* [#6260](https://github.com/bryntum/support/issues/6260) - Milestone is rendered incorrectly

## 5.2.10 - 2023-02-17

### FEATURES / ENHANCEMENTS

* The `beforeSend` event triggered by `CrudManager` now allows async listeners ([#6011](https://github.com/bryntum/support/issues/6011))

### API CHANGES

* Recently browsers have added support for Unicode 15, which changes the output of `Intl.DateTimeFormat` when
  formatting time to include `AM`/`PM`. Those browsers now use "thin space" (`\u202f`) instead of regular space. This
  affects the `DateHelper.format()` function, but likely you do not need to take any action in your application. It
  also affects `DateHelper.parse()`, which has been updated to support the new unicode space ([#6193](https://github.com/bryntum/support/issues/6193))
* [DEPRECATED] The `eventRecord` and `assignmentRecord` params of the `eventKeyDown` & `eventKeyUp` events fired by
  Scheduler were renamed to `eventRecords` and `assignmentRecords` to match the type (array)

### BUG FIXES

* [#5109](https://github.com/bryntum/support/issues/5109) - `StickyContents` not working correctly during `dragMove` in Safari
* [#5605](https://github.com/bryntum/support/issues/5605) - Enable mouse Events config in Resource Time Range feature triggers an error
* [#5607](https://github.com/bryntum/support/issues/5607) - Dependencies lines "lose" position when dragging
* [#5781](https://github.com/bryntum/support/issues/5781) - Problem with pan enabled for 2 partnered schedulers
* [#5829](https://github.com/bryntum/support/issues/5829) - Dependencies are rendered incorrectly after zooming
* [#5977](https://github.com/bryntum/support/issues/5977) - Chained `resourceStore` doesn't work as expected
* [#6027](https://github.com/bryntum/support/issues/6027) - `eventKeyUp` and `eventKeyDown` not being triggered correctly
* [#6094](https://github.com/bryntum/support/issues/6094) - Error appeared on drop event into empty scheduler
* [#6109](https://github.com/bryntum/support/issues/6109) - `ScheduleContext` feature cannot be disabled
* [#6113](https://github.com/bryntum/support/issues/6113) - `SimpleEventEdit` editor has wrong size in vertical mode
* [#6119](https://github.com/bryntum/support/issues/6119) - Zoom In with dependencies enabled stuck the Scheduler with big dataset
* [#6159](https://github.com/bryntum/support/issues/6159) - `EventEdit` modal popup shows anchor arrow on first display

## 5.2.9 - 2023-01-30

### FEATURES / ENHANCEMENTS

* The event editor of the `EventEdit` feature may be reconfigured to not be a popup by configuring the `editorConfig`
  with `floating : false` or by adding an `appendTo` config. In this situation, the editor is displayed as a side-docked
  overlay. See the new docked-editor example ([#5873](https://github.com/bryntum/support/issues/5873))

### BUG FIXES

* [#5006](https://github.com/bryntum/support/issues/5006) - Add `ViewPreset` base property to documentation and TS types
* [#5956](https://github.com/bryntum/support/issues/5956) - `ResizeObserver` loop limit exceeded warning
* [#5971](https://github.com/bryntum/support/issues/5971) - Dependency terminals not shown when enabling feature at runtime
* [#5974](https://github.com/bryntum/support/issues/5974) - Unable to extend 5971 without specifying `'headers'`
* [#5979](https://github.com/bryntum/support/issues/5979) - Summary cell opens context menu on vertical mode
* [#6019](https://github.com/bryntum/support/issues/6019) - [TypeScript] Feature classes and configs have `on` event handlers exposed on owner class

## 5.2.8 - 2023-01-19

### BUG FIXES

* [#5386](https://github.com/bryntum/support/issues/5386) - Improved panel collapse animation when collapsed panel header is perpendicular to expanded
* [#5814](https://github.com/bryntum/support/issues/5814) - `StateProvider` throws during component construction
* [#5913](https://github.com/bryntum/support/issues/5913) - Scheduler states it's still dragging, when canceling event drop in `beforeEventDropFinalize`
* [#5931](https://github.com/bryntum/support/issues/5931) - Deprecated API use. Handle size is from CSS
* [#5957](https://github.com/bryntum/support/issues/5957) - Console error when removing events in vertical mode
* [#5960](https://github.com/bryntum/support/issues/5960) - TypeError: `this.docScrollListener is not a function`

## 5.2.7 - 2023-01-11

### API CHANGES

* [DEPRECATED] The `EventDrag` feature's events `beforeEventDrag` and `eventDragStart` property `event` will be replaced
  by `domEvent` in 6.0. This to make it more clear that it refers to the original event from the `DOM` that initiated
  the Bryntum event ([#5818](https://github.com/bryntum/support/issues/5818))
* [DEPRECATED] The `handleSize` and `touchHandleSize` configs to the `EventResize` feature is deprecated and will no
  longer have any effect. The handle size is determined from the theme's CSS ([#5882](https://github.com/bryntum/support/issues/5882))

### BUG FIXES

* [#2258](https://github.com/bryntum/support/issues/2258) - Dragged task hangs on drop position when drag and drop is finalized in `beforeEventDropFinalize` handler
* [#3995](https://github.com/bryntum/support/issues/3995) - Using chained `eventStore` caused an error
* [#4411](https://github.com/bryntum/support/issues/4411) - `DragCreate` fails when event store is reloaded while dragging
* [#4862](https://github.com/bryntum/support/issues/4862) - Scheduler Pro percent bar in vertical mode wrong UI
* [#5604](https://github.com/bryntum/support/issues/5604) - Empty timerange line header
* [#5729](https://github.com/bryntum/support/issues/5729) - Dependency creation difficult on touch devices
* [#5850](https://github.com/bryntum/support/issues/5850) - Zooming out on partnered schedulers crashes when infiniteScroll is enabled
* [#5891](https://github.com/bryntum/support/issues/5891) - Support `sort` feature in vertical mode

## 5.2.6 - 2022-12-28

### FEATURES / ENHANCEMENTS

* [REACT] React wrapper now supports React components in widgets and tooltips ([#774](https://github.com/bryntum/support/issues/774))
* Dependencies feature now fires `dependencyContextMenu` event when right clicking a dependency line ([#5800](https://github.com/bryntum/support/issues/5800))

### BUG FIXES

* [#4455](https://github.com/bryntum/support/issues/4455) - Copy-paste event to collapsed group should be a no-op
* [#4569](https://github.com/bryntum/support/issues/4569) - Row outlined after event copy paste
* [#5486](https://github.com/bryntum/support/issues/5486) - Horizontal scrollbar overlaps when the view becomes smaller
* [#5817](https://github.com/bryntum/support/issues/5817) - Zoomed scheduler time header looks incorrect after exporting to multiple pages
* [#5822](https://github.com/bryntum/support/issues/5822) - The `endDate` remains frozen when moving events more than once
* [#5825](https://github.com/bryntum/support/issues/5825) - Infinite scroll demo shows lots of Toasts
* [#5830](https://github.com/bryntum/support/issues/5830) - "No records to display" label is wrongly rendered

## 5.2.5 - 2022-12-16

### FEATURES / ENHANCEMENTS

* Scheduler previously supported including milestone labels in the layout calculations to avoid overlap in a mode that
  "stretches" the diamonds (by configuring a `milestoneLayoutMode`). It can now do the same for the normal milestone
  rendition by combining  `milestoneLayoutMode` with the new `milestoneTextPosition : 'always-outside'` setting. The
  `milestonelayout` demo was updated to showcase this ([#3483](https://github.com/bryntum/support/issues/3483))
* `RowCopyPaste` feature supports copying rows in a tree. Copied records will have same hierarchy
* Paste after cut and copy behavior is unified, records are moved below the paste target
* Event drag feature is improved to allow copying dragged event. To copy, press and hold copy key (`Shift` by
  default). Copy can either add new assignment (default) or copy the event itself, this behavior is controlled
  by `copyMode` config. ([#4940](https://github.com/bryntum/support/issues/4940))
* The `Dependencies` feature has a new `clickWidth` config, that lets you enlarge the clickable area for dependency
  lines. Tradeoff being that the lines will be more expensive to draw. The `dependencies` demo has been updated
  with a slider for adjusting it ([#41](https://github.com/bryntum/support/issues/41))

### BUG FIXES

* [#5036](https://github.com/bryntum/support/issues/5036) - Zooming not centered where the cursor is
* [#5163](https://github.com/bryntum/support/issues/5163) - Context menu not working correctly inside the schedule
* [#5267](https://github.com/bryntum/support/issues/5267) - Copy action not copying child resources
* [#5378](https://github.com/bryntum/support/issues/5378) - Resource gets hidden on event creation in first parent resource
* [#5545](https://github.com/bryntum/support/issues/5545) - Center date is not restored correctly if state contains different size for locked grid
* [#5668](https://github.com/bryntum/support/issues/5668) - Chained `resourceStores` from one `CrudManager` works incorrect
* [#5710](https://github.com/bryntum/support/issues/5710) - Error in Widget detection of RTL environment
* [#5724](https://github.com/bryntum/support/issues/5724) - Scheduler crashes when resources children changed to boolean
* [#5731](https://github.com/bryntum/support/issues/5731) - Time axis cells are recycled when making schedule area small
* [#5770](https://github.com/bryntum/support/issues/5770) - CopyPaste doesn't work with mapped event id field
* [#5780](https://github.com/bryntum/support/issues/5780) - ICS export datetime stamp is not UTC

## 5.2.4 - 2022-11-28

### FEATURES / ENHANCEMENTS

* We recently launched a new homepage over at [bryntum.com](https://bryntum.com), and have now slightly updated the
  styling for demos and docs to better match it (new logo, new header color, new font). Please note that this is not a
  change to our themes, only the look of the demos, and it won't affect your application

### BUG FIXES

* [#4463](https://github.com/bryntum/support/issues/4463) - Event drag create on big dataset generates error
* [#5307](https://github.com/bryntum/support/issues/5307) - [React] error when changing Scheduler dataset in React Advanced demo
* [#5541](https://github.com/bryntum/support/issues/5541) - Timeline header is not rendered when calling `zoomToFit`
* [#5595](https://github.com/bryntum/support/issues/5595) - Fix panel collapse icon directions
* [#5633](https://github.com/bryntum/support/issues/5633) – Crash when changing bar margin slider in demo

## 5.2.3 - 2022-11-17

### FEATURES / ENHANCEMENTS

* The `Dependencies` feature has a new `drawOnScroll` config, that controls whether dependencies are dawn during scroll
  or only when scrolling ends. Setting it to `false` will boost scrolling performance for schedules with many
  dependencies ([#5555](https://github.com/bryntum/support/issues/5555))
* Pan and EventDragSelect features now offer preventable `beforePan` and `beforeEventDragSelect` events which give you
  better control over when each feature is active.
* The `EventModel.split` function can now accept a duration to split at in the form of a string such as `'30 min'`. The
  duration of the event will be converted into the specified units if they are different. The new event's duration will
  be in the same units. Splitting using a fraction of the event duration will continue to work as usual.

### BUG FIXES

* [#4868](https://github.com/bryntum/support/issues/4868) - Events UI does not update when using batch mode and update custom field
* [#5535](https://github.com/bryntum/support/issues/5535) - Inconsistent End Date information in event tooltip when zooming out
* [#5551](https://github.com/bryntum/support/issues/5551) - Store `allRecords` includes group footers twice
* [#5578](https://github.com/bryntum/support/issues/5578) - [LWC] `onScheduleScroll` listener should be disabled for Salesforce

## 5.2.2 - 2022-11-08

### API CHANGES

* [DEPRECATED] The behaviour of the `store.data` getter will be changed in 6.0. Currently, it returns the **initial**
  raw dataset, in 6.0 it will be changed to have the more expected behaviour of returning the data objects for the
  **current** state instead. See Grid's upgrade guide for more information ([#5499](https://github.com/bryntum/support/issues/5499))

### BUG FIXES

* [#3600](https://github.com/bryntum/support/issues/3600) - Hide resize handle if disabled on feature level
* [#5500](https://github.com/bryntum/support/issues/5500) - `eventResizeEnd` doesn't return the resized `eventRecord`
* [#5520](https://github.com/bryntum/support/issues/5520) - [LWC] Scheduler throws on body scroll if pan feature is active

## 5.2.1 - 2022-10-28

### BUG FIXES

* [#1996](https://github.com/bryntum/support/issues/1996) - Maximum call stack size exceeded when updating event `resourceId`
* [#4443](https://github.com/bryntum/support/issues/4443) - `MergeCells` set `true` resources are not collapsing correctly
* [#5149](https://github.com/bryntum/support/issues/5149) - Angular demos now use component-local styles using `ViewEncapsulation.None`
* [#5377](https://github.com/bryntum/support/issues/5377) - `hideHeaders` crashing vertical mode when combined with `FilterBar` feature
* [#5388](https://github.com/bryntum/support/issues/5388) - `DragHelper` misplaces drag proxy on a scrolled page
* [#5422](https://github.com/bryntum/support/issues/5422) - Scheduler "Custom event styling" demo has wrong styles
* [#5431](https://github.com/bryntum/support/issues/5431) - `Pan` feature interferes with row reordering
* [#5432](https://github.com/bryntum/support/issues/5432) - `Pan` feature buggy when reaching edge of window
* [#5446](https://github.com/bryntum/support/issues/5446) - Wrong event position on invalid drop with `expandOnCellClick` enabled
* [#5447](https://github.com/bryntum/support/issues/5447) - Exception on console when clear time and date on event edit
* [#5457](https://github.com/bryntum/support/issues/5457) - Drag creating events fails with multiple vertical schedulers on a scrolled page
* [#5465](https://github.com/bryntum/support/issues/5465) - `EventStore.filter()` does not trigger refresh

## 5.2.0 - 2022-10-13

### FEATURES / ENHANCEMENTS

* A new widget, `ViewPresetCombo`, is available to Scheduler, SchedulerPro and Gantt. Put it in the toolbar, and it will
  provide easy-to-setup view switching. It uses the built-in `ViewPreset`s functionality which is easily customized
  ([#4539](https://github.com/bryntum/support/issues/4539))
* New `booking` demo, mimicking a real property booking interface
* ResourceTimeRanges feature now has a `enableMouseEvents` flag which lets you interact with the resource time range
  elements ([#1069](https://github.com/bryntum/support/issues/1069))
* The `TimeRanges` feature was refactored to support virtualization, it now only renders lines and ranges in view. This
  also applies to the `NonWorkingTime` feature, and will boost rendering performance on long time axes when either
  feature is used ([#3757](https://github.com/bryntum/support/issues/3757))
* Added a new `collapsible-columns` demo showing how to use collapsible column groups ([#4878](https://github.com/bryntum/support/issues/4878))
* You can now select a custom time span in the timeline header, see new `time-selection` demo ([#2676](https://github.com/bryntum/support/issues/2676))
* The `NonWorkingTime` feature was made aware of the `fillTicks` config, cropping the non-working-time ranges for a
  better look when `fillTicks` is enabled
* A new `EventNonWorkingTime` feature was added. When enabled, the parts of the event bars that intersect weekends will
  be shaded. Can be tried in the updated `nonworkingdays` demo ([#5150](https://github.com/bryntum/support/issues/5150))
* Menu has a `separator` config to make it easier to visually separate menu items
* The responsive state objects used in the `responsive` config of the `Responsive` mixin now support a `once` property
  to allow configs to only be set on first activation of the state
* The `Core.helper.DateHelper` class has a new method `formatRange` method which can format date ranges, as well as new
  formatting options for week numbers
* The `TreeGroup` feature introduced in 5.0.0 has been reworked and now also works in Scheduler. Check it out in the new
  `tree-grouping` demo
* PdfExport feature is refactored to render content directly. This significantly improves performance and robustness by
  eliminating component scrolling. This behavior is enabled by default. You can revert to the old behavior by setting
  `enableDirectRendering` config on the export feature to `false`. ([#4449](https://github.com/bryntum/support/issues/4449))

### API CHANGES

* [DEPRECATED] The `highlightWeekends` config of the `NonWorkingTime` feature is superfluous, disabling the feature will
  yield the same result. It has been deprecated and will be removed in 6.0

## 5.1.5 - 2022-10-12

### FEATURES / ENHANCEMENTS

* New records are assigned a generated `id` if none is provided. The generated `id` is meant to be temporary (a
  phantom `id`), and should be replaced by the backend on commit. Previously the `id` was based on a global counter
  incremented with each assignment. That simplistic scheme assured no two records got the same `id` during a session,
  but if an application serialized the generated `id` (note, they should not) and then reloaded it, it would eventually
  collide with a new generated `id`. To prevent this, the generated `id`s are now based on a random UUID instead
* Stores now by default show a warning on console when loading records that has generated `id`s, as a reminder that it
  should be replaced by the backend on commit

### BUG FIXES

* [#4645](https://github.com/bryntum/support/issues/4645) - Improve error message "Bryntum bundle included twice"
* [#4654](https://github.com/bryntum/support/issues/4654) - [REACT] Bryntum widget wrappers don't accept all component properties in React 18

## 5.1.4 - 2022-09-29

### FEATURES / ENHANCEMENTS

* The `ScheduleContext` feature now offers a `triggeredBy` config which may be `'mouseover'`. It also offers
  a `renderer` which allows applications to customize the highlight style. Scheduler now fires a `timelineContextChange`
  event when the mouse moves from tick to tick and row to row within the schedule region. ([#5035](https://github.com/bryntum/support/issues/5035))

### API CHANGES

* [DEPRECATED] The `events` config of `SchedulerDatePicker` has been renamed to `showEvents`. The `events` property is
  deprecated but will continue to work during its deprecation period
* [DEPRECATED] The 3rd param of the `scrollResourceEventIntoView` was deprecated and will be removed in a future release
* [DEPRECATED] The 2nd param of the `scrollAssignmentIntoView` was deprecated and will be removed in a future release

### BUG FIXES

* [#3198](https://github.com/bryntum/support/issues/3198) - Order of events changes on scrolling if `eventLayout: 'none'`
* [#4374](https://github.com/bryntum/support/issues/4374) - Console error if return false on preventable `beforeAdd` event on dependency store
* [#4995](https://github.com/bryntum/support/issues/4995) - Should not allow creating or dragging events for `readOnly` resources
* [#5066](https://github.com/bryntum/support/issues/5066) - Visual Splitter glitch in docs demo
* [#5130](https://github.com/bryntum/support/issues/5130) - Scheduler partnering in vertical mode should use vertical scroll sync
* [#5155](https://github.com/bryntum/support/issues/5155) - Timeline scrolls when event creation canceled
* [#5170](https://github.com/bryntum/support/issues/5170) - When first region has width and last region is collapsed, Scheduler doesn't resize with container
* [#5231](https://github.com/bryntum/support/issues/5231) - `eventDragSelect` does not select events when scrolling
* [#5272](https://github.com/bryntum/support/issues/5272) - Group Summary not updating when display in header
* [#5315](https://github.com/bryntum/support/issues/5315) - Scheduler has no vertical lines in vertical mode
* [#5316](https://github.com/bryntum/support/issues/5316) - `AvatarRendering` should always set alt text by default

## 5.1.3 - 2022-09-09

### BUG FIXES

* [#415](https://github.com/bryntum/support/issues/415) - Improve docs on formatting currency values on `NumberField`
* [#3680](https://github.com/bryntum/support/issues/3680) - Support Salesforce Winter 22 release
* [#5062](https://github.com/bryntum/support/issues/5062) - Drag from grid demo is missing invalid indicator
* [#5125](https://github.com/bryntum/support/issues/5125) - Setting an initial value for `activeTab` on a `TabPanel` no longer animates that tab into view
* [#5135](https://github.com/bryntum/support/issues/5135) - Event is not selected after `Ctrl + click` following a multi-drag

## 5.1.2 - 2022-08-29

### FEATURES / ENHANCEMENTS

* Configs that accept configuration options for a widget (or other class) are now (mostly) documented to accept a typed
  config object rather than a plain object. For example instead of `{Object} tooltip - A tooltip configuration object`,
  it is now `{TooltipConfig} tooltip - A tooltip configuration object`. This improves our TypeScript typings (transforms
  to `Partial<TooltipConfig>` in typings) when using such configs, but also improves our docs by linking to the configs
  of the type
* Added a config to allow State Tracking Manager to ignore remote changes coming in a sync response. This allows user
  to only undo/redo local changes (`ignoreRemoteChangesInSTM` config on the ProjectModel/CrudManager) ([#5083](https://github.com/bryntum/support/issues/5083))

### BUG FIXES

* [#2124](https://github.com/bryntum/support/issues/2124) - UI issues related to recurring events
* [#2806](https://github.com/bryntum/support/issues/2806) - Browser freezes while vertically scrolling Scheduler with many events selected
* [#4225](https://github.com/bryntum/support/issues/4225) - Wrong `endDate` when dragging events over days at which DST/STD change
* [#4835](https://github.com/bryntum/support/issues/4835) - Summary feature showing incorrect values when enabled after scheduler initialization
* [#4897](https://github.com/bryntum/support/issues/4897) - `ResourceFilter` should continue to filter when its own `Store` is filtered
* [#4943](https://github.com/bryntum/support/issues/4943) - Changing the time by dragging an event triggering an error
* [#4965](https://github.com/bryntum/support/issues/4965) - Dependency creation still working when readOnly is true
* [#4981](https://github.com/bryntum/support/issues/4981) - `copy` event menu item not able to copy multiple events
* [#4999](https://github.com/bryntum/support/issues/4999) - `AjaxStore` `beforeRequest` doesn't allow to make changes in request body
* [#5017](https://github.com/bryntum/support/issues/5017) - [TypeScript] Property type is missing in `DataFieldConfig`
* [#5018](https://github.com/bryntum/support/issues/5018) - [Vue] Prop Validation fails for `String` options
* [#5076](https://github.com/bryntum/support/issues/5076) - Cannot configure customized `ViewPreset` set
* [#5078](https://github.com/bryntum/support/issues/5078) - `eventDrag` feature should support `tip` being configured away
* [#5117](https://github.com/bryntum/support/issues/5117) - Drag drop stops working after drop during scrolling
* [#5122](https://github.com/bryntum/support/issues/5122) - Dependencies not rendered after expanding parent nodes in a tree resource data set
* [#5124](https://github.com/bryntum/support/issues/5124) - Improve docs for `eventMouseEnter` and `eventMouseLeave`

## 5.1.1 - 2022-07-28

### BUG FIXES

* [#4637](https://github.com/bryntum/support/issues/4637) - `mergeCells` is not reactive to row height
* [#4849](https://github.com/bryntum/support/issues/4849) - Scheduler Pro with dependencies | Vertical mode + Resize
* [#4908](https://github.com/bryntum/support/issues/4908) - Collapsing resource tree column changes dependency lines
* [#4957](https://github.com/bryntum/support/issues/4957) - `ScheduleContext` feature does not offer information about the selected context

## 5.1.0 - 2022-07-21

### FEATURES / ENHANCEMENTS

* The `Dependencies` feature was refactored, it now supports vertical mode (shown in the new vertical-dependencies demo)
  and also continuously redraws dependencies during drag, resize and transitions. In addition to this it now also allows
  customizing the marker (arrow head), applying a radius to line corners for a more rounded look and taking full control
  over what enters the DOM using a `renderer` function ([#4579](https://github.com/bryntum/support/issues/4579))
* Scheduler `ResourceModel` now has a `columnWidth` field which is used in vertical mode ([#734](https://github.com/bryntum/support/issues/734))
* Our TypeScript typings for string types that have a predefined set of alternatives was improved to only accept
  those alternatives. For example previously the `dock` config which was previously declared as `dock: string` is now
  `dock : 'top'|'right'|'bottom'|'left'`
* Create React App templates now available
* Configuring the CrudManager was made a little easier by introducing shortcuts for setting load and sync urls using the
  new `loadUrl` and `syncUrl` configs
* Updated the built-in version of FontAwesome Free to `6.1.1`
* `KeyMap` is a mixin that allows for standardized and customizable keyboard shortcuts functionality. `KeyMap` is by
  default  mixed in to `Widget` and therefore available to all `Widget`'s child classes. There is a new guide
  **Guides/Customization/Keyboard shortcuts** describing how to customize currently integrated keyboard shortcuts
  ([#4300](https://github.com/bryntum/support/issues/4300), [#4313](https://github.com/bryntum/support/issues/4313), [#4328](https://github.com/bryntum/support/issues/4328))
* CrudManager uses `parentIndex` field to insert record to the correct position in the store ([#4720](https://github.com/bryntum/support/issues/4720))
* CrudManager optionally allows `sync()` calls without local changes, to retrieve changes from the backend. Configure
  `forceSync : true` to enable this new behaviour ([#4575](https://github.com/bryntum/support/issues/4575))
* The dependency hover tooltip can now be configured using the new `tooltipTemplate` config on the Dependencies feature
  ([#1063](https://github.com/bryntum/support/issues/1063))
* The tooltip shown while creating new dependencies can now be configured using the new `creationTooltipTemplate` config
  on the Dependencies feature ([#4655](https://github.com/bryntum/support/issues/4655))

### API CHANGES

* [BREAKING] [ANGULAR] Angular wrappers now use the more modern module bundle by default, instead of the legacy umd
  bundle. Hence application imports must be changed to match. This will slightly improve application size and
  performance ([#2786](https://github.com/bryntum/support/issues/2786))
* [BREAKING] `schedulerpro.lite.umd.js` bundle is no longer available
* [BREAKING] WebComponents has been removed from `scheduler.module.js` ES modules bundle. New bundle with WebComponents
  is `scheduler.wc.module.js`
* [BREAKING] The `draw()`, `drawDependency()`, `getConnectorEndSide()`, `getConnectorStartSide()`,
  `refreshDependency()` and `releaseDependency()` functions on the `Dependencies` feature has mistakenly been public
  ever since the feature was created. With the refactoring described above they are all now either removed or made
  private
* [DEPRECATED] The `drawForEvent()` fn of the `Dependencies` feature was deprecated. Calling it should no longer be
  necessary
* Removed the `removeUnassignedEvent` config from Scheduler. It was moved to `EventStore` back in 4.0 and was supposed
  to have been removed at the same time, it has not had any effect since

### BUG FIXES

* [#4681](https://github.com/bryntum/support/issues/4681) - STM issues when using w/ backend
* [#4684](https://github.com/bryntum/support/issues/4684) - Highlighted dependencies loose highlight on hover
* [#4685](https://github.com/bryntum/support/issues/4685) - Dependency creation tooltip layout broken
* [#4691](https://github.com/bryntum/support/issues/4691) - Scheduler responsive demo with small screen width
* [#4694](https://github.com/bryntum/support/issues/4694) - Scheduler dependencies: "Drop anywhere" is not re-enabled after re-checking the button
* [#4696](https://github.com/bryntum/support/issues/4696) - Parents sorted below children in docs
* [#4697](https://github.com/bryntum/support/issues/4697) - Too dark code background in docs
* [#4850](https://github.com/bryntum/support/issues/4850) - Time range label misplaced when `showHeaderElements` is `false`

## 5.0.7 - 2022-07-13

### BUG FIXES

* [#1667](https://github.com/bryntum/support/issues/1667) - Changing `rowHeight` and `barMargin` breaks the layout
* [#3363](https://github.com/bryntum/support/issues/3363) - Allow "Change only this event" option for a master event
* [#4681](https://github.com/bryntum/support/issues/4681) - STM issues when using with backend
* [#4703](https://github.com/bryntum/support/issues/4703) - Resources disappear if removed all and added new in scrolled position
* [#4756](https://github.com/bryntum/support/issues/4756) - PDF export hangs trying to restore component
* [#4881](https://github.com/bryntum/support/issues/4881) - Visible timeline is not restored properly for a scheduler with `infiniteScroll`
* [#4888](https://github.com/bryntum/support/issues/4888) - Event disappear after dragdrop
* [#4899](https://github.com/bryntum/support/issues/4899) - Timeline header is rendered incorrectly after restoring app state
* [#4916](https://github.com/bryntum/support/issues/4916) - `Fullscreen` is not working on mobile Safari

## 5.0.6 - 2022-06-20

### FEATURES / ENHANCEMENTS

* TimeRange feature now fires `timeRangeHeaderClick`,  `timeRangeHeaderDblClick` and  `timeRangeHeaderContextMenu`
  events when interacting with the header elements ([#4790](https://github.com/bryntum/support/issues/4790))

### BUG FIXES

* [#4748](https://github.com/bryntum/support/issues/4748) - Occurrence content element has wrong CSS class
* [#4777](https://github.com/bryntum/support/issues/4777) - Web sockets demo broken
* [#4778](https://github.com/bryntum/support/issues/4778) - Body mask now tracks grid resize to maintain cover of the body
* [#4808](https://github.com/bryntum/support/issues/4808) - Typings are wrong for async functions

## 5.0.5 - 2022-05-30

### FEATURES / ENHANCEMENTS

* Pan feature now is now also enabled when dragging in the time axis header. Can be disabled with the new
  `enableInHeader` config ([#4594](https://github.com/bryntum/support/issues/4594))
* You can now render custom HTML contents inside TimeRange elements using the `headerRenderer` and `bodyRenderer`
  methods ([#4613](https://github.com/bryntum/support/issues/4613))
* Added `paste` and `copy` events to the `EventCopyPaste` feature ([#4552](https://github.com/bryntum/support/issues/4552))

### BUG FIXES

* [#4468](https://github.com/bryntum/support/issues/4468) - Event disappears if dropped over group head
* [#4478](https://github.com/bryntum/support/issues/4478) - Vertical time axis in Scheduler should show time labels aligned with lines like calendar week view
* [#4589](https://github.com/bryntum/support/issues/4589) - `EventDrag` broken if async validation finalized without delay in `beforeEventDropFinalize`
* [#4591](https://github.com/bryntum/support/issues/4591) - `response.message` not shown in error mask in case of response code not `200`
* [#4592](https://github.com/bryntum/support/issues/4592) - `UndoRedo` needs the `transactionsCombo` emptyText localized
* [#4607](https://github.com/bryntum/support/issues/4607) - [VUE] Incorrect prop types in Vue wrapper
* [#4615](https://github.com/bryntum/support/issues/4615) - Vertical scrolling broken in vertical mode
* [#4667](https://github.com/bryntum/support/issues/4667) - Turn off infinite scroll feature when exporting to PDF

## 5.0.4 - 2022-05-11

### FEATURES / ENHANCEMENTS

* The behaviour of the `EventCopyPaste` feature in a multi assignment scheduler is now better defined and also
  configurable using the new `copyPasteAction` config on the feature ([#4495](https://github.com/bryntum/support/issues/4495))
* On a similar note the behaviour of `EventDragSelect` was also improved in a multi assigned scheduler. It now selects
  the assignments within the selection marquee rather than the events, giving you better control

### API CHANGES

* [DEPRECATED] The `records` param of the `beforeCopy` and `beforePaste` events triggered by the `EventCopyPaste`
  feature was deprecated in favour of the new `eventRecords` param

### BUG FIXES

* [#3832](https://github.com/bryntum/support/issues/3832) - Change from invalid resourceId to valid resourceId of event throws error
* [#4526](https://github.com/bryntum/support/issues/4526) - DragMove doesn't work on touch enabled laptops
* [#4562](https://github.com/bryntum/support/issues/4562) - [REACT] React wrappers have incorrect source mapping urls

## 5.0.3 - 2022-04-26

### API CHANGES

* The `validateResponse` flag on `CrudManager` has been changed to default to `true`. When enabled, it validates
  `CrudManager` responses from the backend and outputs a message on console if the format isn't valid. This is helpful
  during the development phase, but can be turned off in production
* New Vue 2/3 wrapper config option `relayStoreEvents` (defaults to `false`). When set to `true`, the events fired
  by stores are relayed to the Bryntum Grid instance
* [REACT] React wrappers now include TypeScript definitions ([#3378](https://github.com/bryntum/support/issues/3378))

### BUG FIXES

* [#4127](https://github.com/bryntum/support/issues/4127) - [LWC] `DomHelper.isInView()` throws
* [#4222](https://github.com/bryntum/support/issues/4222) - [LWC] Performance degradation in 5.0 release
* [#4225](https://github.com/bryntum/support/issues/4225) - Wrong `endDate` when dragging events over days at which DST/STD change
* [#4387](https://github.com/bryntum/support/issues/4387) - ASPNet demos should use trial packages in trial distribution
* [#4432](https://github.com/bryntum/support/issues/4432) - [LWC] Mouse events do not work
* [#4461](https://github.com/bryntum/support/issues/4461) - [Vue] wrapper triggers doubled `dataChange` events with different params
* [#4484](https://github.com/bryntum/support/issues/4484) - `zoomToFit` does not work correctly when `infiniteScroll` is enabled

## 5.0.2 - 2022-04-13

### FEATURES / ENHANCEMENTS

* `ResourceFilter` in `Sidebar` should be configurable with custom selection ([#2006](https://github.com/bryntum/support/issues/2006))
* EventDrag now adds `b-drop-target` class to all valid drop target elements on drag start when
  an `externalDropTargetSelector` is provided. ([#3888](https://github.com/bryntum/support/issues/3888))
* The previously private event `visibleRangeChange` has been removed in favour of the public
  event `visibleDateRangeChange`. If your app made use of this event, please replace the event name
  ([#3876](https://github.com/bryntum/support/issues/3876))
* You can now set event drag-drop validity in the eventDrag listener ([#4441](https://github.com/bryntum/support/issues/4441))

### BUG FIXES

* [#3528](https://github.com/bryntum/support/issues/3528) - Content Security Policy (csp) demo doesn't work in Scheduler
* [#4219](https://github.com/bryntum/support/issues/4219) - Milestones not rendered in vertical view
* [#4298](https://github.com/bryntum/support/issues/4298) - `b-animating` class added/removed while dragging task onto schedule
* [#4371](https://github.com/bryntum/support/issues/4371) - Summary tooltip should not be shown for empty cells
* [#4397](https://github.com/bryntum/support/issues/4397) - Bad alignment in header
* [#4406](https://github.com/bryntum/support/issues/4406) - Fixed items in disabled `fieldset`/`radiogroup` not being disabled
* [#4412](https://github.com/bryntum/support/issues/4412) - Batch column updates do not show until next column update
* [#4416](https://github.com/bryntum/support/issues/4416) - `MergeCells` feature prevents scrolling time axis
* [#4426](https://github.com/bryntum/support/issues/4426) - Should be possible to invalidate an external drop by setting valid flag to `false`
* [#4467](https://github.com/bryntum/support/issues/4467) - Changing the tree column causes expand icon sync issues
* [#4480](https://github.com/bryntum/support/issues/4480) - Milestone element misplaced while dragging

## 5.0.1 - 2022-03-04

### BUG FIXES

* [#4267](https://github.com/bryntum/support/issues/4267) - Disabling resources field breaks task editor
* [#4275](https://github.com/bryntum/support/issues/4275) - SASS Compilation Error when min/max conflicts with native CSS
* [#4278](https://github.com/bryntum/support/issues/4278) - `cellContextMenu` not working
* [#4283](https://github.com/bryntum/support/issues/4283) - Crashing when exporting after filtering out a resource
* [#4293](https://github.com/bryntum/support/issues/4293) - `scrollEventIntoView` bug when event falls in time span not matching `workingTime`

## 5.0.0 - 2022-02-21

* We are thrilled to announce version 5.0 of our Scheduler product. This release marks a big milestone for us, after
  more than a year of development. This update makes it much easier to combine multiple Bryntum products, and also
  includes new demos, improved state management as well as bug fixes and other enhancements requested by our community
  A big thanks to our customers who helped us with testing our alpha & beta versions
* You are most welcome to join us on March 16th, at 9am PST (6pm CET) for a 5.0 walkthrough webinar, demonstrating all
  the shiny new features
  [Click here to register](https://us06web.zoom.us/webinar/register/5116438317103/WN_4MkExpZPQsGYNpzh1mR_Ag)
* We hope you will enjoy this release and we are looking forward to hearing your feedback of what you would like us to
  develop next
* / Mats Bryntse, CEO @Bryntum

### FEATURES / ENHANCEMENTS

* Each product has a new "thin" JavaScript bundle. The thin bundle only contains product specific code, letting you
  combine multiple Bryntum products without downloading the shared code multiple times (previously only possible with
  custom-built bundles from sources). Find out more in the What's new guide ([#2805](https://github.com/bryntum/support/issues/2805))
* Each theme is now available in a version that only has product specific CSS in it, called a `thin` version. These
  files are name `[product].[theme].thin.css` - `scheduler.stockholm.thin.css` for example. They are intended for using
  when you have multiple different bryntum products on the same page, to avoid including shared CSS multiple times
  Read more about it in the `What's new` section in docs ([#3276](https://github.com/bryntum/support/issues/3276))
* `Model` has a new `readOnly` field that is respected by UI level editing features to disallow editing records having
  `readOnly : true`. It does not directly affect the datalayer, meaning that you can still programmatically edit the
  records ([#665](https://github.com/bryntum/support/issues/665))
* New `drag-from-list` demo showing how to drag items from an external List widget onto events in the schedule
  ([#3904](https://github.com/bryntum/support/issues/3904))
* Scheduler's event rendering now uses absolute positioning instead of translation to position the event bars. This
  was changed to make native `position: sticky` work, the `stickyEvents` feature is now very thin and more performant
  ([#4055](https://github.com/bryntum/support/issues/4055))
* New `ProjectModel` setters/getters for `assignments`, `dependencies`, `events`, `resourceTimeRanges`, `resources`,
  `timeRanges` ([#4043](https://github.com/bryntum/support/issues/4043))
* New `deselectOnClick` to allow simple deselection of events with click ([#3221](https://github.com/bryntum/support/issues/3221))
* `window` references are replaced with `globalThis` which is supported in all modern browsers and across different JS
  environments ([#4071](https://github.com/bryntum/support/issues/4071))
* A new function called `downloadTestCase()` was added to Bryntum widgets, it is intended to simplify creating test
  cases for reporting issues on Bryntum's support forum. Running it collects the current value for the configs your app
  is using, inlines the current dataset and compiles that into a JavaScript app that is then downloaded. The app will
  most likely require a fair amount of manual tweaking to reproduce the issue, but we are hoping it will simplify the
  process for you. Run `scheduler.downloadTestCase()` on the console in a demo to try it
* The TimeAxis class now lets you change the `generateTicks` method during runtime ([#4199](https://github.com/bryntum/support/issues/4199))
* Updated FontAwesome to version 6, which includes some new icons sponsored by Bryntum in the charts category:
  https://fontawesome.com/search?m=free&c=charts-diagrams&s=solid
* When configured with a StateProvider and `stateId`, Scheduler state is stored automatically as stateful properties
  change ([#1859](https://github.com/bryntum/support/issues/1859))
* Scheduler´s selectAssignment & deselectAssignment methods now receives the native DOM event allowing you to
  implement custom selection behaviors ([#4234](https://github.com/bryntum/support/issues/4234))

### API CHANGES

* [BREAKING] React wrappers now use the more modern module bundle by default, instead of the legacy umd bundle. Hence
  application imports must be changed to match. This will slightly improve application size and performance
  ([#2787](https://github.com/bryntum/support/issues/2787))
* [DEPRECATED] Schedulers `horizontalEventSorterFn` config was deprecated and will be removed in 6.0. It was replaced by
  a new `overlappingEventSorter` config, which works identically but has a better name ([#3716](https://github.com/bryntum/support/issues/3716))
* Code of drag-from-grid and similar demos have been simplified and if you have used that code in your application you
  should make sure to review and update your code accordingly
* Event bar root node now uses CSS grid layout for its internal layout. This may affect your appearance if you have
  customized the event bar markup
* The following previously deprecated Scheduler configs, functions etc. where removed:
    * `EventContextMenu` feature - previously replaced by `EventMenu` feature
    * `HeaderContextMenu` feature - previously replaced by `TimeAxisHeaderMenu` feature
    * `ScheduleContextMenu` feature - previously replaced by `ScheduleMenu` feature
    * Argument `draggedRecords` of the `EventDrag#validatorFn()` function - previously replaced by `assignmentRecords`
      and `eventRecords`
    * Config `EventEdit#showResourceField` - previously replaced by `resourceField` property in `items` config
    * Config `EventEdit#resourceFieldConfig` - previously replaced by `resourceField` property in `items` config
    * Config `EventEdit#autoClose` - previously replaced by `autoClose` property in `editorConfig` config
    * Config `EventEdit#showDeleteButton` - previously replaced by `deleteButton` property in `items` config
    * Config `EventEdit#showNameField` - previously replaced by `nameField` property in `items` config
    * Config `EventEdit#startTimeConfig` - previously replaced by `startTimeField` property in `items` config
    * Config `EventEdit#startDateConfig` - previously replaced by `startDateField` property in `items` config
    * Config `EventEdit#endTimeConfig` - previously replaced by `endTimeField` property in `items` config
    * Config `EventEdit#endDateConfig` - previously replaced by `endDateField` property in `items` config
    * Config `EventEdit#extraItems` - previously replaced by `items` config
    * Param `resourceRecord` of the `EventEdit#beforeEventSave` event - previously replaced by `resourceRecords` param
    * Event `TimeAxisColumn#timeAxisHeaderClick` - previously replaced by the same event on Scheduler
    * Event `TimeAxisColumn#timeAxisHeaderDblClick` - previously replaced by the same event on Scheduler
    * Event `TimeAxisColumn#timeAxisHeaderContextMenu` - previously replaced by the same event on Scheduler
    * Function `CrudManager#commit()` - previously replaced by `acceptChanges()`
    * Function `CrudManager#reject()` - previously replaced by `revertChanges()`
    * Function `CrudManager#commitCrudStores()` - previously replaced by `acceptChanges()`
    * Function `CrudManager#rejectCrudStores()` - previously replaced by `revertChanges()`
    * Property `CrudManager#timeRangesStore` - previously replaced by `timeRangeStore`
    * Function `DependencyStore#getEventPredecessors()` - previously replaced by `event.predecessors`
    * Function `DependencyStore#getEventSuccessors()` - previously replaced by `event.successors`
    * Function `EventStore#getEventsInTimeSpan()` - previously replaced by `getEvents()`
    * Function `EventStore#getEventsByStartDate()` - previously replaced by `getEvents()`
    * Arguments `startText`, `endText`, `startClockHtml`, `endClockHtml` & `dragData` of `EventDrag#tooltipTemplate()`
    * Param `context` of the `EventDrag#beforeEventDrag` event
    * Param `context` of the `EventDrag#eventDragStart` event
    * Param `context` of the `EventDrag#eventDrag` event
    * Param `context` of the `EventDrag#eventDragAbort` event
    * Param `newEventRecord` of the `EventDragCreate#dragCreateEnd` event - previously replaced by `eventRecord`
    * Param `proxyElement` of the `EventDragCreate#dragCreateEnd` event - previously replaced by `eventElement`
    * Param `proxyElement` of the `EventDragCreate#dragCreateStart` event - previously replaced by `eventElement`
    * Param `proxyElement` of the `EventDragCreate#beforeDragCreateFinalize` event - previously replaced by
      `eventElement`
    * Param `proxyElement` of the `EventDragCreate#afterDragCreate` event - previously replaced by `eventElement`
    * Config `ResourceTimeRanges#store` - previously replaced by `Scheduler#resourceTimeRangeStore`
    * Config `ResourceTimeRanges#resourceTimeRanges` - previously replaced by `Scheduler#resourceTimeRanges`
    * Config `TimeRanges#store` - previously replaced by `Scheduler#timeRangeStore`
    * Config `TimeRanges#timeRanges` - previously replaced by `Scheduler#timeRanges`
    * Param `data.source` of the `Dependencies#beforeDependencyCreateDrag` event - previously replaced by `source` param
    * Param `data` of the `Dependencies#dependencyCreateDragStart` event - previously replaced by top level params
    * Param `data` of the `Dependencies#dependencyValidationComplete` event - previously replaced by top level params
    * Param `data` of the `Dependencies#dependencyValidationStart` event - previously replaced by top level params
    * Param `data` of the `Dependencies#dependencyCreateDrop` event - previously replaced by top level params
    * Param `data` of the `Dependencies#afterDependencyCreateDrop` event - previously replaced by top level params
    * Property `DependencyModel#sourceEvent` - previously replaced by `fromEvent`
    * Property `DependencyModel#targetEvent` - previously replaced by `toEvent`
    * Function `DependencyModel#getSourceEvent()` - previously replaced by `fromEvent`
    * Function `DependencyModel#getTargetEvent()` - previously replaced by `toEvent`
    * Argument `tplData` of `Scheduler#eventRenderer()` - previously replaced by `renderData`
    * Param `tplData` of the `Scheduler#renderEvent` event - previously replaced by `renderData`
    * Param `resources` of the `Scheduler#beforeEventAdd` event - previously replaced by `resourceRecords`
    * Function `Scheduler#getVisibleDateRange()` - previously replaced by property `visibleDateRange`
    * Config `EventDrag#dragTipTemplate` - previously replaced by `tooltipTemplate`
    * Event `Scheduler#beforeExport` - in favor of `beforePdfExport` event
    * Event `Scheduler#export` - in favor of `pdfExport` event

### BUG FIXES

* [#758](https://github.com/bryntum/support/issues/758) - State mixin to use configurable's `onConfigChange` hook
* [#1953](https://github.com/bryntum/support/issues/1953) - When constrainDragToTimeline is false the dragging outside a scheduler should be invalid
* [#1954](https://github.com/bryntum/support/issues/1954) - Create a demo showing drag events to grid
* [#2192](https://github.com/bryntum/support/issues/2192) - Events rendering is broken when prevent multiple event drag which is not constrained to the timeline
* [#3069](https://github.com/bryntum/support/issues/3069) - Nested events misrendered if startDate starts before visible area
* [#3829](https://github.com/bryntum/support/issues/3829) - Extra element appears after invalid drag drop when constrainDragToTimeline is disabled
* [#4147](https://github.com/bryntum/support/issues/4147) - Milestone label overlaps element
* [#4151](https://github.com/bryntum/support/issues/4151) - Bad animation when `constrainToTimeline` is false
* [#4207](https://github.com/bryntum/support/issues/4207) - `getDateConstraints` not working in vertical Scheduler
* [#4212](https://github.com/bryntum/support/issues/4212) - Error thrown when event is updated in a non-painted scheduler
* [#4227](https://github.com/bryntum/support/issues/4227) - Event drag drop is broken in closed shadow root
* [#4239](https://github.com/bryntum/support/issues/4239) - Vertical mode crashes if endDate is not provided in data

## 4.3.9 - 2022-02-17

### BUG FIXES

* [#4121](https://github.com/bryntum/support/issues/4121) - Reasonable minimum task bar in both `Gantt` and `Scheduler`
* [#4167](https://github.com/bryntum/support/issues/4167) - `EventDrag` feature does not allow configuration of its tooltip
* [#4184](https://github.com/bryntum/support/issues/4184) - `DomClassList` not updated when cls changes using `syncDataOnLoad`

## 4.3.8 - 2022-02-07

### BUG FIXES

* [#4100](https://github.com/bryntum/support/issues/4100) - `DependencyStore` does not sync when updating dependency

## 4.3.7 - 2022-02-02

### API CHANGES

* [DEPRECATED] Scheduler `beforeExport` and `export` events (triggered by `PdfExport` feature) were deprecated in favor
  of the `beforePdfExport` and `pdfExport` events respectively. The old event names will be dropped in v5.0.0

### BUG FIXES

* [#630](https://github.com/bryntum/support/issues/630) - Drag drop is not finalized correctly when fillTicks is enabled
* [#4050](https://github.com/bryntum/support/issues/4050) - `Tooltip` aligned on clipped out area of target element
* [#4051](https://github.com/bryntum/support/issues/4051) - `CellTooltip` does not update on next show for the same row, when its record is mutated
* [#4082](https://github.com/bryntum/support/issues/4082) - Relayed listeners do not trigger onFunctions
* [#4092](https://github.com/bryntum/support/issues/4092) - Code editor wrongly positioned in theme example

## 4.3.6 - 2022-01-13

### BUG FIXES

* [#3779](https://github.com/bryntum/support/issues/3779) - Dependencies aren't attached to correct task after scrolling
* [#3798](https://github.com/bryntum/support/issues/3798) - The Cancel button of the recurrence confirmation dialog doesn't cause rerender
* [#3933](https://github.com/bryntum/support/issues/3933) - An error when using multiSelect filter field config for tree column
* [#3974](https://github.com/bryntum/support/issues/3974) - Crash after dragging event with no content element
* [#3976](https://github.com/bryntum/support/issues/3976) - Grid Column needs a maxWidth config
* [#3990](https://github.com/bryntum/support/issues/3990) - Chrome & Content Security Policy causes failure because of debug code section
* [#3994](https://github.com/bryntum/support/issues/3994) - Scheduler fails to scroll for drag-create when row-reorder is enabled

## 4.3.5 - 2021-12-24

### API CHANGES

* [DEPRECATED] ResourceInfoColumn `validNames` is deprecated and will be removed in 6.0

### BUG FIXES

* [#3544](https://github.com/bryntum/support/issues/3544) - dragCreate takes wrong dates if weekStartDay is not default
* [#3752](https://github.com/bryntum/support/issues/3752) - Restoring state after `filterBy` on grid (or scheduler) crashes
* [#3815](https://github.com/bryntum/support/issues/3815) - Event listeners stop working properly after scroll using Firefox
* [#3896](https://github.com/bryntum/support/issues/3896) - [TypeScript] Wrong typings of model class configs
* [#3899](https://github.com/bryntum/support/issues/3899) - `ScheduleTooltip` feature should forward own configuration into it's tooltip the same as `TooltipBase`
* [#3907](https://github.com/bryntum/support/issues/3907) - [TypeScript] Cannot pass Scheduler instance to `Store.relayAll`
* [#3918](https://github.com/bryntum/support/issues/3918) - Event tooltip stays visible on target change if `hideOnDelegateChange` is enabled
* [#3927](https://github.com/bryntum/support/issues/3927) - TimeAxis available space set too narrow on TimeAxisSubGrid resize
* [#3928](https://github.com/bryntum/support/issues/3928) - DateHelper `k` format behaves incorrectly

## 4.3.4 - 2021-12-13

### FEATURES / ENHANCEMENTS

* Updated `advanced`, `animations`, `custom-event-editor` and `drag-from-grid` Angular demos to use Angular 13
  ([#3742](https://github.com/bryntum/support/issues/3742))
* Added Angular demo which shows using TimeRanges feature with recurring time spans and TypeScript mixins. Demo is
  located at `examples\angular\recurring-timeranges`
* Added React demo which shows using TimeRanges feature with recurring time spans TypeScript mixins. Demo is located
  at `examples\react\typescript\recurring-timeranges`

### BUG FIXES

* [#3495](https://github.com/bryntum/support/issues/3495) - Extra scrollbar space when resizing partner panels
* [#3508](https://github.com/bryntum/support/issues/3508) - Deleting all future events does not update recurrenceRule
* [#3621](https://github.com/bryntum/support/issues/3621) - [TypeScript] Improve typings of mixins
* [#3699](https://github.com/bryntum/support/issues/3699) - Export generates empty pages if scrolled to bottom before
* [#3737](https://github.com/bryntum/support/issues/3737) - EventStore's LoadDateRange is too large on ViewPreset changes
* [#3759](https://github.com/bryntum/support/issues/3759) - Touch drag starts event drag creation
* [#3763](https://github.com/bryntum/support/issues/3763) - EventStore's LoadDateRange emits twice on ViewPreset changes
* [#3767](https://github.com/bryntum/support/issues/3767) - Incorrect expand/collapse functionality when the resources are initially collapsed
* [#3801](https://github.com/bryntum/support/issues/3801) - Scheduler - White space appearing at the bottom of a tree grid
* [#3830](https://github.com/bryntum/support/issues/3830) - resourceRecord param undefined when pasting event using [Ctrl V]
* [#3834](https://github.com/bryntum/support/issues/3834) - Make the copy paste suffix configurable
* [#3837](https://github.com/bryntum/support/issues/3837) - Scheduler with autoHeight places scrollbar below foreground canvas
* [#3850](https://github.com/bryntum/support/issues/3850) - [TypeScript] Missing static properties in typings
* [#3852](https://github.com/bryntum/support/issues/3852) - Crash if zooming while hovering event resize handle
* [#3853](https://github.com/bryntum/support/issues/3853) - Cannot set row height for scheduler webcomponent
* [#3854](https://github.com/bryntum/support/issues/3854) - `DependencyColumn` does not produce valid value for the Filter Feature
* [#3856](https://github.com/bryntum/support/issues/3856) - Dragged event bar maintains sticky event styling after aborted drag

## 4.3.3 - 2021-11-30

### FEATURES / ENHANCEMENTS

* `EventSelection` now offers an `isEventSelectable` template method which you can implement to prevent some events from
  being selected ([#3647](https://github.com/bryntum/support/issues/3647))
* Scroll performance when using `StickyEvents` was improved by not processing events that are fully in view
  ([#3709](https://github.com/bryntum/support/issues/3709))

### API CHANGES

* The `EventTooltip` feature now hides the tooltip on scroll by default, whereas it previously realigned it. This change
  was done to boost scrolling performance, since realigning the tooltip has negative impact on that. To restore the old
  behaviour, configure the feature with `scrollAction : 'realign'`

### BUG FIXES

* [#3370](https://github.com/bryntum/support/issues/3370) - Recurring range performance issue if many ranges used
* [#3620](https://github.com/bryntum/support/issues/3620) - Milestone's left/right label position is off
* [#3635](https://github.com/bryntum/support/issues/3635) - Drag Error with `constrainDragToTimeline: false`
* [#3640](https://github.com/bryntum/support/issues/3640) - Left/right labels not vertically centered in demo
* [#3645](https://github.com/bryntum/support/issues/3645) - Dependency links are not shown up at browser zoom level 75%
* [#3648](https://github.com/bryntum/support/issues/3648) - [DOCS] Content navigation is broken
* [#3662](https://github.com/bryntum/support/issues/3662) - Partnered scheduler collapse state not synced
* [#3683](https://github.com/bryntum/support/issues/3683) - Not possible to set `constrainDragToTimeline` in `beforeEventDragListener`
* [#3700](https://github.com/bryntum/support/issues/3700) - [REACT] Equipment list empty in drag-onto-tasks demo
* [#3702](https://github.com/bryntum/support/issues/3702) - Events not shown when `eventId` or `resourceId` of assignments use dataSource
* [#3715](https://github.com/bryntum/support/issues/3715) - Infinite scroll changes height of Timeline viewport momentarily
* [#3720](https://github.com/bryntum/support/issues/3720) - `dataSource` property not working on dependency from and to fields
* [#3735](https://github.com/bryntum/support/issues/3735) - `eventMenuBeforeShow` event doesn't expose browser event
* [#3740](https://github.com/bryntum/support/issues/3740) - Support async `beforeshow` event on a widget
* [#3743](https://github.com/bryntum/support/issues/3743) - [DOCS] `web.config` file for Windows IIS server
* [#3785](https://github.com/bryntum/support/issues/3785) - `infiniteScroll` does not re-center when clicking the rightmost point of the horizontal scrollbar
* [#3800](https://github.com/bryntum/support/issues/3800) - Investigate performance with recurring `ResourceTimeRanges`

## 4.3.2 - 2021-10-29

### FEATURES / ENHANCEMENTS

* `EventCopyPaste` feature now fires `beforeCopy` and `beforePaste` events to let you prevent the actions ([#3303](https://github.com/bryntum/support/issues/3303))
* Added a new React demo that shows how to use state to bind events and resources to Scheduler. Demo is located in
  `examples/frameworks/react/javascript/react-state` folder ([#3366](https://github.com/bryntum/support/issues/3366))

### BUG FIXES

* [#3442](https://github.com/bryntum/support/issues/3442) - Recurring events doesn't work in vertical mode
* [#3603](https://github.com/bryntum/support/issues/3603) - ResourceTimeRange showing content from reused event element
* [#3604](https://github.com/bryntum/support/issues/3604) - Events still rendered after returning false from beforeEventAdd listener

## 4.3.1 - 2021-10-21

### FEATURES / ENHANCEMENTS

* Added a new demo using a big data set in a tree scheduler, called `bigdataset-tree`. Optionally also displays
  ResourceTimeRanges and Dependencies
* Bumped builtin Font Awesome Free to version 5.15.4

### BUG FIXES

* [#2481](https://github.com/bryntum/support/issues/2481) - `EventCopyPaste` forces single assignment mode
* [#2495](https://github.com/bryntum/support/issues/2495) - Should be possible to disable `StickyEvents` dynamically
* [#2696](https://github.com/bryntum/support/issues/2696) - Resource Histogram is not aligned when partnered on the fly
* [#3432](https://github.com/bryntum/support/issues/3432) - [ANGULAR] `EventTooltip` template is shown only once when displaying customElement
* [#3479](https://github.com/bryntum/support/issues/3479) - Crash after removing multiple events using keyboard
* [#3515](https://github.com/bryntum/support/issues/3515) - Setting `resourceTimeRange` store data breaks the view
* [#3523](https://github.com/bryntum/support/issues/3523) - Dragging events with Ctrl key pressed always adds to selection
* [#3539](https://github.com/bryntum/support/issues/3539) - Resource time ranges are not rendered for initially invisible resource rows
* [#3563](https://github.com/bryntum/support/issues/3563) - Feature toggle event for baselines feature does not fire
* [#3567](https://github.com/bryntum/support/issues/3567) - Minified css bundle contains unicode chars
* [#3568](https://github.com/bryntum/support/issues/3568) - Incorrect `visibleDateRange` in horizontal scroll listener when changing view preset
* [#3574](https://github.com/bryntum/support/issues/3574) - Fix recurrence editor handling of monthly pattern using "On the n'th of the month" ("first" was ignored,
  "second" was interpreted as "first", etc.)
* [#3579](https://github.com/bryntum/support/issues/3579) - Crash when combining `resourceTimeRanges` and `eventRenderer` with custom content
* [#3593](https://github.com/bryntum/support/issues/3593) - Weekly recurrence does not handle Sunday properly

## 4.3.0 - 2021-10-12

### FEATURES / ENHANCEMENTS

* [BREAKING] `@babel/preset-env` config target `chrome: 75` is now used for the UMD bundle. This decreases bundle size
  and improves performance for modern browsers ([#3201](https://github.com/bryntum/support/issues/3201))
* Legacy Angular demos for versions 1-5 were removed due to incompatibility with the new UMD bundle format
* Dependency drawing was sped up a bit by not always recalculating dependency bounds. This change will give a boost
  to scroll performance for schedules with many dependencies ([#3486](https://github.com/bryntum/support/issues/3486))

### API CHANGES

* TimeAxisColumn now subclasses WidgetColumn (before it was a Column), this should not affect your code. This opens up
  for rendering widgets embedded in row cells, see this demonstrated in the `examples/embedded-chart` demo in
  Scheduler Pro
* [DEPRECATED] Buttons `menuIconCls` config was deprecated in favor of the new `menuIcon` config, which better matches
  the naming of other configs

### BUG FIXES

* [#2811](https://github.com/bryntum/support/issues/2811) - Zoomed-out dependencies do not display correctly
* [#3449](https://github.com/bryntum/support/issues/3449) - `ResourceTimeRanges` disappear when many tasks are overlapping on a resource
* [#3472](https://github.com/bryntum/support/issues/3472) - Error after drop while finalizing async beforeEventDropFinalize event after switching browser tab
* [#3473](https://github.com/bryntum/support/issues/3473) - Dependencies not repainted after editing event duration
* [#3474](https://github.com/bryntum/support/issues/3474) - Fix and update React Advanced JavaScript demo
* [#3476](https://github.com/bryntum/support/issues/3476) - `DragCreate` does not work after scrolling on Firefox
* [#3477](https://github.com/bryntum/support/issues/3477) - Resource time range gets the name of the event after re-add
* [#3482](https://github.com/bryntum/support/issues/3482) - EventStore's `add` event not being emitted when editing occurrences
* [#3509](https://github.com/bryntum/support/issues/3509) - Tooltip position is wrongly recognized after moving event out of schedule
* [#3521](https://github.com/bryntum/support/issues/3521) - Time range and resource time range should not share `z-index`

## 4.2.7 - 2021-10-01

### FEATURES / ENHANCEMENTS

* `ComboBox` can now be configured to accept unmatched typed filter strings to create a new record. Use the
  `createOnUnmatched` config to enable this. This may be configured as a function to create the new record in an
  app-specific way. See the `eventeditor` example for usage ([#3249](https://github.com/bryntum/support/issues/3249))
* You can now force single assignment mode using the `singleAssignment` config on EventStore ([#3287](https://github.com/bryntum/support/issues/3287))

### BUG FIXES

* [#1481](https://github.com/bryntum/support/issues/1481) - Recurring events repeats endless after delete one of occurrences
* [#3166](https://github.com/bryntum/support/issues/3166) - Dependency editor Lag field does not use `dependency.lagUnit` value
* [#3413](https://github.com/bryntum/support/issues/3413) - Correct DST handling in monthly recurrence for nth weekdays of a month
* [#3422](https://github.com/bryntum/support/issues/3422) - [LWC] Scheduler pro doesn't render all events
* [#3444](https://github.com/bryntum/support/issues/3444) - Time axis header is broken
* [#3449](https://github.com/bryntum/support/issues/3449) - ResourceTimeRanges disappear when many tasks are overlapping on a resource
* [#3456](https://github.com/bryntum/support/issues/3456) - End after X time setting not applies for event with end on date setting
* [#3458](https://github.com/bryntum/support/issues/3458) - Document nested fields
* [#3479](https://github.com/bryntum/support/issues/3479) - Crash after removing multiple events using keyboard

## 4.2.6 - 2021-09-15

### FEATURES / ENHANCEMENTS

* The ResourceTimeRanges feature has a new `tabIndex` config that lets you control if the ranges are focusable/reachable
  using tab or not ([#3391](https://github.com/bryntum/support/issues/3391))

### BUG FIXES

* [#3177](https://github.com/bryntum/support/issues/3177) – React custom-event-editor demo issues
* [#3208](https://github.com/bryntum/support/issues/3208) - Header is rendered incorrectly for monthAndYear preset
* [#3370](https://github.com/bryntum/support/issues/3370) - Recurring range performance issue if many ranges used
* [#3376](https://github.com/bryntum/support/issues/3376) - Drag create breaks group summary
* [#3383](https://github.com/bryntum/support/issues/3383) - Setting store.data throws if syncDataOnLoad:true while re-assigning data with custom fields
* [#3387](https://github.com/bryntum/support/issues/3387) - Group header incorrect when showing summary in header
* [#3388](https://github.com/bryntum/support/issues/3388) - GroupSummary counts wrong for the first tick if event ends in that tick
* [#3408](https://github.com/bryntum/support/issues/3408) - Updated typings to support spread operator for method parameters

## 4.2.5 - 2021-09-08

### FEATURES / ENHANCEMENTS

* ProjectModel now fires a `dataReady` event when the engine has finished its calculations and the result has been
  written back to the records ([#2019](https://github.com/bryntum/support/issues/2019))
* The API documentation now better communicates when a field or property accepts multiple input types but uses a single
  type for output. For example date fields on models, which usually accepts a `String` or `Date` but always outputs a
  `Date` ([#2933](https://github.com/bryntum/support/issues/2933))

### BUG FIXES

* [#223](https://github.com/bryntum/support/issues/223) - View preset should support any number of headers
* [#1482](https://github.com/bryntum/support/issues/1482) - Show a tooltip when drag an event from the grid to scheduler
* [#2756](https://github.com/bryntum/support/issues/2756) - Row height is not recalculated when collapsing group when using `collapseToHeader`
* [#3273](https://github.com/bryntum/support/issues/3273) - Follow cursor on event resize when using fillTicks
* [#3283](https://github.com/bryntum/support/issues/3283) - Resources grouping works incorrect with some data set
* [#3313](https://github.com/bryntum/support/issues/3313) - Allow `String`, `String[]` and `Object` in `cls` getter for subclassing `EventModel`
* [#3322](https://github.com/bryntum/support/issues/3322) - Add `dataChange` event to framework guides
* [#3323](https://github.com/bryntum/support/issues/3323) - Forward step button in toolbar not working
* [#3330](https://github.com/bryntum/support/issues/3330) - Syncing records with syncDataOnLoad throws an error
* [#3342](https://github.com/bryntum/support/issues/3342) - Bug when combining simpleEventEdit and eventEdit
* [#3345](https://github.com/bryntum/support/issues/3345) - AspNet demos use wrong `@bryntum` npm package version
* [#3355](https://github.com/bryntum/support/issues/3355) - Column cell tooltip misplaced with `hideDelay = 0`
* [#3356](https://github.com/bryntum/support/issues/3356) - `EventResize#showTooltip` config has no effect
* [#3357](https://github.com/bryntum/support/issues/3357) - `OnBeforeEventDrag` not working
* [#3374](https://github.com/bryntum/support/issues/3374) - Crash after filtering
* [#3377](https://github.com/bryntum/support/issues/3377) - Drag create first creates long bar, then hides it

## 4.2.4 - 2021-08-27

### FEATURES / ENHANCEMENTS

* The `EventDragCreate` feature has a new config called `lockLayout`. Set it to `true` to emulate the pre 4.2 drag
  create behaviour, locking events in place until user finishes the drag gesture. Also applies some styling to
  differentiate the event being created from the existing events when the config is used ([#3228](https://github.com/bryntum/support/issues/3228))
* ScheduleTooltip feature has a new config `hideForNonWorkingTime` which hides it when hovering weekends and other
  non-working time ranges
* Scheduler's project (that holds all of its stores) now triggers a `change` event when data in any of the stores
  changes. Useful to listen for to keep an external data model up to date for example. This event is also relayed by
  Scheduler as `dataChange`, to allow easier binding in frameworks ([#3281](https://github.com/bryntum/support/issues/3281))

### API CHANGES

* [DEPRECATED] The `store` property on the TimeRanges feature was deprecated. The corresponding config was deprecated in
  4.0, the property should have been flagged at the same time

### BUG FIXES

* [#794](https://github.com/bryntum/support/issues/794) - Dependency creation tooltip is initially misaligned
* [#1158](https://github.com/bryntum/support/issues/1158) - Filtering out all resources in vertical mode should show empty message
* [#1432](https://github.com/bryntum/support/issues/1432) - Scheduler doesn't take DST into account for event duration
* [#1702](https://github.com/bryntum/support/issues/1702) - Error if no value in the field used in dataSource paths
* [#2501](https://github.com/bryntum/support/issues/2501) - Scheduler in vertical mode should stretch foreground canvas as in horizontal mode
* [#2521](https://github.com/bryntum/support/issues/2521) - Not possible to set resourceTimeRangeStore on Scheduler
* [#2887](https://github.com/bryntum/support/issues/2887) - Changing event's data while resizing causes issues
* [#2971](https://github.com/bryntum/support/issues/2971) - ResourceTimeRangeStore updates not tracked by STM
* [#3116](https://github.com/bryntum/support/issues/3116) - Gantt throws on task terminal drag
* [#3150](https://github.com/bryntum/support/issues/3150) - Allow EventDragCreateFeature to opt out of finalizing by resizing to zero width
* [#3180](https://github.com/bryntum/support/issues/3180) - Drag create does not flip edges correctly
* [#3219](https://github.com/bryntum/support/issues/3219) - Replacing events is slow
* [#3231](https://github.com/bryntum/support/issues/3231) - Render event for resource time ranges does not fire anymore
* [#3251](https://github.com/bryntum/support/issues/3251) - Document recurrent time ranges for timeranges feature
* [#3253](https://github.com/bryntum/support/issues/3253) - Crash when dragging row in drag-from-grid demo in vertical mode
* [#3254](https://github.com/bryntum/support/issues/3254) - Vertical resourceColumns fillWidth & fitWidth configs have no effect
* [#3262](https://github.com/bryntum/support/issues/3262) - Vertical time axis column content overflows its cell
* [#3263](https://github.com/bryntum/support/issues/3263) - Deleted dependency still rendered
* [#3265](https://github.com/bryntum/support/issues/3265) - Docs are not scrolled to the referenced member
* [#3282](https://github.com/bryntum/support/issues/3282) - Dragging the thumb in infinite scroll causes overscrolling
* [#3283](https://github.com/bryntum/support/issues/3283) - Resources grouping works incorrect with some data set
* [#3290](https://github.com/bryntum/support/issues/3290) - Schedule tooltip should offer to hide itself when hovering non working time
* [#3291](https://github.com/bryntum/support/issues/3291) - Scheduler dependency tooltip should render the dependencyIdField rather than `task.id`
* [#3292](https://github.com/bryntum/support/issues/3292) - Events disappear in Scheduler on vertical scroll
* [#3297](https://github.com/bryntum/support/issues/3297) - Scheduler resource time range name (label) not visible
* [#3298](https://github.com/bryntum/support/issues/3298) - Existed in store events not assigned to new added resources if loaded on demand
* [#3300](https://github.com/bryntum/support/issues/3300) - Cannot use external URL for resourceImagePath
* [#3305](https://github.com/bryntum/support/issues/3305) - Guides look bad in the docs search results
* [#3306](https://github.com/bryntum/support/issues/3306) - Doc browser does not scroll to member
* [#3327](https://github.com/bryntum/support/issues/3327) - Not possible to combine eventEdit + simpleEventEdit features
* [#3332](https://github.com/bryntum/support/issues/3332) - [LWC] Exception when realigning popup

## 4.2.3 - 2021-08-05

### FEATURES / ENHANCEMENTS

* You can now define the default new event duration when double clicking schedule by setting
  config `createEventOnDblClick : { useEventModelDefaults : true }`. When setting config `useEventModelDefaults` to
  true, the default duration and durationUnit will be read from the default values of the `duration` and `durationUnit`
  fields of the EventModel. ([#3234](https://github.com/bryntum/support/issues/3234))
* CrudManager can now log warnings to the browser console when it detects an unexpected response format. To enable these
  checks please use the `validateResponse` config ([#2668](https://github.com/bryntum/support/issues/2668))
* Fixed a scroll performance regression introduced in version 4.2.2
* [NPM] Bryntum Npm server now supports remote private repository access for Artifactory with username and password
  authentication ([#2864](https://github.com/bryntum/support/issues/2864))
* [TYPINGS] Type definitions now contain typed `features` configs and properties ([#2740](https://github.com/bryntum/support/issues/2740))

### API CHANGES

* [DEPRECATED] PdfExport feature `export` event is deprecated and will be removed in 4.3.0. Use `export` event on the
  Scheduler instead
* [DEPRECATED] Scheduler `beforeExport` event signature is deprecated and will be removed in 4.3.0. New signature wraps
  config object to the corresponding key

### BUG FIXES

* [#2948](https://github.com/bryntum/support/issues/2948) - CrudManager should handle autoSync during sync
* [#3116](https://github.com/bryntum/support/issues/3116) - Gantt throws on task terminal drag
* [#3126](https://github.com/bryntum/support/issues/3126) - `timeAxisSubGrid` is missing from Scheduler typings
* [#3199](https://github.com/bryntum/support/issues/3199) - Setting partner to vertical scheduler in runtime throws
* [#3203](https://github.com/bryntum/support/issues/3203) - Crud Manager not sending assignment record
* [#3205](https://github.com/bryntum/support/issues/3205) - Scheduler: Summaries not "counted" when event ends outside of current date range
* [#3210](https://github.com/bryntum/support/issues/3210) - Drag to create render issue
* [#3232](https://github.com/bryntum/support/issues/3232) - EventModel.set() and normalization bug - event moves instead of resizing

## 4.2.2 - 2021-07-21

### FEATURES / ENHANCEMENTS

* You can now distinguish new events being created using drag create (or double clicking in the schedule) by checking
  the Model#isCreating flag. In the DOM, a new CSS class b-sch-creating has been added to all events that are being
  created
* Added a new `hideRangesOnZooming` config to `NonWorkingTime` feature ([#2788](https://github.com/bryntum/support/issues/2788)). The config allows to disable the
  feature default behavior when it hides ranges shorter than the base timeaxis unit on zooming out
* TimeRange feature can now show a tooltip when hovering a time range header element, by using the new `tooltipTemplate`
  config ([#3194](https://github.com/bryntum/support/issues/3194))
* [NPM] Bryntum Npm server now supports `npm token` command for managing access tokens for CI/CD ([#2703](https://github.com/bryntum/support/issues/2703))

### BUG FIXES

* [#201](https://github.com/bryntum/support/issues/201) - Line event styles should go from top to bottom in vertical mode
* [#2071](https://github.com/bryntum/support/issues/2071) - Support configuring eventeditor / taskeditor child items with 'true' value
* [#2661](https://github.com/bryntum/support/issues/2661) - DateTime field in EventEditor does not allow selecting a date same as max value
* [#2666](https://github.com/bryntum/support/issues/2666) - Sticky events content positioning issue while scrolling
* [#3141](https://github.com/bryntum/support/issues/3141) - Event store optimization
* [#3146](https://github.com/bryntum/support/issues/3146) - Scheduler renders too many events for single resource
* [#3147](https://github.com/bryntum/support/issues/3147) - Drag create finalization code should not throw when scheduler instance is destroyed
* [#3148](https://github.com/bryntum/support/issues/3148) - [ANGULAR] Icon misrendered in dependency demo
* [#3149](https://github.com/bryntum/support/issues/3149) - Event drag tooltip misrendered after dragging task out of schedule then back in
* [#3154](https://github.com/bryntum/support/issues/3154) - Engine in Scheduler takes too much time to handle the data
* [#3167](https://github.com/bryntum/support/issues/3167) - LWC bundle is missing from trial packages
* [#3178](https://github.com/bryntum/support/issues/3178) - Syntax highlighter messes up code snippets in docs
* [#3181](https://github.com/bryntum/support/issues/3181) - Partnered scheduler does not update after assigning a task in Gantt assignment column
* [#3200](https://github.com/bryntum/support/issues/3200) - showTooltip config of EventDragCreate has no effect

## 4.2.1 - 2021-07-07

### FEATURES / ENHANCEMENTS

* Added throttle/buffer options for event listeners ([#2590](https://github.com/bryntum/support/issues/2590))
* [FRAMEWORKS] Added `scheduleContextFeature` to frameworks wrappers ([#3135](https://github.com/bryntum/support/issues/3135))

### BUG FIXES

* [#3046](https://github.com/bryntum/support/issues/3046) - Events being dragged with the StickyEvents feature enabled should keep event inner text in view
* [#3117](https://github.com/bryntum/support/issues/3117) - Improve the docs to show how to access `eventRecord` in `beforeShow` listener
* [#3125](https://github.com/bryntum/support/issues/3125) - Error when summary feature enabled event starts at time axis end
* [#3131](https://github.com/bryntum/support/issues/3131) - Browser unresponsive with large data set
* [#3134](https://github.com/bryntum/support/issues/3134) - ScheduleContext should be off by default
* [#3136](https://github.com/bryntum/support/issues/3136) - [NPM] Running `npm install` twice creates modified `package-lock.json` file
* [#3139](https://github.com/bryntum/support/issues/3139) - Support `on` and `un` methods for `eventTooltip` feature instance

## 4.2.0 - 2021-06-30

### FEATURES / ENHANCEMENTS

* Scheduler has a new config option `infiniteScroll` meaning that as the user scrolls the timeline back or forward in
  time, the "window" of time encapsulated by the TimeAxis is moved and the EventStore fires a `loadDateRange` event
  ([#1114](https://github.com/bryntum/support/issues/1114))
* Dependencies can now be created by dropping on the target event without hitting the terminal circle element. The
  defaultValue of the DependencyModel `type` field will be used in this case. ([#3003](https://github.com/bryntum/support/issues/3003))
* Dependency creation can now be finalized asynchronously, for example after showing the user a confirmation dialog
* The `EventResize` feature now uses the task's data to change the appearance by updating `endDate` or `startDate` live
  but in batched mode so that the changes are not available for server sync until the operation is finished
  ([#2541](https://github.com/bryntum/support/issues/2541))
* EventResize now allows resizing an event to be zero duration, enable this behavior with the new `allowResizeToZero`
  config. ([#2945](https://github.com/bryntum/support/issues/2945))
* Added "Upgrade Font Awesome icons to Pro version" guide
* Updated "Replacing Font Awesome with Material Icons" guide

### API CHANGES

* [DEPRECATED] The `resources` param of the `beforeEventAdd` event fired by Scheduler was renamed to `resourceRecords`
  and will be removed in 5.0
* [DEPRECATED] The `newEventRecord` param of the `dragCreateEnd` event fired by Scheduler was renamed to `eventRecord`
  and will be removed in 5.0

### LOCALE UPDATES

* `removeRows` label of CellMenu & GridBase was removed
* Value of `removeRow` label of CellMenu & GridBase was updated to say just 'Remove'
* RowCopyPaste locales were updated to just say 'Copy', 'Cut' & 'Paste'. `copyRows`, `cutRows` & `pasteRows` keys were
  removed
* EventCopyPaste locales were updated to just say 'Copy', 'Cut' & 'Paste'. `copyRows`, `cutRows` & `pasteRows` keys were
  removed

### BUG FIXES

* [#2366](https://github.com/bryntum/support/issues/2366) - Drag to Create - Selection Spans entire resource row instead of an event block
* [#2706](https://github.com/bryntum/support/issues/2706) - Drag and drop is not accurate when scrolling vertically
* [#3044](https://github.com/bryntum/support/issues/3044) - Dragged event misplaced on scroll
* [#3047](https://github.com/bryntum/support/issues/3047) - Time axis header formatting broken
* [#3064](https://github.com/bryntum/support/issues/3064) - Vertical demo summary is empty after zooming
* [#3099](https://github.com/bryntum/support/issues/3099) - Setting eventStore.data with enabled syncDataOnLoad doesn't update rendered events
* For more details, see [What's new](https://bryntum.com/products/scheduler/docs/guide/Scheduler/whats-new/4.2.0)
  and [Upgrade guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/upgrades/4.2.0) in docs

## 4.1.6 - 2021-06-23

### BUG FIXES

* [#110](https://github.com/bryntum/support/issues/110) - Group and Sort features should support custom sorting functions
* [#2756](https://github.com/bryntum/support/issues/2756) - Row height is not recalculated when collapsing group
* [#2977](https://github.com/bryntum/support/issues/2977) - Summary feature and Filter feature work slow together
* [#3005](https://github.com/bryntum/support/issues/3005) - [VUE-3] Problem with Critical Paths due to Vue Proxy and double native events firing bug
* [#3021](https://github.com/bryntum/support/issues/3021) - Event editor should not allow end date before start date
* [#3026](https://github.com/bryntum/support/issues/3026) - [VUE-2] and [VUE-3] typescript type declarations are missing
* [#3078](https://github.com/bryntum/support/issues/3078) - Avatars initials not rendering inside perfect circle

## 4.1.5 - 2021-06-09

### FEATURES / ENHANCEMENTS

* The behaviour when dragging unselected events has changed slightly. Scheduler now selects the event from which a drag
  originates, whereas previously it did not
* [TYPINGS] API singleton classes are correctly exported to typings ([#2752](https://github.com/bryntum/support/issues/2752))
* Added a new ResourceCollapse column to toggle `eventLayout` of a resource between overlap and stack. A new
  `resource-collapsing` demo has been added to showcase the feature ([#2979](https://github.com/bryntum/support/issues/2979))
* Scheduler now has a `minHeight` of `10em` by default. This assures that the Scheduler will get a size even if no other
  sizing rules are applied for the element it is rendered to. When the default `minHeight` is driving the height, a
  warning is shown on the console to let the dev know that sizing rules are missing. The warning is not shown if a
  `minHeight` is explicitly configured ([#2915](https://github.com/bryntum/support/issues/2915))

### BUG FIXES

* [#1358](https://github.com/bryntum/support/issues/1358) - EventTooltip configs are missing
* [#2949](https://github.com/bryntum/support/issues/2949) - Schedule context menu should not be shown when clicking empty area below rows
* [#2953](https://github.com/bryntum/support/issues/2953) - UndoRedo buttons always disabled if used in event context menu
* [#2958](https://github.com/bryntum/support/issues/2958) - Weekly Repeat event editor doesn't fit day names
* [#2961](https://github.com/bryntum/support/issues/2961) - Recurring event rule is not working correctly for Week/Day view
* [#2974](https://github.com/bryntum/support/issues/2974) - eventRecord property not available in onBeforeShow listener
* [#2990](https://github.com/bryntum/support/issues/2990) - [ANGULAR] Preventable async events don't work
* [#2991](https://github.com/bryntum/support/issues/2991) - Events disappear after scrolling
* [#3000](https://github.com/bryntum/support/issues/3000) - Scheduler pro scrolling with touchpad not working properly on Firefox

## 4.1.4 - 2021-05-28

### FEATURES / ENHANCEMENTS

* TypeScript definitions updated to use typed `Partial<>` parameters where available
* Buttons now has a new style `b-transparent` that renders them without background or borders ([#2853](https://github.com/bryntum/support/issues/2853))
* [NPM] repository package `@bryntum/scheduler` now includes source code ([#2723](https://github.com/bryntum/support/issues/2723))
* [NPM] repository package `@bryntum/scheduler` now includes minified versions of bundles ([#2842](https://github.com/bryntum/support/issues/2842))
* [FRAMEWORKS] Frameworks demos packages dependencies updated to support Node v12

### API CHANGES

* [DEPRECATED] The `eventRecord` and `assignmentRecord` params of the `eventKeyDown` & `eventKeyUp` events fired by
  Scheduler were renamed to `eventRecords` and `assignmentRecords` to match the type (array)

### BUG FIXES

* [#31](https://github.com/bryntum/support/issues/31) - Bugs with selection state and scroll position after crudManager.load()
* [#2104](https://github.com/bryntum/support/issues/2104) - "Core" code not isomorphic
* [#2519](https://github.com/bryntum/support/issues/2519) - Vertical mode resourceStore.filter does not hide all resources even if filter result is empty
* [#2520](https://github.com/bryntum/support/issues/2520) - Events are misaligned when changing to summer time
* [#2575](https://github.com/bryntum/support/issues/2575) - Memory leak when replacing project instance
* [#2783](https://github.com/bryntum/support/issues/2783) - CellMenu not triggered on iPhone's with 3D touch enabled
* [#2834](https://github.com/bryntum/support/issues/2834) - Core should not use b-fa for icon prefix
* [#2875](https://github.com/bryntum/support/issues/2875) - Selected events cleared after aborted drag drop
* [#2880](https://github.com/bryntum/support/issues/2880) - Undoing a deleted event inserts two events
* [#2882](https://github.com/bryntum/support/issues/2882) - Snapping not enabled when dragging multiple events
* [#2898](https://github.com/bryntum/support/issues/2898) - eventKeyDown / eventKeyUp missing event param
* [#2901](https://github.com/bryntum/support/issues/2901) - Focus is lost when scrolling using native scrollbar
* [#2903](https://github.com/bryntum/support/issues/2903) - Event Edit modal closes on iPhone when user taps "Done" on the keyboard
* [#2919](https://github.com/bryntum/support/issues/2919) - Crash when moving mouse after mouse down and all events are removed before starting drag
* [#2928](https://github.com/bryntum/support/issues/2928) - Drag drop not finalized properly if dragged events are removed while dragging
* [#2935](https://github.com/bryntum/support/issues/2935) - Error when scrolled vertically and reducing data set size

## 4.1.3 - 2021-05-13

### FEATURES / ENHANCEMENTS

* Bumped the built-in version of FontAwesome Free to 5.15.3 and added missing imports to allow stacked icons etc
* Bumped the `@babel/preset-env` config target to `chrome: 75` for the Module bundle. This decreased bundle sizes and
  improved performance for modern browsers
* Vertical scroll performance was improved by limiting how far out of view events are drawn. Should especially help for
  scenarios where stacking leads to large row heights
* Updated Angular Wrappers to be compatible with Angular 6-7 in production mode for target `es2015`
* EventResize now has a configurable `tooltipTemplate` so you can easily show custom contents in the resizing tooltip
  See updated 'tooltips' demo to try it out ([#2244](https://github.com/bryntum/support/issues/2244))
* Added new `encoder.requestData` config for Crud Manager allowing to put static info into request data object
  ([#541](https://github.com/bryntum/support/issues/541))

### API CHANGES

* [DEPRECATED] EventDrag#dragTipTemplate was renamed to `tooltipTemplate` to better match the naming scheme of other
  features
* [DEPRECATED] The `startText`, `endText`, `startClockHtml`, `endClockHtml`, `dragData` params of the EventDrag
  dragTipTemplate / tooltipTemplate methods have been deprecated and will be removed in 5.0

### BUG FIXES

* [#509](https://github.com/bryntum/support/issues/509) - Drag from Grid demo should take in account allowOverlap
* [#1974](https://github.com/bryntum/support/issues/1974) - Not possible to add event listeners to EventTooltip feature
* [#2566](https://github.com/bryntum/support/issues/2566) - Committing CSS class not cleared correctly
* [#2646](https://github.com/bryntum/support/issues/2646) - Resource time zones are not exported correctly
* [#2690](https://github.com/bryntum/support/issues/2690) - [ANGULAR] Scheduler can't use custom fields in production build
* [#2704](https://github.com/bryntum/support/issues/2704) - setTimeSpan works incorrect if workingTime hours defined
* [#2705](https://github.com/bryntum/support/issues/2705) - Loading tree data first time with children true for the first node makes other nodes to ignore their
  children
* [#2754](https://github.com/bryntum/support/issues/2754) - Vue error appeared on create new event in custom editor if dependencies created before
* [#2770](https://github.com/bryntum/support/issues/2770) - Column lines misaligned when switching locale
* [#2771](https://github.com/bryntum/support/issues/2771) - Non-working days demo crash
* [#2774](https://github.com/bryntum/support/issues/2774) - Drag drop not finalized if eventStore data is cleared when dragging multiple events
* [#2778](https://github.com/bryntum/support/issues/2778) - Wrong module declaration in typings file
* [#2797](https://github.com/bryntum/support/issues/2797) - Crash when deleting a selected event using highlightSuccessors
* [#2800](https://github.com/bryntum/support/issues/2800) - Delete event menu action does not remove all selected events
* [#2829](https://github.com/bryntum/support/issues/2829) - Recurrence editor does not filter its UI according to recurrence type until the recurrence type field
  is *changed*
* [#2857](https://github.com/bryntum/support/issues/2857) - Not possible to pass timeAxis column in columns array
* [#2866](https://github.com/bryntum/support/issues/2866) - Missing method return value type for `EventSelection.isEventSelected` and
  `EventSelection.isAssignmentSelected`
* [#2867](https://github.com/bryntum/support/issues/2867) - Issue after dragging and aborting multiple events with Escape key

### API CHANGES

* [DEPRECATED] `TimeRanges#store` + `TimeRanges#timeRanges` configs have been deprecated in favor of supplying data on
  Scheduler or its project

## 4.1.2 - 2021-04-27

### BUG FIXES

* [#895](https://github.com/bryntum/support/issues/895) - Date in ScheduleTooltip does not update when scrolling

## 4.1.1 - 2021-04-23

### FEATURES / ENHANCEMENTS

* Scheduler / Gantt / Calendar will now react when CTRL-Z key to undo / redo recent changes made. Behavior can be
  controlled with the new `enableUndoRedoKeys` config ([#2532](https://github.com/bryntum/support/issues/2532))
* Added a new "Non-working days" demo
* Summary feature is now supported in vertical mode ([#2555](https://github.com/bryntum/support/issues/2555))
* Summary feature now supports summing only selected rows ([#2631](https://github.com/bryntum/support/issues/2631))
* Vertical mode now supports zooming using mouse wheel or when double clicking a time axis header cell ([#823](https://github.com/bryntum/support/issues/823))
* Added a new Angular 11 Routing demo

### API CHANGES

* Scheduler has a new public property `visibleResources` that returns the range of currently visible resources
* [DEPRECATED] Arguments of `beforeEventDrag`, `eventDragStart`, `eventDrag`, `eventDragAbort` listeners of the
  EventDrag feature have been updated. `context` argument has been deprecated. See the upgrade guide for more
  information
* [DEPRECATED] The events fired by Scheduler.column.TimeAxisColumn (`timeaxisheaderclick`, `timeaxisheadercontextmenu`,
  `timeaxisheaderdblclick`) were deprecated and should instead be listened to on the owning Scheduler / Gantt component

### BUG FIXES

* [#318](https://github.com/bryntum/support/issues/318) - Wrong Event and TimeRange durations when dragging over DST period
* [#868](https://github.com/bryntum/support/issues/868) - Should be possible to show all available context menus programmatically
* [#1083](https://github.com/bryntum/support/issues/1083) - Summary not updated after filtering with filter bar
* [#1152](https://github.com/bryntum/support/issues/1152) - TimeRange with empty label produces empty label element
* [#1554](https://github.com/bryntum/support/issues/1554) - Export demo problems
* [#1987](https://github.com/bryntum/support/issues/1987) - DOCS: React guide needs a section on how to listen for events
* [#2151](https://github.com/bryntum/support/issues/2151) - Wrong context is passed to the beforeEventDrag listener
* [#2365](https://github.com/bryntum/support/issues/2365) - scrollToDate call increases date range period
* [#2380](https://github.com/bryntum/support/issues/2380) - eventKeyDown and eventKeyUp events are not documented
* [#2428](https://github.com/bryntum/support/issues/2428) - Events disappear on reload if resource store is a tree
* [#2542](https://github.com/bryntum/support/issues/2542) - selectionMode with checkbox column does not handle selection mutating inside selectionChange listener
* [#2626](https://github.com/bryntum/support/issues/2626) - Last time axis column headers text alignment issue when cropped
* [#2630](https://github.com/bryntum/support/issues/2630) - Sticky headers not enabled
* [#2635](https://github.com/bryntum/support/issues/2635) - Milestone Resize Error
* [#2636](https://github.com/bryntum/support/issues/2636) - [WRAPPERS] Features are not updated at runtime
* [#2644](https://github.com/bryntum/support/issues/2644) - timeRangeStore property doesn't work for recurring time ranges
* [#2663](https://github.com/bryntum/support/issues/2663) - [ANGULAR] Scheduler crashes on 2nd create after destroy
* [#2664](https://github.com/bryntum/support/issues/2664) - Crash when using showCurrentTimeLine with headers hidden
* [#2673](https://github.com/bryntum/support/issues/2673) - Unsynced current timeline in partnered schedulers
* [#2675](https://github.com/bryntum/support/issues/2675) - Delete key should delete all selected events
* [#2679](https://github.com/bryntum/support/issues/2679) - on-owner events should be added to owner too in docs
* [#2681](https://github.com/bryntum/support/issues/2681) - Yarn. Package trial alias can not be installed

## 4.1.0 - 2021-04-02

### FEATURES / ENHANCEMENTS

* We are happy to announce that Bryntum Scheduler now can be directly installed using our npm registry. We've updated
  all our frameworks demos to use `@bryntum` npm packages. See them in `examples/frameworks` folder. Please refer to "
  Npm packages" guide in docs for registry login and usage information
* Added a new "Non-working days" demo
* Bryntum demos were updated with XSS protection code. `StringHelper.encodeHtml` and `StringHelper.xss` functions were
  used for this
* Model fields can now be marked with `alwaysWrite` to ensure important data fields are always included when updates are
  committed by a CrudManager ([#848](https://github.com/bryntum/support/issues/848))
* CrudManager now exposes a `changes` property returning an object with the current changes in its stores
* Added new Vue Cell Renderer demo to show Vue Components as cell renderers (Partially fixed [#946](https://github.com/bryntum/support/issues/946) - Vue: Support
  components in renderers)
* Schedulers performance was improved compared to version 4.0, mainly by shortening critical code paths such as getting
  record field values and by reducing the amount of work performed during the engines initial commit
* Summary feature now offers a `refresh` method to update summaries. See updated summary demo for sample usage
* Custom rendered HTML for events is no longer wrapped in an element unless there are other elements (such as icon) to
  also render
* Added new Vue 3 Simple demo to show integration of Bryntum Scheduler with Vue 3 ([#1315](https://github.com/bryntum/support/issues/1315))
* `eventColor` can now be specified as any valid CSS style (hex, hsl, rgba etc) ([#2314](https://github.com/bryntum/support/issues/2314))
* The Labels feature can now be configured to make event labels take part in the event layout process, preventing them
  from being overlapped by other events ([#2147](https://github.com/bryntum/support/issues/2147))
* Added new React 17 demo for Scheduler in vertical mode. The example also implements theme switching ([#1823](https://github.com/bryntum/support/issues/1823) and
  [#2213](https://github.com/bryntum/support/issues/2213))
* ResourceInfoColumn now shows resource initials if no avatar image exists ([#2202](https://github.com/bryntum/support/issues/2202))

### API CHANGES

* [BREAKING] Removed RequireJS demos and integration guides in favor of modern ES6 Modules technology ([#1963](https://github.com/bryntum/support/issues/1963))
* [BREAKING] `init` method is no longer required in Lightning Web Components and was removed from the LWC bundle
* [DEPRECATED] CrudManager `commit` was deprecated in favor of `acceptChanges`
* [DEPRECATED] CrudManager `commitCrudStores` was deprecated in favor of `acceptChanges`
* [DEPRECATED] CrudManager `reject` was deprecated in favor of `revertChanges`
* [DEPRECATED] CrudManager `rejectCrudStores` was deprecated in favor of `revertChanges`
* [DEPRECATED] In the `DependencyCreation` feature, the `data` param of all events was deprecated. All events now have
  useful documented top level params
* Value of `store` config defined on `TimeRanges` feature is no longer passed to Crud Manager instance. Instead please
  use `timeRangeStore` config on the project. That will both register the store on Crud Manager and used by the feature
  automatically

### BUG FIXES

* [#394](https://github.com/bryntum/support/issues/394) - ScrollManager does not start vertical scrolling if mouse leaves scheduler element
* [#695](https://github.com/bryntum/support/issues/695) - Dependency line not redrawn during resize
* [#893](https://github.com/bryntum/support/issues/893) - Scrolling scheduler while dragging event makes dragged event go away from cursor
* [#1489](https://github.com/bryntum/support/issues/1489) - Copy / Cut / Paste event API + context menu entries
* [#1525](https://github.com/bryntum/support/issues/1525) - Improve Localization guide
* [#1689](https://github.com/bryntum/support/issues/1689) - Investigate sharing static resource between multiple LWC on the same page
* [#1742](https://github.com/bryntum/support/issues/1742) - Misleading visual feedback when clicking between multi assigned events
* [#1752](https://github.com/bryntum/support/issues/1752) - Error if startDate field is hidden in EventEditor
* [#1873](https://github.com/bryntum/support/issues/1873) - Virtual event rendering derenders too eagerly
* [#1893](https://github.com/bryntum/support/issues/1893) - [REACT] JSX renderer not supported for TreeColumn
* [#2021](https://github.com/bryntum/support/issues/2021) - Adding event when all resources missing fails
* [#2067](https://github.com/bryntum/support/issues/2067) - Vertical Scheduler does not update view when undoing actions
* [#2056](https://github.com/bryntum/support/issues/2056) - Setting resourceId to newly created event record before it is saved by the event editor fails
* [#2084](https://github.com/bryntum/support/issues/2084) - Loading empty assignments does not refresh UI
* [#2163](https://github.com/bryntum/support/issues/2163) - Icon is not shown for resource time ranges when iconCls is specified
* [#2166](https://github.com/bryntum/support/issues/2166) - Buttons in bottom toolbar of a Popup should be right aligned
* [#2204](https://github.com/bryntum/support/issues/2204) - EventEdit docs should show how configure the buttons
* [#2211](https://github.com/bryntum/support/issues/2211) - Add test coverage for XSS
* [#2309](https://github.com/bryntum/support/issues/2309) - Scheduler weekends are not configurable
* [#2323](https://github.com/bryntum/support/issues/2323) - Dependency drag creation fails
* [#2329](https://github.com/bryntum/support/issues/2329) - Processing records by the Engine makes CrudManager to load data slowly
* [#2331](https://github.com/bryntum/support/issues/2331) - Cursor isn't changed to ew-resize when resizing event
* [#2333](https://github.com/bryntum/support/issues/2333) - Dependencies not cleared after setting an empty array
* [#2337](https://github.com/bryntum/support/issues/2337) - Disabling recurrenceCombo in Editor fails with exception
* [#2338](https://github.com/bryntum/support/issues/2338) - Time axis misrendered if changing scheduler element size
* [#2346](https://github.com/bryntum/support/issues/2346) - Drag drop not finalized properly if event is deleted during drag drop
* [#2358](https://github.com/bryntum/support/issues/2358) - Scheduler 4.x is 2 times slower than Scheduler 3.x
* [#2359](https://github.com/bryntum/support/issues/2359) - Update readme files in all framework demos in all products
* [#2364](https://github.com/bryntum/support/issues/2364) - Adding a new event triggers 'update'
* [#2379](https://github.com/bryntum/support/issues/2379) - Add minified version of *.lite.umd.js to the bundle
* [#2381](https://github.com/bryntum/support/issues/2381) - Unable to Drag from left corner of event when Event#resizable set to 'end'
* [#2386](https://github.com/bryntum/support/issues/2386) - Events disappear after setting resources twice
* [#2400](https://github.com/bryntum/support/issues/2400) - Sync failure messages displayed in `syncMask` where not auto-closing
* [#2402](https://github.com/bryntum/support/issues/2402) - assignmentStore add function ignores `silent` param
* [#2407](https://github.com/bryntum/support/issues/2407) - Grid/Scheduler not working in IE11
* [#2414](https://github.com/bryntum/support/issues/2414) - Header cell rendering leaves some space on the right when expand the browser window fast
* [#2418](https://github.com/bryntum/support/issues/2418) - Project does not respect suspendEvents
* [#2426](https://github.com/bryntum/support/issues/2426) - Double clicking tree expander icon should not start editing
* [#2429](https://github.com/bryntum/support/issues/2429) - GroupSummary redraws excessively
* [#2430](https://github.com/bryntum/support/issues/2430) - Summary redraws excessively
* [#2433](https://github.com/bryntum/support/issues/2433) - Time picker doesn't display AM/PM switch properly
* [#2441](https://github.com/bryntum/support/issues/2441) - Demo control sizes and styling issues
* [#2450](https://github.com/bryntum/support/issues/2450) - Sorting demo breaks when trying to change sort order
* [#2453](https://github.com/bryntum/support/issues/2453) - Multiple rebuilds of indices when adding events
* [#2468](https://github.com/bryntum/support/issues/2468) - Add a public way to refresh summaries
* [#2474](https://github.com/bryntum/support/issues/2474) - Empty text not shown when using autoHeight
* [#2480](https://github.com/bryntum/support/issues/2480) - Race condition and me.nextAnimationFrame is not a function error
* [#2486](https://github.com/bryntum/support/issues/2486) - Month/year picker is not aligned to date picker properly
* [#2492](https://github.com/bryntum/support/issues/2492) - Removed dependency is rendered
* [#2497](https://github.com/bryntum/support/issues/2497) - Event derendered on resize
* [#2505](https://github.com/bryntum/support/issues/2505) - Clicking tree node expander icon should not focus row
* [#2509](https://github.com/bryntum/support/issues/2509) - Docs missing for DependencyCreation events
* [#2511](https://github.com/bryntum/support/issues/2511) - Applying empty store state doesn't clear filters/sorters/groupers
* [#2522](https://github.com/bryntum/support/issues/2522) - Percent column never displays a value
* [#2526](https://github.com/bryntum/support/issues/2526) - Grid: CheckAll checkbox un-checks after drag and drop
* [#2527](https://github.com/bryntum/support/issues/2527) - Inconsistent Behaviour with Select All when Collapsed Groups
* [#2528](https://github.com/bryntum/support/issues/2528) - Snapping not working when using a custom time axis
* [#2530](https://github.com/bryntum/support/issues/2530) - Event disappears after drag drop if timeaxis is filtered
* [#2554](https://github.com/bryntum/support/issues/2554) - Vue demo styling issues
* [#2557](https://github.com/bryntum/support/issues/2557) - Double click resource histogram header fails
* [#2561](https://github.com/bryntum/support/issues/2561) - Drag from grid demo styling bugs
* [#2564](https://github.com/bryntum/support/issues/2564) - [LWC] Dependency lines are not created
* [#2577](https://github.com/bryntum/support/issues/2577) - Crash after dragging newly created event
* [#2593](https://github.com/bryntum/support/issues/2593) - Changes are saved immediately when beforeEventSave listener is async
* [#2598](https://github.com/bryntum/support/issues/2598) - Should be possible to detect in DOM what ViewPreset is used

## 4.0.8 - 2021-01-27

### FEATURES / ENHANCEMENTS

* You can now position milestone text inside the diamond or outside (default) with the new `milestoneTextPosition`
  config
* You can now opt out of sticky event behavior for individual Events, using the EventModel#stickyContents field
* Crud Manager now supports less strict `sync` response format allowing to respond only server side changes
  See `supportShortSyncResponse` config for details

### API CHANGES

* [BREAKING] Crud Manager default behaviour has been changed to allow `sync` response to include only server-side
  changes. Previously it was mandatory to mention each updated/removed record in the response to confirm the changes
  With this release the Crud Manager automatically confirms changes of all updated/removed records mentioned in
  corresponding request. To revert to previous strict behaviour please use `supportShortSyncResponse` config

### BUG FIXES

* [#1970](https://github.com/bryntum/support/issues/1970) - Infinite requests if wrong response received
* [#2241](https://github.com/bryntum/support/issues/2241) - PDF export fails with certain column combination

## 4.0.7 - 2021-01-12

### FEATURES / ENHANCEMENTS

* Scheduler now supports per resource row height, by setting `resource.rowHeight`. The value is used as the actual row
  height for pack and overlap event layouts, and as input for the row height calculation with stack layout. It is also
  possible to control the setting from a column renderer. If no value is supplied, the height configured on the
  Scheduler is used ([#2158](https://github.com/bryntum/support/issues/2158))
* Also added per resource event layout support, by setting the new corresponding `resource.eventLayout` field. It
  accepts the same options as `scheduler.eventLayout` (stack, pack, none), and if the field is unspecified it will use
  the layout configured on the Scheduler ([#176](https://github.com/bryntum/support/issues/176))

### BUG FIXES

* [#410](https://github.com/bryntum/support/issues/410) - Resized element goes invisible if dragged to be zero width
* [#1220](https://github.com/bryntum/support/issues/1220) - Scheduler time axis is empty after switching between schedulers
* [#1764](https://github.com/bryntum/support/issues/1764) - Reordering inserts at the wrong position when the store is filtered
* [#1929](https://github.com/bryntum/support/issues/1929) - Drag drop not finalized if eventStore data is updated during dragging
* [#2140](https://github.com/bryntum/support/issues/2140) - WebSocket demo shows incorrect action info in Toast messages
* [#2157](https://github.com/bryntum/support/issues/2157) - Recreating Scheduler Angular component when resources are bound fails in production mode with build
  optimizer enabled
* [#2182](https://github.com/bryntum/support/issues/2182) - Virtual scroller jumps to 0 on first zoom
* [#2184](https://github.com/bryntum/support/issues/2184) - zoomToLevel doesn't return current zoom level
* [#2185](https://github.com/bryntum/support/issues/2185) - Responsive tickSize is not applied to the timeline
* [#2197](https://github.com/bryntum/support/issues/2197) - Broken styles in React demos
* [#2200](https://github.com/bryntum/support/issues/2200) - scrollEventIntoView throws error when event belongs to resource in a collapsed parent

## 4.0.6 - 2020-12-29

### BUG FIXES

* [#1741](https://github.com/bryntum/support/issues/1741) - Modifying assigned resources of Recurring events does not update UI
* [#1821](https://github.com/bryntum/support/issues/1821) - Events multi drag&drop via schedulers works incorrect
* [#2108](https://github.com/bryntum/support/issues/2108) - Update of recurring event creates another repeat of event
* [#2120](https://github.com/bryntum/support/issues/2120) - Filterable function not able to access "property"
* [#2121](https://github.com/bryntum/support/issues/2121) - Zooming in configuration demo breaks time axis

## 4.0.5 - 2020-12-15

### FEATURES / ENHANCEMENTS

* You can now change partnership of Scheduler panels at runtime using `addPartner` / `removePartner` APIs ([#2042](https://github.com/bryntum/support/issues/2042))
* EventTooltip now updates itself if its event record updates while tooltip is visible ([#2077](https://github.com/bryntum/support/issues/2077))

### BUG FIXES

* [#1314](https://github.com/bryntum/support/issues/1314) - Fix for ASPNET demo build in Windows cmd environment
* [#1369](https://github.com/bryntum/support/issues/1369) - Simpleeditor is not aligned with record after create
* [#2082](https://github.com/bryntum/support/issues/2082) - Not possible to configure a config object or Tooltip instance as EventResize#tip

## 4.0.4 - 2020-12-09

### FEATURES / ENHANCEMENTS

* A new Scheduler feature `StickyEvents` enables the textual content of event bars to "stick" within the scrolling
  viewport until the event itself is out of view. ([#390](https://github.com/bryntum/support/issues/390))
* Added `groupRecord`, `groupField`, `groupValue` to `GroupSummary.renderer` config and `SummaryFormatter.generateHtml`
  method ([#1897](https://github.com/bryntum/support/issues/1897))
* A new config `discardPortals` on the React wrapper, that controls the behaviour of cell renderers using React
  components. Set to `false` (default) to enhance performance. Set to `true` to limit memory consumption
* With the TimeRanges feature, you can now easily configure current time indicator to show any text using the updated
  `showCurrentTimeLine` object config
* New fields `resourceMargin` and `barMargin` was added to `ResourceModel`, allowing for per row adjustment of the
  resource margin and the bar margin respectively ([#2014](https://github.com/bryntum/support/issues/2014))

### API CHANGES

* EventEdit feature now exposes an 'isEditing' boolean to detect if the editor is currently visible ([#1935](https://github.com/bryntum/support/issues/1935))
* You can now specify the date to scroll into view initially, using the new `visibleDate` config
* Task and event renderings that return HTML are now placed in a `<span>`. Previously, such text was placed inside a
  `<div>` but the block-level element caused undesirable wrapping. This applies to simple cases such as names with an
  ampersand (`'&'`) character. Simple text is still rendered as a text node. ([#1989](https://github.com/bryntum/support/issues/1989))
* [DEPRECATED] The `getSourceEvent()` and `getTargetEvent()` functions in `DependencyModel` was deprecated in favor of
  the `fromEvent` and `toEvent` getters

### BUG FIXES

* [#70](https://github.com/bryntum/support/issues/70) - Summary and GroupSummary column lines misaligned when autoAdjustTimeAxis is set to false
* [#1303](https://github.com/bryntum/support/issues/1303) - Store sorting improvements
* [#1374](https://github.com/bryntum/support/issues/1374) - Dark theme tab bar has wrong background
* [#1398](https://github.com/bryntum/support/issues/1398) - Error when update current timeline if scheduler is hidden
* [#1763](https://github.com/bryntum/support/issues/1763) - Excel exporter demo doesn't really customize exported columns
* [#1812](https://github.com/bryntum/support/issues/1812) - Make tables look better in docs
* [#1880](https://github.com/bryntum/support/issues/1880) - Crash when dragging right demo splitter
* [#1889](https://github.com/bryntum/support/issues/1889) - Settings not applied for scheduler configured with ViewPreset config object
* [#1892](https://github.com/bryntum/support/issues/1892) - beforeRemove event doesn't cancel Event removal
* [#1906](https://github.com/bryntum/support/issues/1906) - Scheduler resourceTimeRangeStore config doesn't work
* [#1907](https://github.com/bryntum/support/issues/1907) - ResourceTimeRanges feature doesn't support recurring ranges
* [#1911](https://github.com/bryntum/support/issues/1911) - Runtime error with disabled startTimeField or endTimeField for EventEdit
* [#1930](https://github.com/bryntum/support/issues/1930) - Scheduler vertical cell borders missing in vertical mode
* [#1944](https://github.com/bryntum/support/issues/1944) - relayAll targets not cleaned up on destroy
* [#1986](https://github.com/bryntum/support/issues/1986) - Pan feature should be able to coexist with other mouse input features
* [#2030](https://github.com/bryntum/support/issues/2030) - Event edit breaks rendering if beforeEventAdd listener returns false
* [#2036](https://github.com/bryntum/support/issues/2036) - Strange drag behavior when using eventDragSelect with multi assignments

## 4.0.3 - 2020-11-17

### FEATURES / ENHANCEMENTS

* A new Scheduler widget type `undoredo` has been added which, when added to the `tbar` of a scheduling widget
  (such as a `Scheduler`, `Gantt`, or `Calendar`), provides undo and redo functionality
* A new config, `collapseToHeader` on the `GroupSummary` feature makes the headers row of a collapsed group contain the
  summary data for the group. Be aware that the group title is limited in width in a collapsed group header with this
  set so that it does not overflow into summary cells. ([#1355](https://github.com/bryntum/support/issues/1355))
* Added example to columns localization on guide. ([#1846](https://github.com/bryntum/support/issues/1846))
* New `suspendAutoSync()` and `resumeAutoSync()` methods added `ProjectModel` to prevent CrudManager sync operations
  temporarily. ([#1853](https://github.com/bryntum/support/issues/1853))

### BUG FIXES

* [#1286](https://github.com/bryntum/support/issues/1286) - Event Drag/Drop not working for very small unresizable events
* [#1856](https://github.com/bryntum/support/issues/1856) - Scheduler is not defined in menu customization guide
* [#1870](https://github.com/bryntum/support/issues/1870) - Vertical mode example UX issues
* [#1879](https://github.com/bryntum/support/issues/1879) - Incorrect request URL when CrudManager URL contains query string

## 4.0.2 - 2020-11-04

### BUG FIXES

* [#1307](https://github.com/bryntum/support/issues/1307) - Localization for topDateFormat doesn't apply in dayAndWeek and weekAndDay mode
* [#1529](https://github.com/bryntum/support/issues/1529) - Task Editor fields should not marked invalid at initial show

## 4.0.1 - 2020-11-03

### BUG FIXES

* [#1706](https://github.com/bryntum/support/issues/1706) - Toolbar should not be exported
* [#1712](https://github.com/bryntum/support/issues/1712) - Skip non-exportable columns in export dialog window
* [#1740](https://github.com/bryntum/support/issues/1740) - Event name is not shown in Scheduler when using dataSource for the name field
* [#1744](https://github.com/bryntum/support/issues/1744) - eventEdit `items` config should not be of type Array
* [#1747](https://github.com/bryntum/support/issues/1747) - Crash when long pressing splitter on touch devices
* [#1759](https://github.com/bryntum/support/issues/1759) - eventColor in eventRenderer is buggy with HEX colors

## 4.0.0 - 2020-10-19

### FEATURES / ENHANCEMENTS

* [BREAKING] Dropped Support for Edge 18 and older. Our Edge <=18 fixes are still in place and active, but we will not
  be adding more fixes. Existing fixes will be removed in a later version
* [BREAKING] Parts of the Scheduler data layer now use async operations, matching how Scheduler Pro and Gantt works
  This affects manipulations of dates and durations, where the UI will not be updated immediately after data
  manipulations but instead moments later. See the upgrade guide for more information
* Scheduler now optionally can be configured with a `project`. A project is an entity that holds all the stores used by
  the Scheduler, a concept moved down from Gantt & Scheduler Pro. If no project is supplied, one is created internally
  Please see the upgrade guide for more details
* [BREAKING] Multi-assignment was made a first class feature of Scheduler. The Scheduler now always uses an
  AssignmentStore internally. If none is assigned one will be created automatically. This change enables
  multi-assignment to work with more features, since it is now the only mode of operation internally. It still supports
  single assignment using the `resourceId` field on events, by automatically creating assignment records in an internal
  AssignmentStore on load/add/change. We recommend transitioning to always use assignments, as
  `resourceId` might get deprecated in the future
* [BREAKING] The `Core/adapter` directory has been removed. There are no longer any Widget adapters. All Widget classes
  register themselves with the `Widget` class, and the `Widget` class is the source of Widget `type` mapping and Widget
  registration and lookup by `id`
* [BREAKING] The way recurring events are inserted into a Scheduler's timeline has changed. Instead of occurrences being
  dynamically generated upon every data change and change of a scheduler's time axis, no extra events are added into the
  store. Occurrences of recurring events are ephemeral and are returned from the new `EventStore.getEvents` API when
  necessary. This should not affect the default operations of apps, but the differences may be apparent in more
  sophisticated apps. To change an occurrence use `occurrence.beginBatch`, then make changes to including setting its
  `recurrence` to null if it's to be a one-off exception, then use `occurrence.endBatch`. That will update the data and
  the UI. See the upgrade guide in the documentation
* [BREAKING] The `Default`, `Light` and `Dark` themes were renamed to `Classic`, `Classic-Light` and `Classic-Dark`
  This change highlights the fact that they are variations of the same theme, and that it is not the default theme
  (Stockholm is our default theme since version 2.0)
* Context menu features refactoring, please see the upgrade guide for details ([#128](https://github.com/bryntum/support/issues/128)):
    - naming was simplified by removing the word "Context" in feature names and in event names
    - introduced named objects for menu items, allowing easier customization
    - split context menu features by area of responsibility
    - introduced TimeAxisHeaderMenu feature and made it responsible for header menu of TimeAxis column
* Added support for toggling `constrainDragToResource` dynamically ([#542](https://github.com/bryntum/support/issues/542))
* The HeaderContextMenu feature was refactored and renamed to TimeAxisHeaderMenu ([#8783](https://github.com/bryntum/support/issues/8783))
* Column lines are now drawn using divs instead of images + divs. Only divs for lines in view are available in DOM. This
  allows for easier styling and testing of column lines, while only having a very minor impact on performance
* TimeRanges can now show an icon using the `iconCls` field in the data model
* A new event style "rounded" was added, try the updated `eventstyles` demo to see it in action
* Added new config `verticalTimeAxisColumn` that allows configuring the `VerticalTimeAxisColumn` instance used in
  vertical mode with any Column options that apply to it. Changed "vertical" example to use the new
  `verticalTimeAxisColumn` configuration with a field to search values ([#1136](https://github.com/bryntum/support/issues/1136))
* Added a new demo + guide showing how to create a custom event editor ([#957](https://github.com/bryntum/support/issues/957))
* Events have acquired an extra internal element, `.b-sch-event-content`. It is used to allow `text-overflow: ellipsis`,
  padding without affecting minimum width and to allow us to much easier place labels for milestones. It also gives you
  more styling options for your custom look, having an additional element to leverage. Note though that it might affect
  any custom event styling you are using
* Scheduler CrudManager PHP demo now supports multiple resource assignment
* The 3d-bars demo was removed. It has a history of being broken in many releases and was deemed not worth keeping
* Scheduler now extends `Panel` instead of `Container`. This allows you to easily add toolbars to it ([#1417](https://github.com/bryntum/support/issues/1417))
* Added XSS protection to default renderers (based on `StringHelper.encodeHtml` and `StringHelper.xss`)
* Added support to export events to ICS format with the new `TimeSpan#exportToICS` method. Demonstrated in the new
  `exporttoics` example
* Added `scheduler.lite.umd.js` module that does not include `Promise` polyfill. This module is primarily intended to be
  used with Angular to prevent `zone.js` polyfills overwrite
* Added experimental support for Salesforce Locking Service ([#359](https://github.com/bryntum/support/issues/359)). The distributed bundle only supports modern
  browsers (no IE11 or non-chromium based Edge), since Salesforce drops support for these in January 1st 2021 too
* Added Lightning Web Component demo, see `examples/salesforce/src/lwc`
* Dependencies feature has a new public method to get a dependency record from the corresponding DOM element. See
  `resolveDependencyRecord` docs for details

### API CHANGES

* [BREAKING] The `dependencies` feature no longer holds its own store, instead it is configured on Scheduler or in a
  project along with the other stores used by Scheduler. The same applies if configuring it with inline data, the
  `dependencies` config was moved to Scheduler to match how inline data is supplied for other stores
* [BREAKING] Events triggered by the EventDrag feature now always supplies assignment records and event records. If you
  currently use multi-assignment, you might need to adjust your listeners
* [BREAKING] `RecurringEvents` feature was removed. Use the `enableRecurringEvents` boolean config on the Scheduler
* [BREAKING] `RecurringTimeSpans` feature was removed as no longer needed for displaying recurring events
* [BREAKING] Event selection now more clearly distinguishes between selected assignments and selected events. Previously
  for example `scheduler.selectedEvents` would return events or assignments depending on mode. Now it always returns
  events, and assignments are returned by `scheduler.selectedAssignments`. The same thinking applies to the events
  triggered by selection, there is now a new `assignmentSelectionChange` event in addition to the existing
  `eventSelectionChange`
* [BREAKING] The `removeUnassignedEvent` config was moved from Scheduler to EventStore. If you have it explicitly
  configured with `false` or are using a standalone EventStore you might have to add/move it in your code. If you rely
  on an event record being available after being unassigned, you should configure with `removeUnassignedEvent: false`
* [BREAKING] An EventStore is no longer directly linked to a ResourceStore or an AssignmentStore. Nor does it handle the
  date normalization on its own. If you are using standalone stores (not connected to a Scheduler), you have to use a
  project to hold the stores. See the upgrade guide for more information
* [BREAKING] Event records can no longer be shared between multiple stores. The stores can still be shared
* [BREAKING] Field `serialize` function `this` has been changed to refer the field definition (it used to refer the
  model instance before)
* [BREAKING] A clarification to changes in alpha-1, regarding async date manipulation: Dates and durations are also
  calculated async when data is loaded or new events are added. To simplify the transition to this approach new
  awaitable `addAsync()` and `loadDataAsync()` functions were added to project stores. See upgrade guide for more
  information ([#1505](https://github.com/bryntum/support/issues/1505))
* [DEPRECATED] `context.draggedRecords` argument of `Scheduler.feature.EventDrag.validatorFn` function is deprecated
  Use `context.eventRecords` instead
* [DEPRECATED] The `tplData` param in the `eventRenderer` function was deprecated in favor of the new `renderData` param
* [DEPRECATED] abstract `TimeSpanRecordContextMenuBase` class was deprecated, in favor of `TimeSpanMenuBase`
* [DEPRECATED] `HeaderContextMenu` feature was deprecated. `TimeAxisHeaderMenu` was introduced instead
* [DEPRECATED] `EventContextMenu` feature was renamed to `EventMenu`
* [DEPRECATED] `ScheduleContextMenu` feature was renamed to `ScheduleMenu`
* [DEPRECATED] `occurrencesready` event has been removed
* Event elements no longer use cryptic ids (like `id="scheduler-57-r2-x"`). If you need a CSS selector for a specific
  event, you can instead use `[data-event-id="myid"]`. Following this simplification, the `getResourceRecordFromDomId()`
  and `getEventRecordFromDomId()` functions has been removed
* The `WidgetColumn.onBeforeWidgetSetValue` and `WidgetColumn.onAfterWidgetSetValue` functions was made public to allow
  greater control
* Model fields in derived classes are now merged with corresponding model fields (by name) in super classes. This allows
  serialization and other attributes to be inherited when a derived class only wants to change the `defaultValue` or
  other attribute of the field
* The `dateFormat` config for `type='date'` model fields has been simplified to `format`
* Model date fields are serialized by default according to the field `format` ([#273](https://github.com/bryntum/support/issues/273))
* Schedulers "main" stores (EventStore, ResourceStore, AssignmentStore and DependencyStore) has had their event
  triggering modified to make sure data is in a calculated state when relevant events are triggered. This affects the
  timing of the `add`, `remove`, `removeAll`, `change` and `refresh` events. Please see the upgrade guide for more
  information ([#1486](https://github.com/bryntum/support/issues/1486))
* The following previously deprecated members/classes were removed:
    - `ResourceImageColumn.imagePath` and `ResourceImageColumn.defaultImageName`
    - `EditBase.extraWidgets`
    - `ViewPreset`, compatibility layer introduced in 3.0 was removed
    - `TimelineDateMapper.getDateFromX()`
    - `TimelineEventRendering.tickWidth`
    - `beforeZoomChange` and `zoomChange` events for `TimelineViewPresets`

### BUG FIXES

* [#520](https://github.com/bryntum/support/issues/520) - Preventing sync request throws uncatchable exception
* [#592](https://github.com/bryntum/support/issues/592) - Row disappear when scrolling a lot
* [#911](https://github.com/bryntum/support/issues/911) - React custom event editor demo improvements
* [#996](https://github.com/bryntum/support/issues/996) - Type of EditBase#items config docs are wrong
* [#1009](https://github.com/bryntum/support/issues/1009) - Time axis misaligned in vertical mode if scheduler is scrolled
* [#1087](https://github.com/bryntum/support/issues/1087) - Events disappear after a vertical scroll
* [#1199](https://github.com/bryntum/support/issues/1199) - Vertical bold tick line is missing when show only working time and Sunday is filtered out
* [#1266](https://github.com/bryntum/support/issues/1266) - Gantt+Scheduler demo: First scheduler resource row animates into view
* [#1227](https://github.com/bryntum/support/issues/1227) - Crash after undoing event deletion
* [#1337](https://github.com/bryntum/support/issues/1337) - Export columns look strange in demo
* [#1342](https://github.com/bryntum/support/issues/1342) - Scheduler throws when dragging event out of the view on filtered time axis
* [#1345](https://github.com/bryntum/support/issues/1345) - Assignment store changes are not in sync request
* [#1365](https://github.com/bryntum/support/issues/1365) - Editing two events, second edit affects first
* [#1371](https://github.com/bryntum/support/issues/1371) - Possible to change event start date with readonly mode enabled
* [#1373](https://github.com/bryntum/support/issues/1373) - EventEditor demo event styling broken
* [#1376](https://github.com/bryntum/support/issues/1376) - Drag create breaks leaving visible proxy
* [#1378](https://github.com/bryntum/support/issues/1378) - Recurring time ranges missing from recurring time ranges demo
* [#1384](https://github.com/bryntum/support/issues/1384) - Dependency not redrawn on new assignment
* [#1391](https://github.com/bryntum/support/issues/1391) - Scheduler throws when trying to navigate a filtered event store
* [#1392](https://github.com/bryntum/support/issues/1392) - Scheduler throws when trying to remove recurrent event
* [#1396](https://github.com/bryntum/support/issues/1396) - eventStore.getEvents could go into infinite loop if recurrence feature is enabled
* [#1399](https://github.com/bryntum/support/issues/1399) - Improve EventEdit docs* [#1375](https://github.com/bryntum/support/issues/1375) - Vertical mode does not fill viewport correctly
* [#1418](https://github.com/bryntum/support/issues/1418) - Fields missing from AssignmentModel docs
* [#1419](https://github.com/bryntum/support/issues/1419) - An error when using custom renderer for schedulerTooltip
* [#1431](https://github.com/bryntum/support/issues/1431) - Recurring events don't render on load
* [#1447](https://github.com/bryntum/support/issues/1447) - Scheduler big data set example doesn't sort on column click
* [#1462](https://github.com/bryntum/support/issues/1462) - BigDataset demo fails when few resources
* [#1464](https://github.com/bryntum/support/issues/1464) - Bug on Unassign action in Drag from grid demo
* [#1466](https://github.com/bryntum/support/issues/1466) - Newly created event has bad top label in Labels demo
* [#1473](https://github.com/bryntum/support/issues/1473) - Scheduler validation example no longer validates properly
* [#1483](https://github.com/bryntum/support/issues/1483) - Fixed time format with AM/PM removing the "0" changing from 09:00 PM to 9:00 PM. Changed viewPreset
  `hourAndDay` on `middleDateFormat` to `K` for en-US locale
* [#1487](https://github.com/bryntum/support/issues/1487) - Dependency lines are not removed when regenerating dataset
* [#1497](https://github.com/bryntum/support/issues/1497) - Event added using Plus button on the TopBar loses some data
* [#1499](https://github.com/bryntum/support/issues/1499) - Cannot edit standalone event having startDate + duration
* [#1542](https://github.com/bryntum/support/issues/1542) - Scheduler put inside of panel gets narrow with overlay scrollbar
* [#1546](https://github.com/bryntum/support/issues/1546) - Cannot drag drop narrow events
* [#1548](https://github.com/bryntum/support/issues/1548) - [ANGULAR] Investigate zone.js loading order and set it to Angular default
* [#1552](https://github.com/bryntum/support/issues/1552) - ExtJS Scheduler demo: Uncaught TypeError: Cannot read property 'getTime' of null
* [#1564](https://github.com/bryntum/support/issues/1564) - scrollToNow() results in wrong timeline headers
* [#1570](https://github.com/bryntum/support/issues/1570) - Events disappear when scrolling
* [#1576](https://github.com/bryntum/support/issues/1576) - Setting resourceId via set method does not update assignment
* [#1582](https://github.com/bryntum/support/issues/1582) - Next valid drag after invalid drag is broken in Safari
* [#1590](https://github.com/bryntum/support/issues/1590) - Summary feature redundant refreshing
* [#1607](https://github.com/bryntum/support/issues/1607) - constrainDragToTimeSlot does not maintain event start date while dragging
* [#1642](https://github.com/bryntum/support/issues/1642) - Scheduler.scrollToNow() during paint broken when part of TabPanel

## 3.1.9 - 2020-08-26

### BUG FIXES

* [#779](https://github.com/bryntum/support/issues/779) - Working time: Crash when dragging event starting & ending outside timeaxis
* [#1351](https://github.com/bryntum/support/issues/1351) - EventStore + syncDataOnLoad = crash
* [#1353](https://github.com/bryntum/support/issues/1353) - Exporting scheduler with groups to excel crashes

## 3.1.8 - 2020-08-11

### BUG FIXES

* [#1244](https://github.com/bryntum/support/issues/1244) - Initial export options are shown incorrectly in the export dialog
* [#1263](https://github.com/bryntum/support/issues/1263) - eventStyle 'colored' not populated for hex color codes

## 3.1.7 - 2020-07-24

### FEATURES / ENHANCEMENTS

* Added new exporter: MultiPageVertical. It fits content horizontally and then generates vertical pages to fit vertical
  content. ([#1092](https://github.com/bryntum/support/issues/1092))

### BUG FIXES

* [#402](https://github.com/bryntum/support/issues/402) - Export UI should validate date range fields
* [#460](https://github.com/bryntum/support/issues/460) - Make RecurrenceConfirmationPopup buttons handlers public
* [#563](https://github.com/bryntum/support/issues/563) - Tick size cannot be set less than certain value
* [#910](https://github.com/bryntum/support/issues/910) - Crash when exporting to PDF if schedule area has no width
* [#953](https://github.com/bryntum/support/issues/953) - Load mask appearing on top of export progress
* [#969](https://github.com/bryntum/support/issues/969) - Multi page export of more than 100 tasks fails
* [#972](https://github.com/bryntum/support/issues/972) - Export feature does not export dependencies unless visible first
* [#973](https://github.com/bryntum/support/issues/973) - Export feature does not respect left grid section width
* [#1093](https://github.com/bryntum/support/issues/1093) - DatePicker should respect weekStartDay timeline config
* [#1172](https://github.com/bryntum/support/issues/1172) - Wrapper should not relay store events to the instance
* [#1175](https://github.com/bryntum/support/issues/1175) - Resize cursor stuck after clicking event resize handle
* [#1180](https://github.com/bryntum/support/issues/1180) - Exported grid should end with the last row
* [#1198](https://github.com/bryntum/support/issues/1198) - Resizing left handle outside schedule area to the left stretches event width
* [#1201](https://github.com/bryntum/support/issues/1201) - Event not refreshed if dropping it back in same position in Websocket demo
* [#1249](https://github.com/bryntum/support/issues/1249) - Columns lines are not exported correctly
* [#1252](https://github.com/bryntum/support/issues/1252) - Adding predecessor removes dependency line to the successor
* [#1256](https://github.com/bryntum/support/issues/1256) - Initial animation aborted
* [#1260](https://github.com/bryntum/support/issues/1260) - Scheduler freezes after drag drop with many events

## 3.1.6 - 2020-07-10

### FEATURES / ENHANCEMENTS

* Added Docker image of the PDF Export Server. See server README for details. ([#905](https://github.com/bryntum/support/issues/905))

### API CHANGES

* [DEPRECATED] To avoid risk of confusing the Scheduler instance with the calculation engine,  `schedulerEngine` has
  been deprecated in favor of `schedulerInstance` in all framework wrappers (Angular, React, Vue). ([#776](https://github.com/bryntum/support/issues/776))

### BUG FIXES

* [#897](https://github.com/bryntum/support/issues/897) - Splitter does not work on iPads
* [#974](https://github.com/bryntum/support/issues/974) - Cannot hide Delete button in EventEditor
* [#1005](https://github.com/bryntum/support/issues/1005) - Vertical mode not working in Vue
* [#1067](https://github.com/bryntum/support/issues/1067) - VerticalTimeAxisColumn header should be not focusable
* [#1095](https://github.com/bryntum/support/issues/1095) - Time header get blank when changing view preset after export

## 3.1.5 - 2020-06-09

### FEATURES / ENHANCEMENTS

* Updated Font Awesome Free to v5.13.0
* Updated ScheduleTooltip docs to show how to customize the tip content ([#809](https://github.com/bryntum/support/issues/809))
* ScheduleTooltip is now shown also when Scheduler is readOnly, set the feature to disabled to hide it completely
* [DEPRECATED] ScheduleTooltip#getHoverTipHtml is now deprecated in favor of the new `generateTipContent` method
  allowing you to completely customize the markup shown inside it
* Removed React and Vue CDN demos in favor of existing framework examples ([#840](https://github.com/bryntum/support/issues/840))
* Moved localization from `'GridBase.serverResponseLabel` to `'CrudManagerView.serverResponseLabel`
* Renamed localization from `RecurrenceCombo.Custom...` to `RecurrenceCombo.Custom`

### BUG FIXES

* [#780](https://github.com/bryntum/support/issues/780) - removeRow text missing
* [#791](https://github.com/bryntum/support/issues/791) - Dependency creation tooltip is always invalid in angular when module bundle is used instead of umd
* [#846](https://github.com/bryntum/support/issues/846) - No scheduleclick event triggered in IE in area next to splitter
* [#865](https://github.com/bryntum/support/issues/865) - afterEventDrop is not fired when event is dropped outside the timeline
* [#881](https://github.com/bryntum/support/issues/881) - Tooltip is blinking in Firefox when hoverDelay is specified
* [#886](https://github.com/bryntum/support/issues/886) - commit triggered twice after event dragged from partner
* [#896](https://github.com/bryntum/support/issues/896) - Event element is left when reassign is used on the event model and autoCommit is enabled

## 3.1.4 - 2020-05-19

### BUG FIXES

* [#772](https://github.com/bryntum/support/issues/772) - undefined query parameter in CrudManager URLs

## 3.1.3 - 2020-05-14

### FEATURES / ENHANCEMENTS

* Scrolling in a dataset with varying row heights has been improved. Scheduler now pre-calculates heights up to a
  configurable row count limit and populates a row height map used to estimate the total scroll height better

### BUG FIXES

* [#322](https://github.com/bryntum/support/issues/322) - Fields with complex mapping are not updated properly on sync
* [#539](https://github.com/bryntum/support/issues/539) - Scrollbar changes position during scroll when row heights vary greatly in a small dataset
* [#553](https://github.com/bryntum/support/issues/553) - Loadmask not hidden after load fails
* [#554](https://github.com/bryntum/support/issues/554) - Safari shows wrong dates in event editor
* [#565](https://github.com/bryntum/support/issues/565) - Scheduler Export to PDF failed with grouping enabled
* [#570](https://github.com/bryntum/support/issues/570) - Scrolling with touch doesn't work on events
* [#583](https://github.com/bryntum/support/issues/583) - CrudManager should load URL provided in requestConfig
* [#603](https://github.com/bryntum/support/issues/603) - Resource images in ResourceInfoColumn flicker after record update
* [#638](https://github.com/bryntum/support/issues/638) - constrainToTimeSlot setting not cleared when drag starts

## 3.1.2 - 2020-04-17

### FEATURES / ENHANCEMENTS

* The scheduler.module.js bundle is now lightly transpiled to ECMAScript 2015 using Babel to work with more browsers out
  of the box
* The PDF Export feature scrolls through the dataset in a more efficient manner. [#578](https://github.com/bryntum/support/issues/578)

### BUG FIXES

* [#443](https://github.com/bryntum/support/issues/443) - Failed CrudManager load/sync should show failure message just like Store loading does
* [#464](https://github.com/bryntum/support/issues/464) - Dependencies are not refreshed after filtering with schedule region collapsed
* [#471](https://github.com/bryntum/support/issues/471) - CrudManager + AjaxHelper sends wrong content type
* [#515](https://github.com/bryntum/support/issues/515) - Dependencies cannot be created in scheduler web component
* [#572](https://github.com/bryntum/support/issues/572) - CrudMananger load GET request has Content-Type header set to json

## 3.1.1 - 2020-03-27

### BUG FIXES

* [#120](https://github.com/bryntum/support/issues/120) - Vertical mode misses 'renderTimeSpan' method
* [#314](https://github.com/bryntum/support/issues/314) - Load mask is not hidden after receiving unsuccessful response
* [#369](https://github.com/bryntum/support/issues/369) - Resource time range title changes on scrolling in vertical mode
* [#404](https://github.com/bryntum/support/issues/404) - Crash in CrudManager demo after saving updated event
* [#409](https://github.com/bryntum/support/issues/409) - Crash when clicking next time arrow in event editor if end date is cleared
* [#441](https://github.com/bryntum/support/issues/441) - Recurrence dialog is too narrow
* [#445](https://github.com/bryntum/support/issues/445) - React: Scheduler crashes when features object passed as prop
* [#454](https://github.com/bryntum/support/issues/454) - "No records to display" shown during loading
* [#457](https://github.com/bryntum/support/issues/457) - Docker container with gantt ASP.NET Core demo cannot connect to MySQL container
* [#459](https://github.com/bryntum/support/issues/459) - Event editor should be scrollable if it does not fit in viewport
* [#466](https://github.com/bryntum/support/issues/466) - `constrainDragToResource` should be supported in vertical mode

## 3.1.0 - 2020-03-10

### FEATURES / ENHANCEMENTS

* New Recurring Events React+TypeScript demo ([#655](https://github.com/bryntum/support/issues/655))
* New Recurring Events Angular 9 demo ([#654](https://github.com/bryntum/support/issues/654))
* Added new demos showing integration with .NET backend and .NET Core backend ([#299](https://github.com/bryntum/support/issues/299))
* Font Awesome 5 Pro was replaced with Font Awesome 5 Free as the default icon font (MIT / SIL OFL license)

### BUG FIXES

* [#083](https://github.com/bryntum/support/issues/083) - Drag selection element position wrong if page is scrolled
* [#320](https://github.com/bryntum/support/issues/320) - Resource margin does not affect milestone size
* [#346](https://github.com/bryntum/support/issues/346) - Cascading combo box not editable
* [#347](https://github.com/bryntum/support/issues/347) - Crash if starting timerange drag while previous drag operation is finalizing
* [#348](https://github.com/bryntum/support/issues/348) - Tooltip misaligned after clicking add in tasks demo
* [#380](https://github.com/bryntum/support/issues/380) - Vue custom event editor shows editor only once
* [#384](https://github.com/bryntum/support/issues/384) - Dependencies not repainted after group collapse / expand
* [#385](https://github.com/bryntum/support/issues/385) - Ghost event element remains in view after adding new event/resource and syncing changes to backend
* [#403](https://github.com/bryntum/support/issues/403) - Aborted fetch should not create exception in console

## 3.0.4 - 2020-02-24

### FEATURES / ENHANCEMENTS

* Compressed non-working time was added to TimeAxis demo ([#319](https://github.com/bryntum/support/issues/319))

### BUG FIXES

* [#198](https://github.com/bryntum/support/issues/198) - Promise not resolved when showing a shown Popup
* [#203](https://github.com/bryntum/support/issues/203) - Events stay selected after other events selection if they are not in the viewport
* [#288](https://github.com/bryntum/support/issues/288) - Add recurringTimeSpans to framework wrappers and update guides
* [#292](https://github.com/bryntum/support/issues/292) - Crash when using arrow key in simple event editor
* [#295](https://github.com/bryntum/support/issues/295) - Scroll is reset to top after clicking time axis in vertical mode
* [#333](https://github.com/bryntum/support/issues/333) - Crash when creating dependency in web components demo

## 3.0.3 - 2020-02-13

### FEATURES / ENHANCEMENTS

* Added a new demo using cellGenerator + improved cellGenerator docs  ([#250](https://github.com/bryntum/support/issues/250))
* Added new `resourceheaderclick`, `resourceheaderdblclick`, `resourceheadercontextmenu` events fired when interacting
  with resource header in vertical mode ([#282](https://github.com/bryntum/support/issues/282))

### API CHANGES

* [DEPRECATED] The `beforeZoomChange` and `zoomChange` events are deprecated. These are synonyms for
  `beforePresetChange` and `presetChange`

### BUG FIXES

* [#194](https://github.com/bryntum/support/issues/194) - fillTicks fills the next day if time is 00:00:00
* [#243](https://github.com/bryntum/support/issues/243) - Scheduler doesn't properly render rows for resource tree loaded on demand
* [#245](https://github.com/bryntum/support/issues/245) - timeRanges not refreshed if its store uses beginBatch/endBatch
* [#260](https://github.com/bryntum/support/issues/260) - Cannot enter negative lag in dependency editor
* [#263](https://github.com/bryntum/support/issues/263) - Scrolling breaks after event resize
* [#276](https://github.com/bryntum/support/issues/276) - Event disappears after drag drop (Angular Drag from Grid demo)

## 3.0.2 - 2020-01-30

### FEATURES / ENHANCEMENTS

* PDF export server was refactored. Removed websocket support until it is implemented on a client side. Added logging
  Added configuration file (see `app.config.js`) which can be overridden by CLI options. Multipage export performance
  was increased substantially (see `max-workers` config in server readme)
  ([#112](https://github.com/bryntum/support/issues/112))

### API CHANGES

* Added `image` field for `ResourceModel`

### BUG FIXES

* [#195](https://github.com/bryntum/support/issues/195) - ExtJS modern demo: not possible to create more than one instance dynamically
* [#207](https://github.com/bryntum/support/issues/207) - EventDrag constraint wrong when constrainDragToTimeline is false
* [#210](https://github.com/bryntum/support/issues/210) - Assignment store does not fire `change` event when editing resources
* [#220](https://github.com/bryntum/support/issues/220) - Load mask with CrudManager not working
* [#226](https://github.com/bryntum/support/issues/226) - columnLinesFor config is ignored when switching between view presets
* [#233](https://github.com/bryntum/support/issues/233) - Assignments updated when just changing event dates in event editor
* [#234](https://github.com/bryntum/support/issues/234) - Missing "Recurring events" demo resource image

## 3.0.1 - 2020-01-17

### FEATURES / ENHANCEMENTS

* PDF Export feature uses *Scheduler* as the default file name ([#117](https://github.com/bryntum/support/issues/117))
* Added new Grid methods `enableScrollingCloseToEdges` / `disableScrollingCloseToEdges` to activate automatic scrolling
  of a SubGrid when mouse is close to the edges. Demonstrated in the updated scheduler 'dragfromgrid' demo
* Added support to show async tooltips ([#148](https://github.com/bryntum/support/issues/148)). Showcased in updated `tooltips` demo. See EventTooltip feature docs
  for information

### API CHANGES

* [BREAKING] (for those who build from sources): "Common" package was renamed to "Core", so all our basic classes should
  be imported from `lib/Core/`
* Added `resourceImageExtension` config to `SchedulerEventRendering` mixin to support setting resource image extension
* EventNavigation#navigator config changed from public to internal. This config should not be needed in normal use of
  the Scheduler

### BUG FIXES

* [#25](https://github.com/bryntum/support/issues/25) - eventContextMenu triggered when right clicking summary bar
* [#45](https://github.com/bryntum/support/issues/45) - Event not derendered after setting future dates in event editor of new event
* [#59](https://github.com/bryntum/support/issues/59) - EventDragSelect feature selects events even if drag happens on locked grid
* [#62](https://github.com/bryntum/support/issues/62) - Event disappears after drag cancelled with ESC and followed by ZoomIn/Out
* [#96](https://github.com/bryntum/support/issues/96) - Drag create proxy not removed if autoClose is false on EventEdit feature
* [#97](https://github.com/bryntum/support/issues/97) - weekStartDay not updated after localization
* [#104](https://github.com/bryntum/support/issues/104) - Calendar icon should be shown in tooltips if date format doesn't include hour info
* [#105](https://github.com/bryntum/support/issues/105) - Time axis breaks after scrolling leftwards a long way bug high-priority resolved
* [#119](https://github.com/bryntum/support/issues/119) - Infinite image requests in vertical demo
* [#129](https://github.com/bryntum/support/issues/129) - Crash when exporting scheduler with no dependencies
* [#130](https://github.com/bryntum/support/issues/130) - Crash when export Scheduler with columnLines disabled
* [#136](https://github.com/bryntum/support/issues/136) - PresetManager methods not declared as static in gantt.d.ts
* [#137](https://github.com/bryntum/support/issues/137) - Drag drop of multiple selected events in vertical mode does not work
* [#146](https://github.com/bryntum/support/issues/146) - Recurring event not rendering occurrences
* [#163](https://github.com/bryntum/support/issues/163) - Recurrence UI should be disabled by default
* [#168](https://github.com/bryntum/support/issues/168) - Broken Vue CDN demo
* [#169](https://github.com/bryntum/support/issues/169) - Features disabled in Vue demos
* [#189](https://github.com/bryntum/support/issues/189) - DOCS: Public configs should not link to private configs/classes

## 3.0.0 - 2019-12-20

### FEATURES / ENHANCEMENTS

* New Ionic Themes demo which shows using and changing included themes. (#9394)
* Added support for exporting the Scheduler to PDF and PNG. It is showcased in several examples, pdf-export for Angular,
  React and Vue frameworks, as well as in examples/export. The feature requires a special export server, which you can
  find in the examples/_shared/server folder. You will find more instructions in the README.md file in each new demo. (
  #6268)
* Added public config to disable recurring event fields in event editor UI ([#71](https://github.com/bryntum/support/issues/71))

### API CHANGES

* [BREAKING] The `ViewPreset` now uses a `headers` array instead of named header levels in a `headerConfig` property. So
  the `columnLinesFor` property is now an index into that array. (#9325, #4469)
* ViewPresets and zoom levels were refactored for easier usage. `ViewPresets` are now contained in a `PresetStore` and
  zooming steps between them, removing the need of manually defining `zoomLevels`
* TimeSpan (and its subclasses such as EventModel) now uses `DateHelper.defaultFormat` as the default format for parsing
  strings to dates (applies to `startDate` and `endDate`). The actual format used by default is still the same, but now
  more easily configurable ([#32](https://github.com/bryntum/support/issues/32))
* Scheduler now also uses `DateHelper.defaultFormat` as its default format for the timeaxis start and end dates. This
  change makes it behave slightly different, previously it would expect milliseconds in its format and now it does not
* Scheduler#getDateFromX is deprecated because it is orientation dependent. Scheduler#getDateFromCoordinate should be
  used if you have the position on the correct axis, or Scheduler.getDateFromXY if you have a coordinate pair

### BUG FIXES

* [#6](https://github.com/bryntum/support/issues/6) - hideHeaders in combination with timeRanges causes crash
* [#18](https://github.com/bryntum/support/issues/18) - onEventCommit triggers too many row refreshes
* [#58](https://github.com/bryntum/support/issues/58) - Timeline is broken when event is scrolled into view
* [#65](https://github.com/bryntum/support/issues/65) - Event is not repainted to the updated time if its resource has been changed too
* [#72](https://github.com/bryntum/support/issues/72) - Drop date is resolved based on cursor position instead of proxy element
* #8569 - Scheduler doesn't paint events for resource with id 0
* #8570 - Dependencies with id: null are reusing one dependency line
* #9456 - Event editor recurring UI should be hidden when RecurringEvents feature is disabled

## 2.3.1 - 2019-11-20

### BUG FIXES

* [#3](https://github.com/bryntum/support/issues/3) - Crash when using recurrence custom field

## 2.3.0 - 2019-11-06

### FEATURES / ENHANCEMENTS

* Scheduler now supports recurring events (#8305). See new `recurrence` demo and `recurringEvents` feature in the
  docs for details
* Added a thinner version of Scheduler called `SchedulerBase`. It is a Scheduler without default features, allowing
  smaller custom builds using for example WebPack. See the new `custom-build` demo for a possible setup (#7883)
* Event removal using keyboard and the event editor is now both preventable through the `beforeEventDelete` event
  triggered on Scheduler (#8681)
* The horizontal time axis header now only renders ticks in view, reducing the performance impact of displaying long
  time ranges (#9022)
* Added `dragHelperConfig` to EventDrag feature to be able to easily configure the internal DragHelper instance
  (#9276)
* `mode` property is supported by Angular/React/Vue wrappers by default now (#9320)
* `scheduleClick`, `scheduleDblClick` and `scheduleContextmenu` events now also include information about the current
  tickStartDate and tickEndDate of the timeAxis
* New `scheduleMouseMove` event added with same event signature as `scheduleClick`
* Support for disabling features at runtime has been improved, all features except Tree can now be disabled at any time
* Widgets may now adopt a preexisting DOM node to use as their encapsulating `element`. This reduces DOM footprint when
  widgets are being placed inside existing applications, or when used inside UI frameworks which provide a DOM node. See
  the `adopt` config option. (#9414)
* The `dragfromgrid` demo was updated with toggling between vertical and horizontal mode (#8985)
* The `drag-between-schedulers` and `partners` demos uses a new Splitter widget to allow adjusting the size of the
  Schedulers (#9138)
* Experimental: The React wrapper has been updated to support using React components (JSX) in cell renderers and as cell
  editors. Please check out the updated React demos to see how it works (#7334, #9043)
* React Integration Guide updated with information on new JSX and React Components renderers and editors support
  (#9245)
* Added new Angular 8 demo (#9336)

### BUG FIXES

* #7998 - DOCS: Links are wrong if open grid docs from scheduler docs
* #8272 - Dep lines can be orphaned when multiassigned event shares resource with single assigned
* #8522 - STYLING: Line header element and body element should have same color
* #8642 - Custom event sorting is not supported
* #8660 - DOCS: Column lines major ticks are not thicker
* #8702 - TimeRanges feature throws an exception when Scheduler is in a Popup
* #8898 - Resizing should work also when events are small
* #9036 - Assigning to a resource which is filtered out doesn't move event to the resource
* #9234 - Event disappears on drag/drop between multiple schedulers
* #9236 - Dependency store changes are not empty after initialization
* #9249 - Tooltip End Date wrong if event ends on midnight
* #9254 - draggable field not respected for multi-event drag
* #9258 - VUE: Custom Event Editor demo does not use the full screen height on iPad
* #9270 - Crash after creating event in vertical mode after sync
* #9307 - eventDragSelect feature missing from react wrappers
* #9316 - Should be possible to specify renderer for ResourceInfoColumn
* #9395 - Code shown in ResourceInfoColumn after few changes to events

## 2.2.5 - 2019-09-16

### FEATURES / ENHANCEMENTS

* Added example that shows how to use Vue popup as a custom event editor and (Partial fix #8721)
* Added example that shows how to use Angular popup as a custom event editor (#8721)

### BUG FIXES

* #9110 - Crash if undoing change to event which is inside collapsed parent
* #9199 - TimelineZoomable passes level: -1 in the zoomChange event
* #9202 - ResourceInfo column reloads non-existing image instantly
* #9210 - Crash when opening eventEditor programmatically in vertical mode
* #9215 - CrudManager only syncs featured stores
* #9216 - DOCS: Nested configs look broken
* #9218 - TimeRanges feature doesn't update element properly on id change
* #9224 - CrudManager doesn't commit records on sync
* #9232 - getStartEndDatesFromRectangle not implemented for vertical mode
* #9241 - EventTooltip hides on left/right scroll with magic mouse while still over an event

## 2.2.4 - 2019-09-09

### FEATURES / ENHANCEMENTS

* Added a customization guide about switching to Material Icons (#8969)
* New example that shows how to use React popup form as a custom event editor (partial fix of #8721)
* Added `triggerEvent` config for TimeSpanRecordContextMenuBase (inherited in ScheduleContextMenu, EventContextMenu), to
  set event which triggers context menu (#8757)
* Scheduler now fires `eventDragAbort` in case of an aborted drag operation (#9195)

### BUG FIXES

* #7809 - eventType field should update visibility of the other EventEditor fields
* #8658 - STYLING: Milestone layout demo renders incorrectly
* #9067 - Crud manager should support fetchOptions
* #9111 - Unexpected transitions for existing events when adding new events
* #9149 - Crash when dragging many tasks and some end up outside time axis, then dragged back
* #9150 - TimeAxis#round off for distant months
* #9151 - Event bars of multi week events not visible at extreme zoom in levels
* #9168 - Default image not shown after scrolling
* #9192 - Crash in vertical mode if calling store.endBatch

## 2.2.3 - 2019-08-27

### FEATURES / ENHANCEMENTS

* A new `resourceMargin` config was added to Scheduler, to allow more control over the event layout. Use it to specify
  the margin between the first/last stacked/packed event within a resource and the resources edges (row or column
  depending on mode). Defaults to use the configured `barMargin`, making it backwards compatible (#7888)
* A `readOnly` mode was added to the event editor (#8343)

### API CHANGES

* The default region for new columns has changed to be the first region (usually "locked") in Scheduler (#7423)

### BUG FIXES

* #6357 - Dependency creation tooltip prevents creating dependecies in some cases
* #7816 - Investigate performance when changing start/end dates
* #8093 - No need to redraw other rows on changes with eventLayout: 'none'
* #8764 - Partner timelines out of sync after zooming
* #8772 - ScheduleTooltip should reposition itself upon hover over it
* #8947 - VERTICAL: Scroll to date not functioning
* #8998 - ResourceTimeRanges not drawn after clearing and repopulating resource store
* #9004 - Resource images reloaded upon every Resource change
* #9017 - zoomchange event signature doesn't match doc
* #9032 - Adding event when no rows to display fails with exception
* #9046 - Angular-N demos are broken
* #9073 - vue drag-from-grid demo cannot be built with yarn
* #9090 - Resource images reloaded when resource column width changes
* #9098 - Warn users if scrollEventIntoView is not possible
* #9105 - STYLING: Change major tick column lines to use Grid's cell border color, minor tick lines slightly
  faded
* #9112 - Crash when modifying number of resources in bigdataset demo
* #9115 - Timerange header position is incorrect after scroll
* #9120 - Vertical scheduler throws exception when autoHeight is true
* #9127 - ResourceInfoColumn.validNames null disallows all names

## 2.2.2 - 2019-08-15

### FEATURES / ENHANCEMENTS

* Support for dragging multiple events at once was added, check it out in the `dragselection` demo (#8289)
* New Ext Scheduler to Bryntum Scheduler migration guide (#8595)

### BUG FIXES

* #7697 - Milestone position wrong in Custom Event Styling demo
* #8456 - Dependencies feature not working in nested events demo
* #8722 - No context menu shown when dependencies initialized as disabled or get disabled
* #8842 - beforeclose event not fired consistently for EventEditor
* #8939 - HeaderContextMenu range setting does not handle sub-day ticks
* #8965 - Resource time ranges missing after filtering + zooming
* #8972 - Crash in vertical mode if a resource has no name defined
* #8994 - Advanced Angular demo (angular 8) fails to run production build
* #9009 - Dependency terminals visible after event resize with 'allowCreate' set to false

## 2.2.1 - 2019-07-24

### BUG FIXES

* #8730 - Dependencies are not redrawn after change
* #8877 - Crash in Tasks demo when typing arrow right on an event
* #8893 - PHP demo: doesn't save changes for newly created events
* #8894 - PHP demo: fails when try to edit an event after another is created
* #8923 - Child nodes not shown for newly added resource in a tree
* #8933 - Vue trial demos don't work in IE11
* #8942 - Crash when starting vertical mode demo on touch device
* #8943 - Crash when dragging newly created event
* #8944 - Crash when clicking next arrow in start date field of date range menu
* #8946 - VERTICAL: Resizing small event starts both resize + drag

## 2.2.0 - 2019-07-19

### FEATURES / ENHANCEMENTS

* New vertical rendering mode added showing resources on the horizontal axis and time on the vertical axis. The vertical
  mode compatible with most Scheduler features, be sure to check out the new `vertical` demo (#7504)
* New integration example Filtering Scheduler for React with TypeScript (#7408)
* Scheduler now supports zooming by dragging a range in the time axis header. Use the new HeaderZoom feature to enable
  this behavior (#8747)
* Added a `resourceImagePath` to Scheduler, for shared usage by features that displays resource miniatures (such as
  ResourceInformationColumn and the header in vertical mode)
* [BREAKING] The Bryntum Scheduler wrapper for React and Angular has been rewritten to support passing different values
  to features and config options with same names. Property names must be now suffixed with `Feature` to differentiate
  features and config options, for example `timeRangesFeature`. In this example, `timeRangesFeature` would be propagated
  to Scheduler features and `timeRanges` property would go to Scheduler itself

### API CHANGES

* [DEPRECATED] ResourceInfoColumns `imagePath` and `defaultImageName` configs was deprecated in favour of the new
  `resourceImagePath` and `defaultResourceImageName` configs on Scheduler
* [DEPRECATED] Scheduler's `tickWidth` property is deprecated, it is called `tickSize` now

### BUG FIXES

* #8694 - Touch drag on events should only start after a small delay
* #8736 - nonWorkingTime feature highlights wrong zones when scheduler shows only working time
* #8867 - React drag onto tasks demo in full screen
* #8873 - VUE Localization demo: Locales are hardcoded
* #8878 - Specifying listeners for event editor breaks drag create feature and tooltip
* #8918 - ResourceTimeRanges not rendered when filtering tasks

## 2.1.3 - 2019-07-04

### FEATURES / ENHANCEMENTS

* The integration guides for Angular, React and Vue have been updated to reflect the latest versions of our examples and
  wrappers

### BUG FIXES

* #8746 - Drag and drop breaks row rendering when the view is scrolled and drop makes events overlapped
* #8750 - Scheduler shouldn't fire beforeEventAdd event if eventEdit feature exists
* #8804 - Error / warnings in console of web components demo
* #8818 - PHP demo: creating a new event fails
* #8819 - PHP demo: changing assignment to a different resource duplicates the event
* #8843 - Drag between schedulers: Bottom scheduler header bug
* #8868 - Crash when zooming in narrow screensize
* #8871 - Exception thrown when removing event under mouse pointer

## 2.1.2 - 2019-06-27

### BUG FIXES

* #8667 - GroupSummary sometimes not rendering
* #8705 - Not possible to disable dependency creation
* #8719 - Clean up public configs that were removed in 2.1 release (showAddEventInContextMenu,
  showRemoveEventInContextMenu, showUnassignEventInContextMenu)
* #8720 - REGRESSION: readOnly mode should disable default context menu items
* #8726 - DependencyEdit editDependency crashes when called programmatically
* #8761 - Grid vertical scroll height not updated after event add
* #8762 - Time range elements are sized incorrectly when zooming out

## 2.1.1 - 2019-06-14

### BUG FIXES

* Unfortunately we broke event animations in 2.1.0, this release re-enables them

## 2.1.0 - 2019-06-12

### FEATURES / ENHANCEMENTS

* Bumped built-in FontAwesome to version 5.8.2
* Demos now have a built-in code editor that allows you to edit their code (Chrome only) and CSS (#7210)
* Scheduler now supports selecting multiple events using drag drop (#8647)
* Scheduler now has a new SimpleEventEdit feature for editing the name of an event (#8648)
* Multiple new Angular demos added, see the `examples/angular` folder

### API CHANGES

* The `cls` property of `Scheduler.model.Event` is now an instance of `Common.helper.util.DomClassList`. Code which uses
  it as a string will continue to work as the class has a `toString` implementation, and the `set Cls` setter will
  promote incoming strings. But using the `DomClassList` API allows easy adding and removal of individual CSS classes,
  easy testing for presence of a CSS class and more accurate comparisons of two Events' classes. The
  `DomClassList#isEqual` method will work regardless of the _order_ that class names were added
* Scheduler repaints dependencies asynchronously when dependency, assignment or event is changed. Use
  `dependenciesDrawn` event to know when dependency lines are actually painted. `draw`, `drawDependency` and
  `drawForEvent` are still synchronous
* [BREAKING] Context menu Features are configured in a slightly different way in this version. If you have used the
  `extraItems` or `processItems` options to change the contents of the shown menu, this code must be updated. Instead of
  using `extraItems`, use `items`

  The `items` config is an *`Object`* rather than an array. The property values are your new submenu configs, and the
  property name is the menu item name. In this way, you may add new items easily, but also, you may override the
  configuration of the default menu items that we provide

  The default menu items now all have documented names (see the `defaultItems` config of the Feature), so you may apply
  config objects which override default config. To remove a provided default completely, specify the config value as
  `false`

  This means that the various `showXxxxxxxInContextMenu` configs in the Scheduler are now ineffective. Simply use for
  example, `items : { deleteEvent : false }` to remove a provided item by name

  `processItems` now recieves its `items` parameter as an `Object`, so finding predefined named menu items to mutate is
  easier. Adding your own entails adding a new named config object. Use the `weight` config to affect the menu item
  order. Provided items are `weight : 0`. Weight values may be negative to cause your new items to gravitate to the top
* [DEPRECATED] EventEdit's `extraWidgets` config was deprecated and will be removed in a future version. Please use
  `extraItems` instead
* [BREAKING] EventSelection#deselectEvent now always maintains current selected events. (#8646)

### BUG FIXES

* #8063 - Drag resize ignores allowOverlap set to false
* #8205 - Dependencies can be rendered wrong for out of view events/tasks
* #8245 - Aborting task drag with ESC does not redraw dependency
* #8258 - Scheduler/examples/multiassign-with-dependencies/ throws error when dragging event and mouse moves over
  splitter
* #8380 - Non working time should highlight header time axis cells
* #8393 - CrudManager tries to sync invalid record
* #8544 – React: drag from grid freeze bug
* #8546 - scrollEventIntoView/scrollResourceEventIntoView should focus event element
* #8584 - ColumnLines feature misrendering
* #8600 - Zoom to fit not functioning correctly
* #8601 - Nested demo: nested event styles
* #8657 - Presets should have column lines defined for the lowest header level by default
* #8663 - Rendering broken in drag from grid demo

## 2.0.3 - 2019-05-23

### FEATURES / ENHANCEMENTS

* EventDrag feature can now be programmatically disabled

### API CHANGES

* CrudManager would previously when used with a tree store erroneously append new records from the backend without
  specified `parentId` to the first record in the store, whereas it now will append them to the root

### BUG FIXES

* #7561 - Should be able to use Grid & Scheduler & Gantt bundles on the same page
* #8350 - Pan feature should also scroll the view by clicking on an event when drag and drop is disabled
* #8369 - ResourceInfoColumn should show default image if loading fails
* #8392 - 'cls' CSS class not added to rendered dependency
* #8398 - Event not selected if clicking the resize handle
* #8403 - Workingtime demo: Drag create out the right side of the time axis
* #8411 - Scheduler redrawn twice on EventStore dataset
* #8431 - Drag between schedulers demo not working with mobile device
* #8484 - New events not saved in CrudManager demo
* #8487 - Unchanged events in row are animated upon event add

## 2.0.2 - 2019-05-10

### FEATURES / ENHANCEMENTS

* Scheduler now only redraws affected rows if events change, greatly speeding up cases where a change does not affect
  the height of the row (#8303)
* Labels for TimeRanges are now rendered in the time axis header to not be covered by task elements in the timeline
  (`showHeaderElements` config of the feature switched to `true` by default)
* New initial animation 'zoom-in' added
* Animations demo extended to showcase initial animations, also includes a custom animation

### API CHANGES

* Dependency hover and creation tooltips can now be enabled separately (`showTooltip` vs `showCreationTooltip`)

### BUG FIXES

* #7496 - Allow aborting event resize with ESC
* #7968 - zoomToSpan should take centerDate config into account
* #8069 - Provide public timeRanges property on CrudManager
* #8307 - Context menu should work on whole scheduling area
* #8319 - Current timeline header element not initially shown
* #8337 - Subclasses of TimeRanges remove each others elements
* #8346 - TimeRange with startDate == endDate not rendered properly
* #8355 - Selection of next event upon deletion bugged by implementation of non working time
* #8365 - Event style not cleaned up properly on reuse

## 2.0.1 - 2019-05-03

### BUG FIXES

* #7906 - RoughJS demo not running in IE11
* #7932 - Crash if timeRange lacks start or end date
* #7947 - Dependencies feature sets up its store listeners too early
* #7956 - EventNavigation fires an incorrect event signature for the navigate event
* #7974 - Having leaf item at the top of the tree makes the whole tree broken
* #7976 - Should not highlight timeaxis column on hover
* #7977 - Dependency drag terminals wrong colour after mouseup of event resize drag
* #7981 - When moving an event into the far future, dep lines are redrawn wrong and not kept up to date
* #7989 - Timeaxis filter field width overflows its container
* #7997 - Mouseout of event through dep terminal leaves resizing class present on inner
* #8005 - Resource timeranges not rendering correctly with eventLayout 'none'
* #8006 - Investigate poor scrolling performance on partnered schedulers with many events
* #8041 - Normal header is not correctly stretched inside flex layout
* #8046 - "event(s)" in ResourceInfoColumn template should be localized
* #8066 - Working time demo: Column lines for middle day viewpreset out of sync
* #8084 - Scheduler view not reacting to 'refresh' event after endBatch()
* #8128 - getDateFromDomEvent doesn't work with non-local mouse events
* #8144 - Header menu items duplicated if using multiple instances of TimeRanges
* #8161 - TimeRanges doesn't work in React Typescript demo
* #8221 - Drag proxy misplaced if page is scrolled
* #8263 - Event selection should be cleared if drag starts without CTRL pressed

## 2.0.0 - 2019-03-28

### FEATURES / ENHANCEMENTS

* New demo using WebSockets added (client + server)
* New demo using Ionic added (#7426)
* New demo showing integration to the Vuestic web app (IE11 is not supported) (#7831)
* New demo showing cascading combos in Event Editor (#7755)
* New demo using Rough.js for custom sketched event styling added (#7493)
* Demos ported to vue: drag-from-grid, drag-onto-tasks (TypeScript, [#756](https://github.com/bryntum/support/issues/756))
* Included a new default theme called "stockholm"
* Added animation for first display of events (#7550)
* Scheduler now supports filtering the time axis ticks and/or defining a custom tick generator to create a
  non-continuous time axis. Try the new `timeaxis` demo to see it in action (#6597)
* Added support for specifying working days and hours, which will be used to either filter the time axis or stretch the
  rendered events depending on zoom level (#7536)
* Removed flatpickr as our time picker for `TimeField` and replaced with our own implementation (#7396)
* Made it possible to manipulate items of HeaderContextMenu before show (#7544)
* Added support for using dependencies with multi assigned events (#6749)
* Added API to show context menu for event record (#7621)
* Scheduler now supports multiple regions for columns, as opposed to only two previously (locked and normal). Check out
  the new columns demo to see how it works (#7642)
* Add support for dashed and dotted lines to the ColumnLines feature (#7653)
* Events can now be split in pieces using the new `split` API. Demonstrated in tooltips demo and eventcontextmenu demo
* Angular demos no longer use `autoHeight`, instead they get their height from CSS as most of other demos do. This makes
  code from them a bit easier to reuse outside of our demos (#7767)
* EventEdit feature now triggers a `beforeEventEditShow` event on scheduler after constructing the editor and loading
  the event, but before being shown. Allows you to hook in to for example filter the resources combo (#7520)
* Added a `style` field to the `TimeSpan` model. Can be used to apply custom styling to events, time ranges and resource
  time ranges (#7596)
* New `getVisibleDateRange()` API added (#7876)
* The CrudManager `AjaxTransport` mixin now uses our internal AjaxHelper and the fetch API for transport,
  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### API CHANGES

* Previously private field accessors on the event editor feature were made public (nameField, resourceField etc.) to for
  example allow manipulation of shown resources when displaying the editor (#7519)
* TimeAxisViewModel was made public, it handles mapping between the data based time axis and the UI. You can access it
  using `scheduler.timeAxisViewModel` to find out the date at a specific pixel etc
* EventContextMenu#onElementContextMenu is private now, use EventContextMenu#showContextMenuFor instead
* 'beforeEventDrag' is no longer fired on mousedown, but on the first mousemove following a mousedown (#7723)
* [BREAKING] The `renderEventsAsContainers` has been removed, and the rendering simplified. All Events are rendered
  inside their own wrapper element. _This will only affect you if you have custom styling applying to event elements and
  were not using `renderEventsAsContainers: true`_
* [BREAKING] TimeField's and DateField's `pickerFormat` config was removed in favour of using `format` also for the
  picker
* [BREAKING] EventEditors resource field was renamed from `resourceIdField` -> `resourceField` to reflect the fact that
  it might involve multi assignment (#7518)
* [BREAKING] Scheduler now renders it contents on `paint` instead of on `render`, to allow it to initialize correct when
  embedded in tab panels and similar. Because of this change, the `render` event was removed
* [BREAKING] `idField` config was removed from `Store`, it was not used in the codebase and did not work as intended
  The config is still available and working on `Model`, set it on your subclass (`MyModelClass.idField = 'MyId'`). If
  you really want to remap id to another field in your data without subclassing `Model` you can still do it using the
  `fields` config on `Store`: `new Store({ fields : [{ name : 'id', dataSource : 'MyId' }] });`

### BUG FIXES

* #7422 - Cannot read property 'atob' of undefined
* #7483 - finalize method called twice when cancelling event resizing
* #7500 - Crash in CrudManager demo if making changes while sync is in progress
* #7599 - Event rendering in month is a bit off
* #7669 - TimeField in EventEditor left/right buttons should use same increment as current viewPreset
  timeResolution
* #7675 - EditBase should check field validity in a more precise manner
* #7719 - Assignment cannot be moved correctly if it overlaps with itself and allowOverlap is false
* #7708 - ScheduleTip and EventTip disabled after dragging en event out of view
* #7726 - DOCS: Complete list of defaults
* #7732 - Event selection lost after loading new dataset which contains previously selected event id
* #7733 - Old selected events not cleaned up when a dataset changes
* #7735 - TimeSpan.normalize should respect mapping
* #7758 - ViewPreset headerConfig "align" has no effect
* #7760 - ViewPreset headerConfig "headerCls" has no effect
* #7761 - Some feature methods, exposed to scheduler, are not typed properly
* #7770 - Events not deleted when parent tree node deleted
* #7802 - Incorrect dates on the timeaxis when resolution unit is month
* #7810 - Filterable timeaxis doesn't work with DAY shift unit
* #7863 - Crash after drag drop when scrolled to bottom and replacing events dataset
* #7869 - Setting showCurrentTimeLine to false doesn't work

## 1.2.5 - 2019-02-26

### FEATURES / ENHANCEMENTS

* Updated the React guide to reflect the change of bundle used in the demo (it uses scheduler.module.transpiled.js to
  allow the demo to run in IE11)

### BUG FIXES

* Renamed event relay prefix in the vue wrapper to avoid naming collisions (eventStore -> events etc.)
* Fixed react_typescript build

## 1.2.4 - 2019-02-19

### FEATURES / ENHANCEMENTS

* Updated `readme.md` to better describe the projects folder structure and different included bundles

### BUG FIXES

* #7560 - Crash in GroupSummary demo
* #7629 - Error when building Angular demos

## 1.2.3 - 2019-02-14

### FEATURES / ENHANCEMENTS

* Added a date picker to EventEditor, Angular, and Vue demos (#7584)

### BUG FIXES

* #7547 - STYLING: Wrong selection style for group header rows
* #7563 - Scroll reset in partners demo
* #7590 - STYLING: Headers missing padding in IE11
* #7608 - react_build demo is broken
* #7609 - passStartEndParameters config has no effect
* #7619 - Dblclicking a summary row should not create a new event
* #7620 - Incorrect position for events below collapsed group in groupsummary demo

## 1.2.2 - 2019-01-28

### API CHANGES

* ANGULAR: The Scheduler component was previously relaying events from EventStore and ResourceStore by prefixing them
  with `eventStore` and `resourceStore`, making it possible to listen for example `eventStoreAdd` or
  `resourceStoreRemove`. The prefix was causing naming collisions internally and have now been changed to `events`
  and `resources` -> `eventsAdd` / `resourcesRemove`. In case you rely on this in your code, you need to rename to match
  the new pattern

### BUG FIXES

* #7529 - After a drag on empty calendar spot, the scheduleClick event is no more fired
* #7541 - Crash when updating rendered timerange to be nonrendered
* #7558 - Error during dragdrop in angular demo
* #7555 - Drag from grid example throws error

## 1.2.1 - 2019-01-17

### API CHANGES

* The behaviour when setting `startDate` after initialization on Scheduler has changed from modifying the length of the
  displayed time range to instead shift it backwards or forwards, keeping its duration. `endDate` still modifies the
  length of the time range. To allow control over this behaviour `setStartDate` and `setEndDate` methods have been added
  to the Scheduler, both accepting a `keepDuration` flag (#7410)

### BUG FIXES

* #6576 - AjaxTransport does not honour headers config
* #7194 - Crash when exporting schedule with grouped column
* #7354 - Angular demo doesn't work in IE11
* #7370 - [EDGE] Investigate Angular + trial bundle
* #7400 - Drag between schedulers demo: Cannot read property 'isMilestone' of undefined
* #7402 - Bundle aliases for angular demos not updated
* #7409 - React Typescript demo doesn't work in IE11
* #7413 - Crash when creating new event in multi-assignment mode
* #7421 - Unexpected animation after event add
* #7440 - Crash in WebComponents demo after drag drop
* #7441 - Crash when updating resourceTimeRange of non-existing resource
* #7443 - Scroll bars showing/hiding indefinitely
* #7444 - Crash when deleting new multiassigned task
* #7448 - Crash in drag-between-schedulers demo
* #7452 - Trial demos do not work in Edge
* #7466 - Can't access dropped record when dragging between schedulers
* #7482 - Should not fire 'eventclick' after resizing
* #7485 - allowOverlap is not taken into account when dragging from another Scheduler
* #7492 - Column lines do not match headers if autoAdjustTimeAxis is false
* #7495 - End dates mismatch in resize tooltip
* #7502 - Timeaxis rendering not consistent in drag from grid demo
* #7503 - Drag drop breaks if event start is aligned with viewport left edge
* #7511 - Group summary rows visible in resource combo of event editor
* #7516 - Typings generation misses `implements` if no `extends`

## 1.2.0 - 2018-12-19

### FEATURES / ENHANCEMENTS

* React wrapper changed to use `shouldComponentUpdate()` to prevent unnecessary re-renders
* Added React + TypeScript demo (#7283)
* Full TypeScript typings included as `build/scheduler.d.ts`. Typings define module `bryntum-scheduler` to avoid
  possible name collisions, so we had to also rename import in the angular demo
* Vue wrapper now adds watchers for all props
* New demo using Vue CLI added (#7121)
* New feature + demo ResourceTimeRanges added. Renders time ranges per resource, displayed behind events (#7176)
* Built-in version of FontAwesome was bumped to 5.5.0
* New demo showing drag drop of tasks between two Scheduler instances (#7069)
* Improved the "drag from grid" demo, adding new behavior to automatically reschedule overlapping tasks (#7355)
* Added a new guide on how to listen for events (#7196)
* Docs updated to state that locales should be included before the umd bundle to have effect (#7205)
* Scheduler.feature.HeaderContextMenu now accepts an `extraItems` array to add extra items to the header context menu
* The context menu for events now accepts a `processItems` function that allows processing of the items before the menu
  is shown (#6887)
* A context menu for empty parts of the schedule was added, ScheduleContextMenu (#6724)
* Built-in version of FontAwesome was bumped to 5.5.0

### API CHANGES

* [BREAKING] AssignmentModels `getEvent()`, `getResource()`, `getEventName()` and `getResourceName()` removed in favor
  of properties `event`, `resource`, `eventName` and `resourceName`
* [BREAKING] TimeRanges `rangeCls` and `lineCls` were made private
* `DependencyStore#getEventIncomingDependencies` renamed to `getEventpredecessors`
* `DependencyStore#getEventOutgoingDependencies` renamed to `getEventsuccessors`
* The `resourceRecord` parameter of the Scheduler.feature.EventEdit#beforeeventsave event object was deprecated in favor
  of `resourceRecords` to better support multiple assignments

### BUG FIXES

* #7195 - Production build broken in angular demo
* #7224 - Store filter is not getting applied again when it's supposed to
* #7243 - Dependency lines misplaced
* #7246 - Salesforce demo doesn't work
* #7259 - React demo doesn't work in IE11
* #7267 - Dependency Tooltip width increases while moving (Firefox only)
* #7293 - Event is not visible in monthAndYear preset if end date is out of scheduler timespan
* #7307 - Dragging event to the right makes it disappear
* #7311 - Angular demo does not work in Edge
* #7315 - UI not refreshed when finalizing resize flow with `false` to cancel it
* #7316 - EventEdit endTimeConfig has no effect
* #7324 - Crash when deleting event in multassign demo
* #7325 - Angular production buid doesn't work with trial sources
* #7344 - Setting a new dataset crashes when using AssignmentStore
* #7346 - react_build demo is missing .babelrc config

## 1.1.2 - 2018-11-23

### FEATURES / ENHANCEMENTS

* EventTooltip docs updated to show that you can use Tooltip configs to affect the tooltip

### API CHANGES

* CSS class `b-sch-minuteIndicator` renamed to `b-sch-minute-indicator`
* CSS class `b-sch-hourIndicator` renamed to `b-sch-hour-indicator`

### BUG FIXES

* #7153 - Adding 100 records in a loop does not extend the scroll range of the grid
* #7167 - End date icon inconsistent with the date it's shown next to
* #7174 - record.imageUrl should have a priority and stay as it is
* #7185 - Readding a removed resource renders events after scroll
* #7191 - STYLING: Wrong color in dark theme for nbr events text in resource info column
* #7217 - group summary demo misrendering

## 1.1.1 - 2018-11-16

### FEATURES / ENHANCEMENTS

* New drag drop demo showing how to drag objects from outside the scheduler onto scheduled tasks (fixed #7139)
* The Angular wrapper now includes @Input for `eventBodyTemplate`, `crudManager`, `eventStore`, `resourceStore`,
  `assignmentStore` and `dependencyStore`
* New pan feature added (#6665)
* New `drag-between-schedulers` demo showing how you can drag and drop tasks between multiple Schedulers

### API CHANGES

* Calling TimeSpan#startDate setter and TimeSpan#setStartDate will now move the span in time as opposed to earlier where
  it would modify the duration of the event

### BUG FIXES

* #7003 - Vue wrapper naming collision
* #7120 - Cannot use ids containing "-" on events or resources
* #7125 - Export feature doesn't export correct data by default
* #7129 - Crash when localizing time units
* #7130 - Web Components demo throws 404s
* #7132 - Setting start date > end date results in negative duration
* #7136 - Duration field should spin on up/down keys
* #7143 - Strange scroller behavior in dragfromgrid demo
* #7147 - When record is removed from context menu focus should move to next event

## 1.1.0 - 2018-11-09

### FEATURES / ENHANCEMENTS

* React demo bumped to latest react and styling improved
* Built-in FontAwesome version bumped to 5.4.1, scope changed from .fa -> .b-fa to not affect icons outside of our
  widgets
* New `tooltips` demo showing how to customize the event tooltip
* New `validation` demo showing how to validate drag drop & resizing operations
* New Export to Excel demo (#6961)

### API CHANGES

* `Scheduler` has a new `parter` config which pairs the `Scheduler` with the passed `Scheduler`, sharing the
  `TimeAxis`, and synchronizing the horizontal scroll positions
* Scheduler now defaults to remove the event when removing its last assignment. This behaviour can be changed using the
  `removeUnassignedEvent` config
* Scheduler has a new `triggerSelectionChangeOnRemove` config that determines if `eventSelectionChange` should trigger
  or not when removing a selected event
* [BREAKING] ViewPresets property `timeColumnWidth` and related getters and setters was renamed to `tickWidth`
  `timeColumnWidth` can still be used for backwards compatibility, but if you are using a custom ViewPreset we recommend
  that you rename to be future proof
* [BREAKING] EventDrag#validatorFn now receives the drag context in one context object (similar to dragCreate and
  eventResize features), instead of multiple params
* [DEPRECATED] In the context object parameter (first param) of the EventResize#validatorFn, 'start' and 'end' were
  deprecated in favor of 'startDate' + 'endDate'
* [DEPRECATED] In the context object parameter (first param) of the EventDragCreate#validatorFn, 'start' and 'end' were
  deprecated in favor of 'startDate' + 'endDate'
* [DEPRECATED] In the `eventpartialresize` context object, the 'start' and 'end' were deprecated in favor of 'startDate'
    + 'endDate'
* [DEPRECATED] TimeSpan#shift method now has switched position of the `amount` and `unit` params (#7031)
* [DEPRECATED] Scheduler#viewportresize event was deprecated in favor of #timelineviewportresize (#7046)
* [BREAKING] In the SchedulerEventRendering#eventRenderer template method, the `columnIndex` property of the `detail`
  object was made private
* [BREAKING] In the SchedulerEventRendering#eventRenderer template method, the following properties of the
  `detail.tplData` object were made private: `start`, `end`, `startMs`, `endMs`, `startsOutsideView`, `endOutsideView`,
  `resourceId`, `resource`, `id` and `eventId`. A new `height` property was added to `tplData` which lets your read the
  event height

### BUG FIXES

* #6098 - Scheduler may be partnered with another Scheduler to share TimeAxis and scroll position
* #6720 - Schedule and timeaxis out of sync after calling scrollEventIntoView
* #6723 - Dependency lines for events which have been deleted reappear when the scheduler subgrid is scrolled
* #6731 - Our CSS rules should be all scoped to apply inside .b-widget
* #6814 - Editing an event's startDate to make it outside of the rendered event zone doesn't hide the event
* #6906 - Theme demo not rendering correctly
* #6980 - Maximum value violation warning seen in event editor
* #6990 - When resize triggers multiple events update, extra terminals got rendered into resized element, growing
  uncontrollably
* #7000 - Hardcoded z-index for focused event
* #7005 - Hover should not be triggered on events during drag create
* #7006 - Calling dependencyStore.removeAll() does not remove dependency lines from view
* #7009 - New dependency gets removed from the view on scroll
* #7019 - DST transition problem
* #7021 - Copy DST fix + test from ExtScheduler 6.x
* #7024 - Dependency lines are missing after zoom in/out
* #7029 - Selected event styling not working when using labels
* #7037 - Events rendered slightly off their start dates
* #7050 - EventEdit feature should pass false to extendTimeAxis option to scrollResourceEventIntoView
* #7048 - Scheduler: Drag/drop resizes task when task is small
* #7070 - Crash when assigning from unexisting resourceId back to valid resourceId
* #7072 - eventStore#removeAll doesn't refresh UI
* #7074 - Deleting row does not repaint events properly

## 1.0.4 - 2018-10-08

### FEATURES / ENHANCEMENTS

* Angular demo improved: relays more events from the engine, added eventLayout config
* Vue demo improved: added more configs and improved styling
* Functions for shifting time in the time axis documented and exposed on Scheduler: `shift()`, `shiftNext()`,
  `shiftPrev()`and `setTimespan()`. These functions are used in the timeresolution demo

### BUG FIXES

* #6770 - Loadmask not working when using crudManager
* #6803 - EventEditor setting end date/time does not adjust the duration field
* #6848 - Should create new record even if resource field is not shown in Editor
* #6852 - Hovered event has wrong z-index when dragging
* #6856 - "Container is not defined" in docs
* #6857 - Crash in docs when collapsing group
* #6860 - online webcomponents demo doesn't load polyfill for firefox
* #6871 - ExtraWidgets position is wrong in EventEdit feature
* #6889 - Missing APIs in docs
* #6912 - Changing event start time via typing should move the event

## 1.0.3 - 2018-10-01

### FEATURES / ENHANCEMENTS

* Added a new demo - "Nested events"
* Added demos for Angular 1, 2, 4, 5 and 6

### BUG FIXES

* #6787 - Invalid drop should make no influence on event changing
* #6816 - Add polyfills to webcomponents demo to make it work in all browsers
* #6820 - Crash in filter demo when typing regex chars
* #6826 - Cache buster needed for docs app.js

## 1.0.2 - 2018-09-24

### BUG FIXES

* #6779 - Link to react_build demo gives 404
* #6783 - Date picker in header context menu produces inconsistent results
* #6788 - Event editor doesn't allow setting a start date greater than end date
* #6795 - Examples online do not work in edge
* #6798 - Scheduler doc 404 on Scheduler/column/ResourceInfoColumn
* #6801 - Grid vs Scheduler feature collision in docs
* #6808 - Locales broken in react demo

## 1.0.1 - 2018-09-20

### BUG FIXES

* #6706 - Modification date in guides restyled
* #6735 - Name not shown in newly added task
* #6774 - Enter key in an event editor triggers side effect

## 1.0.0 - 2018-09-13

* We're happy to announce the first v1.0.0 release of our new Scheduler component. The Scheduler is a modern and high
  performance scheduling UI component. Built from the ground up with pure JavaScript, supporting any framework you are
  already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation

### FEATURES / ENHANCEMENTS

* Multi assignment support added, see multiassign demo (#4460)
* Localization guide must show how to localize all date formats (#6448)
* `scheduler.modules.js` bundle and related demos are now included in trial

### BUG FIXES

* #6459 - Group header z-index and background adjusted
* #6487 - Event Editor doesn't fit text of date fields
* #6489 - Milestone outline styling fixed for event style "line"
* #6528 - Dependency rendering broken when scrolling
* #6605 - Cannot read property 'start' of null
* #6607 - Crash in column header context menu date picker
* #6638 - Create angular demo for trial bundle
* #6660 - Demos should shown "unknown" generic image for names not known
* #6682 - Drag drop not working on iPhone


<p class="last-modified">Last modified on 2026-07-22 10:50:29</p>