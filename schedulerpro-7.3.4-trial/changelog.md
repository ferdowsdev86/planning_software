# Bryntum Scheduler Pro version history

## 7.3.4 - 2026-07-22

### DEMOS

* `resource-non-working-time` demo break stripes now use a theme-aware color, visible in dark theme ([#13373](https://github.com/bryntum/support/issues/13373))

### BUG FIXES

* [#12305](https://github.com/bryntum/support/issues/12305) - [HIGH PRIO] `ResourceTimeRanges` not displaying for resources in collapsed groups
* [#13137](https://github.com/bryntum/support/issues/13137) - `highlightEvents()` now flashes every highlighted event, not only the one scrolled into view
* [#13161](https://github.com/bryntum/support/issues/13161) - Max zoom level doesn't work with `smoothZoom`
* [#13169](https://github.com/bryntum/support/issues/13169) - Recurrence tab problem when editing tasks with recurrence
* [#13244](https://github.com/bryntum/support/issues/13244) - Orphaned event demo styling broken
* [#13328](https://github.com/bryntum/support/issues/13328) - Accordions from the function sections cannot be opened
* [#13387](https://github.com/bryntum/support/issues/13387) - Resource utilization - cellClick event is no longer raised for histogram cells
* [#13412](https://github.com/bryntum/support/issues/13412) - `TaskEdit.cancel()` crashes when `this.editor` is undefined

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

* Fixed a crash in the `maps-tanstack` demo when starting a drag from the unplanned table header ([#13334](https://github.com/bryntum/support/issues/13334))

### BUG FIXES

* [#8438](https://github.com/bryntum/support/issues/8438) - [DOCS] `CalendarModel#forEachAvailabilityInterval()` is now public in the TypeScript definitions
* [#9622](https://github.com/bryntum/support/issues/9622) - [TypeScript] Added `earlySchedule` and `lateSchedule` fields with `EventSchedule` typedef on
  `EventModel`, exposing `startDateConstraintIntervals` and `endDateConstraintIntervals`
* [#10039](https://github.com/bryntum/support/issues/10039) - Documented `ProjectModel#validateDependency` and `#isValidDependency` in the typings
* [#11032](https://github.com/bryntum/support/issues/11032) - [TypeScript] `TaskEdit#items` config now typed (per-tab config) in the TypeScript definitions
* [#13333](https://github.com/bryntum/support/issues/13333) - `EventBuffer` tooltip blinks while hovering the buffer line

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

* [#9023](https://github.com/bryntum/support/issues/9023) - [HIGH PRIO] `record.toggleExpanded` is expanding more than it needs

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

* `EventSegments` feature is now compatible with `Revisions` feature ([#12499](https://github.com/bryntum/support/issues/12499))
* Early start/end date fields are now cached. Please check "what's new" guide for details

### API CHANGES

* [DEPRECATED] [ANGULAR] Support for Angular 14 and older will be dropped in `8.0.0`. If you plan on upgrading
  to version 8, please make sure to update to Angular 15 or newer before then

### BUG FIXES

* [#12150](https://github.com/bryntum/support/issues/12150) - Dependencies updates are not cleared from the `project.changes` after sync
* [#12945](https://github.com/bryntum/support/issues/12945) - Scheduler pro - Recurrence tab error
* [#13092](https://github.com/bryntum/support/issues/13092) - `NestedEvents` not disabling correctly
* [#13141](https://github.com/bryntum/support/issues/13141) - Dates Not Restored After Undo
* [#13155](https://github.com/bryntum/support/issues/13155) - `AllocationCellEdit` editor did not appear when its Gantt partner used `infiniteScroll`
* [#13228](https://github.com/bryntum/support/issues/13228) - Numbers not vertically centered in `ResourceUtilizationView` in Firefox

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

* Added `smoothZoom` config for fluid zooming that interpolates between view presets. Opt-in, but from v8 it will be the
  new default ([#5037](https://github.com/bryntum/support/issues/5037))
* Added two new view presets, to fill gaps in the zoom levels: `amPm` and `fifteenMinutesAndHour`. Also note that some
  presets have had their tick size adjusted for a better zooming experience
* `ResourceHistogram` and `ResourceUtilization` were refactored to render to a single shared SVG canvas to improve UX
  and performance
* Added `createGroup` method to the `NestedEvents` feature, allowing programmatic
  creation of a parent event that groups existing events as nested children ([#12818](https://github.com/bryntum/support/issues/12818))
* Added `showCreateGroupMenuItem` config to the `NestedEvents` feature, which adds an
  opt-in "Group selected events" context menu item using the `createGroup` API. Will be
  enabled by default from v8.0
* `ResourceHistogram` and `ResourceUtilization` were refactored to render to a single shared SVG canvas to improve UX
  and performance
* `ResourceNonWorkingTime` now supports a `drawThreshold` config to hide ranges with a width below a pixel threshold, to
  declutter zoomed out views and increase draw performance ([#2988](https://github.com/bryntum/support/issues/2988))
* `EventDrag` feature has been changed to make it more customizable. Please check the release "What's new" guide
  for more details ([#12437](https://github.com/bryntum/support/issues/12437))
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
* To facilitate easy agentic onboarding, Bryntum structural and theme CSS are now loaded from CDN when not present,
  while also logging a console warning. This can be disabled with `detectCSSCompatibilityIssues: false`. For production
  use, include the CSS in your app

### API CHANGES

* [DEPRECATED] The vendored Later.js third-party library, used internally to parse text-based schedule
  expressions on calendar exceptions/intervals, is deprecated and will be removed in v8.0. It will be
  replaced by a Bryntum in-house implementation to drop the third-party dependency

### STYLING CHANGES

* Removed `content: var(--fa)` convenience CSS rule from `.b-icon::before` / `.b-fw-icon::before`. Font Awesome icon
  classes like `fa-book` now require the `fa` base class (e.g., `fa fa-book`) ([#12790](https://github.com/bryntum/support/issues/12790))

### LOCALE UPDATES

* `NestedEvents` feature added new locale keys: `createGroup` ("Group selected events") and `newGroupName`
  ("New Group") for the create group context menu item

### DEMOS

* [ANGULAR] Added theme switching support to all demos ([#12129](https://github.com/bryntum/support/issues/12129))
* Updated `nested-events`, `nested-events-configuration` and `nested-events-deep` demos with a
  "Group selected events" context menu item using the new `createGroup` API
* [VUE-3] Added theme switching support to all demos ([#12905](https://github.com/bryntum/support/issues/12905))
* Added a new Mapbox with TanStack demo showcasing SchedulerPro integration with Mapbox maps and Tanstack Grid.
  The demo is located in
  `examples/maps-tanstack` folder ([#12158](https://github.com/bryntum/support/issues/12158))
* Removed legacy Ionic demos and guides. Ionic remains supported via the existing React, Angular, and Vue demos.

### BUG FIXES

* [#9043](https://github.com/bryntum/support/issues/9043) - Support chaining project stores to other SchedulerPro instances
* [#9054](https://github.com/bryntum/support/issues/9054) - [TypeScript] `calendar` field on `EventModel`, `ResourceModel` and `DependencyModel` now accepts
  `string|number` (calendar id) in addition to `CalendarModel`
* [#13099](https://github.com/bryntum/support/issues/13099) - `TypeError` 'reading event' in `EventDrag.isValidDrop` when dragging between partnered schedulers

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

* [#12755](https://github.com/bryntum/support/issues/12755) - [HIGH PRIO] Time phased assignments not being displayed correctly in Scheduler Pro
* [#12951](https://github.com/bryntum/support/issues/12951) - [HIGH PRIO] Nested events disappear after calling `shiftNext`/`shiftPrevious`
* [#13051](https://github.com/bryntum/support/issues/13051) - `TypeError` in `ResourcesTab`/`DependencyTab` when add/remove buttons are hidden via widget config

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

* [#12319](https://github.com/bryntum/support/issues/12319) - `onInput` not working in `startDateField` in `TaskEdit`
* [#12761](https://github.com/bryntum/support/issues/12761) - `TaskEditor` save lost dependency field changes when cell editor was still focused
* [#12778](https://github.com/bryntum/support/issues/12778) - `reapplyFilterOnUpdate` not working with `applyProjectChanges`
* [#12872](https://github.com/bryntum/support/issues/12872) - Events disappearing after unload and load the same data again when events are scrolled out of view
* [#12911](https://github.com/bryntum/support/issues/12911) - Non-working time in `ResourceHistogram` not visible due to `z-index`

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

### BUG FIXES

* [#12404](https://github.com/bryntum/support/issues/12404) - [HIGH PRIO] `TimeAxis` header render bug after switching view presets
* [#12593](https://github.com/bryntum/support/issues/12593) - `ignoreResourceCalendar` not respected when double-clicking to create new events
* [#12628](https://github.com/bryntum/support/issues/12628) - `DomSync.removeChild` error when deleting nested events with transitions enabled
* [#12639](https://github.com/bryntum/support/issues/12639) - Segment rename editor invisible due to missing CSS after theme migration
* [#12648](https://github.com/bryntum/support/issues/12648) - `recurrenceRule` should not contain `TZID` parameter per RFC 5545
* [#12713](https://github.com/bryntum/support/issues/12713) - New data series config option `barWidth` now allows controlling the size of bars in bar charts
* [#12749](https://github.com/bryntum/support/issues/12749) - Wrong Duration for task when Fixed effort mode enabled
* [#12768](https://github.com/bryntum/support/issues/12768) - `EventDrag` wrote wrong resource ID to DOM in `TreeGroup` mode causing crash during drag
* [#12798](https://github.com/bryntum/support/issues/12798) - HSL color definitions missing `%` on saturation broke colors on older Safari/iOS
* [#12845](https://github.com/bryntum/support/issues/12845) - CSS typo in `PercentBar.css` used invalid `mix-blend-mode` keyword causing incorrect blend behavior

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

### DEMOS

* The login process for the new Scheduler Pro AI demo has been fixed, try the demo here:
  https://bryntum.com/products/schedulerpro/examples/ai-skillmatching/

### BUG FIXES

* [#12704](https://github.com/bryntum/support/issues/12704) - RecurrenceEditorPanel month date buttons not updated after first edit
* [#12712](https://github.com/bryntum/support/issues/12712) - Lock rows feature with layoutFn throws error
* [#12720](https://github.com/bryntum/support/issues/12720) - `Dependencies` crash on mouseleave when `relatedTarget` is `null`
* [#12725](https://github.com/bryntum/support/issues/12725) - Maps demo tooltip has uneven icon spacing and missing gaps

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

* We've added a new AI feature which provides an AI agent for the SchedulerPro. By using the provided chat panel, the
  user can ask the agent to interact with the SchedulerPro in different ways. For example, the user can ask the agent to
  filter the data, sort it, or select specific records. The agent can also perform data manipulation operations such as
  adding, updating, deleting records. The feature and all its related components are marked as **experimental** and are
  subject to change
* Added `allowedDependencyTypes` config to `DependencyStore` to restrict which dependency types can be created
  ([#548](https://github.com/bryntum/support/issues/548))
* SchedulerPro no longer silences changes made by the Engine on initial data loading if there was a scheduling issue
  resolved. Please check the release upgrade guide for details ([#8986](https://github.com/bryntum/support/issues/8986))

### DEMOS

* Added a new Kitchen Sink demo showcasing all the various widgets included in the Bryntum Scheduler Pro package. The
  demo is located in the `examples/kitchen-sink` folder ([#3961](https://github.com/bryntum/support/issues/3961))

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

* [#12479](https://github.com/bryntum/support/issues/12479) - [HIGH PRIO] SchedulerPro with initially empty project does not render added resources correctly

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

### DEMOS

* Added a new Angular demo, 'nested-events-lazy-load', which demonstrates nested events with individual store setup to
  be lazy loaded. The demo is located in `examples/frameworks/angular/nested-events-lazy-load` folder ([#10677](https://github.com/bryntum/support/issues/10677))

### BUG FIXES

* [#9546](https://github.com/bryntum/support/issues/9546) - [HIGH PRIO] Unable to detach `nested event` from `parent` at the same date and resource
* [#11865](https://github.com/bryntum/support/issues/11865) - Filtering `resourceStore` incorrectly triggers `noChanges` event when other stores have changes
* [#11911](https://github.com/bryntum/support/issues/11911) - [NPM] Incorrect source maps in npm packages (`@bryntum/schedulerpro`, `@bryntum/schedulerpro-trial`)
* [#12464](https://github.com/bryntum/support/issues/12464) - [HIGH PRIO] Disappearing events after crudManager.load call in the vertical mode
* [#12525](https://github.com/bryntum/support/issues/12525) - [HIGH PRIO] Triggering `crudManager.load()` repeatedly leads to rendering issues
* [#12534](https://github.com/bryntum/support/issues/12534) - Button in conflict dialog not enabled

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

### BUG FIXES

* [#6494](https://github.com/bryntum/support/issues/6494) - `EventModelConfig.segments` now accepts `EventSegmentModelConfig[]` in TypeScript
* [#8127](https://github.com/bryntum/support/issues/8127) - [TypeScript] `EventModel.unassign()` now accepts resource id (string or number)
* [#10977](https://github.com/bryntum/support/issues/10977) - [HIGH PRIO] Event order changes when dragging with `fillTicks` enabled
* [#12215](https://github.com/bryntum/support/issues/12215) - [HIGH PRIO] [React] Applying filter on lazy loaded resource store removes resource calendars
* [#12368](https://github.com/bryntum/support/issues/12368) - [TypeScript] Types missing for `TimePhasedAssignment` and `TimePhasedProject` classes
* [#12392](https://github.com/bryntum/support/issues/12392) - [HIGH PRIO] [React] Subtasks disappear due to missing event renderer invocation
* [#12450](https://github.com/bryntum/support/issues/12450) - `highlightTimeSpan` wrong positioning when collapse tree node

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

### STYLING CHANGES

* Added a new `fluent2` theme, available in both a light and dark variant ([#10338](https://github.com/bryntum/support/issues/10338))

### BUG FIXES

* [#12241](https://github.com/bryntum/support/issues/12241) - [ANGULAR] `Event.SplitToSegments` errors
* [#12260](https://github.com/bryntum/support/issues/12260) - Scroll position not preserved and bottom scrolling unreliable with custom `layoutFn`
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

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

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

### DEMOS

* Upgraded `drag-unplanned-tasks` demo to support vertical mode ([#11947](https://github.com/bryntum/support/issues/11947))
* Added new demo using AG Grid community version with Scheduler Pro and Mapbox GL JS API. This demo is located at
  `examples/maps-ag-grid` and shows how to use AG Grid as an unplanned sessions grid alongside Scheduler Pro with Mapbox
  GL JS API integration ([#12292](https://github.com/bryntum/support/issues/12292))

### BUG FIXES

* [#11794](https://github.com/bryntum/support/issues/11794) - Configuring `max` for end date field crashes
* [#12237](https://github.com/bryntum/support/issues/12237) - [REACT] Unintended change events in Bryntum Scheduler using Redux
* [#12302](https://github.com/bryntum/support/issues/12302) - Time indicator lost after hopping to a new date
* [#12316](https://github.com/bryntum/support/issues/12316) - Error while expand a group and a calendar non-working time is rendered
* [#12318](https://github.com/bryntum/support/issues/12318) - [HIGH PRIO] Unnecessary flashing when same resource / time blocks being highlighted

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
* [TypeScript] Improved TypeScript definitions to support function parameters in typedef declarations
* The Resource utilization view's tooltip's layout and contents have been updated for a nicer display of information

### API CHANGES

* Added a new parameter `clearChanges` to the store's `applyChangeset` method which, when passed as `false`, applies
  changes to the store without committing them, keeping the store dirty. By default, it is `true`. ([#11089](https://github.com/bryntum/support/issues/11089))
* [BREAKING] The default value for Scheduler's `resourceImageExtension` config has been changed from `.jpg` to `.png`
* When syncing project changes (or querying `project.changes`), changed project settings are now included by default
* The task editor is now resizable by default
* When TabPanel is `autoHeight`, if any fields containing `ChipView`s are changed, the `TabPanel` recalculates its
  required height unless that would cause a realignment ([#11908](https://github.com/bryntum/support/issues/11908))
* [BREAKING] `DatePicker`'s `cellRenderer` is now passed the cell element as the `cell` property of its render context.
  The inner element into which new content can be added is passed as `innerCell`. Previously the inner element was
  passed in the `cell` property. This will only affect your apps if you have implemented a `cellRenderer` in any
  `DatePicker`

### STYLING CHANGES

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
* When highlighting events (using `scheduler.highlightEvents()`), the `b-highlighted` class is now applied to the event
  wrapper element instead of the event bar element. This change allows for it to also affect labels, travel time, etc.

### LOCALE UPDATES

* The `labelWidth` key was removed from the `SchedulerGeneralTab`, `SchedulerAdvancedTab`, `AdvancedTab` & `GeneralTab`
  groups, since with the new themes and layouts it is no longer necessary
* New `ResourceEdit`, `ResourceEditor`, `ResourceEditorGeneralTab`, `ResourceCostAccrualColumn`, `CostAccrualField`,
  `ResourceType`, `ResourceTypeColumn`, `ResourceEditorRateTablesTab`, `ResourceGrid`, `ResourceRateTableContainer` and
  `RateTableColumn` class locales have been added
* `ResourcesTab` class locale has got three new properties: `cost`, `quantity` and `quantityTpl`
* `ResourceUtilization` class locale has got four new locale properties:
  `effortRangeInfo`, `effortInfo`, `costInfo` and `quantityInfo`
  The class existing tooltip locales have been changed to use `{effort-range-info}`, `{effort-info}`, `{cost-info}` and
  `{quantity-info}` patterns where the new properties values to be injected. Please check "Upgrade guide..." for details
* Keys related to Resource utilization tooltip have been updated to enable a nicer layout of the displayed information.
  The following keys on the `ResourceUtilization` locale object were changed : `effortRangeInfo`, `effortInfo`,
  `costInfo`, `quantityInfo`, `barTipInRange`, `barTipOnDate`, `groupBarTipAssignment`, `groupBarTipInRange` and
  `groupBarTipOnDate`

### DEMOS

* [ANGULAR] Ported `flight-dispatch` vanilla demo to Angular, showcasing flight scheduling and dispatch workflows.
  Demo is located in `examples/frameworks/angular/flight-dispatch` folder
* New `table-booking` demo added showcasing Scheduler Pro used for table bookings in a restaurant setting. Demo is
  located in `examples/table-booking` folder

### BUG FIXES

* [#12174](https://github.com/bryntum/support/issues/12174) - Resource utilization rendering broken after zoom and expand/collapse
* [#12177](https://github.com/bryntum/support/issues/12177) - Event `Tooltip` wrongly sized

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

* [VUE-3] Vue 3 npm wrapper packages now include `types` declaration in `package.json` ([#12014](https://github.com/bryntum/support/issues/12014))

### BUG FIXES

* [#12011](https://github.com/bryntum/support/issues/12011) - [DOCS] Docs for `ResourceTimeRanges` needs to add `exceptionDates`
* [#12075](https://github.com/bryntum/support/issues/12075) - [HIGH PRIO] `TreeGroup` does not work when `transformFlatData` is used
* [#12155](https://github.com/bryntum/support/issues/12155) - Dependency terminals not correctly hidden after mouse leaving event bar

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

* Added `noZoomChange` event which is triggered from `zoomToSpan` method when the requested date range
  cannot fit into any zoom level higher than the current level ([#11891](https://github.com/bryntum/support/issues/11891))
* Update Advanced tab documentation for `calendarField` ([#11877](https://github.com/bryntum/support/issues/11877))
* Setting `createOnUnmatched` to `true` on a `Combo` will now create a record for the initial value, or a value
  programmatically set later, if the value does not exist in the store for the combo ([#11781](https://github.com/bryntum/support/issues/11781))

### DEMOS

* Our new [Salesforce Community page](https://bryntum-dev-ed.develop.my.site.com/demo/schedulerpro) is up and running.
  It solves the problem caused by recent change in Salesforce policy regarding Non-Revenue Orgs. Look up "Device
  Activation Is Always Required for Non-Revenue Orgs"

### BUG FIXES

* [#11636](https://github.com/bryntum/support/issues/11636) - [HIGH PRIO] `groupBy` function not available as a valid config
* [#11788](https://github.com/bryntum/support/issues/11788) - [HIGH PRIO] Removed `eventStore` item is automatically restored
* [#11979](https://github.com/bryntum/support/issues/11979) - Experimental `minPackSize` not working as intended with event grouping in SchedulerPro

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

### DEMOS

* [REACT-VITE] New demo showing events split to segments that can be dragged and resized individually.
  The demo is located in `examples/frameworks/react-vite/split-events` folder
* [REACT-VITE] `effort` demo has been updated to use `BryntumSchedulerProProjectModel` shared React component for
  `BryntumSchedulerPro` and `BryntumResourceUtilization`. The demo is located in `examples/react-vite/effort` folder

### BUG FIXES

* [#11580](https://github.com/bryntum/support/issues/11580) - [HIGH PRIO] [REACT] Segmented events with JSX content crashes
* [#11697](https://github.com/bryntum/support/issues/11697) - The Features list in the guides is generated incorrectly
* [#11718](https://github.com/bryntum/support/issues/11718) - [HIGH PRIO] Issue with `requestData` on project level
* [#11723](https://github.com/bryntum/support/issues/11723) - 1px pale line shown at the bottom of the time axis
* [#11810](https://github.com/bryntum/support/issues/11810) - [HIGH PRIO] `TooltipRenderer` function not re-updating when `timeAxis` is changed
* [#11817](https://github.com/bryntum/support/issues/11817) - Weird animation after dragging first segment
* [#11884](https://github.com/bryntum/support/issues/11884) - Animation after initial load

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

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

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

* Added new `Charts` feature, which leverages the new `Chart` and `ChartDesigner` widgets to enable developers and end
  users to easily create charts and visualize data directly from selected cells in Bryntum products. Check the
  "What's new" guide for details ([#8442](https://github.com/bryntum/support/issues/8442))
* When using early rendering (the default, tasks are rendered before scheduling calculations take place), dependency
  lines are now also rendered early ([#10440](https://github.com/bryntum/support/issues/10440))
* New Single Page Unscaled exporter is added. It allows exporting content to a single page without limiting to a
  specific paper size. PDF export server upgrade to version `2.1.0` is required ([#11397](https://github.com/bryntum/support/issues/11397))
* As part of the change described above, we also re-enabled early rendering for data loaded using the projects crud
  manager functionality. That was unintentionally disabled when support for project settings was added to the crud
  manager a while back. Please note that this change might affect your app renderers if you are supplying incomplete
  task data (e.g., without one of startDate, endDate, duration) or rely on the event's calendar to have been set up
* Bryntum now ships a `Chart` module (`chart.module.thin.js`), to easier integrate `Chart.js`-based charts with our
  products. Used in the new `examples-scheduler/charts` demo
* Bryntum npm repository provides charts thin package `@bryntum/chart-thin` and wrapper packages for major frameworks:
  Angular (`@bryntum/chart-angular-thin`), React (`@bryntum/chart-react-thin`) and Vue 3 (`@bryntum/chart-vue-3-thin`)
* To pave the way for future improvements, Grid cells are now absolutely positioned inside the rows. A cell size is
  matched with the size of its column's header using a `ResizeObserver`. If you see any side effect of this change in
  your app, please report it to us

### API CHANGES

* [DEPRECATED] The `eventsData`, `resourcesData`, `assignmentsData`, `dependenciesData`, `timeRangesData` and
  `resourceTimeRangesData` configs and properties on the `ProjectModel` have been deprecated. Use `events`, `resources`,
  `assignments`, `dependencies`, `timeRanges` and `resourceTimeRanges` instead ([#9778](https://github.com/bryntum/support/issues/9778))

### LOCALE UPDATES

* `Es.CalendarEditor.save` locale text has been changed

### DEMOS

* `embedded-chart` demo has been updated to use the `Chart` widget component ([#11550](https://github.com/bryntum/support/issues/11550))

### BUG FIXES

* [#11621](https://github.com/bryntum/support/issues/11621) - Wrong Spanish locale text for Calendar Editor

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

* `EventDragSelect` now allows opting in to drag selecting nested events, using the new `includeNested` config on the
  feature ([#11505](https://github.com/bryntum/support/issues/11505))

### DEMOS

* [REACT-VITE] React JavaScript "Non-working time" demo has been updated to use React + Vite + TypeScript. New demo is
  located in `frameworks/react-vite/non-working-time` folder. Old demo has been removed
* [VUE-3-VITE] Vue 3 JavaScript "Non-working time" demo has been updated to use Vue 3 + Vite + TypeScript. New demo is
  located in `frameworks/vue-3-vite/non-working-time` folder. Old demo has been removed ([#5011](https://github.com/bryntum/support/issues/5011))

### BUG FIXES

* [#11383](https://github.com/bryntum/support/issues/11383) - [HIGH PRIO] Crash when reloading project if resources are grouped based on multi value field
* [#11494](https://github.com/bryntum/support/issues/11494) - `Non-working` interval intersections shown incorrect in resources
* [#11583](https://github.com/bryntum/support/issues/11583) - [HIGH PRIO] Lazy loading indicator is not hidden after initial load or expanding parent resource

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

* `CalendarIntervalModel` class got a new field for specifying a timezone in which `recurrentStartDate` and
  `recurrentEndDate` rules are provided. Please check "What's new" guide for details
* `showDirty` can be configured now to show red tag for all the cells for the new records. Set `newRecord : true` on
  `showDirty` to enable it ([#10344](https://github.com/bryntum/support/issues/10344))

### BUG FIXES

* [#11398](https://github.com/bryntum/support/issues/11398) - [HIGH PRIO] `DateHelper` inconsistent with `Timezoned ISO` String parsing
* [#11410](https://github.com/bryntum/support/issues/11410) - `targetEventRecord` of `beforeEventDropFinalize` event data is incorrect

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

### DEMOS

* [REACT-VITE] New demo showing lazy loaded resource and event stores using the `requestData` function with PHP backend.
  The demo is located in `examples/frameworks/react-vite/tree-lazy-load` folder ([#11054](https://github.com/bryntum/support/issues/11054))
* [SHAREPOINT] Added a new demo showing drag from grid to SchedulerPro for SharePoint Framework (SPFx) in the
  `frameworks/react/typescript/sharepoint-fabric-drag-from-grid` folder ([#11316](https://github.com/bryntum/support/issues/11316))

### BUG FIXES

* [#10926](https://github.com/bryntum/support/issues/10926) - `ProjectModel` with a lazy load won't fetch data when `SchedulerPro`'s tree feature is turned on
* [#11129](https://github.com/bryntum/support/issues/11129) - Lazy loaded project shows load mask when loading more events
* [#11171](https://github.com/bryntum/support/issues/11171) - `ProjectModel.load` doesn't automatically clear stores' data when lazyLoad is enabled
* [#11179](https://github.com/bryntum/support/issues/11179) - [HIGH PRIO] Recurrence event disappears after changing one specific multi-assigned event
* [#11313](https://github.com/bryntum/support/issues/11313) - [HIGH PRIO] SharePoint demos across Bryntum Suite are broken
* [#11335](https://github.com/bryntum/support/issues/11335) - [REACT] Thrown error on remote filtering with lazy loading
* [#11338](https://github.com/bryntum/support/issues/11338) - Lazy loading indicator remains after filtering the `EventStore`
* [#11381](https://github.com/bryntum/support/issues/11381) - [HIGH PRIO] Creating first child on a parent and expanding triggers unnecessary resource load and wipes
  CRUD Manager changes
* [#11389](https://github.com/bryntum/support/issues/11389) - [HIGH PRIO] Lazy-load-reloading an `EventStore` with segments causes crash

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

* You can now control if `EventBuffer` timespans should be considered as unavailable time using the
  `bufferIsUnavailableTime` property of the feature ([#11244](https://github.com/bryntum/support/issues/11244))

### API CHANGES

* When reloading a lazy-loaded `Store` (including remote filtering and sorting) the current dataset will be kept
  until the load request finishes. Previously, it was cleared upon starting the reload and populated with new data
  later. If an `AjaxStore` is being used (a `Store` configured with a `readUrl`) a load mask will be displayed during
  the reload operation ([#11261](https://github.com/bryntum/support/issues/11261))

### DEMOS

* `examples/tree-summary-heatmap` was updated to show listening to the `tickCellClick` event ([#11187](https://github.com/bryntum/support/issues/11187))
* `examples/frameworks/angular/maps` was updated with drag from grid support
* Maps demo was ported to React and Vue-3, see `examples/frameworks/react-vite/maps` and
  `examples/frameworks/vue-3-vite/maps`

### BUG FIXES

* [#11069](https://github.com/bryntum/support/issues/11069) - `EventSegmentDrag` not working if timeaxis config set with custom hours
* [#11078](https://github.com/bryntum/support/issues/11078) - Copy-pasting nested events only pastes parent event
* [#11134](https://github.com/bryntum/support/issues/11134) - [HIGH PRIO] Inconsistent remote filtering when used with `lazyLoad`
* [#11139](https://github.com/bryntum/support/issues/11139) - [HIGH PRIO] Resource working time not rendering correctly with lazily loaded data
* [#11178](https://github.com/bryntum/support/issues/11178) - Show dependencies error on `eventLayout: 'pack'`
* [#11235](https://github.com/bryntum/support/issues/11235) - [REACT] Async cell renderer can throw if the row being rendered is destroyed during the await
* [#11238](https://github.com/bryntum/support/issues/11238) - Broken style when dragging an event with `EventBuffer` and `LockRows` features active
* [#11275](https://github.com/bryntum/support/issues/11275) - `NestedEvents` feature error, if provided `null` for children
* [#11282](https://github.com/bryntum/support/issues/11282) - [REACT] Applying remote filter to lazy loaded store while loading cause id collision
* [#11297](https://github.com/bryntum/support/issues/11297) - Crash when dragging event between partnered `SchedulerPro`'s
* [#11312](https://github.com/bryntum/support/issues/11312) - Additional Stores are not loaded on project re-load

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

* [#11065](https://github.com/bryntum/support/issues/11065) - Drag and drop last segment and invalidate the drop operation
* [#11088](https://github.com/bryntum/support/issues/11088) - `CalendarEditor` widget doesn't save changes to color for intervals
* [#11149](https://github.com/bryntum/support/issues/11149) - Resizing causes a weird shrinking effect

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

* [ACCESSIBILITY] Scheduler `eventRenderer` now supports setting `ariaLabel` which is assigned to the event element's
  `aria-label` attribute
* Readonly tasks now consistently display a non-editable information modal, that can be invoked by double-click or
  context menu. The associated menu item `Edit` is no longer disabled, but replaced by `Show details` when the task
  item cannot be edited
* We've improved search in the documentation with new context-aware algorithms, delivering more accurate and relevant
  results from the API, guides & examples
* [BREAKING] Since most apps have a build process that includes a transpilation step, starting with `v6.2.0` we use the
  minimum possible transpile polyfills for the source code inside the `@bryntum/schedulerpro-thin` npm package to ensure
  that it works for all currently supported frameworks. Previously, each source file was transpiled with more polyfills,
  which introduced unnecessary overhead from transpilation helper functions. After this change, the size of your built
  app should be reduced. If you encounter issues with your framework's builder parsing the code, consider upgrading to a
  newer framework version that supports the latest ECMAScript specification ([#10797](https://github.com/bryntum/support/issues/10797))
* [BREAKING] The `AjaxHelper.fetch()` utility function no longer applies `credentials: 'include'` by default, to better
  match how the native `fetch` API works. This change also affects `AjaxStore`, `CrudManager` and `ProjectModel`, if
  used by your app to handle remote data ([#10886](https://github.com/bryntum/support/issues/10886))

### API CHANGES

* `ResourceHistogram` has got new configs controlling data filtering. Please check "what's new..." guide for details
  ([#10818](https://github.com/bryntum/support/issues/10818))

### LOCALE UPDATES

* Removed translation key `TaskEditBase.Information` and replaced it with `Object.information`
* New locale key `EventBuffer.preamblePostambleDescription` added for the preamble/postamble text appended to the
  aria-label of event bar elements

### DEMOS

* Added new demo showing how to summarize the number of events per date and group with a heat map. The demo is located
  in `tree-summary-heatmap` folder

### BUG FIXES

* [#10500](https://github.com/bryntum/support/issues/10500) - [ACCESSIBILITY] Scheduler event wrapper element should have `aria-label`

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
* [#10484](https://github.com/bryntum/support/issues/10484) - [HIGH PRIO] Merge cells rendering issue when adding events
* [#11003](https://github.com/bryntum/support/issues/11003) - Event and drag drop on the available slot time consideration issue
* [#11017](https://github.com/bryntum/support/issues/11017) - Default project calendar not highlighted if project has no calendar

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
* CrudManager now includes a `rawResponse` reference to the native Response object, when firing `requestDone`, `load`
  `loadFail` and `requestFail` events ([#10863](https://github.com/bryntum/support/issues/10863))
* EventBuffer `renderer` now provides a `resourceRecord` param ([#10895](https://github.com/bryntum/support/issues/10895))
* There are new hooks allowing to customize duration and lag units conversion. Please read the release "What's new..."
  guide for details ([#10681](https://github.com/bryntum/support/issues/10681))

### API CHANGES

* [DEPRECATED] The `responseOptions` event param in `CrudManager` load/sync events was renamed to `requestOptions`.
* The `rtl` config property of widgets is now public. By default, widgets conform to the writing direction of the
  element they are rendered to. But with the now public `rtl` property, you can force a widget, and all descendant
  widgets to lay out from right to left ([#10859](https://github.com/bryntum/support/issues/10859))

### DEMOS

* We have introduced UI localization for our Vanilla JavaScript demos, supporting all 45 currently available locales
* New Real time updates demo, showing changes made by other clients in real time, the demo is located in
  `examples/realtime-updates` folder
* [ANGULAR] New "Map integration" demo, shows how to integrate the Scheduler with Mapbox GL JS API, the demo is located
  in `examples/frameworks/angular/maps` folder
* Updated the `drag-from-grid` demos (vanilla and frameworks) with better styling and UI ([#10911](https://github.com/bryntum/support/issues/10911))

### BUG FIXES

* [#10795](https://github.com/bryntum/support/issues/10795) - [SALESFORCE] Remove `Map`/`Set` polyfills
* [#10804](https://github.com/bryntum/support/issues/10804) - Crash when cancel event creation from edit popup with `resourceIds` set to `persist`
* [#10822](https://github.com/bryntum/support/issues/10822) - Frequency count is required even when frequency is set to `No Repeat`
* [#10896](https://github.com/bryntum/support/issues/10896) - [DOCS] Make public link to an editor instance in `TaskEdit` feature
* [#10938](https://github.com/bryntum/support/issues/10938) - [HIGH PRIO] Incorrect CSS `sourceMappingURL` in Bryntum thin npm packages

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

* New `roundedSplit` config introduced in `EventSegments` feature that allows user to split events using either the
  exact clicked date or the rounded one ([#10314](https://github.com/bryntum/support/issues/10314))

### API CHANGES

* `EventDrag` feature has a new config `alwaysCopy`. When set to `true`, it will always `copy` the event on drag-drop
  operation ([#10402](https://github.com/bryntum/support/issues/10402))

### BUG FIXES

* [#4428](https://github.com/bryntum/support/issues/4428) - Task editor dragging is slow in Windows
* [#9997](https://github.com/bryntum/support/issues/9997) - Loading a task record with configured timezone jumps when scheduler also has the same timezone
* [#10398](https://github.com/bryntum/support/issues/10398) - Styling issue in Year picker in Calendar Editor
* [#10552](https://github.com/bryntum/support/issues/10552) - `applyProjectChanges` now uses the `idField` of the `modelClass` to apply model changes
* [#10747](https://github.com/bryntum/support/issues/10747) - [HIGH PRIO] Scheduler Pro event date change animation issue
* [#10752](https://github.com/bryntum/support/issues/10752) - Calendar field overlapping `default value` and `label` in Advanced Tab in `TaskEdit`
* [#10774](https://github.com/bryntum/support/issues/10774) - Lazy loading not working for tree event stores

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

* `NestedEvents` is now supported when using lazy loading

### API CHANGES

* The `highlightTimeSpan` and `highlightTimeSpan` methods of the `CalendarHighlight` feature are now async

### DEMOS

* [REACT] Legacy React JavaScript `highlight-time-spans` demo has been updated to use React + Vite. New demo is located
  in `frameworks/react-vite/highlight-time-spans` folder
* A new demo demonstrating lazy loading of nested events has been added. Located in `nested-events-lazy-load` folder
* [REACT] A React version of the demo demonstrating lazy loading of nested events has been added. New demo is located in
  `frameworks/react-vite/nested-events-lazy-load` folder

### BUG FIXES

* [#7548](https://github.com/bryntum/support/issues/7548) - Calendar highlight misplaced on overlapping events
* [#8727](https://github.com/bryntum/support/issues/8727) - Scheduler `highlightTimespans` bug
* [#10469](https://github.com/bryntum/support/issues/10469) - [HIGH PRIO] Tree store with multi assignment not displaying correctly on event editor
* [#10478](https://github.com/bryntum/support/issues/10478) - Non-working time not shaded for custom interval entirely within one calendar day with
  `fillTicks : true`
* [#10566](https://github.com/bryntum/support/issues/10566) - [TYPESCRIPT] Labels feature incorrect docs and type for record in renderer
* [#10664](https://github.com/bryntum/support/issues/10664) - Suspend `autoCommit` on individual stores while editing in task editor

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

### BUG FIXES

* [#9943](https://github.com/bryntum/support/issues/9943) - `CalendarEditor` can't remember new week setting
* [#10325](https://github.com/bryntum/support/issues/10325) - Scheduler is blank when `resourceStore` loaded when custom `groupSortFn` used
* [#10391](https://github.com/bryntum/support/issues/10391) - Drag-n-drop from unplanned list not working properly with larger event
* [#10438](https://github.com/bryntum/support/issues/10438) - [HIGH PRIO] Bryntum `ResourceUtilization` column renderer executes infinitely
* [#10444](https://github.com/bryntum/support/issues/10444) - Assignment model has units field as `null` when using event `resourceId` field
* [#10482](https://github.com/bryntum/support/issues/10482) - Project clears child records added collection when applying a record sync response

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

### API CHANGES

* Classes extending `Base` got new `is{{ClassName}}` boolean property indicating instances of the corresponding class or
  subclasses of thereof. Please check "What's new..." guide for details
* `ProjectModel` and `EventSegmentModel` got some new public properties. Please check "What's new..." guide for details

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

* [#10328](https://github.com/bryntum/support/issues/10328) - Versioning Grid not rendering correct intervals
* [#10349](https://github.com/bryntum/support/issues/10349) - Lazy loaded tree Scheduler should use `resourceIds` when resource store is not lazy loaded
* [#10365](https://github.com/bryntum/support/issues/10365) - Divider text in `TaskEditor` panels not localized
* [#10377](https://github.com/bryntum/support/issues/10377) - Hiding `Delete` button dynamically doesn't work
* [#10400](https://github.com/bryntum/support/issues/10400) - `EventSegments` feature need to add few properties as public
* [#10406](https://github.com/bryntum/support/issues/10406) - Vertical mode in Nested Events demo broken
* [#10418](https://github.com/bryntum/support/issues/10418) - `onBeforeEventSegmentDrag` is missing `eventRecords` param
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

* New `keepTime` modes for `StartDateField` and `EndDateField` classes
* [VUE 2] reached end of life on December 31, 2023. As a result, we will no longer be updating our Vue 2 components.
  While the components will continue to exist, we will remove them in a future release and recommend that you upgrade to
  Vue 3 for continued support

### STYLING CHANGES

* Certain color adjustment functions in SASS has been deprecated and will be removed from SASS in a future version. To
  be prepared for that, we have replaced our usages of these functions with the new ones. In general, this should not
  affect the look of components, with reservation for minor color variations (for more information, see
  https://sass-lang.com/documentation/breaking-changes/color-functions)

### BUG FIXES

* [#8498](https://github.com/bryntum/support/issues/8498) - Inconsistent task ui and incorrect end date when duration is set to fraction value
* [#9018](https://github.com/bryntum/support/issues/9018) - [HIGH PRIO] Localization doesn't work for Microsoft Dynamics CRM Online
* [#9798](https://github.com/bryntum/support/issues/9798) - [HIGH PRIO] Non-working intervals are calculated incorrectly in certain time zone
* [#10210](https://github.com/bryntum/support/issues/10210) - Console warning about date parsing in demo
* [#10211](https://github.com/bryntum/support/issues/10211) - [HIGH PRIO] [REACT] SchedulerPro `lazyLoad` crashes with `autoLoad` stores
* [#10251](https://github.com/bryntum/support/issues/10251) - Bug in `SchedulerPro` Skill matching demo
* [#10299](https://github.com/bryntum/support/issues/10299) - Calendar picker should not display calendars in groups

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

* [VUE-3-VITE] New basic demo (Vue 3 vite) shows how to use Bryntum Scheduler Pro in Vue 3 project with TypeScript. The
  demo is located in `examples/frameworks/vue-3-vite/basic` folder ([#9808](https://github.com/bryntum/support/issues/9808))

### BUG FIXES

* [#9411](https://github.com/bryntum/support/issues/9411) - [HIGH PRIO] `Timeline` doesn't respect `startDate` and `endDate` config
* [#10132](https://github.com/bryntum/support/issues/10132) - `zoomToSpan` does not zoom correctly
* [#10134](https://github.com/bryntum/support/issues/10134) - Timespan highlights not working after switching project model
* [#10156](https://github.com/bryntum/support/issues/10156) - Vue examples with multiple widgets don't size them correctly

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

* [#9684](https://github.com/bryntum/support/issues/9684) - [HIGH PRIO] Deeply nested events incorrectly redrawn on move
* [#10086](https://github.com/bryntum/support/issues/10086) - `Timespan` highlights stops working after project model change

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

* With some configurations, zooming in and out of the Scheduler Pro could lead to a very long time axis, which degraded
  performance. To prevent this, it now limits how many ticks (the bottommost unit) its time axis can contain to 10,000
  (which will give a very long scroll range even with small tick sizes)
* The regular non-Ajax `Store` now has the ability to accept remote paging, sorting and filtering ([#6860](https://github.com/bryntum/support/issues/6860),
  [#8180](https://github.com/bryntum/support/issues/8180), [#9363](https://github.com/bryntum/support/issues/9363))
* `ExcelExport` feature got a minor refactoring, and now uses more feature-rich `write-excel-file` library ([#6089](https://github.com/bryntum/support/issues/6089))

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

### BUG FIXES

* [#9833](https://github.com/bryntum/support/issues/9833) - Event buffer makes event nonworking time wrong calculation
* [#9924](https://github.com/bryntum/support/issues/9924) - No API call is triggered when start date and end date are same using `lazyLoad` and `timeAxis` filter
* [#9979](https://github.com/bryntum/support/issues/9979) - Calendar editor New exception is not localized

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

* New config `ignoreLoadPropagationChanges` added for `AjaxStore`
* The `Dependency` feature has a new property: `allowCreateOnlyParent`. Set it to `true` to allow
  dependency creation only for parent events ([#9494](https://github.com/bryntum/support/issues/9494))

### BUG FIXES

* [#3660](https://github.com/bryntum/support/issues/3660) - Event `durationMS` is not synced w/ duration value
* [#5233](https://github.com/bryntum/support/issues/5233) - [ANGULAR] Frameworks wrappers components not triggering some events
* [#7387](https://github.com/bryntum/support/issues/7387) - [HIGH PRIO] `ResourceUtilization` should not expand a collapsed resource when assigning it
* [#8283](https://github.com/bryntum/support/issues/8283) - Scheduler Pro header date is not sticky
* [#9030](https://github.com/bryntum/support/issues/9030) - Should not trigger a sync when `AjaxStore` is configured with a URL and `syncDataOnLoad: true`
* [#9718](https://github.com/bryntum/support/issues/9718) - [VUE-3] Preventable events don't work in Vue wrapper
* [#9803](https://github.com/bryntum/support/issues/9803) - Missing event object in `beforeAdd` and strange effects when copy/paste events
* [#9806](https://github.com/bryntum/support/issues/9806) - `ResourceHistogram` w/ `NonWorkingTime` feature changes project default calendar intervals
* [#9830](https://github.com/bryntum/support/issues/9830) - Add ability to hide/remove `CalendarEditor` parent field and Remove button

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

* Internal code improvements and bugfixes

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

* `TimelineHistogram`, `ResourceHistogram` and `ResourceUtilization` views got two new hooks providing more control over
  the rendered charts DOM elements. Please check "What's new" guide for more details ([#9037](https://github.com/bryntum/support/issues/9037))
* Bumped the built-in version of FontAwesome Free to `v6.6.0`, which includes a new
  [table-cells-row-unlock](https://fontawesome.com/icons/table-cells-row-unlock) icon sponsored by Bryntum

### API CHANGES

* [DEPRECATED] `TimelineHistogram`, `ResourceHistogram` and `ResourceUtilization` classes `getRectClass` config in
  favor of new `getBarClass` config to make naming more consistent
* [BREAKING] The `context` parameter of the `eventPartialResize/eventResizeStart/eventResizeEnd` events and their
  corresponding `onEventPartialResize/...` event handlers have been removed. Please use `resizeData` parameter instead
  for information about the event resize operation. This change was introduced in the `6.0.0` release, but was missing
  in changelog

### DEMOS

* [REACT-REMIX] "Basic" (React + Remix) demo shows using SchedulerPro component in Remix. The demo is located in
  `frameworks/react-remix/basic` folder ([#4912](https://github.com/bryntum/support/issues/4912))
* [SHAREPOINT] Updated the SharePoint Framework (SPFx) in the `frameworks/react/typescript/sharepoint-fabric`
  to be compatible with recent versions of SharePoint ([#9224](https://github.com/bryntum/support/issues/9224))

### BUG FIXES

* [#6721](https://github.com/bryntum/support/issues/6721) - Moving first child of tree to an empty parent doesn't trigger sync
* [#8738](https://github.com/bryntum/support/issues/8738) - Strange animation when clicking `[ + ]`
* [#9068](https://github.com/bryntum/support/issues/9068) - [DOCS] `EventLayout` `layoutFn` missing docs
* [#9517](https://github.com/bryntum/support/issues/9517) - [HIGH PRIO] [REACT] Print to PDF failing with custom JSX in `eventRenderer`
* [#9565](https://github.com/bryntum/support/issues/9565) - Incorrect validation when creating event by Drag
* [#9569](https://github.com/bryntum/support/issues/9569) - [HIGH PRIO] `EventResize` does not work correctly with `eventBuffer` feature

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

* [#8746](https://github.com/bryntum/support/issues/8746) - [HIGH PRIO] Unplanned tasks resets duration on `revertChanges`
* [#8997](https://github.com/bryntum/support/issues/8997) - [HIGH PRIO] `STM` buggy when used with `NestedEvents` feature
* [#9381](https://github.com/bryntum/support/issues/9381) - [HIGH PRIO] `Duration` column invalid input bug when using custom unit name
* [#9427](https://github.com/bryntum/support/issues/9427) - [RTL] Wrong time spans highlighted while dragging

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

* We are thrilled to announce version `6.0` of our Scheduler Pro product. This release marks a significant milestone for
  us after more than two years of dedicated development. In this update, we are excited to bring you:
  * **Realtime updates via websocket**
  * **Lazy loading of rows as you scroll, for huge datasets**
  * **Support for freezing rows**
  * **New `ScrollButtons` feature to easily scroll events into view**
  * **New `CalendarEditor` widget for editing working/non-working time**
  * **Support for resizing multiple events simultaneously**
  * **Improved TypeScript typings**
  * **A new code editor in the examples for easy fiddling**
  * **Cool new demos**
  * **Bug fixes and other enhancements requested by our community**
* A special thanks to everyone who helped us by testing our alpha and beta versions. Your feedback and support have been
  invaluable

### FEATURES / ENHANCEMENTS

* This release introduces the calendar editor - a special widget visualizing and allowing to edit a calendar's data. The
  editor can be opened using a new trigger added to the calendar combo, used in the task editor, and the resource
  calendar column. Please check the "Upgrade guide", "What's new" and "Calendar editor guide" ([#356](https://github.com/bryntum/support/issues/356))
* Custom styling for milestones in the `Timeline` widget was removed, it did not work for overlapping milestones. The
  component now uses `milestoneLayoutMode: 'measure'` by default instead ([#5351](https://github.com/bryntum/support/issues/5351))
* Stores now have support for lazy loading of data, which when used in the Scheduler, loads new data while scrolling
  (both vertically and horizontally). ([#8001](https://github.com/bryntum/support/issues/8001))
* To allow for better control of the `z-index` of different layers in the schedule, elements from the
  `ResourceTimeRanges` and `ResourceNonWorkingTime` features are now rendered to separate parent elements in the DOM.
  Previously, they were both rendered into the same parent as event bars. If you have adjusted the z-index of the
  different elements in the schedule, please verify that they are as you expect after upgrading ([#8043](https://github.com/bryntum/support/issues/8043))
* The code editor in examples is now implemented with the VS Code engine. Code folding, search and replace, full
  undo/redo is now available when editing examples
* [TypeScript] Class configs `*Config` (e.g. `ButtonConfig`) now provide type declarations for `listeners` parameter in
  `*.d.ts` files
* [TypeScript] Class configs `*Config` (e.g. `ButtonConfig`) types now have optional parameters in `*.d.ts` files.
  `*Config` type can be used instead of `Partial<*Config>` declaration
* PDF export server has been moved from `examples/_shared/server` folder to its own GitHub repository:
  https://github.com/bryntum/pdf-export-server
* In alpha-2, the `useRawData` setting on Store was enabled by default, to boost data loading performance. If you are
  binding to a data in React, Angular or Vue and after upgrading to `6.0.0` see issues with dates on events / tasks not
  behaving as expected when changed outside of the Bryntum component, you can try opting out of this setting by
  configuring the `project` with `useRawData: false`
* Event bars, resource time ranges and time ranges all now use the direction neutral `inset-block-start` and
  `inset-inline-start` styles for positioning, rather than `top` and `left`. This puts them in the same place in LTR and
  RTL directions without additional processing
* Bumped the built-in version of FontAwesome Free to `v6.5.2`, which includes a new
  [table-cells-row-lock](https://fontawesome.com/icons/table-cells-row-lock) icon sponsored by Bryntum
* [Angular] Bryntum Angular wrapper now exports `Bryntum...Props` types (e.g. `BryntumSchedulerProProps`) which match
  the configs available for a wrapper component (e.g. `BryntumSchedulerProComponent`).Wrappers code is now delivered
  with documentation inside, that helps in setting up the components
* `EventHelper` no longer mutates the DOM event object to fix browser quirks and add utility properties. It now wraps
  the DOM event with a Proxy, which exposes all the properties of the DOM event and also accepts any new properties
  added to it. The original DOM event is available in the `browserEvent` property
* New `skill-matching` demo showing how to require matching of certain skills when assigning resources

### API CHANGES

* [VUE-3] Bryntum Vue-3 wrapper now exports `Bryntum...Props` types (e.g. `BryntumSchedulerProProps`) which match the
  configs available for a wrapper component (e.g. `<bryntum-scheduler-pro>`). Wrappers code is now delivered with
  documentation and TypeScript sources inside ([#3085](https://github.com/bryntum/support/issues/3085))
* [DEPRECATED] The `WidgetHelper` utility class has been deprecated and will be removed in a future release. Use the
  corresponding widget class instead - `Widget`, `Toast` or `Mask` ([#6103](https://github.com/bryntum/support/issues/6103))
* In previous versions, a call to `project.commitAsync()` caused a UI refresh even if nothing was changed by the commit.
  This has been fixed so that the UI is only refreshed if the commit actually changed something. This is a slight
  behavioral change (for the better), which we think should have minimal impact on apps ([#7924](https://github.com/bryntum/support/issues/7924))
* [BREAKING] The `useRawData` setting on `Store` is now enabled by default, but with all sub-settings disabled. This
  means that the incoming data object will be used as is, without being cloned. Which will boost data loading
  performance, but is potentially a breaking change if the data object is reused / used in other parts of the
  application ([#8335](https://github.com/bryntum/support/issues/8335))
* [BREAKING] In `6.0.0-alpha-2` we changed the default value for `useRawData` on stores to `true`. This boosted record
  creation performance by not cloning the incoming data object. However, this change has lead to some issues, and we are
  now taking a step back. It will once again default to `false` when supplying data inline, and instead only to `true`
  when data is loaded remotely using an `AjaxStore` or a `CrudManager` ([#9289](https://github.com/bryntum/support/issues/9289))
* With the recent introduction of individual layers for positioned elements, z-indexes have now been normalized. If you
  have overridden z-index of the layers, please adjust your CSS to ensure it looks as you expect.
* The nonworking-time layer has been moved up in the z-index stack to float above the time axis tick lines
* [DEPRECATED] `@bryntum/babel-preset-react-app`, `@bryntum/cra-template-typescript-schedulerpro`,
  `@bryntum/cra-template-javascript-schedulerpro` npm packages are deprecated, and will not get any further updates.
  Versions prior to `6.0.0` are still accessible
* [BREAKING] [ANGULAR] [REACT] [VUE] `BryntumProjectModel` framework wrapper is no longer available since `6.0.0`.
  Use `BryntumSchedulerProProjectModel` instead. Check the upgrade guide for the details
* [BREAKING] The default value for `ProjectModel.skipNonWorkingTimeInDurationWhenSchedulingManually` is now `false`
* [BREAKING] The `ScaleColumn` class has been removed from SchedulerPro. It was previously moved to Scheduler, but a
  proxy was kept in SchedulerPro for compatibility. This proxy has now been removed
* The `EventEdit` name field is no longer `required`, allowing users to add empty placeholder events.
* The `EventEdit` name field no longer sets "New event" as its value when creating a new event, and instead shows it as
  a placeholder (same behavior as Bryntum Scheduler)
* [BREAKING] When using the `fillTicks` mode, drag-drop interactions now use the same granularity as the bottom time
  axis "ticks". This means if you are viewing a day schedule, and you move an event starting 8am from Monday to Tuesday,
  it will still always start at `8am`
* The `ScheduledByDependenciesEarlyEventMixin` mixin in the scheduling engine has been renamed to
  `ConstrainedByDependenciesEventMixin`
* `EventMenu` menu item texts for `Copy event`, `Delete event` etc. were simplified to omit `event` word. Menu options
  will now just say "Copy, Cut, Delete"

### STYLING CHANGES

* The Stockholm theme got some slight tweaks to panel header (removed bottom border) and tab panel styling (replaced
  active tab background with thick bottom border) for a more modern look ([#8440](https://github.com/bryntum/support/issues/8440))

### DEMOS

* [ANGULAR] "Inline data" demo (Angular) is now updated and converted to Angular 17. The demo is located in
  `frameworks/angular/inline-data` folder ([#8810](https://github.com/bryntum/support/issues/8810))
* Scheduler Pro Maps demo has been updated ([#8884](https://github.com/bryntum/support/issues/8884))
* New power demo shows a Scheduler Pro, which can be switched from planned to actual mode and vice versa. The demo is
  located in `planned-vs-actual` folder
* [REACT-VITE] "Inline data" demo (React Javascript) is now updated and converted to React Vite TypeScript. The demo is
  located in `frameworks/react-vite/inline-data` folder
* [VUE-3-VITE] "Inline data" demo (Vue 3 Javascript) is now updated and converted to Vue 3 Vite TypeScript. The demo is
  located in `frameworks/vue-3-vite/inline-data` folder

### BUG FIXES

* [#4902](https://github.com/bryntum/support/issues/4902) - `EmptyCalendarEffect` description is not clear enough
* [#6021](https://github.com/bryntum/support/issues/6021) - `EventCopyPaste` should keep copied event immutable
* [#7760](https://github.com/bryntum/support/issues/7760) - [HIGH PRIO] [TypeScript] Type intersection with `any` might be wrong
* [#8025](https://github.com/bryntum/support/issues/8025) - [HIGH PRIO] `DragCreate` triggers transitions
* [#9117](https://github.com/bryntum/support/issues/9117) - `Infinite scroll` demo backend runs out of memory

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

### BUG FIXES

* [#9242](https://github.com/bryntum/support/issues/9242) - `ResourceUtilization` throws exception when aggregating data
* [#9403](https://github.com/bryntum/support/issues/9403) - [VUE 3] Events disappear after ResourceStore.load() in `5.6.12`

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

### API CHANGES

* [VUE] [REACT] When using wrappers for Vue or React, `syncDataOnLoad` is by default set to `true` on all stores
  configured on the wrapped Widget. Starting from `5.6.12`, stores with a configured `readUrl` or that belongs to a
  project configured with a `loadUrl`, will have their `syncDataOnLoad` default to `null`

### DEMOS

* [REACT-VITE] New "Travel time" demo (React + Vite) shows how to visualize travel time before/after an event. The demo
  is located in `frameworks/react-vite/travel-time` folder ([#8692](https://github.com/bryntum/support/issues/8692))
* [VUE-3-VITE] New "Travel time" demo (Vue 3 + Vite) shows how to visualize travel time before/after an event. The demo
  is located in `frameworks/vue-3-vite/travel-time` folder ([#8693](https://github.com/bryntum/support/issues/8693))

### BUG FIXES

* [#9089](https://github.com/bryntum/support/issues/9089) - Resource allocation is not aggregated correctly for the second (and higher) treeGroups in
  `ResourceHistogram`
* [#9222](https://github.com/bryntum/support/issues/9222) - [HIGH PRIO] Alternative definition for Mon-Fri calendar does not work
* [#9233](https://github.com/bryntum/support/issues/9233) - Events getting selected when `eventSelectionDisabled` is set to `true` and `pan` feature is enabled

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
* Vanilla JavaScript documentation has a new section on Multiple Products, showing how to use multiple components
  in a single page using `thin` components ([#8756](https://github.com/bryntum/support/issues/8756))
* Project has a new config called `includeChildrenInRemoveRequest`, that controls if a remove request includes the id of
  a removed parent and all its children, or just the id of the removed parent ([#8099](https://github.com/bryntum/support/issues/8099))

### API CHANGES

* After a docs regression, several APIs flagged to be hidden in subclasses were still visible in the docs. These APIs
  are now correctly hidden ([#9140](https://github.com/bryntum/support/issues/9140))

### BUG FIXES

* [#8921](https://github.com/bryntum/support/issues/8921) - `Postamble` does not handle DST transitions
* [#8963](https://github.com/bryntum/support/issues/8963) - Enable `reapplyFilterOnAdd` on the `ResourceUtilizationStore`
* [#9078](https://github.com/bryntum/support/issues/9078) - [HIGH PRIO] `layoutFn` misplaces events in vertical mode
* [#9153](https://github.com/bryntum/support/issues/9153) - Task effort is not updated

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

### API CHANGES

* The `setStartEndDate` method on `EventModel` was inherited by mistake. The docs have been updated to remove it
  ([#8881](https://github.com/bryntum/support/issues/8881))

### BUG FIXES

* [#8979](https://github.com/bryntum/support/issues/8979) - Creating event causing the auto zoom in timeline when no start date set to the scheduler
* [#8985](https://github.com/bryntum/support/issues/8985) - [HIGH PRIO] Smarter `EventStore` sync behavior for start / end dates
* [#8992](https://github.com/bryntum/support/issues/8992) - [ANGULAR] implement support of `ViewEncapsulation.ShadowDom`
* [#9014](https://github.com/bryntum/support/issues/9014) - Tooltip is not working when we hover over the child in nested-event dependencies
* [#9031](https://github.com/bryntum/support/issues/9031) - `'Error: Invalid cache fill interval'` when a child event starts before parent

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

### FEATURES / ENHANCEMENTS

* Now it is possible to specify the maximum units capacity of the resource, using `maxUnits` field. Default value
  is 100%, but if resource represents a team of several people `maxUnits` can be increased accordingly.
  This field is taken into account in the resource histogram and resource utilization widgets ([#833](https://github.com/bryntum/support/issues/833))
* The rules of calendar intervals prioritization in case of their intersection have been properly documented. Now the
  index of the interval in the dataset is also taken into account. Please refer to the updated Calendars guide and
  priority field documentation for the details ([#8754](https://github.com/bryntum/support/issues/8754))
* `ProjectModel.toJSON()` now includes data from all registered `crudStores` ([#8803](https://github.com/bryntum/support/issues/8803))
* `ProjectModel` has a new `toJSONResultFormat` config that controls the output format of the `ProjectModel.toJSON`
   method. Please check the config docs for more details ([#8814](https://github.com/bryntum/support/issues/8814))

### API CHANGES

* A change in Scheduler Pro `v5.3.0` fell out of the upgrade guide, repeating it here: `CalendarModel` class `intervals`
  field definition has been changed to behave as a store when performing CRUD operations. Please check "Upgrade guide"
  for the details

### LOCALE UPDATES

* Added Brazilian Portuguese translation (`'PtBr'`) ([#8747](https://github.com/bryntum/support/issues/8747))

### DEMOS

* [ANGULAR] New "Travel time" demo (Angular) shows how to visualize travel time before/after an event. The demo is
  located in `frameworks/angular/travel-time` folder ([#8691](https://github.com/bryntum/support/issues/8691))
* [REACT-VITE] New "Highlighting Event Calendars" demo (React + Vite) helps end users understand the scheduling logic by
  visualizing event calendars. The demo is located in `frameworks/react-vite/highlight-event-calendars` folder
  ([#8295](https://github.com/bryntum/support/issues/8295))
* [VUE-3-VITE] New "Highlighting Event Calendars" demo (Vue 3 + Vite) helps end users understand the scheduling logic by
  visualizing event calendars. The demo is located in `frameworks/vue-3-vite/highlight-event-calendars` folder
  ([#8296](https://github.com/bryntum/support/issues/8296))
* [ANGULAR] New "Highlighting Event Calendars" demo (Angular) helps end users understand the scheduling logic by
  visualizing event calendars. The demo is located in `frameworks/angular/highlight-event-calendars` folder
  ([#8297](https://github.com/bryntum/support/issues/8297))
* [REACT-VITE] New "Highlighting Resource Calendars" demo (React + Vite) helps end users understand the scheduling logic
  by visualizing resource calendars. The demo is located in `frameworks/react-vite/highlight-resource-calendars` folder
  ([#8472](https://github.com/bryntum/support/issues/8472))
* [VUE-3-VITE] New "Highlighting Resource Calendars" demo (Vue 3 + Vite) helps end users understand the scheduling logic
  by visualizing resource calendars. The demo is located in `frameworks/vue-3-vite/highlight-resource-calendars` folder
  ([#8473](https://github.com/bryntum/support/issues/8473))
* [ANGULAR] New "Highlighting Resource Calendars" demo (Angular) helps end users understand the scheduling logic by
  visualizing resource calendars. The demo is located in `frameworks/angular/highlight-resource-calendars` folder
  ([#8474](https://github.com/bryntum/support/issues/8474))

### BUG FIXES

* [#7267](https://github.com/bryntum/support/issues/7267) - Request for improved API for custom cell editors
* [#8263](https://github.com/bryntum/support/issues/8263) - [HIGH PRIO] CRUD manager loses changes when applying sync response
* [#8572](https://github.com/bryntum/support/issues/8572) - [HIGH PRIO] [REACT] Events disappear when scrolling and using JSX `eventRenderer`
  and `resourceTimeRanges`
* [#8718](https://github.com/bryntum/support/issues/8718) - [HIGH PRIO] SchedulerPro freezes when change timeZone with existed recurring timeRange
* [#8719](https://github.com/bryntum/support/issues/8719) - [DOCS] Document `getVersionContent` method of Versions feature
* [#8720](https://github.com/bryntum/support/issues/8720) - [HIGH PRIO] Inconsistent behavior when updating `startDate` of events
* [#8853](https://github.com/bryntum/support/issues/8853) - Memory not freed after destroying gantt instance in the "bigdataset" example
* [#8865](https://github.com/bryntum/support/issues/8865) - XSS vulnerability in `ResourceUtilization` with enabled `TreeGroup` feature
* [#8879](https://github.com/bryntum/support/issues/8879) - Missing scheduler reference in vertical mode layoutFn

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

### FEATURES / ENHANCEMENTS

* An exception with a meaningful message will now be thrown if parsing of the calendar interval's recurrent date string
  has failed ([#8705](https://github.com/bryntum/support/issues/8705))

### BUG FIXES

* [#8647](https://github.com/bryntum/support/issues/8647) - [HIGH PRIO] Scheduler Pro - error removing partner
* [#8684](https://github.com/bryntum/support/issues/8684) - [HIGH PRIO] Missing row hover effect on event drag
* [#8686](https://github.com/bryntum/support/issues/8686) - [HIGH PRIO] Exception thrown when loading data with segmented events into the event store with
  `useRawData : true` setting

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

* If Scheduler Pro is not provided with the viewport start date on creation, it now tries to use the project's start
  date, or calculates the earliest start date among all events
* Scheduler Pro now offers to not automatically merge two task segments when placed next to each other, via the new
  `ProjectModel` `autoMergeAdjacentSegments` config ([#8018](https://github.com/bryntum/support/issues/8018))
* The `effort` field on the `AssignmentModel` is now documented and public

### BUG FIXES

* [#7824](https://github.com/bryntum/support/issues/7824) - [HIGH PRIO] `ResourceUtilization` resource/task tree is not rendered correctly with async assignments
* [#8387](https://github.com/bryntum/support/issues/8387) - Embedded 3rd party chart not linked correctly when zooming in/out
* [#8401](https://github.com/bryntum/support/issues/8401) - [HIGH PRIO] Dependency line misplaces on scroll with lot of data
* [#8423](https://github.com/bryntum/support/issues/8423) - [HIGH PRIO] [LWC] Engine performance is too low with LWS enabled
* [#8426](https://github.com/bryntum/support/issues/8426) - [HIGH PRIO] Nested events are offseted when resizing parent events
* [#8430](https://github.com/bryntum/support/issues/8430) - [HIGH PRIO] Scheduler Pro does not link up single assignments when passed records
* [#8454](https://github.com/bryntum/support/issues/8454) - [HIGH PRIO] Binding to resources and events on Scheduler Pro requires refresh to render
* [#8477](https://github.com/bryntum/support/issues/8477) - [HIGH PRIO] Escape does not clear `FilterBar` filter in name column
* [#8489](https://github.com/bryntum/support/issues/8489) - Crash in drag-unplanned tasks demo
* [#8543](https://github.com/bryntum/support/issues/8543) - Exception thrown when editing the segmented event
* [#8545](https://github.com/bryntum/support/issues/8545) - Promise rejection error in maps demo when searching address
* [#8548](https://github.com/bryntum/support/issues/8548) - Timespan remains highlighted after `shiftPrevious`
* [#8550](https://github.com/bryntum/support/issues/8550) - Incorrect CSS class name in Stockholm theme

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

* Bumped built-in FontAwesome Free to version `6.5.1`
* All frameworks demo applications have been verified and updated to be compatible with Node.js 20
* When editing very long tasks where the task bar extends outside the visible viewport, only the nearest 100 pixels of
  the bar are scrolled into the viewport rather than attempting to scroll the whole width into view. The minimum width
  to scroll in may be configured in the `taskEdit` feature using the `minEditSize` config property ([#8315](https://github.com/bryntum/support/issues/8315))

### API CHANGES

* To boost record creation performance, records now cache their `id` (it is accessed very frequently, helps performance
  a bit) and join their store(s) in a more efficient way. As a side effect, a record no longer has a `stores` array
  prior to joining a store, previously it was there as an empty array from start. We don't think this will affect any
  code, but wanted to share the change in case it does
* [DEPRECATED] [ANGULAR] [REACT] [VUE] `BryntumProjectModel` framework wrapper will be removed starting from `6.0.0`
  version. Use `BryntumSchedulerProProjectModel` instead. Check the upgrade guide for the details

### LOCALE UPDATES

* Changed the locale key `Edit task : Edit task` to `editEvent : Edit event` in `TaskEdit`

### BUG FIXES

* [#2411](https://github.com/bryntum/support/issues/2411) - [HIGH PRIO] Dragging event over non-working resource time ranges erratic
* [#7640](https://github.com/bryntum/support/issues/7640) - Segment don't display event name
* [#7707](https://github.com/bryntum/support/issues/7707) - [TYPESCRIPT] Update `timeAxisColumn` to be a property
* [#7720](https://github.com/bryntum/support/issues/7720) - `scrollResourceEventIntoView` not working for collapsed tasks
* [#7821](https://github.com/bryntum/support/issues/7821) - Issue with rendering recurring events with multi assign
* [#7869](https://github.com/bryntum/support/issues/7869) - [HIGH PRIO] Cell edit feature behaves incorrectly when double-clicking to edit next cell
* [#8150](https://github.com/bryntum/support/issues/8150) - Edit task should be Edit Event in `EventMenu`
* [#8200](https://github.com/bryntum/support/issues/8200) - Webpack build failed with `.min.css` file
* [#8202](https://github.com/bryntum/support/issues/8202) - Event preamble has incorrect size after aborting event resize
* [#8210](https://github.com/bryntum/support/issues/8210) - [HIGH PRIO] Strange row expansion when drag creating in `embedded-chart` demo
* [#8233](https://github.com/bryntum/support/issues/8233) - [HIGH PRIO] Dependencies to nested parent events, cause all child events to have an "offset"
* [#8244](https://github.com/bryntum/support/issues/8244) - [HIGH PRIO] Events not showing when using `resourceId` to assign resource
* [#8267](https://github.com/bryntum/support/issues/8267) - [DOCS] `EventBuffer` renderer config not appear in the docs
* [#8279](https://github.com/bryntum/support/issues/8279) - Cancelling dependency creation hangs transactional feature
* [#8310](https://github.com/bryntum/support/issues/8310) - Timeline histogram with current timeline config triggering error
* [#8344](https://github.com/bryntum/support/issues/8344) - Event preamble/postamble element sizing/positioning doesn't change for RTL mode
* [#8374](https://github.com/bryntum/support/issues/8374) - Unexpected animation after resizing event

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

* [#7403](https://github.com/bryntum/support/issues/7403) - Make a guide on how to make a theme selector in frameworks
* [#7818](https://github.com/bryntum/support/issues/7818) - [TypeScript] Incorrect `RecurrenceModel` typing in typings
* [#7850](https://github.com/bryntum/support/issues/7850) - [Salesforce] Multi event select not selecting events in Salesforce
* [#7964](https://github.com/bryntum/support/issues/7964) - [REACT] JSX doesn't work in Popups
* [#8009](https://github.com/bryntum/support/issues/8009) - Issue with hidden non-working time in combination with `infiniteScroll`
* [#8133](https://github.com/bryntum/support/issues/8133) - Scheduler crashes on drag when `highlightSuccessors`/`highlightPredecessors` is enabled
* [#8155](https://github.com/bryntum/support/issues/8155) - Crash when dragging event to time axis header
* [#8176](https://github.com/bryntum/support/issues/8176) - Project data loading fails if filters hide all resources, and `reapplyFilterOnAdd` + `transformFlatData`
  are set to `true`
* [#8177](https://github.com/bryntum/support/issues/8177) - `TimeAxisSubGrid` throws `"queueMicrotask is not a function"` exception
* [#8192](https://github.com/bryntum/support/issues/8192) - `beforeEventResizeFinalize` not reverting event UI to the previous state

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.4 - 2023-12-21

### API CHANGES

* `resourceTimeRangeRenderer` method from `ResourceTimeRanges` feature is now a config on the Scheduler, making it
  available in framework wrappers ([#8035](https://github.com/bryntum/support/issues/8035))

### BUG FIXES

* [#8029](https://github.com/bryntum/support/issues/8029) - Dragging Task when `fillTicks` and `snap` enabled behaves differently on `5.6.0`
* [#8046](https://github.com/bryntum/support/issues/8046) - Feature is not finalized correctly when editor window is closed
* [#8080](https://github.com/bryntum/support/issues/8080) - Missing `TimelineHistogram` component in Angular / React / Vue packages
* [#8081](https://github.com/bryntum/support/issues/8081) - Missing `TreeGrid` component in Angular / React / Vue packages

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

* Added support for custom event layouts in vertical mode, by supplying a `layoutFn` to then `eventLayout` config
  ([#7659](https://github.com/bryntum/support/issues/7659))
* [ANGULAR] New "Resource utilization" demo (Angular) shows a Scheduler Pro and a `ResourceUtilization` visualizing
  resource allocation in sync. The demo is located in `frameworks/angular/resource-utilization` folder ([#7771](https://github.com/bryntum/support/issues/7771))
* [REACT] Documentation in "Quick start" and "Guide" is now updated with how to build React application in Vite for
  higher efficiency and better performance in development

### API CHANGES

* [DEPRECATED] Please kindly note that `@bryntum/babel-preset-react-app` and
  `@bryntum/cra-template-typescript-schedulerpro`, `@bryntum/cra-template-javascript-schedulerpro` packages will not get
  any updates after `6.0.0` version

### BUG FIXES

* [#7716](https://github.com/bryntum/support/issues/7716) - Link is created to a task when trying to abort building the link
* [#7801](https://github.com/bryntum/support/issues/7801) - Project gets out of sync when passing duration/end date changes to each other
* [#7981](https://github.com/bryntum/support/issues/7981) - `EventDragCreate` not working as intended with filtered ticks
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

### API CHANGES

* [DEPRECATED] The `eventBodyTemplate` function was deprecated in favor of returning the desired markup from an
  `eventRenderer` function. It will be removed in 6.0 ([#7288](https://github.com/bryntum/support/issues/7288))

### BUG FIXES

* [#7092](https://github.com/bryntum/support/issues/7092) - Feature mixin on-owner events are not exposed on class
* [#7683](https://github.com/bryntum/support/issues/7683) - `TaskEditor` not vertically scrollable when shown on a small screen
* [#7716](https://github.com/bryntum/support/issues/7716) - Link is created to a task when trying to abort building the link
* [#7726](https://github.com/bryntum/support/issues/7726) - `TaskEdit` stops working if `hideAnimationEnd` event is not fired
* [#7876](https://github.com/bryntum/support/issues/7876) - Issue with `DragCreating` event that snaps to `0` duration

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

* [REACT] New Pro Event effort demo (React + Vite) shows events that distribute their effort across their duration
  Scheduler Pro and a Resource Utilization visualize effort allocation in sync. The demo is located in
  `frameworks/react-vite/effort` folder ([#7442](https://github.com/bryntum/support/issues/7442))

### BUG FIXES

* [#5719](https://github.com/bryntum/support/issues/5719) - [YARN] Can not install `@bryntum` product packages using yarn v2/v3
* [#7582](https://github.com/bryntum/support/issues/7582) - PDF exports not showing nested events
* [#7622](https://github.com/bryntum/support/issues/7622) - Disabled fields in `taskEditor` becomes editable on changing time
* [#7750](https://github.com/bryntum/support/issues/7750) - Vite error `@charset must precede all other statements`
* [#7754](https://github.com/bryntum/support/issues/7754) - [Frameworks] Thin packages not working with `pnpm`
* [#7755](https://github.com/bryntum/support/issues/7755) - Misplaced drag proxy when dragging from grid
* [#7797](https://github.com/bryntum/support/issues/7797) - Record is duplicated when client receives response with removed phantom `id` and existing `id`
* [#7820](https://github.com/bryntum/support/issues/7820) - `globalThis` should be defined in locales to support LWC
* [#7831](https://github.com/bryntum/support/issues/7831) - [Thin bundles] some classes are not exported from `@bryntum/engine-thin` package

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

* When dragging events in Scheduler Pro, the dates shown in the tooltip now take non-working time into account. This
  means that the tooltip now more accurately indicate the dates that will be assigned on drop
* This release introduces a new set of npm packages and framework components, that allows combining multiple Bryntum
  products in the same application. These packages contain the product specific code only, as opposed to the current
  packages that has all code for the products each product builds upon (for example Scheduler contains Grid & Core).
  The new packages are called `thin` packages, and moving forward it will be the recommended way of using Bryntum
  products in npm based applications (for all supported frameworks). See the "What's new" guide for more information
* `@bryntum/schedulerpro-thin` bundle includes scss theme files in `sass/themes` folder ([#7445](https://github.com/bryntum/support/issues/7445))
* Nested events are now by default scheduled relative to their parent event. Previously they were positioned relative
  to their parent event initially, but when the parent was moved intersecting non-working time the relative position was
  lost. This is implemented as a new `delayFromParent` field (optional to specify), which behind the scenes is used as
  a constraint, taking non-working time into account ([#6821](https://github.com/bryntum/support/issues/6821))
* Scheduler now suspends UI refreshes during direct application calls to `project.loadCrudManagerData()`, only
  refreshing once after the data has been applied ([#7246](https://github.com/bryntum/support/issues/7246))
* [TypeScript] Functions and events declarations in typings were improved to contain all available parameters and return
  type ([#6961](https://github.com/bryntum/support/issues/6961), [#4456](https://github.com/bryntum/support/issues/4456))
* Added a `Print` feature based on `PdfExport` feature which allows using browser print dialog and not rely on backend
  ([#6218](https://github.com/bryntum/support/issues/6218))
* Scheduler Pro now supports dependencies between nested events, on display in the new `nested-events-dependencies`
  example ([#7211](https://github.com/bryntum/support/issues/7211))
* [REACT][SharePoint] Added a new React based SharePoint web part demo. It shows how to integrate Scheduler Pro in
  SharePoint, using a task list as the data source. Located in `examples/frameworks/react/typescript/sharepoint-fabric`

### API CHANGES

* [BREAKING] `Core.util.helper.Point` class has been moved to solve circular module dependencies. It is now a named
  export of the `Core.util.helper.Rectangle` module. Check upgrading guide for the details
* [BREAKING] [TypeScript] `ScrollOptions` typedef has been renamed to `BryntumScrollOptions` to not interfere with
  TypeScript interface `ScrollOptions`. Check upgrading guide for the details ([#7385](https://github.com/bryntum/support/issues/7385))
* [FRAMEWORKS][DEPRECATED] `BryntumProjectModel` wrapper component has been renamed to
  `BryntumSchedulerProProjectModel`. Please see the upgrade guide for details

### BUG FIXES

* [#7594](https://github.com/bryntum/support/issues/7594) - Dragging with non-continuous time axis does not take non-working time into account
* [#7613](https://github.com/bryntum/support/issues/7613) - `onEventResizeStart` and `onEventDragStart` does not persist custom properties set on events
* [#7696](https://github.com/bryntum/support/issues/7696) - Issue with dragging event that extends beyond filtered time axis

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.5.5 - 2023-10-23

### FEATURES / ENHANCEMENTS

* `EventStore` now calls `console.error` when you load / set invalid data with `startDate` > `endDate`
* `EventBuffer` feature now supports a `renderer` function allowing you to change text, CSS class and icon for the
  preamble and postamble elements ([#6136](https://github.com/bryntum/support/issues/6136))

### API CHANGES

* A 0-duration `preamble` or `postamble` now serializes as `null`

### BUG FIXES

* [#5927](https://github.com/bryntum/support/issues/5927) - Error when scrolling and then switching to collapsed tree structure
* [#6654](https://github.com/bryntum/support/issues/6654) - Issues combining `infiniteScroll` with zoom
* [#7612](https://github.com/bryntum/support/issues/7612) - `highlightTimeSpans` feature DomSync update fail during scroll
* [#7623](https://github.com/bryntum/support/issues/7623) - Dependencies stay visible after filtering `taskStore`
* [#7639](https://github.com/bryntum/support/issues/7639) - Segments are not serialized when calling model `toJSON`
* [#7670](https://github.com/bryntum/support/issues/7670) - Drag drop broken in highlight demo
* [#7671](https://github.com/bryntum/support/issues/7671) - Map pins not showing in `maps` demo

## 5.5.4 - 2023-10-05

### BUG FIXES

* [#7312](https://github.com/bryntum/support/issues/7312) - `scrollEventIntoView` not working correctly
* [#7500](https://github.com/bryntum/support/issues/7500) - Top level child styling broken in `nested-events-configuration` demo
* [#7541](https://github.com/bryntum/support/issues/7541) - `scrollEventIntoView` throwing error in `gantt-schedulerpro` demo

## 5.5.3 - 2023-09-15

### FEATURES / ENHANCEMENTS

* It is now possible to use the `CalendarModel` instance standalone, independently of the project instance ([#7335](https://github.com/bryntum/support/issues/7335))
* [VUE-3-VITE] New Drag unplanned tasks demo (Vue 3 + Vite) shows how to drag unplanned tasks from a
  list onto the Scheduler Pro component. The demo is located in `frameworks/vue-3-vite/drag-unplanned-tasks` folder

### BUG FIXES

* [#7348](https://github.com/bryntum/support/issues/7348) - Map markers not always shown on load
* [#7390](https://github.com/bryntum/support/issues/7390) - `Resourceutilization` group collapse works incorrect after new assignment
* [#7393](https://github.com/bryntum/support/issues/7393) - Drag proxy not centered below cursor in react `drag-batches` demo
* [#7428](https://github.com/bryntum/support/issues/7428) - Changing `timeZone` doesn't move recurring `ResourceTimeRange`
* [#7481](https://github.com/bryntum/support/issues/7481) - Task editor should not close when fully reloading project if id of edited task is still present

## 5.5.2 - 2023-08-30

### BUG FIXES

* [#1491](https://github.com/bryntum/support/issues/1491) - `TaskEdit` resets end time when user changes `startDate`
* [#4866](https://github.com/bryntum/support/issues/4866) - `ResourceUtilizationModel` `origin` property is config-only
* [#7283](https://github.com/bryntum/support/issues/7283) - `SchedulerTooltip` `mouseOffset` stack overflow

## 5.5.1 - 2023-08-16

### API CHANGES

* We added two public methods - `suspendChangeTracking` and `resumeChangeTracking` to suspend and resume
  `hasChanges`/`noChanges` events on a `CrudManager`

### BUG FIXES

* [#644](https://github.com/bryntum/support/issues/644) - Event cannot be assigned to multiple resources from editor with `autoUpdateRecord` enabled
* [#7116](https://github.com/bryntum/support/issues/7116) - Event removed when returning false from `beforeEventEdit` after `v5.3.3`
* [#7203](https://github.com/bryntum/support/issues/7203) - `onVisibleDateRangeChange` is not subscriber on `visibleDateRangeChange` event but separated method
* [#7233](https://github.com/bryntum/support/issues/7233) - LaterJS bug when enum days from Monday
* [#7259](https://github.com/bryntum/support/issues/7259) - Missing typings in `ResourceUtilizationFeaturesConfigType` after upgrading to version `5.4.0`
* [#7292](https://github.com/bryntum/support/issues/7292) - Crash when assigning resource in grouped Scheduler
* [#7308](https://github.com/bryntum/support/issues/7308) - Navigation issue in Bryntum examples

## 5.5.0 - 2023-07-31

* This release is a replacement for the 5.4.3 patch release. It was changed to a minor version because of some larger
  changes behind the scenes to pave the way for future support for live updates in Scheduler Pro and Gantt.

### FEATURES / ENHANCEMENTS

* We have refactored a few features and changed their prototype chain. If you are importing those features directly, or
  are extending them, you need to use correct base class and import path:
  `Grid/feature/RowReorder` ->  `Scheduler/feature/RowReorder`,
  `Grid/feature/CellEdit` -> `SchedulerPro/feature/CellEdit`,
  `Scheduler/feature/Dependencies` -> `SchedulerPro/feature/Dependencies`
* [REACT] New Drag unplanned tasks demo (React + Vite) shows how to drag unplanned tasks from a list
  onto the Scheduler Pro component. The demo is located in `frameworks/react-vite/drag-unplanned-tasks` folder
* [ANGULAR] New Drag unplanned tasks demo (Angular) showing how to drag unplanned tasks from a list
  onto the Scheduler Pro component. The demo is located in `frameworks/angular/drag-unplanned-tasks` folder

### BUG FIXES

* [#7221](https://github.com/bryntum/support/issues/7221) - [VUE] Vue vite app doesn't compile with Bryntum vue wrappers
* [#7229](https://github.com/bryntum/support/issues/7229) - Assignments not saved correctly while create new event when use store's URLs to save data

## 5.4.2 - 2023-07-26

### BUG FIXES

* [#7091](https://github.com/bryntum/support/issues/7091) - Exception thrown when moving mouse after event drag create
* [#7164](https://github.com/bryntum/support/issues/7164) - Action column icons missing margin in Scheduler Pro

## 5.4.1 - 2023-07-13

### FEATURES / ENHANCEMENTS

* We have created a public repository to showcase Salesforce demos. All previous demos are merged into one Lightning
  Application which is easy to install to a new scratch org. You can find more information in updated guides and in this
  repository: https://github.com/bryntum/bryntum-salesforce-showcase#bryntum-salesforce-showcase
* We have created a public Salesforce org where this app is preinstalled. You can find link to it and login credentials
  on the updated examples page

### BUG FIXES

* [#6077](https://github.com/bryntum/support/issues/6077) - [TypeScript] `Model` constructors should allow second param
* [#7099](https://github.com/bryntum/support/issues/7099) - Dependency creation validates not correct when move cursor fast

## 5.4.0 - 2023-06-30

### FEATURES / ENHANCEMENTS

* This release introduces a new `TimelineHistogram` class which implements a grid with histogram charts displayed for
  rows in the timeaxis section. Please check the new
  [Timeline histogram demo](https://bryntum.com/products/schedulerpro/examples-scheduler/timelinehistogram/) and the
  "Timeline histogram" guide for more details
* The release also includes refactored `ResourceHistogram` and `ResourceUtilization` views which now better support
  `TreeGroup` and `Group` features and provide some additional APIs for customization. For more details please check
  new "Resource histogram" and "Resource utilization" guides and see the updated `resourcehistogram` and
  `resourceutilization` examples
* `Widget` has a new config, `maximizeOnMobile` which takes effect only on `floating` widgets on a mobile device. It
  causes the widget to be maximized instead of positioned in order to accommodate the mobile virtual keyboard. This will
  make event editing much easier to use on mobile devices ([#6522](https://github.com/bryntum/support/issues/6522))
* On mobile devices, `type : 'checkbox'` is rendered as a `slidetoggle` widget. The API and value is the same, it is
  just a more appropriate UI for the platform
* The `NestedEvents` feature now supports deeper nesting of events, by specifying the new `maxNesting` config (it
  defaults to one level). Although it technically supports any depth, we do not recommend going deeper than 2 levels for
  the UI to be comprehensible ([#6030](https://github.com/bryntum/support/issues/6030))
* For a slightly better docs experience for most users, the docs browser now by default hides some more obscure APIs
  normally only used when implementing own widgets and features. Advanced users in need of these APIs can still opt in
  to see them using the `Show` menu in the docs browser

### API CHANGES

* The `ScaleColumn` class has been moved from Pro to regular Scheduler classes. This should not affect your application
  unless it imports the class from its individual file (not the case for the vast majority of customers). The
  distribution still includes `SchedulerPro/column/ScaleColumn.js` file which is now an empty wrapper importing the
  class from its new location. The wrapper is there till the next major release so please update your code and import
  the file from its new location if needed ([#6176](https://github.com/bryntum/support/issues/6176))

### BUG FIXES

* [#5553](https://github.com/bryntum/support/issues/5553) - `reapplyFilterOnAdd` doesn't work when adding resources before loading

## 5.3.8 - 2023-06-28

### BUG FIXES

* [#6986](https://github.com/bryntum/support/issues/6986) - Undo / Redo Inconsistent Crud changes

## 5.3.7 - 2023-06-20

### BUG FIXES

* [#6389](https://github.com/bryntum/support/issues/6389) - Drag-n-Drop bug when `constrainDragToTimeSlot` set to `true`
* [#6842](https://github.com/bryntum/support/issues/6842) - Issues with updating segments in latest nightly (2023-05-24-release)
* [#7004](https://github.com/bryntum/support/issues/7004) - [REACT] `StateTrackingManager` not working correctly

## 5.3.6 - 2023-05-26

### FEATURES / ENHANCEMENTS

* Event segments can now have `eventColor` HEX values, e.g. `[#000000](https://github.com/bryntum/support/issues/000000)` ([#6531](https://github.com/bryntum/support/issues/6531))

### BUG FIXES

* [#6740](https://github.com/bryntum/support/issues/6740) - [REACT] Set same events data with segments shows different result
* [#6747](https://github.com/bryntum/support/issues/6747) - Exception when filtering the segmented event
* [#6762](https://github.com/bryntum/support/issues/6762) - `WidgetHelper.showContextMenu` does not display the context menu when using `Number[]`

## 5.3.5 - 2023-05-11

### API CHANGES

* The internal feature mixin `ProTaskEditStm` has been moved to Scheduler codebase and renamed to `TaskEditStm`. It is
  available now as `TaskEditStm` entry in Scheduler bundle

### BUG FIXES

* [#6610](https://github.com/bryntum/support/issues/6610) - Scheduler Pro crashes when trying to undo after copy/paste multievent selection (`[CTRL + Click]`)
* [#6684](https://github.com/bryntum/support/issues/6684) - Cannot read properties of `null` (reading `'activeTransaction'`)
* [#6691](https://github.com/bryntum/support/issues/6691) - Events render to early when `timeZone` is set on a Scheduler Pro
* [#6699](https://github.com/bryntum/support/issues/6699) - Should record only 1 STM transaction for drag-create and following task edit user actions
* [#6701](https://github.com/bryntum/support/issues/6701) - [IONIC] `Scrollbar` width could not be determined under Ionic framework
* [#6713](https://github.com/bryntum/support/issues/6713) - Time spans highlights re-appear after calling `unhighlightTimeSpans()`
* [#6749](https://github.com/bryntum/support/issues/6749) - Event editor body cropped and not scrollable

## 5.3.4 - 2023-04-28

### FEATURES / ENHANCEMENTS

* New config option on the `SchedulerPro`'s `ProjectModel`: `skipNonWorkingTimeInDurationWhenSchedulingManually`.
  Please refer to the documentation for details

### BUG FIXES

* [#6582](https://github.com/bryntum/support/issues/6582) - Event's endDate jumps when start editing manually scheduled event
* [#6644](https://github.com/bryntum/support/issues/6644) - Edit Task option missing in `EventMenu`
* [#6652](https://github.com/bryntum/support/issues/6652) - Minified UMD bundle does not export `bryntum` namespace

## 5.3.3 - 2023-04-21

### FEATURES / ENHANCEMENTS

* [TypeScript] Type definition files were added for `schedulerpro.node.cjs` and `schedulerpro.node.mjs` bundles
  ([#6523](https://github.com/bryntum/support/issues/6523))
* `ResourceNonWorkingTime` now offers a `enableMouseEvents` config to enable showing tooltips for its rendered
  elements. See updated `resource-non-working-time` demo ([#6545](https://github.com/bryntum/support/issues/6545))
* `ResourceNonWorkingTime` now supports showing the `name` interval field in the rendered element ([#6493](https://github.com/bryntum/support/issues/6493))
* [ANGULAR] Bryntum Scheduler Pro now ships with two npm Angular wrapper packages to support different versions of
  Angular framework. Existing `@bryntum/schedulerpro-angular` package is now designed to work with Angular 12 and newer
  versions, which use the IVY rendering engine. New `@bryntum/schedulerpro-angular-view` package is designed to work
  with Angular 11 and older versions, which use the View Engine rendering. Check Upgrading and Angular integration
  guides in documentation for more information ([#6270](https://github.com/bryntum/support/issues/6270))
* [ANGULAR] `angular-11` demo has been added to show use of `@bryntum/schedulerpro-angular-view` package with
  Angular 11. Demo is located in `examples/frameworks/angular/angular-11` folder

### BUG FIXES

* [#1372](https://github.com/bryntum/support/issues/1372) - Pro Constraints demo doesn't update constraint icon
* [#2695](https://github.com/bryntum/support/issues/2695) - Resource Histogram is not updated when primary partner is zoomed or gets shifted
* [#5059](https://github.com/bryntum/support/issues/5059) - Histogram not updating when doing `shiftPrevious()`
* [#6439](https://github.com/bryntum/support/issues/6439) - Timeline jumps to wrong dates when change direction to RTL at runtime with `infiniteScroll` enabled
* [#6521](https://github.com/bryntum/support/issues/6521) - Task Editor disappears when entering invalid time
* [#6527](https://github.com/bryntum/support/issues/6527) - [ANGULAR] Resource Utilization - custom tick context is not updated when shift timeline
* [#6539](https://github.com/bryntum/support/issues/6539) - `eventRecord` member missing in EventTooltip feature
* [#6542](https://github.com/bryntum/support/issues/6542) - Wrong text color when hovering event
* [#6562](https://github.com/bryntum/support/issues/6562) - Broken drag-select + drag & drop of parent events
* [#6576](https://github.com/bryntum/support/issues/6576) - Timelines appear when filter non-working time with custom `viewPreset`

## 5.3.2 - 2023-04-04

### FEATURES / ENHANCEMENTS

* [REACT] Added new React 18 demo "Highlighting time spans". Demo is located in
  `examples/frameworks/react/highlight-time-spans` folder ([#6277](https://github.com/bryntum/support/issues/6277))
* The custom event layout function `eventLayout.layoutFn` is now passed the resource record being laid out as the second
  parameter. ([#6504](https://github.com/bryntum/support/issues/6504))

### BUG FIXES

* [#3765](https://github.com/bryntum/support/issues/3765) - Returning false from beforeUpdate does not revert event D&D
* [#3789](https://github.com/bryntum/support/issues/3789) – UndoRedo widget doesn't catch the project if configured standalone in Angular
* [#6037](https://github.com/bryntum/support/issues/6037) - Inconsistent event menu actions when multiple events are selected
* [#6064](https://github.com/bryntum/support/issues/6064) - Incorrect rendering of a timeaxis when `forceFit` enabled
* [#6105](https://github.com/bryntum/support/issues/6105) - Inconsistent event menu copy/cut/paste actions when multiple events are selected
* [#6297](https://github.com/bryntum/support/issues/6297) - Not possible to drag event that dropped from grid when `nestedEvents` enabled
* [#6369](https://github.com/bryntum/support/issues/6369) - Issues with timezones on scheduler
* [#6376](https://github.com/bryntum/support/issues/6376) - Resource calendar not shown when using nested events
* [#6390](https://github.com/bryntum/support/issues/6390) - Type for `CalendarModel`'s `intervals` too strict
* [#6394](https://github.com/bryntum/support/issues/6394) - `project.changes` still available after `project.revertChanges()`
* [#6425](https://github.com/bryntum/support/issues/6425) - `NestedEvents` not working in vertical mode
* [#6430](https://github.com/bryntum/support/issues/6430) - `taskEditCanceled` event is not triggering
* [#6444](https://github.com/bryntum/support/issues/6444) - Error on load function after dragging
* [#6484](https://github.com/bryntum/support/issues/6484) - Invisible cells repainted with wrong data
* [#6510](https://github.com/bryntum/support/issues/6510) - Event segment `eventColor` not applied

## 5.3.1 - 2023-03-17

### API CHANGES

* `ProjectModel` convenience getter methods (`events`, `resources` etc.) now returns `allRecords` instead of `records`
* Date parsing was made more forgiving in regard to character used to separate date parts. For example these strings are
  now all acceptable as `HH:mm`: `10:20`, `10 20`, `10-20`, `10/20` ([#6344](https://github.com/bryntum/support/issues/6344))

### BUG FIXES

* [#5084](https://github.com/bryntum/support/issues/5084) - React orders demo not working properly
* [#6025](https://github.com/bryntum/support/issues/6025) - Uncaught error in `populateEventMenu` when dropping an event on the first resource
* [#6041](https://github.com/bryntum/support/issues/6041) - `getDateConstraints()` bounds works not correct with not rounded time in start/end dates
* [#6129](https://github.com/bryntum/support/issues/6129) - Dependencies not refreshed after dropping event on non-working time
* [#6274](https://github.com/bryntum/support/issues/6274) - SENCHA + Scheduler Pro + Chrome : Strange behaviour after zoom
* [#6279](https://github.com/bryntum/support/issues/6279) - Add a new tree node with empty children throws an exception
* [#6320](https://github.com/bryntum/support/issues/6320) - `effortDriven` + fixed duration not working when setting it in the data level initially
* [#6326](https://github.com/bryntum/support/issues/6326) - `GroupSummary` data not updating on event deletion
* [#6351](https://github.com/bryntum/support/issues/6351) - Components do not render into containers not already in DOM

## 5.3.0 - 2023-03-02

### FEATURES / ENHANCEMENTS

* CSS changes in Scheduler has cut the size of Scheduler Pro's standalone CSS-bundles roughly in half. See Schedulers
  upgrade guide for more information
* Added basic support for recurring events, see "What's new" for more information. And be sure to try it out in the new
  `recurrence` demo ([#792](https://github.com/bryntum/support/issues/792))
* Support for Time zone conversion has been added to all Bryntum scheduling products. Simply set a IANA time zone
  identifier as value for the `timeZone` config and that's it. But, since time zones is not supported natively in
  JavaScript we strongly recommend to read our Time zone guide ([#1533](https://github.com/bryntum/support/issues/1533))
* Added `Versions` feature, enabling capturing snapshots of projects together with a detailed changelog
* Localization demos updated to show up-to-date localization approach
* Event model has got new `schedulingMode`, `effort` and `effortDriven` fields. The fields add support for a new
  scheduling mode in which user provided effort gets distributed across the event duration.
  Please check the new `effort` demo to see how it works
* `AjaxHelper.fetch` now supports using request body to pass parameters for non-GET requests. Please check
  `addQueryParamsToBody` argument in the method documentation ([#2855](https://github.com/bryntum/support/issues/2855))
* Lots (but not all) of the not so informative `object` types in our TypeScript typings have been replaced with more
  specific types. Objects that in our JavaScript are used as maps are now declared as `Record<keyType, valueType>`, and
  for functions that accept object arguments many are replaced with anonymous type declarations, such as
  `{ foo: string, bar: number }` (Partially fixed [#5176](https://github.com/bryntum/support/issues/5176))
* Added new "Nested events configuration options" Angular demo. Demo is located in
  `examples/frameworks/angular/nested-events-configuration` folder ([#5188](https://github.com/bryntum/support/issues/5188))
* While resizing the `PercentBar`, the owning component now trigger `percentBarDragStart`, `percentBarDrag`
  and `percentBarDrop` events. The task record is also updated in realtime triggering continuous UI updates for a nicer
  UX ([#6146](https://github.com/bryntum/support/issues/6146))

### API CHANGES

* [DEPRECATED] `LocaleManager.registerLocale` and `LocaleManager.extendLocale` are deprecated.
  `LocaleHelper.publishLocale` should be used instead.
* When configuring a SchedulerPro with a time zone at initialization, and there's also a `startDate` and/or a `endDate`
  initially, those days will be treated as in local system time zone and will therefore be converted to the configured
  time zone. Previously (in `5.3.0-alpha-1` and `5.3.0-beta-1`) those dates was treated as in the provided time zone
* The default value for `ResourceHistogram`'s `effortFormat` was changed from `0` to `0.#`, to round values to one
  decimal place. Previously it was not rounding at all

### LOCALE UPDATES

* Locales format and process for applying locales have been simplified
* New locales for 31 languages have been added. Currently available languages are listed in the localization guide
  (Guides/Customization/Localization)

### BUG FIXES

* [#5889](https://github.com/bryntum/support/issues/5889) - Events are not rendered according to the timezone when scheduler has a timezone
* [#5981](https://github.com/bryntum/support/issues/5981) - Scrolling close to edges hides `highlightEventCalendars`
* [#6018](https://github.com/bryntum/support/issues/6018) - Wrong position of highlighted region when `taskRecord` is set
* [#6020](https://github.com/bryntum/support/issues/6020) - Highlighted task timespan height not adjusting with the height of the rows
* [#6156](https://github.com/bryntum/support/issues/6156) - `eventRecord.set` only works first time for preamble/postamble
* [#6260](https://github.com/bryntum/support/issues/6260) - Milestone is rendered incorrectly
* [#6271](https://github.com/bryntum/support/issues/6271) - Timeline enables eventEdit feature if any features config provided

## 5.2.10 - 2023-02-17

### FEATURES / ENHANCEMENTS

* Added a `trackProjectModelChanges` config to the `ProjectModel` to optionally track own changes of the `ProjectModel`
  ([#5355](https://github.com/bryntum/support/issues/5355))

### API CHANGES

* Recently browsers have added support for Unicode 15, which changes the output of `Intl.DateTimeFormat` when
  formatting time to include `AM`/`PM`. Those browsers now use "thin space" (`\u202f`) instead of regular space. This
  affects the `DateHelper.format()` function, but likely you do not need to take any action in your application. It
  also affects `DateHelper.parse()`, which has been updated to support the new unicode space ([#6193](https://github.com/bryntum/support/issues/6193))

### BUG FIXES

* [#6112](https://github.com/bryntum/support/issues/6112) - Exception is thrown after rejecting a conflicting change
* [#6114](https://github.com/bryntum/support/issues/6114) - `scrollEventIntoView` doesn't handle nested events
* [#6133](https://github.com/bryntum/support/issues/6133) - Crash when dragging events between two schedulers
* [#6142](https://github.com/bryntum/support/issues/6142) - DST Adjustment issue adding 1h on events
* [#6147](https://github.com/bryntum/support/issues/6147) - Undo/redo adding a calendar crashes

## 5.2.9 - 2023-01-30

### FEATURES / ENHANCEMENTS

* The `TaskEditor's` `Advanced` tab's combos has been made wider which required some additional styling and some fields
  have been rearranged as well. If your app is customizing the `Advanced` tab, you should check that your customization
  still gives same result with the new default layout ([#5966](https://github.com/bryntum/support/issues/5966))

### BUG FIXES

* [#5925](https://github.com/bryntum/support/issues/5925) - Adding `workingTime` cause the event tooltip to start from the `eventBuffer` start date
* [#5979](https://github.com/bryntum/support/issues/5979) - Summary on vertical mode "disappears" on double click
* [#6017](https://github.com/bryntum/support/issues/6017) - Scheduler Pro not assigning resourceId to new events
* [#6019](https://github.com/bryntum/support/issues/6019) - [TypeScript] Feature classes and configs have `on` event handlers exposed on owner class
* [#6038](https://github.com/bryntum/support/issues/6038) - Event drag copy throws with mapped fields
* [#6069](https://github.com/bryntum/support/issues/6069) - Params lost if defined in class config

## 5.2.8 - 2023-01-19

### BUG FIXES

* [#5386](https://github.com/bryntum/support/issues/5386) - Improved panel collapse animation when collapsed panel header is perpendicular to expanded
* [#5788](https://github.com/bryntum/support/issues/5788) - Automatic dependency setting not working after resetting events array
* [#5814](https://github.com/bryntum/support/issues/5814) - `StateProvider` throws during component construction
* [#5904](https://github.com/bryntum/support/issues/5904) - TypeError in Scheduler Pro on Drag/Drop event
* [#5917](https://github.com/bryntum/support/issues/5917) - When load data with `schedulerPro.project.loadCrudManagerData` Scheduler Pro crashes
* [#5923](https://github.com/bryntum/support/issues/5923) - `applyProjectChanges` does not account for mapped `id` field
* [#5931](https://github.com/bryntum/support/issues/5931) - Deprecated API use. Handle size is from CSS
* [#5935](https://github.com/bryntum/support/issues/5935) - Scheduler drag to create on a linked record does not work
* [#5950](https://github.com/bryntum/support/issues/5950) - Crash when resizing event being created
* [#5953](https://github.com/bryntum/support/issues/5953) - Event record disappears after changing to zero duration

## 5.2.7 - 2023-01-11

### API CHANGES

* The `StartDateField/EndDateField` fields now sets the default value of their `max` property to be 200 years after the
  project's end date, see the docs for the corresponding classes ([#5779](https://github.com/bryntum/support/issues/5779))

### BUG FIXES

* [#4862](https://github.com/bryntum/support/issues/4862) - Scheduler Pro percent bar in vertical mode wrong UI
* [#5474](https://github.com/bryntum/support/issues/5474) - Wrong endDate when dragging events over days at which DST/STD change
* [#5849](https://github.com/bryntum/support/issues/5849) - Store exception event triggered when create a new event with backend used
* [#5882](https://github.com/bryntum/support/issues/5882) - Rendering content from eventRenderer disappearing when scrolling

## 5.2.6 - 2022-12-28

### FEATURES / ENHANCEMENTS

* [REACT] React wrapper now supports React components in widgets and tooltips ([#774](https://github.com/bryntum/support/issues/774))

### BUG FIXES

* [#2176](https://github.com/bryntum/support/issues/2176) - Adding non-working interval dynamically does not recalculate tasks
* [#4851](https://github.com/bryntum/support/issues/4851) - Infinite requests if server response is malformed
* [#5394](https://github.com/bryntum/support/issues/5394) - Non working days not painted after adding a calendar interval programmatically
* [#5786](https://github.com/bryntum/support/issues/5786) - Store `autoCommit` gets disabled by `CRUDManager`

## 5.2.5 - 2022-12-16

### FEATURES / ENHANCEMENTS

* `RowCopyPaste` feature supports copying rows in tree. Copied records will have same hierarchy
* Paste after cut and copy behavior is unified, records are moved below the paste target

### BUG FIXES

* [#5408](https://github.com/bryntum/support/issues/5408) - `EventDragCreate` doesn't take `ignoreResourceCalendar` into account
* [#5668](https://github.com/bryntum/support/issues/5668) - Chained `resourceStores` from one `CrudManager` works incorrect
* [#5693](https://github.com/bryntum/support/issues/5693) - Nested events drag from Grid example crashes when dragging after code edit
* [#5731](https://github.com/bryntum/support/issues/5731) - Time axis cells are recycled when making schedule area small
* [#5776](https://github.com/bryntum/support/issues/5776) - `Radiobutton` not circular in small popup
* [#5778](https://github.com/bryntum/support/issues/5778) - Dragging resources to the last row causes crash in group

## 5.2.4 - 2022-11-28

### FEATURES / ENHANCEMENTS

* We recently launched a new homepage over at [bryntum.com](https://bryntum.com), and have now slightly updated the
  styling for demos and docs to better match it (new logo, new header color, new font). Please note that this is not a
  change to our themes, only the look of the demos, and it won't affect your application

### BUG FIXES

* [#5242](https://github.com/bryntum/support/issues/5242) - Create styling guide for Scheduler Pro
* [#5564](https://github.com/bryntum/support/issues/5564) - Crash when drag creating with task editor open
* [#5595](https://github.com/bryntum/support/issues/5595) - Fix panel collapse icon directions

## 5.2.3 - 2022-11-17

### BUG FIXES

* [#5551](https://github.com/bryntum/support/issues/5551) - Store `allRecords` includes group footers twice

## 5.2.2 - 2022-11-08

### API CHANGES

* [DEPRECATED] The behaviour of the `store.data` getter will be changed in 6.0. Currently, it returns the **initial**
  raw dataset, in 6.0 it will be changed to have the more expected behaviour of returning the data objects for the
  **current** state instead. See Grid's upgrade guide for more information ([#5499](https://github.com/bryntum/support/issues/5499))

## 5.2.1 - 2022-10-28

### FEATURES / ENHANCEMENTS

* Documentation for `EventModel` mistakenly listed support for `effort`, related fields and functions. The concept
  currently only exists in Gantt, docs has been cleaned up. ([#5411](https://github.com/bryntum/support/issues/5411))

### BUG FIXES

* [#2605](https://github.com/bryntum/support/issues/2605) - Setting new resources to the store fails when all resources are filtered out
* [#4392](https://github.com/bryntum/support/issues/4392) - Error when using store instance in `ProjectModel` definition
* [#5149](https://github.com/bryntum/support/issues/5149) - Angular demos now use component-local styles using `ViewEncapsulation.None`
* [#5322](https://github.com/bryntum/support/issues/5322) - Getting Error "Unknown identifier ClassDefEx-1.$.startDate" when dynamically loading Data
* [#5406](https://github.com/bryntum/support/issues/5406) - `ResourceHistogram` view fails when `eventStore` config is passed
* [#5420](https://github.com/bryntum/support/issues/5420) - Exception thrown when using event tree store in `SchedulerPro`
* [#5435](https://github.com/bryntum/support/issues/5435) - Error after call `loadInlineData` with resource tree structure

## 5.2.0 - 2022-10-13

### FEATURES / ENHANCEMENTS

* Scheduler Pro has gained built-in support for segmented events, by using the new `EventSegments`,
  `EventSegmentDrag` and `EventSegmentResize` features. The features cover splitting events to segments, rendering of
  such events and individual segments dragging Please check the new `split-events` demo to see how it works
  ([#2975](https://github.com/bryntum/support/issues/2975))
* A new widget, ViewPresetCombo, is available to Scheduler, SchedulerPro and Gantt. Put it in the toolbar, and it will
  provide easy-to-setup view switching. It uses the built-in ViewPresets functionality which is easily customized
  ([#4539](https://github.com/bryntum/support/issues/4539))
* Menu has a `separator` config to make it easier to visually separate menu items
* The responsive state objects used in the `responsive` config of the `Responsive` mixin now support a `once` property
  to allow configs to only be set on first activation of the state
* The `Core.helper.DateHelper` class has a new method `formatRange` method which can format date ranges, as well as new
  formatting options for week numbers
* A new `EventNonWorkingTime` feature was added to Scheduler. When enabled in Scheduler Pro, the combined calendar for
  an event (a merge of project / resource + event calendars) is visualized by shading the parts of an event that
  intersects non-working time. Can be tried in the new `event-non-working-time` demo
* PdfExport feature is refactored to render content directly. This significantly improves performance and robustness by
  eliminating component scrolling. This behavior is enabled by default. You can revert to the old behavior by setting
  `enableDirectRendering` config on the export feature to `false` ([#4449](https://github.com/bryntum/support/issues/4449))
* `ResourceHistogram` has got a new `generateScalePoints` event that allows customizing its scale points at runtime
  ([#5025](https://github.com/bryntum/support/issues/5025))

### API CHANGES

* `EventModel` has new `ignoreResourceCalendar` boolean field. When field is set to `true` the event will not take its
  assigned resource calendars into account and will perform according to its own calendar only ([#3349](https://github.com/bryntum/support/issues/3349))

### LOCALE UPDATES

* Added localization for the new event split functionality, keys `EventSegments.splitEvent` and
  `EventSegments.renameSegment`

### BUG FIXES

* [#4096](https://github.com/bryntum/support/issues/4096) - CalendarIntervalMixin class uses hardcoded date field formats
* [#5241](https://github.com/bryntum/support/issues/5241) - Cannot reach dependency terminals for segmented events
* [#5243](https://github.com/bryntum/support/issues/5243) - Task editor too narrow in classic themes
* [#5290](https://github.com/bryntum/support/issues/5290) - Error on triggering `zoomToFit` on `ResourceHistogram`

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
* [#5352](https://github.com/bryntum/support/issues/5352) - Exception thrown when refreshing the data with event selected
* [#5372](https://github.com/bryntum/support/issues/5372) - Not able to remove events in Vertical mode

## 5.1.4 - 2022-09-29

### BUG FIXES

* [#4374](https://github.com/bryntum/support/issues/4374) - Console error if return false on preventable `beforeAdd` event on dependency store
* [#5050](https://github.com/bryntum/support/issues/5050) - Events are not rendered correctly after exporting to PDF
* [#5170](https://github.com/bryntum/support/issues/5170) - When first region has width and last region is collapsed, Scheduler Pro doesn't resize with container
* [#5196](https://github.com/bryntum/support/issues/5196) - Task editor in Scheduler Pro gets empty when opened too fast after closing
* [#5199](https://github.com/bryntum/support/issues/5199) - When `resourceTimeRanges` feature enabled description is displayed twice

## 5.1.3 - 2022-09-09

### BUG FIXES

* [#415](https://github.com/bryntum/support/issues/415) - Improve docs on formatting currency values on `NumberField`
* [#3680](https://github.com/bryntum/support/issues/3680) - Support Salesforce Winter 22 release
* [#5133](https://github.com/bryntum/support/issues/5133) - Custom layout function scope should have a reference to the scheduler

## 5.1.2 - 2022-08-29

### FEATURES / ENHANCEMENTS

* Configs that accept configuration options for a widget (or other class) are now (mostly) documented to accept a typed
  config object rather than a plain object. For example instead of `{Object} tooltip - A tooltip configuration object`,
  it is now `{TooltipConfig} tooltip - A tooltip configuration object`. This improves our TypeScript typings (transforms
  to `Partial<TooltipConfig>` in typings) when using such configs, but also improves our docs by linking to the configs
  of the type
* Added a config to allow State Tracking Manager to ignore remote changes coming in a sync response. This allows user
  to only undo/redo local changes (`ignoreRemoteChangesInSTM` config on the ProjectModel) ([#5083](https://github.com/bryntum/support/issues/5083))

### BUG FIXES

* [#4943](https://github.com/bryntum/support/issues/4943) - Changing the time by dragging an event triggering an error
* [#4965](https://github.com/bryntum/support/issues/4965) - Dependency creation still working when `readOnly` is `true`
* [#4968](https://github.com/bryntum/support/issues/4968) - `change` event doesn't fire when canceling event editor
* [#5010](https://github.com/bryntum/support/issues/5010) - Group expanders still visible after stopping grouping
* [#5017](https://github.com/bryntum/support/issues/5017) - [TypeScript] Property type is missing in `DataFieldConfig`
* [#5018](https://github.com/bryntum/support/issues/5018) - [Vue] Prop Validation fails for `String` options
* [#5028](https://github.com/bryntum/support/issues/5028) - UI does not refresh when certain fields are changed
* [#5056](https://github.com/bryntum/support/issues/5056) - Project mutes events in stores not managed by the engine

## 5.1.1 - 2022-07-28

### BUG FIXES

* [#3427](https://github.com/bryntum/support/issues/3427) - Infinite sync loop if `percentDone` value is incorrect
* [#4963](https://github.com/bryntum/support/issues/4963) - Undoing two scheduled nested events causes crash

## 5.1.0 - 2022-07-21

### FEATURES / ENHANCEMENTS

* Scheduler Pro has gained built-in support for nested events, by using a tree EventStore and the new NestedEvents
  feature. On display in the new `nested-events-configuration` and `nested-events-drag-from-grid` demos, as well as in
  the updated `nested-events` demo ([#1519](https://github.com/bryntum/support/issues/1519), [#3564](https://github.com/bryntum/support/issues/3564))
* Our TypeScript typings for string types that have a predefined set of alternatives was improved to only accept
  those alternatives. For example previously the `dock` config which was previously declared as `dock: string` is now
  `dock : 'top'|'right'|'bottom'|'left'`
* Create React App templates now available
* Configuring the crud manager functionality of the project was made a little easier by introducing shortcuts for
  setting load and sync urls using the new `loadUrl` and `syncUrl` configs
* Updated the built-in version of FontAwesome Free to `6.1.1`
* `KeyMap` is a mixin that allows for standardized and customizable keyboard shortcuts functionality. `KeyMap` is by
  default  mixed in to `Widget` and therefore available to all `Widget`'s child classes. There is a new guide
  **Guides/Customization/Keyboard shortcuts** describing how to customize currently integrated keyboard shortcuts
  ([#4300](https://github.com/bryntum/support/issues/4300), [#4313](https://github.com/bryntum/support/issues/4313), [#4328](https://github.com/bryntum/support/issues/4328))
* Project optionally allows `sync()` calls without local changes, to retrieve changes from the backend. Configure
  `forceSync : true` to enable this new behaviour ([#4575](https://github.com/bryntum/support/issues/4575))

### API CHANGES

* [BREAKING] [ANGULAR] Angular wrappers now use the more modern module bundle by default, instead of the legacy umd
  bundle. Hence application imports must be changed to match. This will slightly improve application size and
  performance ([#2786](https://github.com/bryntum/support/issues/2786))
* [BREAKING] `schedulerpro.lite.umd.js` bundle is no longer available
* [BREAKING] WebComponents has been removed from `schedulerpro.module.js` ES modules bundle. New bundle with
  WebComponents is `schedulerpro.wc.module.js`

### BUG FIXES

* [#4378](https://github.com/bryntum/support/issues/4378) - Dependencies not redrawn when rows reordered
* [#4608](https://github.com/bryntum/support/issues/4608) - Nested events ugly with scrollbars on
* [#4689](https://github.com/bryntum/support/issues/4689) - Drag creating a new event in `nested-events-drag-from-grid` should create a `container`
* [#4696](https://github.com/bryntum/support/issues/4696) - Parents sorted below children in docs
* [#4697](https://github.com/bryntum/support/issues/4697) - Too dark code background in docs
* [#4945](https://github.com/bryntum/support/issues/4945) - Dropping nested event causes crash when not constraining drag to timeline
* [#4948](https://github.com/bryntum/support/issues/4948) - `EventTooltip` buggy for nested events
* [#4955](https://github.com/bryntum/support/issues/4955) - Removing parent when nested event is selected causes crash

## 5.0.7 - 2022-07-13

### BUG FIXES

* [#4681](https://github.com/bryntum/support/issues/4681) - STM issues when using with backend
* [#4737](https://github.com/bryntum/support/issues/4737) - Paste events are not generating the assignments in the request
* [#4756](https://github.com/bryntum/support/issues/4756) - PDF export hangs trying to restore component
* [#4892](https://github.com/bryntum/support/issues/4892) - Unexpected change events after drag or resize if preamble/postamble used
* [#4916](https://github.com/bryntum/support/issues/4916) - `Fullscreen` is not working on mobile Safari
* [#4919](https://github.com/bryntum/support/issues/4919) - Engine throws exception on referencing a destroyed project

## 5.0.6 - 2022-06-20

### BUG FIXES

* [#4146](https://github.com/bryntum/support/issues/4146) - `TaskEditor` clears time when editing events with datetime picker
* [#4626](https://github.com/bryntum/support/issues/4626) - Exception when pressing enter in event editor in timeline demo
* [#4731](https://github.com/bryntum/support/issues/4731) - Reverting assignment change does not update the view
* [#4749](https://github.com/bryntum/support/issues/4749) - Assignment record for new event does not appear in project changes in task editor is disabled
* [#4778](https://github.com/bryntum/support/issues/4778) - Body mask now tracks grid resize to maintain cover of the body
* [#4808](https://github.com/bryntum/support/issues/4808) - Typings are wrong for async functions
* [#4813](https://github.com/bryntum/support/issues/4813) - Scheduling Cycle combo shows previous content on resolving next conflict

## 5.0.5 - 2022-05-30

### FEATURES / ENHANCEMENTS

* Added public `afterTaskEdit` event which is triggered at the end of the task editing after task editor is closed

### BUG FIXES

* [#4503](https://github.com/bryntum/support/issues/4503) - Returning false from `beforeTaskEdit` event breaks `autoSync`
* [#4519](https://github.com/bryntum/support/issues/4519) - `TimeAxis` stopped refreshing data after `loadInlineData` call
* [#4547](https://github.com/bryntum/support/issues/4547) - [LWC] Exception when dragging scheduler pro event on lightning tab
* [#4584](https://github.com/bryntum/support/issues/4584) - `TimeSpanHighlight`: surrounding and non-surrounding simultaneously
* [#4607](https://github.com/bryntum/support/issues/4607) - [VUE] Incorrect prop types in Vue wrapper
* [#4624](https://github.com/bryntum/support/issues/4624) - XSS security bugs
* [#4653](https://github.com/bryntum/support/issues/4653) - Event and dependency are not rendered after reverting changes made in the task editor
* [#4657](https://github.com/bryntum/support/issues/4657) - Can not navigate out of the datetime field using `Shift + Tab`
* [#4668](https://github.com/bryntum/support/issues/4668) - `StartDate` not updated with `syncDataOnLoad` and `project.load()`

## 5.0.4 - 2022-05-11

### FEATURES / ENHANCEMENTS

* The `EventCopyPaste` feature is since its inception documented as being enabled by default, but that only applied to
  the basic Scheduler, code was changed to make it enabled by default also in Scheduler Pro

### API CHANGES

* `ProjectModel` has got new `maxCalendarRange` option that allows to supporting long running projects. For more
  details, see [What's new](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/whats-new/5.0.4)
  ([#2962](https://github.com/bryntum/support/issues/2962))

### BUG FIXES

* [#4294](https://github.com/bryntum/support/issues/4294) - Not possible to reach horizontal time axis scrollbar
* [#4490](https://github.com/bryntum/support/issues/4490) - Dragging events between Scheduler Pro instances freezes
* [#4562](https://github.com/bryntum/support/issues/4562) - [REACT] React wrappers have incorrect source mapping urls
* [#4574](https://github.com/bryntum/support/issues/4574) - `highlightTimeSpans` works even though the `timeSpanHighlight` feature is disabled

## 5.0.3 - 2022-04-26

### FEATURES / ENHANCEMENTS

* Added new `examples/inline-data` demo showing assigning inline data to `SchedulerPro`
* [WRAPPERS] `ProjectModel` wrapper component reference can now be used as `project` parameter for Bryntum Scheduler Pro
  wrapper component in Angular and Vue applications ([#4238](https://github.com/bryntum/support/issues/4238))
* [WRAPPERS] Scheduler Pro has a new `ProjectModel` framework wrapper available for React, Vue and Angular. It
  simplifies sharing data between multiple Bryntum components ([#4382](https://github.com/bryntum/support/issues/4382))
* [ANGULAR] New demo showing use of inline data and `ProjectModel` wrapper. Demo located in
  `examples/frameworks/angular/inline-data` folder
* [REACT] New demo showing use of inline data and `ProjectModel` wrapper. Demo located in
  `examples/frameworks/react/javascript/inline-data` folder
* [VUE-3] New demo showing use of inline data and `ProjectModel` wrapper. Demo located in
  `examples/frameworks/vue-3/javascript/inline-data` folder
* [REACT] New basic React demo with TypeScript. Demo located in `examples/frameworks/react/typescript/basic` folder

### API CHANGES

* The `validateResponse` flag on `ProjectModel` has been changed to default to `true`. When enabled, it validates
  responses from the backend and outputs a message on console if the format isn't valid. This is helpful during the
  development phase, but can be turned off in production
* New Vue 2/3 wrapper config option `relayStoreEvents` (defaults to `false`). When set to `true`, the events fired by
  stores are relayed to the Bryntum Grid instance
* [REACT] React wrappers now include TypeScript definitions ([#3378](https://github.com/bryntum/support/issues/3378))

### BUG FIXES

* [#4031](https://github.com/bryntum/support/issues/4031) - First Redo action works incorrect
* [#4127](https://github.com/bryntum/support/issues/4127) - [LWC] `DomHelper.isInView()` throws
* [#4222](https://github.com/bryntum/support/issues/4222) - [LWC] Performance degradation in 5.0 release
* [#4432](https://github.com/bryntum/support/issues/4432) - [LWC] Mouse events do not work
* [#4439](https://github.com/bryntum/support/issues/4439) - Add public event to track task edit cancel action
* [#4461](https://github.com/bryntum/support/issues/4461) - [Vue] wrapper triggers doubled `dataChange` events with different params

## 5.0.2 - 2022-04-13

### FEATURES / ENHANCEMENTS

* The `beforeTaskEdit`, `beforeTaskSave` and `beforeTaskDelete` events triggered by the TaskEdit feature now handle
  async flows. Use async / await in your listener or return a Promise and it will be awaited before execution
  continues. Useful for example to ask for a confirmation on save etc ([#4421](https://github.com/bryntum/support/issues/4421))
* TaskEditor now offers a `blurAction` config to not reject changes when clicking outside the editor ([#4445](https://github.com/bryntum/support/issues/4445))

### BUG FIXES

* [#4049](https://github.com/bryntum/support/issues/4049) - `beforeEventEdit` does not fire on Scheduler Pro, whereas `beforeTaskEdit` does
* [#4310](https://github.com/bryntum/support/issues/4310) - Wrong console tip for Scheduler Pro
* [#4332](https://github.com/bryntum/support/issues/4332) - Crash when double clicking histogram
* [#4370](https://github.com/bryntum/support/issues/4370) - Assigning tasks to project when `syncDataOnLoad:true` results in empty `SchedulerPro`
* [#4389](https://github.com/bryntum/support/issues/4389) - Scheduler with `infiniteScroll` throws when trying to render already loaded project
* [#4406](https://github.com/bryntum/support/issues/4406) - Fixed items in disabled `fieldset`/`radiogroup` not being disabled
* [#4479](https://github.com/bryntum/support/issues/4479) - `DependencyEdit` dialog not include `fromSide`/`toSide` update into changes param of `datachange` event

## 5.0.1 - 2022-03-04

### API CHANGES

* [WRAPPERS] New `ResourceUtilization` widget wrapper available for Angular, React and Vue frameworks ([#4276](https://github.com/bryntum/support/issues/4276))

### BUG FIXES

* [#4264](https://github.com/bryntum/support/issues/4264) - Collapse / expand icons too far apart
* [#4265](https://github.com/bryntum/support/issues/4265) - Highlighted time span elements animate after zooming
* [#4266](https://github.com/bryntum/support/issues/4266) - Time span highlight elements not updated after resizing window
* [#4267](https://github.com/bryntum/support/issues/4267) - Disabling resources field breaks task editor

## 5.0.0 - 2022-02-21

* We are thrilled to announce version 5.0 of our Scheduler Pro product. This release marks a big milestone for us, after
  more than a year of development. This update makes it much easier to combine multiple Bryntum products, and also
  includes lots of new demos, an EventBuffer feature (for travel time), a ResourceUtilization widget as bug fixes and
  other enhancements requested by our community. A big thanks to our customers who helped us with testing our alpha &
  beta versions
* You are most welcome to join us on March 16th, at 9am PST (6pm CET) for a 5.0 walkthrough webinar, demonstrating all
  the shiny new features
  [Click here to register](https://us06web.zoom.us/webinar/register/5116438317103/WN_4MkExpZPQsGYNpzh1mR_Ag)
* We hope you will enjoy this release and we are looking forward to hearing your feedback of what you would like us to
  develop next

*/ Mats Bryntse, CEO @Bryntum

### FEATURES / ENHANCEMENTS

* Added a new Resource Utilization view displaying resource allocation. Please check its demo for details ([#2348](https://github.com/bryntum/support/issues/2348))
* With this release Scheduler Pro starts displaying a popup informing users of scheduling conflicts, cycles and calendar
  misconfigurations. The popup allows user to pick an appropriate resolution for the case at hand. On the data level the
  cases are indicated by new events triggered on the project ([#1264](https://github.com/bryntum/support/issues/1264), [#1265](https://github.com/bryntum/support/issues/1265))
* Scheduler Pro now performs the initial rendering of events quicker than before, by rendering them using raw data prior
  to performing calculations. Especially on large datasets this makes it feel much snappier. Requires loading normalized
  data to work optimally. Depending on how much non-UI manipulating your app does on the events the delayed calculations
  might affect your code, be sure to check out the upgrade guide ([#2251](https://github.com/bryntum/support/issues/2251))
* Each product has a new "thin" JavaScript bundle. The thin bundle only contains product specific code, letting you
  combine multiple Bryntum products without downloading the shared code multiple times (previously only possible with
  custom-built bundles from sources). Find out more in the What's new guide ([#2805](https://github.com/bryntum/support/issues/2805))
* Each theme is now available in a version that only has product specific CSS in it, called a `thin` version. These
  files are name `[product].[theme].thin.css` - `schedulerpro.stockholm.thin.css` for example. They are intended for
  using when you have multiple different bryntum products on the same page, to avoid including shared CSS multiple
  times. Read more about it in the `What's new` section in docs ([#3276](https://github.com/bryntum/support/issues/3276))
* `Model` has a new `readOnly` field that is respected by UI level editing features to disallow editing records having
  `readOnly : true`. It does not directly affect the datalayer, meaning that you can still programmatically edit the
  records ([#665](https://github.com/bryntum/support/issues/665))
* New feature - Event Buffer - which allows visualizing things like travel time ([#2822](https://github.com/bryntum/support/issues/2822))
* Manually scheduled tasks are changed to not skip non-working time for proposed start/end date values. Check the
  upgrade guide if you want to revert to the previous behaviour ([#2326](https://github.com/bryntum/support/issues/2326))
* New `drag-unplanned-tasks` which shows how to drag tasks from an external grid, and highlighting available resource
  slots in the schedule while dragging
* Scheduler Pro's event rendering now uses absolute positioning instead of translation to position the event bars. This
  was changed to make native `position: sticky` work, the `stickyEvents` feature is now very thin and more performant
  ([#4055](https://github.com/bryntum/support/issues/4055))
* New `ProjectModel` setters/getters for `assignments`, `dependencies`, `events`, `resourceTimeRanges`, `resources`,
  `timeRanges` ([#4043](https://github.com/bryntum/support/issues/4043))
* New `drag-unplanned-tasks` which shows how to drag tasks from an external grid, and highlighting available resource
  slots in the schedule while dragging
* `window` references are replaced with `globalThis` which is supported in all modern browsers and across different JS
  environments ([#4071](https://github.com/bryntum/support/issues/4071))
* You can now style `CalendarIntervals` by providing a `cls` field in their data. This makes it very easy to style non
  working time elements ([#3255](https://github.com/bryntum/support/issues/3255))
* A new function called `downloadTestCase()` was added to Bryntum widgets, it is intended to simplify creating test
  cases for reporting issues on Bryntum's support forum. Running it collects the current value for the configs your app
  is using, inlines the current dataset and compiles that into a JavaScript app that is then downloaded. The app will
  most likely require a fair amount of manual tweaking to reproduce the issue, but we are hoping it will simplify the
  process for you. Run `schedulerPro.downloadTestCase()` on the console in a demo to try it
* Updated FontAwesome Free to version 6, which includes some new icons sponsored by Bryntum in the charts category:
  https://fontawesome.com/search?m=free&c=charts-diagrams&s=solid
* When configured with a StateProvider and `stateId`, Scheduler Pro state is stored automatically as stateful properties
  change ([#1859](https://github.com/bryntum/support/issues/1859))

For more details, see [What's new](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/whats-new/5.0.0)
and [Upgrade guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/upgrades/5.0.0) in docs

### API CHANGES

* [BREAKING] React wrappers now use the more modern module bundle by default, instead of the legacy umd bundle. Hence
  application imports must be changed to match. This will slightly improve application size and performance
  ([#2787](https://github.com/bryntum/support/issues/2787))
* [BREAKING] The Engine `ResourceAllocationInfo` class `allocation` property has been changed from an `Array` to
  an`Object` with two properties `total` and `byAssignments`. The `total` property contains an array of the resource
  allocation intervals. And the `byAssignments` is a `Map` keeping individual assignment allocation intervals with
  assignments as keys and arrays of allocation intervals as values
  Please check [Upgrade guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/upgrades/5.0.0) if
  your code uses that class
* [DEPRECATED] ResourceHistogram `getBarTip` config has been deprecated in favour of new `barTooltipTemplate` config
  Please check the upgrade guide and update your code accordingly
* `DependencyModel.active` field has been changed to persisted. To revert to the old behavior
  please override the field and set its `persist` config to `false`
* Code of drag-from-grid and similar demos have been simplified and if you have used that code in your application you
  should make sure to review and update your code accordingly
* The following previously deprecated Scheduler Pro configs, functions etc. where removed:
    * Configs `hoursPerDay`, `daysPerWeek`, `daysPerWeek` from `CalendarModel` - previously moved to `ProjectModel`
    * Config `TaskEdit#showDeleteButtton` - previously replaced by `editorConfig`
    * Config `TaskEdit#extraItems` - previously replaced by `items`
    * Config `TaskEdit#tabsConfig` - previously replaced by `items`
    * Function `ProjectModel#propagate()` - previously replaced by `commitAsync()`
    * Event `SchedulerPro#beforeExport` - in favor of `beforePdfExport` event
    * Event `SchedulerPro#export` - in favor of `pdfExport` event

### BUG FIXES

* [#3985](https://github.com/bryntum/support/issues/3985) - Timeline time axis header not visible
* [#4144](https://github.com/bryntum/support/issues/4144) - Big data example - Console error after open TaskEditor if 10k events loaded
* [#4156](https://github.com/bryntum/support/issues/4156) - Duplicate assignment Event error when assign resource in Maps demo
* [#4203](https://github.com/bryntum/support/issues/4203) - Big dataset demo broken
* [#4235](https://github.com/bryntum/support/issues/4235) - Wrong start date after copy pasting event

## 4.3.9 - 2022-02-17

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 4.3.8 - 2022-02-07

### BUG FIXES

* [#4100](https://github.com/bryntum/support/issues/4100) - `DependencyStore` does not sync when updating dependency

## 4.3.7 - 2022-02-02

### API CHANGES

* [DEPRECATED] SchedulerPro `beforeExport` and `export` events (triggered by `PdfExport` feature) were deprecated
  in favor of the `beforePdfExport` and `pdfExport` events respectively. The old events names will be dropped in v5.0.0

### BUG FIXES

* [#4012](https://github.com/bryntum/support/issues/4012) - Unexpected scheduling conflict
* [#4082](https://github.com/bryntum/support/issues/4082) - Relayed listeners do not trigger onFunctions

## 4.3.6 - 2022-01-13

### BUG FIXES

* [#3788](https://github.com/bryntum/support/issues/3788) - Minimum value for duration field in Task Editor works incorrect
* [#3835](https://github.com/bryntum/support/issues/3835) - Scheduler Pro task edit resources combo store filter reset on value change
* [#3990](https://github.com/bryntum/support/issues/3990) - Chrome & Content Security Policy causes failure because of debug code section

## 4.3.5 - 2021-12-24

### BUG FIXES

* [#3896](https://github.com/bryntum/support/issues/3896) - [TypeScript] Wrong typings of model class configs
* [#3907](https://github.com/bryntum/support/issues/3907) - [TypeScript] Cannot pass Scheduler instance to `Store.relayAll`
* [#3928](https://github.com/bryntum/support/issues/3928) - DateHelper `k` format behaves incorrectly

## 4.3.4 - 2021-12-13

### FEATURES / ENHANCEMENTS

* Updated `resource-histogram` Angular demo to use Angular 13 ([#3742](https://github.com/bryntum/support/issues/3742))

### BUG FIXES

* [#3621](https://github.com/bryntum/support/issues/3621) - [TypeScript] Improve typings of mixins
* [#3759](https://github.com/bryntum/support/issues/3759) - Touch drag starts event drag creation
* [#3850](https://github.com/bryntum/support/issues/3850) - [TypeScript] Missing static properties in typings
* [#3852](https://github.com/bryntum/support/issues/3852) - Crash if zooming while hovering event resize handle

## 4.3.3 - 2021-11-30

### BUG FIXES

* [#3532](https://github.com/bryntum/support/issues/3532) - Performance issues when resize events for big data apps
* [#3648](https://github.com/bryntum/support/issues/3648) - [DOCS] Content navigation is broken
* [#3668](https://github.com/bryntum/support/issues/3668) - Map demo resets `timeSpan` bounds to 1 work day instead of using user defined start/end dates
* [#3691](https://github.com/bryntum/support/issues/3691) - Resource Histogram renders empty initially
* [#3743](https://github.com/bryntum/support/issues/3743) - [DOCS] `web.config` file for Windows IIS server

## 4.3.2 - 2021-10-29

### FEATURES / ENHANCEMENTS

* `EventCopyPaste` feature now fires `beforeCopy` and `beforePaste` events to let you prevent the actions ([#3303](https://github.com/bryntum/support/issues/3303))

## 4.3.1 - 2021-10-21

### FEATURES / ENHANCEMENTS

* ProjectModel now has a `resetUndoRedoQueuesAfterLoad` flag to optionally clear undo / redo queues
* Bumped builtin Font Awesome Free to version 5.15.4

### BUG FIXES

* [#3539](https://github.com/bryntum/support/issues/3539) - Resource time ranges are not rendered for initially invisible resource rows
* [#3560](https://github.com/bryntum/support/issues/3560) - Timeline demo is rendered with visual artifacts in chrome
* [#3567](https://github.com/bryntum/support/issues/3567) - Minified css bundle contains unicode chars
* [#3579](https://github.com/bryntum/support/issues/3579) - Crash when combining `resourceTimeRanges` and `eventRenderer` with custom content

## 4.3.0 - 2021-10-12

### FEATURES / ENHANCEMENTS

* `ResourceHistogram` now supports resource grouping. It displays the aggregated resources allocation on the group level
  ([#2608](https://github.com/bryntum/support/issues/2608))
* Events can be grouped or manually positioned inside the row. See this demonstrated in the
  new `examples/custom-layouts` demo ([#1854](https://github.com/bryntum/support/issues/1854))

### API CHANGES

* `TimeAxisColumn` now subclasses `WidgetColumn` (before it was a `Column`), this should not affect your code. This
  opens up for rendering widgets embedded in row cells, see this demonstrated in the new `examples/embedded-chart`
  example
* [DEPRECATED] Buttons `menuIconCls` config was deprecated in favor of the new `menuIcon` config, which better matches
  the naming of other configs

## 4.2.7 - 2021-10-01

### BUG FIXES

* [#2284](https://github.com/bryntum/support/issues/2284) - Gantt should support disabling the calculation engine
* [#3166](https://github.com/bryntum/support/issues/3166) - Dependency editor Lag field does not use `dependency.lagUnit` value
* [#3411](https://github.com/bryntum/support/issues/3411) - Noticeable delay before new event is seen when drag creating in big data set scenario
* [#3428](https://github.com/bryntum/support/issues/3428) - `dataChange` event does not fire on SchedulerPro
* [#3458](https://github.com/bryntum/support/issues/3458) - Document nested fields
* [#3471](https://github.com/bryntum/support/issues/3471) - Crash when finalizing drop async on a group header row

## 4.2.6 - 2021-09-15

### FEATURES / ENHANCEMENTS

* The ResourceNonWorkingTime elements are no longer focusable/interfering with tab navigation ([#3391](https://github.com/bryntum/support/issues/3391))

### BUG FIXES

* [#3384](https://github.com/bryntum/support/issues/3384) - Error when loading inline data twice on the same schedule
* [#3408](https://github.com/bryntum/support/issues/3408) - Updated typings to support spread operator for method parameters

## 4.2.5 - 2021-09-08

### FEATURES / ENHANCEMENTS

* Added `schedulerpro.node.mjs` and `schedulerpro.node.cjs` bundles without UI components for Node.js environment
  compatibility ([#3224](https://github.com/bryntum/support/issues/3224))
* ProjectModel now fires a `dataReady` event when the engine has finished its calculations and the result has been
  written back to the records ([#2019](https://github.com/bryntum/support/issues/2019))
* The API documentation now better communicates when a field or property accepts multiple input types but uses a single
  type for output. For example date fields on models, which usually accepts a `String` or `Date` but always outputs a
  `Date` ([#2933](https://github.com/bryntum/support/issues/2933))

### BUG FIXES

* [#3313](https://github.com/bryntum/support/issues/3313) - Allow `String`, `String[]` and `Object` in `cls` getter for subclassing `EventModel`
* [#3322](https://github.com/bryntum/support/issues/3322) - Add `dataChange` event to framework guides
* [#3343](https://github.com/bryntum/support/issues/3343) - Scrolling Scheduler Pro while dragging from outside does not resolve correct resource record
* [#3358](https://github.com/bryntum/support/issues/3358) - Event gets broken after quick drag create

## 4.2.4 - 2021-08-27

### BUG FIXES

* [#1432](https://github.com/bryntum/support/issues/1432) - Scheduler doesn't take DST into account for event duration
* [#2906](https://github.com/bryntum/support/issues/2906) - Labels are visible on non working time entries
* [#2971](https://github.com/bryntum/support/issues/2971) - ResourceTimeRangeStore updates not tracked by STM
* [#3116](https://github.com/bryntum/support/issues/3116) - Gantt throws on task terminal drag
* [#3265](https://github.com/bryntum/support/issues/3265) - Docs are not scrolled to the referenced member
* [#3295](https://github.com/bryntum/support/issues/3295) - Sync requests triggered during drag-create
* [#3305](https://github.com/bryntum/support/issues/3305) - Guides look bad in the docs search results
* [#3306](https://github.com/bryntum/support/issues/3306) - Doc browser does not scroll to member
* [#3319](https://github.com/bryntum/support/issues/3319) - Should not show event editor when double clicking nonworking time range
* [#3320](https://github.com/bryntum/support/issues/3320) - Non working resource time ranges removed after double clicking to create a new event

## 4.2.3 - 2021-08-05

### FEATURES / ENHANCEMENTS

* Project can now log warnings to the browser console when it detects an unexpected response format. To enable these
  checks please use the `validateResponse` config ([#2668](https://github.com/bryntum/support/issues/2668))
* [NPM] Bryntum Npm server now supports remote private repository access for Artifactory with username and password
  authentication ([#2864](https://github.com/bryntum/support/issues/2864))
* [TYPINGS] Type definitions now contain typed `features` configs and properties ([#2740](https://github.com/bryntum/support/issues/2740))

### API CHANGES

* [DEPRECATED] PdfExport feature `export` event is deprecated and will be removed in 4.3.0. Use `export` event on the
  SchedulerPro instead
* [DEPRECATED] SchedulerPro `beforeExport` event signature is deprecated and will be removed in 4.3.0. New signature
  wraps config object to the corresponding key

### BUG FIXES

* [#1727](https://github.com/bryntum/support/issues/1727) - Error when drag event over the histogram
* [#3116](https://github.com/bryntum/support/issues/3116) - Gantt throws on task terminal drag
* [#3182](https://github.com/bryntum/support/issues/3182) - Create React version of drag-batches example
* [#3191](https://github.com/bryntum/support/issues/3191) - New event misrendered when drag creating
* [#3203](https://github.com/bryntum/support/issues/3203) - Crud Manager not sending assignment record

## 4.2.2 - 2021-07-21

### FEATURES / ENHANCEMENTS

* [NPM] Bryntum Npm server now supports `npm token` command for managing access tokens for CI/CD ([#2703](https://github.com/bryntum/support/issues/2703))

### BUG FIXES

* [#3167](https://github.com/bryntum/support/issues/3167) - LWC bundle is missing from trial packages
* [#3178](https://github.com/bryntum/support/issues/3178) - Syntax highlighter messes up code snippets in docs
* [#3190](https://github.com/bryntum/support/issues/3190) - Crash when drag creating in SchedulerPro partnered with Gantt

## 4.2.1 - 2021-07-07

### FEATURES / ENHANCEMENTS

* [FRAMEWORKS] Added `scheduleContextFeature` to frameworks wrappers ([#3135](https://github.com/bryntum/support/issues/3135))

### BUG FIXES

* [#3117](https://github.com/bryntum/support/issues/3117) - Improve the docs to show how to access `eventRecord` in `beforeShow` listener
* [#3136](https://github.com/bryntum/support/issues/3136) - [NPM] Running `npm install` twice creates modified `package-lock.json` file
* [#3139](https://github.com/bryntum/support/issues/3139) - Support `on` and `un` methods for `eventTooltip` feature instance

## 4.2.0 - 2021-06-30

### FEATURES / ENHANCEMENTS

* Scheduler Pro has a new config option `infiniteScroll` meaning that as the user scrolls the timeline back or forward
  in time, the "window" of time encapsulated by the TimeAxis is moved ([#1114](https://github.com/bryntum/support/issues/1114))
* The `EventResize` feature now uses the task's data to change the appearance by updating `endDate` or `startDate` live
  but in batched mode so that the changes are not propagated until the operation is finished. ([#2541](https://github.com/bryntum/support/issues/2541))
* Dependencies can now be created by dropping on the target event without hitting the terminal circle element. The
  defaultValue of the DependencyModel `type` field will be used in this case. ([#3003](https://github.com/bryntum/support/issues/3003))
* Dependency creation can now be finalized asynchronously, for example after showing the user a confirmation dialog
* For more details, see [What's new](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/whats-new/4.2.0)
  and [Upgrade guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/upgrades/4.2.0) in docs

### API CHANGES

* [DEPRECATED] The `resources` param of the `beforeEventAdd` event fired by SchedulerPro was renamed
  to `resourceRecords` and will be removed in 5.0

### LOCALE UPDATES

* `removeRows` label of CellMenu & GridBase was removed
* Value of `removeRow` label of CellMenu & GridBase was updated to say just 'Remove'
* RowCopyPaste locales were updated to just say 'Copy', 'Cut' & 'Paste'. `copyRows`, `cutRows` & `pasteRows` keys were
  removed
* EventCopyPaste locales were updated to just say 'Copy', 'Cut' & 'Paste'. `copyRows`, `cutRows` & `pasteRows` keys were
  removed

### BUG FIXES

* [#3075](https://github.com/bryntum/support/issues/3075) - Task editor behaviour changed after drag create

## 4.1.6 - 2021-06-23

### FEATURES / ENHANCEMENTS

* TaskEdit has a new `scrollIntoView` boolean config allowing to opt-out of scrolling the task being edited into view
  ([#997](https://github.com/bryntum/support/issues/997))

### BUG FIXES

* [#3005](https://github.com/bryntum/support/issues/3005) - [VUE-3] Problem with Critical Paths due to Vue Proxy and double native events firing bug
* [#3026](https://github.com/bryntum/support/issues/3026) - [VUE-2] and [VUE-3] typescript type declarations are missing

## 4.1.5 - 2021-06-09

### FEATURES / ENHANCEMENTS

* Scheduler Pro now has a `minHeight` of `10em` by default. This assures that the Scheduler Pro will get a size even if
  no other sizing rules are applied for the element it is rendered to. When the default `minHeight` is driving the
  height, a warning is shown on the console to let the dev know that sizing rules are missing. The warning is not shown
  if a `minHeight` is explicitly configured ([#2915](https://github.com/bryntum/support/issues/2915))
* [TYPINGS] API singleton classes are correctly exported to typings ([#2752](https://github.com/bryntum/support/issues/2752))

### BUG FIXES

* [#674](https://github.com/bryntum/support/issues/674) - Setting field value or visibility does not work in beforeTaskEditShow when field has "name" property
  specified
* [#2889](https://github.com/bryntum/support/issues/2889) - [ANGULAR] Project model event listeners do not fire on production angular build
* [#2990](https://github.com/bryntum/support/issues/2990) - [ANGULAR] Preventable async events don't work
* [#2991](https://github.com/bryntum/support/issues/2991) - Events disappear after scrolling

## 4.1.4 - 2021-05-28

### FEATURES / ENHANCEMENTS

* TypeScript definitions updated to use typed `Partial<>` parameters where available
* Buttons now has a new style `b-transparent` that renders them without background or borders ([#2853](https://github.com/bryntum/support/issues/2853))
* [NPM] repository package `@bryntum/schedulerpro` now includes source code ([#2723](https://github.com/bryntum/support/issues/2723))
* [NPM] repository package `@bryntum/schedulerpro` now includes minified versions of bundles ([#2842](https://github.com/bryntum/support/issues/2842))
* [FRAMEWORKS] Frameworks demos packages dependencies updated to support Node v12

### BUG FIXES

* [#2104](https://github.com/bryntum/support/issues/2104) - "Core" code not isomorphic
* [#2691](https://github.com/bryntum/support/issues/2691) - Docs for ResourceNonWorkingTime feature
* [#2828](https://github.com/bryntum/support/issues/2828) - Memory leak when replacing project instance
* [#2834](https://github.com/bryntum/support/issues/2834) - Core should not use b-fa for icon prefix
* [#2858](https://github.com/bryntum/support/issues/2858) - Crash when reloading project if groups are collapsed
* [#2865](https://github.com/bryntum/support/issues/2865) - CrudManager should disable autoSync / autoLoad for all its stores
* [#2885](https://github.com/bryntum/support/issues/2885) - Fast switching tabs in TaskEditor is shows blank tab

## 4.1.3 - 2021-05-13

### FEATURES / ENHANCEMENTS

* Percent Bar feature allows to use a custom field instead of percentDone ([#2739](https://github.com/bryntum/support/issues/2739))
* Bumped the built-in version of FontAwesome Free to 5.15.3 and added missing imports to allow stacked icons etc
* Bumped the `@babel/preset-env` config target to `chrome: 75` for the UMD and Module bundles. This decreased bundle
  sizes and improved performance for modern browsers
* Updated Angular Wrappers to be compatible with Angular 6-7 in production mode for target `es2015`

### API CHANGES

* Scheduler Pro's locales have a new `GanttTaskEditor` entry. It defines the width of the task editor when using Gantt's
  editor with Scheduler Pro ([#2789](https://github.com/bryntum/support/issues/2789))
* [DEPRECATED] EventDrag#dragTipTemplate was renamed to `tooltipTemplate` to better match the naming scheme of other
  features

### BUG FIXES

* [#2665](https://github.com/bryntum/support/issues/2665) - Timeline does not render events when used as container item
* [#2745](https://github.com/bryntum/support/issues/2745) - Vue 3 demo crashes when clicking left-most checkbox in tbar
* [#2778](https://github.com/bryntum/support/issues/2778) - Wrong module declaration in typings file
* [#2810](https://github.com/bryntum/support/issues/2810) - PercentBar feature cannot be disabled
* [#2820](https://github.com/bryntum/support/issues/2820) - Loading SchedulerPro styles to a Calendar demo breaks it
* [#2859](https://github.com/bryntum/support/issues/2859) - Drag feature does not update the element when drag is finalized async

## 4.1.2 - 2021-04-27

### BUG FIXES

* [#2735](https://github.com/bryntum/support/issues/2735) - Exception when resizing event with disabled dependencies feature in scheduler pro
* [#2746](https://github.com/bryntum/support/issues/2746) - Deleting predecessor in task editor should put focus back on a row/cell
* [#2761](https://github.com/bryntum/support/issues/2761) - Task editor padding missing

## 4.1.1 - 2021-04-23

### API CHANGES

* ResourceNonWorkingTime feature now has a `maxTimeAxisUnit` config to define at what time axis resolution to stop
  drawing non-working time. Defaults to 'hour', meaning when you zoom out to day view or greater the non-working
  elements will not be painted. The feature also supports configuring the Model class to use for the non-working time
  records, via `resourceTimeRangeModelClass`

### BUG FIXES

* [#2138](https://github.com/bryntum/support/issues/2138) - ResourceHistogram is not refreshed after inline data reset and load again
* [#2257](https://github.com/bryntum/support/issues/2257) - ScaleColumn of ResourceHistogram widget should be configurable
* [#2488](https://github.com/bryntum/support/issues/2488) - TaskEditor tab configuration in beforeTaskEditShow does not work correct
* [#2493](https://github.com/bryntum/support/issues/2493) - GeneralTab defines the height of the TaskEditor
* [#2606](https://github.com/bryntum/support/issues/2606) - SchedulerPro doesn't refresh events
* [#2632](https://github.com/bryntum/support/issues/2632) - Resource non-working time should not be drawn when zoomed out
* [#2636](https://github.com/bryntum/support/issues/2636) - [WRAPPERS] Features are not updated at runtime
* [#2649](https://github.com/bryntum/support/issues/2649) - Timeline should not force flex value
* [#2679](https://github.com/bryntum/support/issues/2679) - on-owner events should be added to owner too in docs
* [#2681](https://github.com/bryntum/support/issues/2681) - Yarn. Package trial alias can not be installed
* [#2697](https://github.com/bryntum/support/issues/2697) - Should be possible to select only single resource

## 4.1.0 - 2021-04-02

### FEATURES / ENHANCEMENTS

* We are happy to announce that Bryntum Scheduler Pro now can be directly installed using our npm registry
  We've updated all our frameworks demos to use `@bryntum` npm packages. See them in `examples/frameworks` folder
  Please refer to "Npm packages" guide in docs for registry login and usage information
* ProjectModel now exposes a `changes` property returning an object with the current changes in its stores
* Bryntum demos were updated with XSS protection code. `StringHelper.encodeHtml` and `StringHelper.xss` functions were
  used for this
* Added new Vue Cell Renderer demo to show Vue Components as cell renderers (Partially fixed [#946](https://github.com/bryntum/support/issues/946) - Vue: Support
  components in renderers)
* Added new React 17 demo for Scheduler with Timeline widget. The example also implements theme switching ([#1823](https://github.com/bryntum/support/issues/1823)
  and [#2213](https://github.com/bryntum/support/issues/2213))
* A new custom element was added to use the SchedulerPro inside a web component. See the new webcomponents demo for
  reference
* Added new Vue 3 demo of Scheduler Pro partnered with Resource histogram ([#1315](https://github.com/bryntum/support/issues/1315))
* Added new "Scheduler Pro event scheduling" guide describing events scheduling logic ([#2268](https://github.com/bryntum/support/issues/2268))

### API CHANGES

* [BREAKING] Removed RequireJS demos and integration guides in favor of modern ES6 Modules technology ([#1963](https://github.com/bryntum/support/issues/1963))
* [BREAKING] `init` method is no longer required in Lightning Web Components and was removed from the LWC bundle
* [DEPRECATED] In the `DependencyCreation` feature, the `data` param of all events was deprecated. All events now have
  useful documented top level params

### BUG FIXES

* [#655](https://github.com/bryntum/support/issues/655) - Cell editor misaligned if row grows as a result of cell edit
* [#695](https://github.com/bryntum/support/issues/695) - Dependency line not redrawn during resize
* [#1525](https://github.com/bryntum/support/issues/1525) - Improve Localization guide
* [#1893](https://github.com/bryntum/support/issues/1893) - [REACT] JSX renderer not supported for TreeColumn
* [#2088](https://github.com/bryntum/support/issues/2088) - Error in ResourceInfoColumn after reload inline data
* [#2211](https://github.com/bryntum/support/issues/2211) - Add test coverage for XSS
* [#2264](https://github.com/bryntum/support/issues/2264) - ResourceHistogram column header menu does not work when a feature specified
* [#2359](https://github.com/bryntum/support/issues/2359) - Update readme files in all framework demos in all products
* [#2379](https://github.com/bryntum/support/issues/2379) - Add minified version of *.lite.umd.js to the bundle
* [#2437](https://github.com/bryntum/support/issues/2437) - Demo styling issues
* [#2441](https://github.com/bryntum/support/issues/2441) - Demo control sizes and styling issues
* [#2549](https://github.com/bryntum/support/issues/2549) - Reacts timeline demo is fixed height
* [#2559](https://github.com/bryntum/support/issues/2559) - Resource Histogram demo in Vue is misconfigured

## 4.0.8 - 2021-01-27

### FEATURES / ENHANCEMENTS

* Project (Crud Manager) now supports less strict `sync` response format allowing to respond only server side changes
  See `supportShortSyncResponse` config for details

### API CHANGES

* [BREAKING] Project (Crud Manager) default behaviour has been changed to allow `sync` response to include only
  server-side changes
  Previously it was mandatory to mention each updated/removed record in the response to confirm the changes
  With this release the project automatically confirms changes of all updated/removed records mentioned in
  corresponding request
  To revert to previous strict behaviour please use `supportShortSyncResponse` config

### BUG FIXES

* [#1814](https://github.com/bryntum/support/issues/1814) - Summaries not updating correctly with Angular wrapper
* [#1865](https://github.com/bryntum/support/issues/1865) - Pro Nested events demo bugs

## 4.0.7 - 2021-01-12

### BUG FIXES

* [#2197](https://github.com/bryntum/support/issues/2197) - Broken styles in React demos

## 4.0.6 - 2020-12-29

### BUG FIXES

* [#2110](https://github.com/bryntum/support/issues/2110) - allowOverlap not working
* [#2146](https://github.com/bryntum/support/issues/2146) - enableProgressNotifications should be documented

## 4.0.5 - 2020-12-15

### FEATURES / ENHANCEMENTS

* You can now change partnership of Scheduler panels at runtime using `addPartner` / `removePartner` APIs ([#2042](https://github.com/bryntum/support/issues/2042))

### BUG FIXES

* [#2082](https://github.com/bryntum/support/issues/2082) - Not possible to configure a config object or Tooltip instance as EventResize#tip

## 4.0.4 - 2020-12-09

### FEATURES / ENHANCEMENTS

* A new config `discardPortals` on the React wrapper, that controls the behaviour of cell renderers using React
  components. Set to `false` (default) to enhance performance. Set to `true` to limit memory consumption
* A new Scheduler feature `StickyEvents` enables the textual content of event bars
  to "stick" within the scrolling viewport until the event itself is out of view. ([#390](https://github.com/bryntum/support/issues/390))

### API CHANGES

* [DEPRECATED] The `showDeleteButton` config on the TaskEdit feature was deprecated in favor of the `items` config
  ([#1526](https://github.com/bryntum/support/issues/1526))

### BUG FIXES

* [#1717](https://github.com/bryntum/support/issues/1717) - Dependency tabs bbar buttons lack height
* [#1812](https://github.com/bryntum/support/issues/1812) - Make tables look better in docs
* [#1869](https://github.com/bryntum/support/issues/1869) - Very low performance of React cell renderers
* [#1962](https://github.com/bryntum/support/issues/1962) - Dependencies are not refreshed when replace resources

## 4.0.3 - 2020-11-17

### FEATURES / ENHANCEMENTS

* `schedulerpro.umd.js` and `schedulerpro.lite.umd.js` bundles are now compiled with up-to-date `@babel/preset-env`
  webpack preset with no extra polyfilling. This change decreases size for the bundle by ~20% and offers performance
  enhancements for supported browsers
* [DEPRECATED] `schedulerpro.lite.umd.js` was deprecated in favor of `schedulerpro.umd.js` and will be removed in
  version 5.0

### BUG FIXES

* [#1681](https://github.com/bryntum/support/issues/1681) - React applications are compiled with patched `react-scripts` presets. Check
  `examples/frameworks/npm/react/readme.md` for more information
* [#1743](https://github.com/bryntum/support/issues/1743) - No way to drag outer event if it's 100% full of subtasks

## 4.0.2 - 2020-11-04

### BUG FIXES

* [#724](https://github.com/bryntum/support/issues/724) - Not possible to shift event -1d if it starts after a non-working day

## 4.0.1 - 2020-11-03

### BUG FIXES

* Fixed minor bugs

## 4.0.0 - 2020-10-19

### FEATURES / ENHANCEMENTS

* Added Bryntum Scheduler Pro with Timeline widget demo
* Added Pro example with draggable nested events ([#889](https://github.com/bryntum/support/issues/889))
* Scheduler Pro now extends `Panel` instead of `Container`. This allows you to easily add toolbars to it ([#1417](https://github.com/bryntum/support/issues/1417))
* Added Bryntum Scheduler Pro example for Ext JS modern framework ([#1471](https://github.com/bryntum/support/issues/1471))
* Added a new powerful MapboxGL JS integration demo, see examples/maps ([#1476](https://github.com/bryntum/support/issues/1476))
* Added `schedulerpro.lite.umd.js` module that does not include `Promise` polyfill. This module is primarily intended to
  be used with Angular to prevent `zone.js` polyfills overwrite
* Added experimental support for Salesforce Locking Service ([#359](https://github.com/bryntum/support/issues/359)). The distributed bundle only supports modern
  browsers (no IE11 or non-chromium based Edge), since Salesforce drops support for these in January 1st 2021 too
* Added Lightning Web Component demo, see `examples/salesforce/src/lwc`

### API CHANGES

* [BREAKING] Dropped Support for Edge 18 and older. Our Edge <=18 fixes are still in place and active, but we will not
  be adding more fixes. Existing fixes will be removed in a later version
* [BREAKING] The `Default`, `Light` and `Dark` themes were renamed to `Classic`, `Classic-Light` and `Classic-Dark`
  This change highlights the fact that they are variations of the same theme, and that it is not the default theme
  (Stockholm is our default theme since version 2.0 of Grid)
* `TaskModel.calendar` property behavior has been changed. Now it returns the task own calendar only (so it could be
  `null` if the task has no own calendar specified). To get the effective calendar used by the task please use
  `TaskModel.effectiveCalendar` which refers to the actual calendar used by the task (either the task own calendar if
  provided or the project calendar)
* Model fields in derived classes are now merged with corresponding model fields (by name) in super classes. This allows
  serialization and other attributes to be inherited when a derived class only wants to change the `defaultValue` or
  other attribute of the field
* The `dateFormat` config for `type='date'` model fields has been simplified to `format`
* Propagation caused by data loading has been changed and now supports two alternative ways (fixed [#1346](https://github.com/bryntum/support/issues/1346))
  The changes happened due to the propagation are applied either:
  1. silently: no store `change`/`update` events are triggered, records aren't modified after the propagation. This mode
     is used by default
  2. not silently: store `change`/`update` events are triggered, records are modified after the propagation
  Please check project `silenceInitialCommit` config for details
* Scheduler Pros "main" stores (EventStore, ResourceStore, AssignmentStore and DependencyStore) has had their event
  triggering modified to make sure data is in a calculated state when relevant events are triggered. This affects the
  timing of the `add`, `remove`, `removeAll`, `change` and `refresh` events. Please see the upgrade guide for more
  information ([#1486](https://github.com/bryntum/support/issues/1486))

### BUG FIXES

* [#639](https://github.com/bryntum/support/issues/639) - Toggling working time on and off does not redraw
* [#1140](https://github.com/bryntum/support/issues/1140) - taskEdit feature ignores width defined in editorConfig
* [#1249](https://github.com/bryntum/support/issues/1249) - Columns lines are not exported correctly
* [#1252](https://github.com/bryntum/support/issues/1252) - Adding predecessor removes dependency line to the successor
* [#1272](https://github.com/bryntum/support/issues/1272) - Crash when removing all resources
* [#1289](https://github.com/bryntum/support/issues/1289) - TaskEdit confirmDelete dialog doesn't support localization
* [#1313](https://github.com/bryntum/support/issues/1313) - Grouping feature throws in Scheduler Pro Resource Histogram demo
* [#1330](https://github.com/bryntum/support/issues/1330) - Event takes significant time to appear after scroll
* [#1439](https://github.com/bryntum/support/issues/1439) - Editor not shown after drag create
* [#1442](https://github.com/bryntum/support/issues/1442) - Invalid resize not reverted
* [#1461](https://github.com/bryntum/support/issues/1461) - Overlapping events styling broken
* [#1470](https://github.com/bryntum/support/issues/1470) - Replacing dataset is very slow
* [#1472](https://github.com/bryntum/support/issues/1472) - Task Editor items of two separate Scheduler Pro instances have implicit impact on each other
* [#1503](https://github.com/bryntum/support/issues/1503) - Cancelling editing of a newly added event should remove it
* [#1506](https://github.com/bryntum/support/issues/1506) - Task tooltip should not show while task editor is open
* [#1521](https://github.com/bryntum/support/issues/1521) - Resource grouping issues
* [#1538](https://github.com/bryntum/support/issues/1538) - Drag create does not respect start+end date of the drag if Event model has a default duration set
* [#1549](https://github.com/bryntum/support/issues/1549) - SchedulerPro summary feature not working
* [#1548](https://github.com/bryntum/support/issues/1548) - [ANGULAR] Investigate zone.js loading order and set it to Angular default
* [#1569](https://github.com/bryntum/support/issues/1569) - Mapping for date on nestedData doesn't work
* [#1611](https://github.com/bryntum/support/issues/1611) - Not possible to select text in Task Editor name field in Firefox
* [#1613](https://github.com/bryntum/support/issues/1613) - Tasks flicker on initial load in Firefox
* [#1622](https://github.com/bryntum/support/issues/1622) - Dependencies are drawn to unassigned events
* [#1635](https://github.com/bryntum/support/issues/1635) - Dragging task outside the timeline and back into the schedule causes a crash
* [#1659](https://github.com/bryntum/support/issues/1659) - TaskEditor demo does not remove warning icon after update
* [#1645](https://github.com/bryntum/support/issues/1645) - Angular example throws an error on expired trial version
* [#1654](https://github.com/bryntum/support/issues/1654) - autoSync doesn't send assignment data
* [#1655](https://github.com/bryntum/support/issues/1655) - autoSync keep trying to sync
* [#1668](https://github.com/bryntum/support/issues/1668) - Crash if adding features config to Timeline config object
* [#1670](https://github.com/bryntum/support/issues/1670) - Event Editor fails to initialize resource field after editing multi assigned event

## 1.0.2 - 2020-07-24

### FEATURES / ENHANCEMENTS

* Added Angular, React and Vue wrappers for Scheduler Pro and Histogram + demos. [#787](https://github.com/bryntum/support/issues/787)

### API CHANGES

* Localization moved from `SchedulerProCommon` to `DependencyType`

### BUG FIXES

* [#797](https://github.com/bryntum/support/issues/797) - View breaks after zooming out few times then clicking work time button
* [#906](https://github.com/bryntum/support/issues/906) - When select event and press enter the event editor doesn't open
* [#956](https://github.com/bryntum/support/issues/956) - Crash when clicking Add button in React basic demo
* [#1041](https://github.com/bryntum/support/issues/1041) - Changing calendar does not redraw events
* [#1084](https://github.com/bryntum/support/issues/1084) - Resource non working time only drawn for initial time span

## 1.0.1 - 2020-05-12

### BUG FIXES

* [#746](https://github.com/bryntum/support/issues/746) - Histogram doesn't track visible timespan changes

## 1.0.0-ga - 2020-05-07

* It is with great pleasure we announce the 1.0 version of the Bryntum Scheduler Pro – our brand new product
  combining the visualisation capabilities of the Bryntum Scheduler with the scheduling engine of the Bryntum Gantt
  The result is a very powerful scheduling tool, which utilises Gantt data structures to reschedule successor
  tasks while respecting constraints, dependencies and calendars. A typical use case is a Manufacturing Execution
  System (MES) where staff have defined shifts, machines need downtime for maintenance / repair and tasks are
  recurring and inter-dependent

### FEATURES / ENHANCEMENTS

* Added histogram widget + demo
* Added new `pro-drag-from-grid` demo

### API CHANGES

* BREAKING: Method `isValid` of the DependencyBaseModel is now a getter

### BUG FIXES

* [#586](https://github.com/bryntum/support/issues/586) - Histogram demo needs to show weekends
* [#599](https://github.com/bryntum/support/issues/599) - Vertical view broken in dragfromgrid demo
* [#601](https://github.com/bryntum/support/issues/601) - Drag-onto-tasks event styling a bit broken
* [#602](https://github.com/bryntum/support/issues/602) - Events are not updated when resource color is changed
* [#604](https://github.com/bryntum/support/issues/604) - Crash after removing resource in task editor and assigning new one
* [#605](https://github.com/bryntum/support/issues/605) - Dependencies not redrawn correctly when unassigning
* [#607](https://github.com/bryntum/support/issues/607) - Progress bar is missing on event
* [#611](https://github.com/bryntum/support/issues/611) - Wrong milestone styling in multi summary demo
* [#615](https://github.com/bryntum/support/issues/615) - Major column lines are not updated correctly
* [#616](https://github.com/bryntum/support/issues/616) - Unintentional header on event tooltips
* [#617](https://github.com/bryntum/support/issues/617) - Column lines out of alignment on timeaxis demo
* [#619](https://github.com/bryntum/support/issues/619) - Custom event styling broken in tasks demo
* [#622](https://github.com/bryntum/support/issues/622) - Dependencies not working in bigdataset demo
* [#625](https://github.com/bryntum/support/issues/625) - Wrong event styling in eventeditor demo
* [#629](https://github.com/bryntum/support/issues/629) - Unreadable text in `Fill ticks` demo
* [#633](https://github.com/bryntum/support/issues/633) - Nested events styling broken
* [#635](https://github.com/bryntum/support/issues/635) - Events disappear when toggling other node
* [#637](https://github.com/bryntum/support/issues/637) - Wrong event styling in validation dem
* [#646](https://github.com/bryntum/support/issues/646) - View is not updated when cancelling changes from task editor
* [#647](https://github.com/bryntum/support/issues/647) - Crash when double clicking to create new event while task editor is visible
* [#650](https://github.com/bryntum/support/issues/650) - Broken styling in weekends demo
* [#652](https://github.com/bryntum/support/issues/652) - EventEditor layout issues in material
* [#654](https://github.com/bryntum/support/issues/654) - Percent bar should not have rounded corners
* [#659](https://github.com/bryntum/support/issues/659) - Dependency lines should break at a grid based on rowHeight
* [#667](https://github.com/bryntum/support/issues/667) - ActionColumn icons in Material have too sharp black color
* [#676](https://github.com/bryntum/support/issues/676) - Improve resource histogram colors
* [#682](https://github.com/bryntum/support/issues/682) - Crash after editing duration of task
* [#684](https://github.com/bryntum/support/issues/684) - Label widths not loaded from locale
* [#688](https://github.com/bryntum/support/issues/688) - Should not save if state of task editor is invalid
* [#693](https://github.com/bryntum/support/issues/693) - Constraint is set after undo
* [#697](https://github.com/bryntum/support/issues/697) - Selected event has indistinguishable progress bar
* [#704](https://github.com/bryntum/support/issues/704) - Crash on drag after deleting a successor
* [#706](https://github.com/bryntum/support/issues/706) - Histogram crashes upon render in Safari
* [#725](https://github.com/bryntum/support/issues/725) - Crash if clearing start date field and pressing TAB
* [#732](https://github.com/bryntum/support/issues/732) - Milestones are rendered incorrectly in scheduler
