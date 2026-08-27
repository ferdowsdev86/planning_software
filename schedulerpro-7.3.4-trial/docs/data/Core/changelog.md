# Bryntum Core version history

## 7.3.4 - 2026-07-22

### BUG FIXES

* [#5099](https://github.com/bryntum/support/issues/5099) - `DataField` `convert`/`serialize` now documented as function configs in the typings
* [#8885](https://github.com/bryntum/support/issues/8885) - `DomClassList#normalize` and `#length` are now public in the typings
* [#13126](https://github.com/bryntum/support/issues/13126) - Animation artefact when expanding side panel
* [#13277](https://github.com/bryntum/support/issues/13277) - Using `Override.apply` on `Model` target impacting `DurationColumn` override
* [#13281](https://github.com/bryntum/support/issues/13281) - `MenuItem` throws when closing a submenu configured as a non-`Menu` widget
* [#13328](https://github.com/bryntum/support/issues/13328) - Accordions from the function sections cannot be opened
* [#13355](https://github.com/bryntum/support/issues/13355) - Hint widget falls below the target `Popup` when the hint targets elements inside a `Popup`

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

### API CHANGES

* Added the `AjaxResponse` typedef (native `Response` extended with `parsedJson`/`error`/`responseText`).
  `AjaxHelper.get`/`post`/`fetch` are now typed to return it

### BUG FIXES

* [#4400](https://github.com/bryntum/support/issues/4400) - [TypeScript] `LocaleManager.locale` corrected from `Locales` to `Locale` (accepting `String|Locale`)
* [#6481](https://github.com/bryntum/support/issues/6481) - [TypeScript] Added generic type parameters to Promise return types on `AjaxStore.load`,
  `AjaxHelper.get`/`post`/`fetch`, `MessageDialog.confirm`/`alert`/`prompt`,
  `StateTrackingManager.undo`/`undoAll`/`redo`/`redoAll`
* [#7443](https://github.com/bryntum/support/issues/7443) - `StateProvider.setup()` now accepts a config object (e.g. `{ storage, prefix }`) in TypeScript
* [#10116](https://github.com/bryntum/support/issues/10116) - `AjaxStore` `encodeSorterParams`/`encodeFilterParams` are now function configs in TypeScript
* [#13157](https://github.com/bryntum/support/issues/13157) - Flex child does not stretch properly inside `fieldset`
* [#13237](https://github.com/bryntum/support/issues/13237) - Unhandled promise rejection from `Combo` when a remote filter load is aborted by a value change or
  `createOnUnmatched`
* [#13278](https://github.com/bryntum/support/issues/13278) - Popup stacking issue when disabling a focused field in a child popup
* [#13307](https://github.com/bryntum/support/issues/13307) - Title should align top vertically when a panel collapses to left/start
* [#13311](https://github.com/bryntum/support/issues/13311) - `DateTimeField` appears too tall - taller than other field types

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

* [DEPRECATED] `Chart` configs `legendScale`, `titlePadding`, `subtitlePadding`, `minTickLabelRotation`,
  `maxTickLabelRotation`, `bubbleScaleFactor`, and `chartTooltip` have been deprecated in preparation for an
  upcoming switch from Chart.js to AG Charts, to occur in version `8.0`

### BUG FIXES

* [#13254](https://github.com/bryntum/support/issues/13254) - When a tooltip is used as an `aria-label`, it applies it to the incorrect element

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

### API CHANGES

* Rectangle API methods now accept any `Element` (parent class of `HTMLElement` and `SVGElement`),
  enabling SVG targets: `from`, `fromScreen`, `inner`, `content`, `client`, `outer`

### BUG FIXES

* [#10599](https://github.com/bryntum/support/issues/10599) - [Salesforce] Removed obsolete `fixEvent()` override and `contextMenuKeyEvent` logic
* [#11925](https://github.com/bryntum/support/issues/11925) - [DOCS] [TypeScript] `checkValidity` config on `Field` is now public in typings
* [#12252](https://github.com/bryntum/support/issues/12252) - [Salesforce] `SFTimeField` invalid-time error label was not localized
* [#13016](https://github.com/bryntum/support/issues/13016) - [TypeScript] Type Errors `allowCrossGridDrag.transferData`, `traverse`, `traverseWhile`, `query`
* [#13170](https://github.com/bryntum/support/issues/13170) - Low contrast on disabled checked checkbox checkmark

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

* Added new tree-filtering configs to `StoreFilter` ([#3609](https://github.com/bryntum/support/issues/3609)):
    * `filterIncludesChildren` — a matching parent includes all its descendants
    * `filterExcludesChildren` — a non-matching parent excludes all its descendants
    * `filterExcludesParents` — non-matching ancestors are dropped and matching descendants are lifted up
* The `orderedChildren` property on `TreeNode` (and `Model`) is now a public read-only property. It returns the direct
  children of a node in their original structural order, unaffected by sorting and filtering ([#12996](https://github.com/bryntum/support/issues/12996))
* `TextAreaField` has a new `autoHeight` config that makes the textarea automatically grow and shrink vertically
  to fit its content. Recommended to combine with a `max-height` CSS rule to cap the growth
* `ChatPanel` now uses a `TextAreaField` (with `autoHeight` enabled) instead of a `TextField` for the message
  input, allowing multiline messages. A new `messageTriggersPlacement` config (`'side'`/`'below'`) controls whether
  trigger buttons appear next to or below the text area
* `TabBar` has a new `horizontalTabs` config. When set to `true` on a side-docked tab bar (`dock: 'left'` or
  `dock: 'right'`), tabs remain horizontal instead of being auto-rotated ([#12626](https://github.com/bryntum/support/issues/12626))
* `Widget.focus()` method now accepts an `options` parameter supporting `preventScroll` (defaults to `true` to avoid
  unexpected scrolling) and `focusVisible` (to force showing or hiding focus indication). By default, focus indication
  is automatically shown for keyboard navigation but hidden for mouse clicks
* AI feature now tracks token usage (`inputTokens`, `outputTokens`, `totalTokens`) on each AI response message record.
  When `debugMode` is enabled, each API call logs current and cumulative token usage to the console
* Added registry-based `Patch` system for applying bug fixes using plain objects with string class names — no class
  imports needed. Use `bryntum.applyPatch(config)` to register patches that auto-apply when classes load. See the
  `Core.Patch` API docs for usage examples. **USE AT OWN RISK** - patches are provided as a best-effort temporary
  workaround
* Added new `fixedIn` config to `Override` and `Patch` for specifying the version where the bug was fixed. This is
  **exclusive** - the override/patch will NOT apply on the specified version or newer
* Container has a new `labelWidth` config that applies to all its children (more convenient than doing it through the
  `defaults` config + allows changing the default globally)
* `Model.applyDefaults()` now also handles field defaults. When a key matches a defined field name, the field's
  default value is updated so that new instances use the new default. Non-field keys are passed through to the
  superclass to handle config defaults as before ([#12865](https://github.com/bryntum/support/issues/12865))

### API CHANGES

* The AI feature's prompt history (ArrowUp/ArrowDown to cycle previous messages) is no longer automatically saved to
  `localStorage`. Instead, configure the new `promptHistory` config with an array (e.g. loaded from `localStorage`) and
  listen to the `promptHistoryUpdate` event to persist changes. Set `promptHistory` to `[]` or `true` to enable with
  an empty history. Previously this was always on and tied to `localStorage` — now the application controls persistence
* `AIChatMessageModel` has new fields: `inputTokens`, `outputTokens`, `totalTokens` for tracking API token consumption
* `AIMessage` typedef now includes an optional `usage` property of type `AITokenUsage`
* [DEPRECATED] The `maxVersion` config on `Override` has been deprecated in favor of `fixedIn`. `maxVersion` is
  inclusive (applies up to and including the version), while `fixedIn` is exclusive (does not apply on the specified
  version or newer). `maxVersion` will be removed in a future major version
* [BREAKING] `relayAll` now propagates `return false` from the relay target back to the original event trigger, which
  may abort event processing. Previously, `return false` from relayed listeners was silently ignored
* [TypeScript] `Store.lazyLoad` and `AjaxStore.lazyLoad` now accept `Boolean|LazyLoadConfig` instead of the
  malformed `Boolean|{ lazyLoad: { chunkSize: Number } }`

### STYLING CHANGES

* Removed `content: var(--fa)` convenience CSS rule from `.b-icon::before` / `.b-fw-icon::before`. Font Awesome icon
  classes like `fa-book` now require the `fa` base class (e.g., `fa fa-book`) ([#12790](https://github.com/bryntum/support/issues/12790))
* When setting `labelWidth` on a field, the label now gets both `min-width` and `width` styles to ensure the label
  does not expand beyond the configured width. This also applies the `.b-has-label-width` class to the label element,
  which enables text wrapping

### BUG FIXES

* [#5009](https://github.com/bryntum/support/issues/5009) - [TypeScript] `Base.mixin()` return type changed from `Function` to `typeof Base`, allowing
  `class MyWidget extends Button.mixin(MyMixin) {}` to compile without errors
* [#12451](https://github.com/bryntum/support/issues/12451) - [TypeScript] `Tooltip.triggeredByEvent` typed as `Event` instead of `PointerEvent`

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

### BUG FIXES

* [#12632](https://github.com/bryntum/support/issues/12632) - `FieldFilterPicker` crashed with array-valued column data when using `isIncludedIn` operator
* [#12934](https://github.com/bryntum/support/issues/12934) - [BUG] Crash in `TreeGrid` when `sparseIndex` is enabled
* [#12966](https://github.com/bryntum/support/issues/12966) - Panel toolbar `border : true` caused rounded corners on `bbar` and doubled borders on `tbar`
* [#12988](https://github.com/bryntum/support/issues/12988) - `Objects.clone`, `Objects.blend` and `Objects.mergeUniformObjects` corrupted Dates whose `constructor`
  was missing or broken
* [#12997](https://github.com/bryntum/support/issues/12997) - Popup error when requesting full screen
* [#12998](https://github.com/bryntum/support/issues/12998) - Combo `filterOnInput` crashed when running inside shadow DOM with non-zero `keyStrokeFilterDelay`
* [#13026](https://github.com/bryntum/support/issues/13026) - `DatePicker` navigation broken after selecting trailing next-month cell

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

### STYLING CHANGES

* Tweaked CSS for Material 3 fields without `labelPosition` specified, to match layout used when
  `labelPosition: 'above'` is set ([#12858](https://github.com/bryntum/support/issues/12858))

### BUG FIXES

* [#9401](https://github.com/bryntum/support/issues/9401) - Allow number editor to allow entering decimals starting with period
* [#12486](https://github.com/bryntum/support/issues/12486) - [Salesforce] List virtualization broken in Locker Service when `IntersectionObserver` unavailable
* [#12777](https://github.com/bryntum/support/issues/12777) - Class extending `TextAreaPickerField` with custom `Panel` picker broke after upgrade
* [#12815](https://github.com/bryntum/support/issues/12815) - `Combo` with chained store not updating correctly
* [#12852](https://github.com/bryntum/support/issues/12852) - Pinch zoom renders floating widgets out of place
* [#12884](https://github.com/bryntum/support/issues/12884) - STM redo produces wrong sort order when tree store has an active filter

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

### FEATURES / ENHANCEMENTS

* The `KeyMap` mixin's `keyMap` property now accepts a `targetSelector` property which filters keystrokes to only those
  originating from inside elements matching the specified CSS selector

### BUG FIXES

* [#11888](https://github.com/bryntum/support/issues/11888) - German locale unit names should be capitalized (nouns are always capitalized in German)
* [#12666](https://github.com/bryntum/support/issues/12666) - `DomHelper.highlight` animation not visible on elements without Bryntum styling
* [#12703](https://github.com/bryntum/support/issues/12703) - `Combo` `change` event not fired when setting `panel.values` with remote `AjaxStore`
* [#12722](https://github.com/bryntum/support/issues/12722) - Empty `DisplayField` has incorrect (smaller) height
* [#12744](https://github.com/bryntum/support/issues/12744) - `idField` with `persist: false` is still included in modification data sent to backend
* [#12750](https://github.com/bryntum/support/issues/12750) - `DatePicker` `editMonth` set to `false` should use `inert` not `disabled`
* [#12779](https://github.com/bryntum/support/issues/12779) - [SALESFORCE] `Objects.clone()` not handling `SecureNodeList` correctly
* [#12798](https://github.com/bryntum/support/issues/12798) - HSL color definitions missing `%` on saturation broke colors on older Safari/iOS
* [#12804](https://github.com/bryntum/support/issues/12804) - `DateTimeField` TAB key trapped focus when `TimeField` was hidden
* [#12848](https://github.com/bryntum/support/issues/12848) - Spacer sorted to end when toolbar items defined using object form

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

### BUG FIXES

* [#12589](https://github.com/bryntum/support/issues/12589) - Scrollbar missing in multi-select Combo when selected items exceed maxHeight
* [#12726](https://github.com/bryntum/support/issues/12726) - `StoreChained` does not refresh on master store batch operations

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

* `Widget.query()` / `Widget.queryAll()` now support `#id` and `[attr=value]` selectors, and accept widget
  instances directly (returned as-is) ([#1979](https://github.com/bryntum/support/issues/1979))

### API CHANGES

* Removed the internal `chain` key from `pluginConfig`. Use `after` instead, which has the same functionality. The
  `after` key is symmetric with `before` ([#12581](https://github.com/bryntum/support/issues/12581))

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
* [#10394](https://github.com/bryntum/support/issues/10394) - `Combo` `onChange` event reported `userAction: true` when value was set programmatically while picker
  was open
* [#12609](https://github.com/bryntum/support/issues/12609) - Collapsed child panels inside a `drawer` `Panel` had their collapse-revealer headers hidden
* [#12625](https://github.com/bryntum/support/issues/12625) - `TabPanel` crashed when configuring `tabBar` with `dock` set to `'left'`
* [#12637](https://github.com/bryntum/support/issues/12637) - Inputs misaligned when labelPosition is null
* [#12659](https://github.com/bryntum/support/issues/12659) - Crash in `DomClassList.assignTo` when element has no CSS classes

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

### FEATURES / ENHANCEMENTS

* Improved "bundle loaded multiple times" exception to show import URLs ([#9296](https://github.com/bryntum/support/issues/9296))

### BUG FIXES

* [#2048](https://github.com/bryntum/support/issues/2048) - Override util issues
* [#4801](https://github.com/bryntum/support/issues/4801) - Field label text should not be selectable
* [#7632](https://github.com/bryntum/support/issues/7632) - UndoRedo control still shows transactions after clearing queue
* [#11317](https://github.com/bryntum/support/issues/11317) - Typescript for Model class does not allow overriding `isPersistable`
* [#11766](https://github.com/bryntum/support/issues/11766) - MessageDialog: `Button` text not visible when ariaLabel matches text
* [#12502](https://github.com/bryntum/support/issues/12502) - FontAwesome 6 "regular" import breaks checkbox and other icons
* [#12512](https://github.com/bryntum/support/issues/12512) - `CheckboxGroup` did not fire `change` event when setting value via `Container.record`
* [#12513](https://github.com/bryntum/support/issues/12513) - Tree node move operations now respect `reapplyFilterOnAdd` config
* [#12515](https://github.com/bryntum/support/issues/12515) - [TypeScript] `Store.filter()` can now be called without arguments to reapply filters
* [#12560](https://github.com/bryntum/support/issues/12560) - `RadioGroup` items misalignment when `inline` is `false`

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

* List `virtualize` config is now public, allowing virtualization to be disabled in environments where
  `IntersectionObserver` is unavailable (e.g., Salesforce Locker Service)

### BUG FIXES

* [#9860](https://github.com/bryntum/support/issues/9860) - `Tab.index` property now available in TypeScript types
* [#10279](https://github.com/bryntum/support/issues/10279) - `Store.sort` returns `Promise<any|null>` instead of `Promise<any>|null` in TypeScript
* [#12490](https://github.com/bryntum/support/issues/12490) - Font Awesome Pro style prefixes (`fa-light`, `fa-regular`, etc.) no longer get base `fa` class added

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

* Added `dragSelect` property to `DatePicker` which means that if you are using `multiSelect`, a drag over cells will
  select the date range

### API CHANGES

* Sliders used `labelWidth` for both their value label and their main label. Now, `labelWidth` only affects the main
  label, while a new `valueLabelWidth` config controls the width of the value label ([#12395](https://github.com/bryntum/support/issues/12395))

### STYLING CHANGES

* Added a new `fluent2` theme, available in both a light and dark variant ([#10338](https://github.com/bryntum/support/issues/10338))

### BUG FIXES

* [#12246](https://github.com/bryntum/support/issues/12246) - Padded `ButtonGroup` needs `:active` button styling
* [#12394](https://github.com/bryntum/support/issues/12394) - `.b-outer` rule should not be seen in a deep widget hierarchy

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

### BUG FIXES

* [#10235](https://github.com/bryntum/support/issues/10235) - Invalid group order if state doesn't have ascending key
* [#12330](https://github.com/bryntum/support/issues/12330) - Grid `v6`, `v7` filter pagination param incorrect in `AjaxStore`
* [#12350](https://github.com/bryntum/support/issues/12350) - Drawer Panel should close by default when clicking outside its element

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

* [#12271](https://github.com/bryntum/support/issues/12271) - Row reordering causes data issues when grouping enabled
* [#12315](https://github.com/bryntum/support/issues/12315) - Drawer `Panel` does not close when clicking outside it by default
* [#12324](https://github.com/bryntum/support/issues/12324) - `Delayable` leaking timeout map

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
* Containers (`Container`, `Panel`, `Popup`) now use a CSS grid layout by default. When also configured with
  `labelPosition: 'align-before'`, field labels will be laid out in the first column, and fields in the second column
* [TypeScript] Improved TypeScript definitions to support function parameters in typedef declarations

### API CHANGES

* [BREAKING] The `mode` config of `Mask` was removed. Style the mask using CSS instead
* [BREAKING] The `getTranslateX/Y()` fns of `DomHelper` now only handle the `translate` property, it no longer parses
  `transform` variants

### STYLING CHANGES

* We have transitioned to using individual transform properties, e.g. `translate`, `scale` & `rotate` instead of legacy
  `transform`

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

### API CHANGES

* `DateTimeField` docs updated clarifying that the input configs cannot be set on this field. Instead, should be
  configured directly on the underlying `DateField` and `TimeField` configs.

### BUG FIXES

* [#11915](https://github.com/bryntum/support/issues/11915) - `Container` without items config in `defaultConfig` does not work
* [#11975](https://github.com/bryntum/support/issues/11975) - Setting inputWidth on date time field crashes

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

* Added direction parameter when setting a `sortFn` on `sortable` column configuration, and added `direction`
  parameter to `sortable` ([#11639](https://github.com/bryntum/support/issues/11639))
* Update documentation section "Clicking in complex widget" to have same function name ([#11750](https://github.com/bryntum/support/issues/11750))
* Setting `createOnUnmatched` to `true` on a `Combo` will now create a record for the initial value, or a value
  programmatically set later, if the value does not exist in the store for the combo ([#11781](https://github.com/bryntum/support/issues/11781))

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

### BUG FIXES

* [#11704](https://github.com/bryntum/support/issues/11704) - Column filtering with filterbar resets the `resourceStore` filters

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

* [REACT] React components can now be used to render the events content. Day, Week, Month, List, Agenda, Timeline, Week
  Resources and Month Resources modes are supported ([#8272](https://github.com/bryntum/support/issues/8272))
* Added `Charts` feature, which leverages the new `Chart` and `ChartDesigner` widgets to enable developers and end users
  to easily create charts and visualize data directly from selected cells in a Grid ([#8442](https://github.com/bryntum/support/issues/8442))
* Add `valueLocked` config to `FieldFilterPicker`, to complement existing `operatorLocked` and `propertyLocked`
  configs ([#11184](https://github.com/bryntum/support/issues/11184))
* Updated documentation regarding embedded text on `format` function ([#11522](https://github.com/bryntum/support/issues/11522))

### LOCALE UPDATES

* Moved translations from section `PanelCollapser` to `Object`
* Changed the `Object.collapse` and `Object.expand` keys to lowercase for consistency

### DEMOS

* [REACT] Added a new `rendering` demo showing the ability of the Calendar to render React components as events
  content. The demo is located in the `examples/frameworks/react-vite/rendering` folder

### BUG FIXES

* [#11304](https://github.com/bryntum/support/issues/11304) - Panel collapse icon does not display any tooltip

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

* Linked records (created using `record.link()`) now have a public `originalRecord` property that points to the original
  record. And the original record has a `linkedRecords` array that contains all the links to it

### BUG FIXES

* [#11584](https://github.com/bryntum/support/issues/11584) - `applyChangeset` crashes on remotely filtered store

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

* The `unload` method has been added to a lazy loaded store. For a regular store, it removes the specified records from
  the store and reloads the next time they are needed. For a tree store, it clears all the child nodes of the specified
  parent nodes, and reloads them the next time they are needed

### API CHANGES

* [DEPRECATED] The `remoteChildCount` field on a `TreeNode` was deprecated and will be removed in `7.0`

### BUG FIXES

* [#11246](https://github.com/bryntum/support/issues/11246) - Avoid re-triggering `onChange` listener after select one `Combo` option then move focus from input

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

### BUG FIXES

* [#11045](https://github.com/bryntum/support/issues/11045) - Case sensitive filtering is inconsistent
* [#11344](https://github.com/bryntum/support/issues/11344) - `Slider` component cannot be used within `Popup` component

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

* Added `showButtons` config to `Splitter` to enable/disable the collapse/expand buttons ([#2406](https://github.com/bryntum/support/issues/2406))
* `List` now has optional support for displaying text when empty, using the new `emptyText` config

### STYLING CHANGES

* The `emptyText` shown in a `Combo`'s picker has been promoted to an actual element with the `.b-empty-text` CSS class
  applied to it, instead of a harder to style pseudo-element

### BUG FIXES

* [#10474](https://github.com/bryntum/support/issues/10474) - Cannot add items into container after remove previous using `destroy()`
* [#10986](https://github.com/bryntum/support/issues/10986) - `Store.search` should get the fields from `record.fields` instead of `record.fieldNames`
* [#11170](https://github.com/bryntum/support/issues/11170) - Clicking "Don't show again" in Hints popup doesn't work

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

* [#11104](https://github.com/bryntum/support/issues/11104) - Resizing `Popup` sometimes does not stop after mouse up

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

* Popups can now be resized on all sides and corners via the new `resizable` property ([#6856](https://github.com/bryntum/support/issues/6856))
* Decimal separator and group separator for formatted numbers can now be configured globally using new static properties
  on `NumberFormat`: `decimalSeparator` and `groupSeparator` ([#11016](https://github.com/bryntum/support/issues/11016))
* [BREAKING] Since most apps have a build process that includes a transpilation step, starting with `v6.2.0` we use
  the minimum possible transpile polyfills for the source code inside the `@bryntum/core-thin` npm package to ensure
  that it works for all currently supported frameworks. Previously, each source file was transpiled with more polyfills,
  which introduced unnecessary overhead from transpilation helper functions. After this change, the size of your built
  app should be reduced. If you encounter issues with your framework's builder parsing the code, consider upgrading to a
  newer framework version that supports the latest ECMAScript specification ([#10797](https://github.com/bryntum/support/issues/10797))

### API CHANGES

* The `Widget.accessibility` property has been removed. We now detect when keyboard control is being used, and this
  can be read from the new `Widget.focusVisible` property
* The type of the `value` property on checkboxes was for legacy reasons `String`, it has now been changed to the more
  expected `Boolean`
* [BREAKING] The `AjaxHelper.fetch()` utility function no longer applies `credentials: 'include'` by default, to better
  match how the native `fetch` API works. This change also affects `AjaxStore`, if used by your app to handle data
  ([#10886](https://github.com/bryntum/support/issues/10886))

### STYLING CHANGES

* `multiSelect` `List`s now display empty checkbox icons when unselected and checked checkboxes when selected

### LOCALE UPDATES

* Added translation keys `Object.information` and `Object.showDetails`, `Object.to`, `Object.at`, `Object.on`,
  `Object.editing`, `Object.settings`, `Object.go`

### BUG FIXES

* [#10373](https://github.com/bryntum/support/issues/10373) - `Filter` dropdown should include the `sameDay` and `sameTime` operators
* [#10811](https://github.com/bryntum/support/issues/10811) - `counts.entries().map is not a function` in `ArrayHelper.countUnique` in Safari

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

## 6.1.8 - 2025-04-01

### FEATURES / ENHANCEMENTS

* We've launched nightly npm package builds on our Bryntum npm server. Versions follow the format
  `X.Y.Z-nightly.YYYYMMDD` (e.g. `6.1.8-nightly.20250330`), reflecting the current version and publish date
* Panel `header` config now accepts an `iconCls` property to show an icon in the header

### API CHANGES

* The `Widget`'s `elementAttributes` config is now public allowing to specify attributes to assign to the root element
  of this widget ([#10940](https://github.com/bryntum/support/issues/10940))

### BUG FIXES

* [#10701](https://github.com/bryntum/support/issues/10701) - Update `AjaxStore` `beforeRequest` and `afterRequest` parameters docs
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

## 6.1.6 - 2025-01-31

### BUG FIXES

* [#2518](https://github.com/bryntum/support/issues/2518) - [HIGH PRIO] Material: `Combo` Label overlaps with trigger
* [#10516](https://github.com/bryntum/support/issues/10516) - `TimeField` label misaligned if initial value has not been set
* [#10571](https://github.com/bryntum/support/issues/10571) - Error when syncing custom dependency model with extra fields

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

* [#10395](https://github.com/bryntum/support/issues/10395) - Error when focusing document body after dialog opened from context menu

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

* Apps can now override `Model.generateId` to generate custom ids for phantom records ([#9831](https://github.com/bryntum/support/issues/9831))
* Added a new config `closeOnEscape` to control whether pressing the `[ESC]` key will close the popup
* Starting with the `6.1.4` release, there are now trial versions of thin NPM packages available on our NPM server.
  These can be used to evaluate combining multiple products before purchasing a license. Please check the "What's new"
  guide for the details

### API CHANGES

* Tree stores has a new `keepExpandedOnLoad` config that defaults to `false`. When set to `true`, the tree will restore
  matching nodes expansion state after a reload ([#10017](https://github.com/bryntum/support/issues/10017))
* For more similar behavior between browsers, `DateHelper.parse` now ignores very short strings and discards any dates
  with a year before 1900 when falling back to `new Date()` parsing. This affects `DateField`s using
  `strictParsing: false` (the default). Before this change, Chrome parsed `'2'` as `Feb 2001`, while Safari parsed it as
  `Jan 0002`

### BUG FIXES

* [#10291](https://github.com/bryntum/support/issues/10291) - Error in Gantt: when adding a predecessor, siblings disappeared in the column editor
* [#10403](https://github.com/bryntum/support/issues/10403) - `DurationField` ignores `unit` config

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

* By configuring a data field with `complexMapping : false`, it can now point to a data property containing a dot (`.`),
  for example `{ "member.name" : "value" }`. Previously (since v4.1), the dot was always interpreted as a nested object
  path ([#10168](https://github.com/bryntum/support/issues/10168))

### API CHANGES

* [VUE 2] reached end of life on December 31, 2023. As a result, we will no longer be updating our Vue 2 components.
  While the components will continue to exist, we will remove them in a future release and recommend that you upgrade to
  Vue 3 for continued support

### STYLING CHANGES

* Certain color adjustment functions in SASS has been deprecated and will be removed from SASS in a future version. To
  be prepared for that, we have replaced our usages of these functions with the new ones. In general, this should not
  affect the look of components, with reservation for minor color variations (for more information, see
  https://sass-lang.com/documentation/breaking-changes/color-functions)

### BUG FIXES

* [#9018](https://github.com/bryntum/support/issues/9018) - [HIGH PRIO] Localization doesn't work for Microsoft Dynamics CRM Online
* [#10135](https://github.com/bryntum/support/issues/10135) - Fix horizontal dragging of widgets in RTL viewports
* [#10258](https://github.com/bryntum/support/issues/10258) - `showAnimation` does not animate the Popup
* [#10278](https://github.com/bryntum/support/issues/10278) - Define the `GridSelectionMode` type
* [#10309](https://github.com/bryntum/support/issues/10309) - Error in `Combo` grouping after updating to `6.1.0`

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

### API CHANGES

* New events `beforeStateSave` and `beforeStateApply` added to manage component's state object

### BUG FIXES

* [#9892](https://github.com/bryntum/support/issues/9892) - Updating column text does not get reflected in State

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

### API CHANGES

* [TypeScript] New `ComboModel` class used for `Combo`'s `listItemTpl` and `displayValueRenderer` configs in TypeScript
  applications ([#9942](https://github.com/bryntum/support/issues/9942))

### BUG FIXES

* [#10089](https://github.com/bryntum/support/issues/10089) - `beforeRequest` and `afterRequest` events missing in `6.1.0` version

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

* `AjaxStore` has new configs that lets you transform incoming and outgoing data: `transformLoadedData`,
  `transformCreationData`, `transformModificationData`, `transformRemovalData` ([#8314](https://github.com/bryntum/support/issues/8314))
* The regular non-Ajax `Store` now has the ability to accept remote paging, sorting and filtering ([#9363](https://github.com/bryntum/support/issues/9363))
* The `FilterBar` feature now supports remote filtering without using `AjaxStore`

### BUG FIXES

* [#8182](https://github.com/bryntum/support/issues/8182) - Enhance `TimeField` with option to show list of interval times
* [#9876](https://github.com/bryntum/support/issues/9876) - `DateRangeField` picker wrongly scrolls right one month when picker is shown (Firefox only)

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

* [#9298](https://github.com/bryntum/support/issues/9298) - `LazyLoad` `beforeLoad` event isn't triggered
* [#9872](https://github.com/bryntum/support/issues/9872) - Records are not persisted when group is collapsed
* [#9912](https://github.com/bryntum/support/issues/9912) - `TimeField`'s picker is not aligned on scroll

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

### BUG FIXES

* [#8211](https://github.com/bryntum/support/issues/8211) - [HIGH PRIO] `DatePicker` should support selecting multiple dates with click
* [#9468](https://github.com/bryntum/support/issues/9468) - Crash when selecting date in fullscreen docs fiddle
* [#9712](https://github.com/bryntum/support/issues/9712) - `store.createRecord()` behavior different with `useRawData`

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

* The difference between `Model.fields` and `Model.allFields` was clarified in the documentation ([#9700](https://github.com/bryntum/support/issues/9700))

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

* Bumped the built-in version of FontAwesome Free to `v6.6.0`, which includes a new
  [table-cells-row-unlock](https://fontawesome.com/icons/table-cells-row-unlock) icon sponsored by Bryntum

### BUG FIXES

* [#8878](https://github.com/bryntum/support/issues/8878) - Wrong `sourceMappingURL` for CSS theme file on `core-thin` package

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

## 6.0.0 - 2024-06-28

### FEATURES / ENHANCEMENTS

* Added a new `DateRangeField` widget for picking a range of dates ([#1888](https://github.com/bryntum/support/issues/1888))
* Convert button to menuitem on Toolbar overflow where appropriate ([#2298](https://github.com/bryntum/support/issues/2298))
* Programmatically expanding & collapsing a Panel was made easier by adding `expandPanel()` and `collapsePanel()`
  methods ([#5871](https://github.com/bryntum/support/issues/5871))
* The `AjaxStore's` `commit` function now queues calls being made while already committing instead of aborting and
  returning `false`. Previously, when a commit was finished, all Store changes were cleared. Now, only changes related
  to the actual commit will be cleared, so any changes being made after the commit call and before the commit finishes
  will be left untouched ([#7980](https://github.com/bryntum/support/issues/7980))
* Elevate `tabIndex` config from TextField to Field ([#8010](https://github.com/bryntum/support/issues/8010))
* `ButtonGroup` should allow multiple toggled buttons ([#8142](https://github.com/bryntum/support/issues/8142))
* Add `tabIndex` config to Button ([#8166](https://github.com/bryntum/support/issues/8166))
* [TypeScript] Class configs `*Config` (e.g. `ButtonConfig`) now provide type declarations for `listeners` parameter in
  `*.d.ts` files
* [TypeScript] Class configs `*Config` (e.g. `ButtonConfig`) types now have optional parameters in `*.d.ts` files.
  `*Config` type can be used instead of `Partial<*Config>` declaration
* Bumped the built-in version of FontAwesome Free to `v6.5.2`, which includes a new
  [table-cells-row-lock](https://fontawesome.com/icons/table-cells-row-lock) icon sponsored by Bryntum
* [Angular] Bryntum Angular wrapper now exports `Bryntum...Props` types (e.g. `BryntumButtonProps`) which match the
  configs available for a wrapper component (e.g. `BryntumButtonComponent`). Wrappers code is now delivered with
  documentation inside, that helps in setting up the components

### API CHANGES

* [VUE-3] Bryntum Vue-3 thin wrapper now exports `Bryntum...Props` types (e.g. `BryntumButtonProps`) which match the
  configs available for a wrapper component (e.g. `<bryntum-button>`). Wrappers code is now delivered with documentation
  and TypeScript sources inside ([#3085](https://github.com/bryntum/support/issues/3085))
* [DEPRECATED] The `WidgetHelper` utility class has been deprecated and will be removed in a future release. Use the
  corresponding widget class instead - `Widget`, `Toast` or `Mask` ([#6103](https://github.com/bryntum/support/issues/6103))
* [BREAKING] The `useRawData` setting on `Store` is now enabled by default, but with all sub-settings disabled. This
  means that the incoming data object will be used as is, without being cloned. Which will boost data loading
  performance, but is potentially a breaking change if the data object is reused / used in other parts of the
  application ([#8335](https://github.com/bryntum/support/issues/8335))
* [BREAKING] In `6.0.0-alpha-2` we changed the default value for `useRawData` on stores to `true`. This boosted record
  creation performance by not cloning the incoming data object. However, this change has lead to some issues, and we are
  now taking a step back. It will once again default to `false` when supplying data inline, and instead only to `true`
  when data is loaded remotely using an `AjaxStore` or a `CrudManager` ([#9289](https://github.com/bryntum/support/issues/9289))

### STYLING CHANGES

* The Stockholm theme got some slight tweaks to panel header (removed bottom border) and tab panel styling (replaced
  active tab background with thick bottom border) for a more modern look ([#8440](https://github.com/bryntum/support/issues/8440))

### BUG FIXES

* [#190](https://github.com/bryntum/support/issues/190) - Widget masking should be a FIFO process
* [#1714](https://github.com/bryntum/support/issues/1714) - Repurpose `store.data` to return something meaningful
* [#4933](https://github.com/bryntum/support/issues/4933) - Toggleable button loses state when moved to toolbar overflow menu
* [#6441](https://github.com/bryntum/support/issues/6441) - Instance config values should not be overridden by responsive configs
* [#6854](https://github.com/bryntum/support/issues/6854) - Pressed state lost as button in `ButtonGroup` enters an overflow menu
* [#8135](https://github.com/bryntum/support/issues/8135) - Mask class should extend Widget
* [#8189](https://github.com/bryntum/support/issues/8189) - Change Field `highlightExternalChange` default value to false
* [#8409](https://github.com/bryntum/support/issues/8409) - Crash when selecting date in `DateRangeField` with null value
* [#8459](https://github.com/bryntum/support/issues/8459) - [HIGH PRIO] Carousel should support swipe gesture scrolling for mobile/touch
* [#8463](https://github.com/bryntum/support/issues/8463) - Widgets in overflow menu fire events twice
* [#8523](https://github.com/bryntum/support/issues/8523) - `SlideToggle` inside overflow menu triggers 2 change events
* [#8612](https://github.com/bryntum/support/issues/8612) - Code panel collapse animation reveals vertical placeholder at the end of the animation
* [#8698](https://github.com/bryntum/support/issues/8698) - Panel header changes size when collapsing / expanding panel in Stockholm theme
* [#8813](https://github.com/bryntum/support/issues/8813) - [HIGH PRIO] `Toolbar` items lose their value when moved into toolbar overflow menu
* [#9085](https://github.com/bryntum/support/issues/9085) - [REACT] `6.0.0-alpha-3` thin packages `"Can't resolve 'vs/editor/editor.main'"` error on build
* [#9400](https://github.com/bryntum/support/issues/9400) - Button menu onFoo listeners don't work when called from overflow menu

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

* [#8949](https://github.com/bryntum/support/issues/8949) - Warn when store data is loaded, and some records have no `id` set
* [#9368](https://github.com/bryntum/support/issues/9368) - `NumberField.wrapAround` processed incorrectly when spin down goes below the min

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
  configured on the wrapped Widget. Starting from `5.6.12`, stores with a configured `readUrl` will have
  their `syncDataOnLoad` default to `null`

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

* `AjaxStore` has a new config called `includeChildrenInRemoveRequest`, that controls if a remove request includes the
  id of a removed parent and all its children, or just the id of the removed parent ([#8099](https://github.com/bryntum/support/issues/8099))

### API CHANGES

* After a docs regression, several APIs flagged to be hidden in subclasses were still visible in the docs. These APIs
  are now correctly hidden ([#9140](https://github.com/bryntum/support/issues/9140))

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

* `Store` has a new `hasChanges` property, it is cheaper than `changes` to use if you only need to know if there are
  changes or not
* `AjaxStore` has a new `paramsInBody` config that allows sending parameters in the request body instead of the URL
  query string ([#4058](https://github.com/bryntum/support/issues/4058))
* Model (=records) has a new `getUnmodified()` function that returns the unmodified value of a field ([#9029](https://github.com/bryntum/support/issues/9029))

### BUG FIXES

* [#8918](https://github.com/bryntum/support/issues/8918) - Arrow buttons should rotate icon in RTL mode
* [#8965](https://github.com/bryntum/support/issues/8965) - [HIGH PRIO] Toolbar overflow synced excessively

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

* Records that relates to other records with the use of the `Model` class's static `relations` config can now propagate
  their changes to the related records stores. This is useful if you have multiple widgets that you want to refresh when
  a related record changes. The new behavior is opt-in, you need to set the new `propagateRecordChanges` property on
  the `RelationConfig` object ([#8671](https://github.com/bryntum/support/issues/8671))

### LOCALE UPDATES

* Added Brazilian Portuguese translation (`'PtBr'`) ([#8747](https://github.com/bryntum/support/issues/8747))

### BUG FIXES

* [#8761](https://github.com/bryntum/support/issues/8761) - `Popup` positioning incorrect when maximized with `centered` and `maximizable`
* [#8815](https://github.com/bryntum/support/issues/8815) - `DateTimeField` editor on `Column` throws an error on start editing
* [#8875](https://github.com/bryntum/support/issues/8875) - `DateHelper` `startOf` week method does not return correct output for Sunday

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

* The `List` class now has a `title` property, which shows a title above the first item ([#8714](https://github.com/bryntum/support/issues/8714))

### BUG FIXES

* [#8547](https://github.com/bryntum/support/issues/8547) - [TypeScript] Improve constructor declarations
* [#8694](https://github.com/bryntum/support/issues/8694) - `DatePicker` should always navigate to the month of the selected date

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

### API CHANGES

* The `StateTrackingManager` (STM) will by default (if `autoRecord` is `true`) merge update actions on the same record
  (in same transaction), keeping the oldest, and the newest values. A transaction will almost always only contain one
  update action per record. If the previous behaviour is desired, you can configure the `StateTrackingManager`
  with `autoRecordMergeUpdateActions` set to `false`. If you're not using `autoRecord`, then the transaction action can
  be merged by calling the `StateTrackingManager`'s new `mergeTransactionUpdateActions` function *before* the end of the
  transaction
* `Widget.getById()` method is now public ([#8403](https://github.com/bryntum/support/issues/8403))

### BUG FIXES

* [#8537](https://github.com/bryntum/support/issues/8537) - [DOCS] Make private `cls` configs on `CalendarPanel` public

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
* New `syncSort` option for chained stores, to always keep chained store data in the same order as the master store
  ([#8286](https://github.com/bryntum/support/issues/8286))

### API CHANGES

* To boost record creation performance, records now cache their `id` (it is accessed very frequently, helps performance
  a bit) and join their store(s) in a more efficient way. As a side effect, a record no longer has a `stores` array
  prior to joining a store, previously it was there as an empty array from start. We don't think this will affect any
  code, but wanted to share the change in case it does

### BUG FIXES

* [#7836](https://github.com/bryntum/support/issues/7836) - [TYPESCRIPT] Missing layout classes and config types
* [#8198](https://github.com/bryntum/support/issues/8198) - `DurationField` does not show error tooltip when inputting invalid data
* [#8239](https://github.com/bryntum/support/issues/8239) - `ContextMenus` aligned below click point instead of to the side
* [#8249](https://github.com/bryntum/support/issues/8249) - Group menu position issue
* [#8269](https://github.com/bryntum/support/issues/8269) - [HIGH PRIO] Issue with appending a child to a collapsed parent in a filtered tree store

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

### API CHANGES

* [TypeScript] `element` parameter for `ElementListenerConfig` typedef and `EventHelper.addListener` method has been
  changed to `EventTarget` type ([#8139](https://github.com/bryntum/support/issues/8139))
* `Point.from()` method will return a point relative to the page coordinates instead of screen coordinates as of `v6.0`

### BUG FIXES

* [#7964](https://github.com/bryntum/support/issues/7964) - [REACT] JSX doesn't work in Popups
* [#8160](https://github.com/bryntum/support/issues/8160) - Runtime error `Cannot read properties of undefined (reading 'defaultView')`
* [#8188](https://github.com/bryntum/support/issues/8188) - [DOCS] Nonexisting `afterConstructor` function documented
* [#8191](https://github.com/bryntum/support/issues/8191) - `PickerField` with `autoExpand : true` does not show picker when clicking trigger icon

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.4 - 2023-12-21

### BUG FIXES

* [#7958](https://github.com/bryntum/support/issues/7958) - Property `type` is missing in `DataFieldConfig`
* [#8024](https://github.com/bryntum/support/issues/8024) - Event editor bottom toolbar missing top padding
* [#8028](https://github.com/bryntum/support/issues/8028) - Store `min/max` functions returning inconsistent values
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

* The `Toast` class has a `side` config which may be specified as `'top'` to show the toast at the top of the screen
  ([#7910](https://github.com/bryntum/support/issues/7910))

### BUG FIXES

* [#1334](https://github.com/bryntum/support/issues/1334) - Should be possible to delete a chip with backspace key
* [#1335](https://github.com/bryntum/support/issues/1335) - Typed text not removed after selecting value in multiselect combo
* [#7888](https://github.com/bryntum/support/issues/7888) - Dock `start/end` in footer configuration crashes the app
* [#7923](https://github.com/bryntum/support/issues/7923) - `AjaxStore` commit requests not always sent
* [#7942](https://github.com/bryntum/support/issues/7942) - Separator for combo box not working
* [#8003](https://github.com/bryntum/support/issues/8003) - `minWidth` of aligned widget calculated wrong when percentage is involved

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

* Added support for wrapping time when reaching min/max using steppers in the time picker ([#7580](https://github.com/bryntum/support/issues/7580))

### BUG FIXES

* [#8213](https://github.com/bryntum/support/issues/8213) - `NumberFormatConfig` typescript class is missing several configs due to docs issue in `NumberFormat`

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.6.1 - 2023-11-17

### BUG FIXES

* [#7471](https://github.com/bryntum/support/issues/7471) - Overriding feature's `keyMap` from Widget doesn't work
* [#7703](https://github.com/bryntum/support/issues/7703) - `NumberField` limits typed input to `minimumFractionDigits` not `maximumFractionDigits`
* [#7754](https://github.com/bryntum/support/issues/7754) - [Frameworks] Thin packages not working with `pnpm`
* [#7810](https://github.com/bryntum/support/issues/7810) - Undo/redo with outdent error

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
* `@bryntum/core-thin` bundle includes scss theme files in `sass/themes` folder ([#7445](https://github.com/bryntum/support/issues/7445))
* The `List` widget now supports collapse / expand of groups ([#7405](https://github.com/bryntum/support/issues/7405))
* [TypeScript] Functions and events declarations in typings were improved to contain all available parameters and return
  type ([#6961](https://github.com/bryntum/support/issues/6961), [#4456](https://github.com/bryntum/support/issues/4456))
* Infer field types for `auto` fields when using `FieldFilterPicker` with store data present ([#7691](https://github.com/bryntum/support/issues/7691))

### API CHANGES

* [BREAKING] `Core.util.helper.Point` class has been moved to solve circular module dependencies. It is now a named
  export of the `Core.util.helper.Rectangle` module. Check upgrading guide for the details

### LOCALE UPDATES

* There is a new locale key `selectValue : 'Select value'` which is used by the `FieldFilterPicker` when creating
  filters on relation-type fields

### BUG FIXES

* [#7527](https://github.com/bryntum/support/issues/7527) - Summary row obscures docked scrollbar
* [#7724](https://github.com/bryntum/support/issues/7724) - Slider styling is wrong when placed on a Toolbar in Classic light theme

### FRAMEWORK SUPPORT

* TypeScript: `>= 3.6.0`
* Angular: `>= 9.0.0`
* React: `>= 16.0.0`
* Vue: `>= 2.0.0`
* Ionic: `>= 5.0.0`
* Vite: `>= 4.0.0`
* Webpack: `>= 4.0.0`

## 5.5.5 - 2023-10-23

### BUG FIXES

* [#279](https://github.com/bryntum/support/issues/279) - `ObjectHelper.isEqual` fails if compared object has cyclic links
* [#2024](https://github.com/bryntum/support/issues/2024) - Slider tooltip should be configurable
* [#7641](https://github.com/bryntum/support/issues/7641) - Bryntum Combo and Tag Combo empty text appearing `null`
* [#7693](https://github.com/bryntum/support/issues/7693) - Align anchor arrow colour detection wrong when mouse is over adjacent element

## 5.5.4 - 2023-10-05

### BUG FIXES

* [#7563](https://github.com/bryntum/support/issues/7563) - Combo value not updated in the input is some cases

## 5.5.3 - 2023-09-15

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 5.5.2 - 2023-08-30

### BUG FIXES

* [#7351](https://github.com/bryntum/support/issues/7351) - `findByField` method does not pick up empty string

## 5.5.1 - 2023-08-16

### BUG FIXES

* [#3504](https://github.com/bryntum/support/issues/3504) - Issue in `DurationField` setting units

## 5.5.0 - 2023-07-31

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 5.4.2 - 2023-07-26

### BUG FIXES

* [#6866](https://github.com/bryntum/support/issues/6866) - Not possible to switch am/pm in time picker in mobile Safari
* [#7127](https://github.com/bryntum/support/issues/7127) - Id collision error when creating new event using an external button on `EventList` mode

## 5.4.1 - 2023-07-13

### BUG FIXES

* [#3285](https://github.com/bryntum/support/issues/3285) - Existing records not tracked when a store is added to STM

## 5.4.0 - 2023-06-30

### FEATURES / ENHANCEMENTS

* Two new widgets for editing colors has been added in this release. Firstly, there is the `ColorPicker`, which lets the
  user select from a range of pre-defined colors. It is not built for stand-alone usage, but meant to be used in a
  `Menu` or as a picker for a `PickerField`. There is also the `ColorField` which can be used as a normal form field to
  display and edit a color value. It uses the `ColorPicker` as its color picker ([#2939](https://github.com/bryntum/support/issues/2939))
* `Widget` has a new config, `maximizeOnMobile` which takes effect only on `floating` widgets on a mobile device. It
  causes the widget to be maximized instead of positioned in order to accommodate the mobile virtual keyboard
  ([#6522](https://github.com/bryntum/support/issues/6522))
* On mobile devices, `type : 'checkbox'` is rendered as a `slidetoggle` widget. The API and value is the same, it is
  just a more appropriate UI for the platform
* Improved and condensed `FieldFilterPicker` layout for better use of space ([#6232](https://github.com/bryntum/support/issues/6232))

## 5.3.8 - 2023-06-28

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 5.3.7 - 2023-06-20

### BUG FIXES

* [#7025](https://github.com/bryntum/support/issues/7025) - `Combo` should handle being destroyed in item/select/change listeners
* [#7028](https://github.com/bryntum/support/issues/7028) - Incorrect examples for `fields` config in `FieldFilterPicker` docs

## 5.3.6 - 2023-05-26

### API CHANGES

* The `change` event for the `FieldFilterPickerGroup` now includes an additional property `validFilters`, the subset of
  filters that are complete and valid ([#6774](https://github.com/bryntum/support/issues/6774))

### BUG FIXES

* [#6805](https://github.com/bryntum/support/issues/6805) - `includeInSubset` creates duplicate records in the store
* [#6833](https://github.com/bryntum/support/issues/6833) - Enabling/disabling filter checkbox in `FieldFilterPickerGroup` throws error on the console

## 5.3.5 - 2023-05-11

### BUG FIXES

* [#6384](https://github.com/bryntum/support/issues/6384) - Inconsistent tool order in header of inline collapsed panel

## 5.3.4 - 2023-04-28

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 5.3.3 - 2023-04-21

### BUG FIXES

* [#6166](https://github.com/bryntum/support/issues/6166) - `createOnUnmatched` only creates new record on `Enter` key press

## 5.3.2 - 2023-04-04

### BUG FIXES

* [#6428](https://github.com/bryntum/support/issues/6428) - `FullScreen.request` method should move `floatRoot` into the `fullscreened` element
* [#6433](https://github.com/bryntum/support/issues/6433) - Escape key not working in example filter field

## 5.3.1 - 2023-03-17

### FEATURES / ENHANCEMENTS

* Tree store now applies filters/sorters to any new data when calling `applyChangeset()` ([#6155](https://github.com/bryntum/support/issues/6155))

### API CHANGES

* Date parsing was made more forgiving in regard to character used to separate date parts. For example these strings are
  now all acceptable as `HH:mm`: `10:20`, `10 20`, `10-20`, `10/20` ([#6344](https://github.com/bryntum/support/issues/6344))

### BUG FIXES

* [#6312](https://github.com/bryntum/support/issues/6312) - Splitter does not move after updating to 5.3.0
* [#6328](https://github.com/bryntum/support/issues/6328) - `'move'` event `oldParent` should pass `rootNode` when moving a node from the `rootNode`

## 5.3.0 - 2023-03-02

### FEATURES / ENHANCEMENTS

* There is a new `store` field type (`StoreDataField`) which can be used for fields on records that holds arrays. The
  array will be converted to a store, manipulating the store will flag the record as modified. On serialization the
  store will be converted back to an array
* Lots (but not all) of the not so informative `object` types in our TypeScript typings have been replaced with more
  specific types. Objects that in our JavaScript are used as maps are now declared as `Record<keyType, valueType>`, and
  for functions that accept object arguments many are replaced with anonymous type declarations, such as
  `{ foo: string, bar: number }` (Partially fixed [#5176](https://github.com/bryntum/support/issues/5176))
* `AjaxHelper.fetch` now supports using request body to pass parameters for non-GET requests. Please check
  `addQueryParamsToBody` argument in the method documentation ([#2855](https://github.com/bryntum/support/issues/2855))
* The model relation system, a data layer concept used internally to link a `ResourceTimeRange` to a `Resource` in
  Scheduler, was made public. It allows you to define one-to-many relations between models in a `relations` block when
  subclassing `Model` ([#3222](https://github.com/bryntum/support/issues/3222))

### API CHANGES

* [DEPRECATED] `LocaleManager.registerLocale` and `LocaleManager.extendLocale` are deprecated.
  `LocaleHelper.publishLocale` should be used instead.
* [DEPRECATED] The type of the `fields` config for `FieldFilterPicker` and `FieldFilterPickerGroup` widgets has changed
  from array of `FieldOption`s to `Object` map of `FieldOption`s keyed by field name. The array type is now deprecated

### LOCALE UPDATES

* Locales format and process for applying locales have been simplified
* New locales for 31 languages have been added. Currently available languages are listed in the localization guide
  (Guides/Customization/Localization)

### BUG FIXES

* [#6212](https://github.com/bryntum/support/issues/6212) - Infinite loop when chaining stores using `syncDataOnLoad`

## 5.2.10 - 2023-02-17

### API CHANGES

* Recently browsers have added support for Unicode 15, which changes the output of `Intl.DateTimeFormat` when
  formatting time to include `AM`/`PM`. Those browsers now use "thin space" (`\u202f`) instead of regular space. This
  affects the `DateHelper.format()` function, but likely you do not need to take any action in your application. It
  also affects `DateHelper.parse()`, which has been updated to support the new unicode space ([#6193](https://github.com/bryntum/support/issues/6193))

### BUG FIXES

* [#5791](https://github.com/bryntum/support/issues/5791) - `EventHelper`'s listeners for `.b-using-keyboard` break iOS dragging
* [#6039](https://github.com/bryntum/support/issues/6039) - Resource order not applied with `syncDataOnLoad`
* [#6092](https://github.com/bryntum/support/issues/6092) - Wrong type for `FetchOptions`
* [#6186](https://github.com/bryntum/support/issues/6186) - Should be possible to get the previous parent in move event

## 5.2.9 - 2023-01-30

### BUG FIXES

* [#5526](https://github.com/bryntum/support/issues/5526) - Cannot open second mask using static call
* [#6014](https://github.com/bryntum/support/issues/6014) - Button menu listeners get duplicated when changing the menu
* [#6071](https://github.com/bryntum/support/issues/6071) - DomHelper `getRootElement` throwing error on creating dependency

## 5.2.8 - 2023-01-19

### BUG FIXES

* [#5386](https://github.com/bryntum/support/issues/5386) - Improved panel collapse animation when collapsed panel header is perpendicular to expanded
* [#5804](https://github.com/bryntum/support/issues/5804) - Material panel toolbar padding not symmetric

## 5.2.7 - 2023-01-11

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 5.2.6 - 2022-12-28

### BUG FIXES

* [#5783](https://github.com/bryntum/support/issues/5783) - Calendar dropdown getting focused when click on the label
* [#5821](https://github.com/bryntum/support/issues/5821) - `constrainTo` not applied unless component is shown using `alignTo`
* [#5838](https://github.com/bryntum/support/issues/5838) - Combo clearable trigger doesn't reset validation

## 5.2.5 - 2022-12-16

### FEATURES / ENHANCEMENTS

* Store now applies filters/sorters to any new data when calling `applyChangeset()` ([#5534](https://github.com/bryntum/support/issues/5534))
* Added field `orderedParentIndex` to resolve position of the child in the ordered children array ([#5353](https://github.com/bryntum/support/issues/5353))

### BUG FIXES

* [#5674](https://github.com/bryntum/support/issues/5674) - Combo not sized the same when editable vs non-editable
* [#5692](https://github.com/bryntum/support/issues/5692) - Combos should be able to share Stores
* [#5730](https://github.com/bryntum/support/issues/5730) - `index` is ignored when insert into filtered store
* [#5732](https://github.com/bryntum/support/issues/5732) - Combo should update value collection silently when replacing store
* [#5780](https://github.com/bryntum/support/issues/5780) - ICS export datetime stamp is not UTC

## 5.2.4 - 2022-11-28

### BUG FIXES

* [#5595](https://github.com/bryntum/support/issues/5595) - Fix panel collapse icon directions

## 5.2.3 - 2022-11-17

### BUG FIXES

* [#5518](https://github.com/bryntum/support/issues/5518) - Undo does not recognise zero and null values as a change
* [#5537](https://github.com/bryntum/support/issues/5537) - `tabPanel.add()` crashes the app
* [#5587](https://github.com/bryntum/support/issues/5587) - Do not patch `offsetX`/`offsetY`

## 5.2.2 - 2022-11-08

### API CHANGES

* [DEPRECATED] The behaviour of the `store.data` getter will be changed in 6.0. Currently, it returns the **initial**
  raw dataset, in 6.0 it will be changed to have the more expected behaviour of returning the data objects for the
  **current** state instead ([#5499](https://github.com/bryntum/support/issues/5499))

### BUG FIXES

* [#5491](https://github.com/bryntum/support/issues/5491) - `onToolClick` not working correctly (even with `callOnFunctions: true`)

## 5.2.1 - 2022-10-28

### API CHANGES

* `TreeNode.isRoot` property is now public ([#5471](https://github.com/bryntum/support/issues/5471))

### BUG FIXES

* [#5409](https://github.com/bryntum/support/issues/5409) - `Field`'s `fetchInputValue` ignores the `inputValueAttr` setting
* [#5451](https://github.com/bryntum/support/issues/5451) - `DatePicker` animation glitch
* [#5480](https://github.com/bryntum/support/issues/5480) - `EventHelper` has globally visible breaking side effects

## 5.2.0 - 2022-10-13

### FEATURES / ENHANCEMENTS

* Menu has a `separator` config to make it easier to visually separate menu items
* The responsive state objects used in the `responsive` config of the `Responsive` mixin now support a `once` property
  to allow configs to only be set on first activation of the state
* The `Core.helper.DateHelper` class has a new method `formatRange` method which can format date ranges, as well as new
  formatting options for week numbers
* Added new `FieldFilterPicker` and `FieldFilterPickerGroup` widgets, providing UI to manage a set of CollectionFilters

### API CHANGES

* [DEPRECATED] The `DomHelper.up()` function was deprecated, use native `element.closest()` instead

### BUG FIXES

* [#2512](https://github.com/bryntum/support/issues/2512) - Implement `ignoreParentReadOnly` config on `Widget`

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
* [#5341](https://github.com/bryntum/support/issues/5341) - `Picker` is shown for `Combo` with `keyStrokeFilterDelay` after clearing value

## 5.1.4 - 2022-09-29

### FEATURES / ENHANCEMENTS

* FilterBar feature now allows you to configure `operator` and `caseSensitive` on a column's `filterable` config object

### BUG FIXES

* [#4974](https://github.com/bryntum/support/issues/4974) - `AjaxStore` continuously making remote requests after store grouping when `sortParamName` is set
* [#5213](https://github.com/bryntum/support/issues/5213) - `DatePicker` can't move months if min date is after current date
* [#5214](https://github.com/bryntum/support/issues/5214) - `AjaxStore` continuously making remote requests after store sorting with `syncDataOnLoad` set to `true`
* [#5282](https://github.com/bryntum/support/issues/5282) - Make `AjaxStore` urls changeable

## 5.1.3 - 2022-09-09

### BUG FIXES

* [#415](https://github.com/bryntum/support/issues/415) - Improve docs on formatting currency values on `NumberField`
* [#5125](https://github.com/bryntum/support/issues/5125) - Setting an initial value for `activeTab` on a `TabPanel` no longer animates that tab into view
* [#5136](https://github.com/bryntum/support/issues/5136) - `callOnFunctions: true` triggers an error when on function is not set
* [#5182](https://github.com/bryntum/support/issues/5182) - `TimeField` should keep date if user types in the value
* [#5201](https://github.com/bryntum/support/issues/5201) - `Store` sort uses `localeCompare` for non-string types

## 5.1.2 - 2022-08-29

### FEATURES / ENHANCEMENTS

* Configs that accept configuration options for a widget (or other class) are now (mostly) documented to accept a typed
  config object rather than a plain object. For example instead of `{Object} tooltip - A tooltip configuration object`,
  it is now `{TooltipConfig} tooltip - A tooltip configuration object`. This improves our TypeScript typings (transforms
  to `Partial<TooltipConfig>` in typings) when using such configs, but also improves our docs by linking to the configs
  of the type
* Added a `keepDate` config to the `TimeField`. By default, it is false and sets date component of the field value to
  `January 1st`. Set it to true to keep original value intact and only change the time component ([#5058](https://github.com/bryntum/support/issues/5058))
* Excel export feature now accepts a `rows` array to export only certain rows instead of the full dataset

### BUG FIXES

* [#4953](https://github.com/bryntum/support/issues/4953) - `List` component does not process the disabled config
* [#5088](https://github.com/bryntum/support/issues/5088) - Crash when entering number into paging toolbar `page` field

## 5.1.1 - 2022-07-28

### BUG FIXES

* [#4958](https://github.com/bryntum/support/issues/4958) - List store reload needs to reset selection if no incoming records match previous selection

## 5.1.0 - 2022-07-21

### FEATURES / ENHANCEMENTS

* Updated the built-in version of FontAwesome Free to `6.1.1`
* Our TypeScript typings for string types that have a predefined set of alternatives was improved to only accept
  those alternatives. For example previously the `dock` config which was previously declared as `dock: string` is now
  `dock : 'top'|'right'|'bottom'|'left'`
* `KeyMap` is a mixin that allows for standardized and customizable keyboard shortcuts functionality. `KeyMap` is by
  default mixed in to `Widget` and therefore available to all `Widget`'s child classes. There is a new guide
  **Guides/Customization/Keyboard shortcuts** describing how to customize currently integrated keyboard shortcuts
  ([#4300](https://github.com/bryntum/support/issues/4300), [#4313](https://github.com/bryntum/support/issues/4313), [#4328](https://github.com/bryntum/support/issues/4328))

### BUG FIXES

* [#4683](https://github.com/bryntum/support/issues/4683) - Menu misaligned after window resizing
* [#4696](https://github.com/bryntum/support/issues/4696) - Parents sorted below children in docs
* [#4697](https://github.com/bryntum/support/issues/4697) - Too dark code background in docs
* [#4936](https://github.com/bryntum/support/issues/4936) - Combo with `autoexpand: true` closes immediately on first click of dropdown arrow

## 5.0.7 - 2022-07-13

### BUG FIXES

* [#4916](https://github.com/bryntum/support/issues/4916) - `Fullscreen` is not working on mobile Safari

## 5.0.6 - 2022-06-20

### BUG FIXES

* [#841](https://github.com/bryntum/support/issues/841) - Add `searchAllRecords` flag to store search functions
* [#4146](https://github.com/bryntum/support/issues/4146) - TaskEditor clears time when editing events with datetime picker
* [#4804](https://github.com/bryntum/support/issues/4804) - Radiobutton hover effect incorrectly positioned in Material theme when on RTL

## 5.0.5 - 2022-05-30

### BUG FIXES

* [#4350](https://github.com/bryntum/support/issues/4350) - Fixed various panel collapse issues
* [#4592](https://github.com/bryntum/support/issues/4592) - `UndoRedo` needs the `transactionsCombo` `emptyText` localized
* [#4636](https://github.com/bryntum/support/issues/4636) - Model field is not exposed correctly if data is not preloaded to the store
* [#4657](https://github.com/bryntum/support/issues/4657) - Cannot navigate out of the datetime field using `Shift + Tab`

## 5.0.4 - 2022-05-11

### API CHANGES

* Container's `autoUpdateRecord` config was made public. Set it to `true` to update record fields when child fields
  change ([#4073](https://github.com/bryntum/support/issues/4073))
* Model's `clearChanges` function parameter `includeDescendants` made public. Set it to `false` to not clear changes on
  a node's descendants ([#4565](https://github.com/bryntum/support/issues/4565))

## 5.0.3 - 2022-04-26

### BUG FIXES

* [#4496](https://github.com/bryntum/support/issues/4496) - createOnUnmatched doc is wrong

## 5.0.2 - 2022-04-13

### API CHANGES

* Deprecated `showByPoint()` in Widget, it will be removed in version 6.0. Use `showBy()` instead

### BUG FIXES

* [#2796](https://github.com/bryntum/support/issues/2796) - Allow customizing Roboto path in material theme
* [#3548](https://github.com/bryntum/support/issues/3548) - `SimpleEdit` should cancel when scrolled out of view
* [#4333](https://github.com/bryntum/support/issues/4333) - Gantt task editor end date picker arrows are not working
* [#4334](https://github.com/bryntum/support/issues/4334) - Material radio button circle misaligned
* [#4351](https://github.com/bryntum/support/issues/4351) - Listeners object breaks click functionality
* [#4360](https://github.com/bryntum/support/issues/4360) - Wrong color of checkbox checkmark in Stockholm theme
* [#4373](https://github.com/bryntum/support/issues/4373) - Panel collapse arrow pointing in wrong direction initially
* [#4377](https://github.com/bryntum/support/issues/4377) - Change radio button to use `<div>` for the selected circle
* [#4398](https://github.com/bryntum/support/issues/4398) - `Tooltips` should use `allowOver:true` if they are shown with visible and enable tools or items
* [#4404](https://github.com/bryntum/support/issues/4404) - List needs a simple selection API
* [#4406](https://github.com/bryntum/support/issues/4406) - Fixed items in disabled `fieldset`/`radiogroup` not being disabled

## 5.0.1 - 2022-03-04

### BUG FIXES

* [#4105](https://github.com/bryntum/support/issues/4105) - Adjust splitter hover and moving width
* [#4244](https://github.com/bryntum/support/issues/4244) - Corrected `RadioGroup` interaction with `autoUpdateRecord` not producing the correct value

## 5.0.0 - 2022-02-21

### FEATURES / ENHANCEMENTS

* `Model` has a new `readOnly` field that is respected by UI level editing features to disallow editing records having
  `readOnly : true`. It does not directly affect the datalayer, meaning that you can still programmatically edit the
  records ([#665](https://github.com/bryntum/support/issues/665))
* New `Radio` and `RadioGroup` widgets were added ([#1357](https://github.com/bryntum/support/issues/1357))
* `window` references are replaced with `globalThis` which is supported in all modern browsers and across different JS
  environments ([#4071](https://github.com/bryntum/support/issues/4071))
* Updated FontAwesome Free to version 6, which includes some new icons sponsored by Bryntum in the charts category:
  https://fontawesome.com/search?m=free&c=charts-diagrams&s=solid

### API CHANGES

* [BREAKING] TextAreaField was renamed to TextAreaPickerField to serve only as a picker-type field. A new TextAreaField
  widget was added which is used in Gantt's NotesTab
* [BREAKING] TextAreaPickerField's `inline` config has been removed, use TextAreaField instead
* Store's `toJSON()` method now ignores all local filters and returns all records ([#4101](https://github.com/bryntum/support/issues/4101))
* The following previously deprecated configs, functions etc. where removed:
    * Config `DatePicker#editOnHover` - no replacement, no longer relevant
    * Argument `newId.deep` for `Model#copy()` - previously replaced by separate `deep` argument
    * Config `DateDataField#dateFormat` - previously replaced by `format` config
    * Config `ContextMenuBase#menuConfig` - previously replaced by `menu` config
    * Function `ObjectHelper.allKeys()` - previously replaced by `keys()` function
    * Function `StringHelper.capitalizeFirstLetter()` - previously replaced by `capitalize()` function
    * Function `StringHelper.lowercaseFirstLetter()` - previously replaced by `uncapitalize()` function
    * Argument `config.element`for `ScrollManager#startMonitoring()` - previously replaced by `config.scrollables` arg
    * Config `Button#menuIconCls` - previously replaced by `menuIcon` config
    * Config `Tooltip.html` no longer handles returning `false` as a way of flagging the tooltip content as async -
      previously replaced by the `showAsyncMessage` config
    * Param `record` of the `Store#move` event - previously replaced with the `records` param
    * Old `TreeNode#insertChild()` signature - previously replaced with current `(childRecord, before, silent)`
      signature
    * Argument `returnAll` for `DomHelper.createElement` - previously replaced by `options.returnAll`

### BUG FIXES

* [#758](https://github.com/bryntum/support/issues/758) - State mixin to use configurable's `onConfigChange` hook
* [#3665](https://github.com/bryntum/support/issues/3665) - DateField and DatePicker accessibility
* [#3947](https://github.com/bryntum/support/issues/3947) - Inconsistent right / bottom padding in MessageDialog
* [#3952](https://github.com/bryntum/support/issues/3952) - Wrong border bottom color for panel header
* [#4022](https://github.com/bryntum/support/issues/4022) - Panel collapse icon
* [#4086](https://github.com/bryntum/support/issues/4086) - Allow derived classes to adjust delayable method options

## 4.3.8 - 2022-02-07

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 4.3.7 - 2022-02-02

### FEATURES / ENHANCEMENTS

* Added public `dragStart` / `drag` / `drop` events to Splitter class ([#4060](https://github.com/bryntum/support/issues/4060))

### BUG FIXES

* [#3770](https://github.com/bryntum/support/issues/3770) - Fix handling of initially collapsed panels with configured size
* [#4041](https://github.com/bryntum/support/issues/4041) - `TextArea` ignores arrowDown key press
* [#4080](https://github.com/bryntum/support/issues/4080) - Sub-menu closes when moving over gap
* [#4082](https://github.com/bryntum/support/issues/4082) - Relayed listeners do not trigger onFunctions

## 4.3.6 - 2022-01-13

### BUG FIXES

* [#3788](https://github.com/bryntum/support/issues/3788) - Minimum value for duration field in Task Editor works incorrect
* [#3945](https://github.com/bryntum/support/issues/3945) - Cannot select text in popup
* [#3958](https://github.com/bryntum/support/issues/3958) - Fix panel collapser docs for `direction` config
* [#3978](https://github.com/bryntum/support/issues/3978) - Clicking selected day cell in datepicker causes refresh
* [#3987](https://github.com/bryntum/support/issues/3987) - StoreSync fails when using tree data with lazy loaded parent nodes
* [#3990](https://github.com/bryntum/support/issues/3990) - Chrome & Content Security Policy causes failure because of debug code section

## 4.3.5 - 2021-12-24

### BUG FIXES

* [#3848](https://github.com/bryntum/support/issues/3848) - Animator transitions now properly track their timers
* [#3928](https://github.com/bryntum/support/issues/3928) - DateHelper `k` format behaves incorrectly

## 4.3.4 - 2021-12-13

### BUG FIXES

* [#3674](https://github.com/bryntum/support/issues/3674) - Collapsed Panel fixes its container's height
* [#3816](https://github.com/bryntum/support/issues/3816) - `move` event is not triggered when moving a node in a `TreeStore`
* [#3840](https://github.com/bryntum/support/issues/3840) - The `menu` config for a button with only `listeners` is now treated as the config for the menu and not
  an item named "listeners"
* [#3850](https://github.com/bryntum/support/issues/3850) - [TypeScript] Missing static properties in typings
* [#3855](https://github.com/bryntum/support/issues/3855) - Setting a ModelDataField in a record could recurse infinitely

## 4.3.3 - 2021-11-30

### BUG FIXES

* [#3625](https://github.com/bryntum/support/issues/3625) - Panels that collapse right now display the expand tool on the top, clicking header of collapsed panel
  will expand the panel
* [#3637](https://github.com/bryntum/support/issues/3637) - When tooltip uses a `forSelector` and `trackMouse`, moving within its active target can hide it
* [#3644](https://github.com/bryntum/support/issues/3644) - Menu hide does not cause `subMenu` hide when `subMenu` is from an `overflow` config button clone
* [#3670](https://github.com/bryntum/support/issues/3670) - STM `resetQueue` error if a transaction is being recorded
* [#3674](https://github.com/bryntum/support/issues/3674) - Remove unnecessary `min-height`/`min-width` on collapsed panels sized by their container
* [#3678](https://github.com/bryntum/support/issues/3678) - Widget `draggable` does not constrain
* [#3740](https://github.com/bryntum/support/issues/3740) - Support async `beforeShow` event on a widget
* [#3749](https://github.com/bryntum/support/issues/3749) - Panels with no header now work when `collapsible : { tool : null }` is specified (collapse and expand
  must be performed via the API)

## 4.3.2 - 2021-10-29

### FEATURES/ENHANCEMENTS

* New PasswordField widget added
* New Field `inputType` config allowing to specify the native input element type used by the field

### BUG FIXES

* [#3566](https://github.com/bryntum/support/issues/3566) - `LocaleHelper` should not throw exception when trying to `trimLocale` with non-existent key
* [#3622](https://github.com/bryntum/support/issues/3622) - Edited cell is not marked when initial cell value is `0` or `undefined`

## 4.3.1 - 2021-10-21

### FEATURES / ENHANCEMENTS

* Bumped builtin Font Awesome Free to version 5.15.4

### BUG FIXES

* [#3567](https://github.com/bryntum/support/issues/3567) - Minified css bundle contains unicode chars

## 4.3.0 - 2021-10-12

### FEATURES/ENHANCEMENTS

* Panels can now be collapsed when configured as `collapsible` ([#914](https://github.com/bryntum/support/issues/914))

### API CHANGES

* [DEPRECATED] Buttons `menuIconCls` config was deprecated in favor of the new `menuIcon` config, which better matches
  the naming of other configs

### BUG FIXES

* [#3457](https://github.com/bryntum/support/issues/3457) - Fix toolbar overflow handling of text field when typing

## 4.2.7 - 2021-10-01

### FEATURES / ENHANCEMENTS

* You can now control if the widget tooltip should be shown when the widget is disabled using the
  `showTooltipWhenDisabled` config
* `ComboBox` can now be configured to accept unmatched typed filter strings to create a new record
  Use the `createOnUnmatched` config to enable this. This may be configured as a function to
  create the new record in an app-specific way ([#3249](https://github.com/bryntum/support/issues/3249))

### BUG FIXES

* [#3415](https://github.com/bryntum/support/issues/3415) - Generate unique phantom ids across all stores
* [#3458](https://github.com/bryntum/support/issues/3458) - Document nested fields

## 4.2.6 - 2021-09-15

### FEATURES / ENHANCEMENTS

* You can now control if the widget tooltip should be shown when the widget is disabled using the
  `showTooltipWhenDisabled` config

### BUG FIXES

* [#3179](https://github.com/bryntum/support/issues/3179) - Tooltip is not shown for a disabled button

## 4.2.5 - 2021-09-08

### FEATURES / ENHANCEMENTS

* The API documentation now better communicates when a field or property accepts multiple input types but uses a single
  type for output. For example date fields on models, which usually accepts a `String` or `Date` but always outputs a
  `Date` ([#2933](https://github.com/bryntum/support/issues/2933))

### BUG FIXES

* [#3373](https://github.com/bryntum/support/issues/3373) - Combo blank entry is less tall

## 4.2.4 - 2021-08-27

### BUG FIXES

* [#3096](https://github.com/bryntum/support/issues/3096) - Slider#showTooltip: false does not disable tooltip
* [#3294](https://github.com/bryntum/support/issues/3294) - List should update its selection prior to firing its item event
* [#3302](https://github.com/bryntum/support/issues/3302) - TreeStore#move does not update tree contents properly
* [#3332](https://github.com/bryntum/support/issues/3332) - [LWC] Exception when realigning popup

## 4.2.3 - 2021-08-05

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 4.2.2 - 2021-07-21

### BUG FIXES

* [#416](https://github.com/bryntum/support/issues/416) - TreeNode children field cannot be mapped
* [#1632](https://github.com/bryntum/support/issues/1632) - Splitter should handle if flex direction changes
* [#3039](https://github.com/bryntum/support/issues/3039) - Fixed incorrect `dragcancel` firing when only a click (and no drag) occurred
* [#3151](https://github.com/bryntum/support/issues/3151) - TabPanel should fire `beforeTabChange` event
* [#3168](https://github.com/bryntum/support/issues/3168) - Date picker doesn't allow to navigate to month if minimum value is set

## 4.2.1 - 2021-07-07

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 4.2.0 - 2021-06-30

### FEATURES / ENHANCEMENTS

* MessageDialog class now has a `prompt` method and an `alert` method ([#2653](https://github.com/bryntum/support/issues/2653))
* Added a new `bubbleEvents` config to specify events that should always bubble. Useful for example on fields in a
  container, to bubble `change` events and catch them in a listener on the container

### API CHANGES

* Added a new `Responsive` mixin that can be mixed into widgets to allow responsive behaviour ([#2672](https://github.com/bryntum/support/issues/2672))
* [BREAKING] `GlobalEvents` is no longer exposed on `window`. If you use it in your application, import it instead

### BUG FIXES

* [#2459](https://github.com/bryntum/support/issues/2459) - Support for drop down with grouped list
* [#2556](https://github.com/bryntum/support/issues/2556) - List is not updated when record id is modified

## 4.1.6 - 2021-06-23

### FEATURES / ENHANCEMENTS

* ButtonGroup now fires `toggle` event when a button in the group is toggled
* Button fires `toggle` event **only** when its `pressed` state is changed

### BUG FIXES

* [#278](https://github.com/bryntum/support/issues/278) - Calling tree store removeAll(true) unbinds rootNode from store
* [#3008](https://github.com/bryntum/support/issues/3008) - Remove childElementCount usages, unsupported in LWC
* [#3078](https://github.com/bryntum/support/issues/3078) - Avatars initials not rendering inside perfect circle

## 4.1.5 - 2021-06-09

### BUG FIXES

* [#1299](https://github.com/bryntum/support/issues/1299) - Add "select all" option for multi-select combo
* [#1596](https://github.com/bryntum/support/issues/1596) - Collapsed groups disappear when using filterBar

## 4.1.4 - 2021-05-28

### FEATURES / ENHANCEMENTS

* Buttons now has a new style `b-transparent` that renders them without background or borders ([#2853](https://github.com/bryntum/support/issues/2853))

### BUG FIXES

* [#2104](https://github.com/bryntum/support/issues/2104) - "Core" code not isomorphic
* [#2502](https://github.com/bryntum/support/issues/2502) - Allow multiple Droppable per element
* [#2775](https://github.com/bryntum/support/issues/2775) - Combo replaces its store data on set value if filterParamName defined
* [#2828](https://github.com/bryntum/support/issues/2828) - Memory leak when replacing project instance
* [#2834](https://github.com/bryntum/support/issues/2834) - Core should not use b-fa for icon prefix
* [#2874](https://github.com/bryntum/support/issues/2874) - Filter field should not grow when X is shown

## 4.1.3 - 2021-05-13

### FEATURES / ENHANCEMENTS

* Bumped the built-in version of FontAwesome Free to 5.15.3 and added missing imports to allow stacked icons etc
* Bumped the `@babel/preset-env` config target to `chrome: 75` for the UMD and Module bundles. This decreased bundle
  sizes and improved performance for modern browsers

### BUG FIXES

* [#2866](https://github.com/bryntum/support/issues/2866) - Missing method return value type for `DomHelper.isInView` and `DomHelper.isFocusable`

## 4.1.2 - 2021-04-27

### BUG FIXES

* [#2677](https://github.com/bryntum/support/issues/2677) - Fixed improper toolbar overflow handling of buttons with menus

## 4.1.1 - 2021-04-23

### FEATURES / ENHANCEMENTS

* Popups can now be maximized to fill the visible viewport
* New config `autoHeight` on Tab Panel to set the height of all tabs to match the tab with the highest content
* Display field can now accept a template formatting its value, which can now also be markup ([#2641](https://github.com/bryntum/support/issues/2641))

### BUG FIXES

* [#109](https://github.com/bryntum/support/issues/109) - Slider label should not have right margin
* [#491](https://github.com/bryntum/support/issues/491) - Store loadChildren should remove existing children
* [#2410](https://github.com/bryntum/support/issues/2410) - List hide/show methods lose parent promises
* [#2482](https://github.com/bryntum/support/issues/2482) - MultiSelect Combo set value doesn't work when configured filterSelected : true
* [#2504](https://github.com/bryntum/support/issues/2504) - Toolbar's overflow button should begin life hidden
* [#2533](https://github.com/bryntum/support/issues/2533) - Panel items laid out using spacing by default
* [#2579](https://github.com/bryntum/support/issues/2579) - Popup should be maximizable
* [#2616](https://github.com/bryntum/support/issues/2616) - Varying padding-left in Panel
* [#2662](https://github.com/bryntum/support/issues/2662) - Toolbar can create duplicate IDs in overflow menu
* [#2671](https://github.com/bryntum/support/issues/2671) - parentIndex field has incorrect value after clearing filters

## 4.1.0 - 2021-04-02

### FEATURES / ENHANCEMENTS

* API code improvements for better XSS injection protection
* Model fields can now be marked with `alwaysWrite` to ensure important data fields are always included when updates
* Refactored `TabPanel` base class to `Panel` from `Container`. The `Panel` class's algorithm for handling docked
  items (such as `tbar` and `bbar`) was enhanced to work with the new `tabBar` config of `TabPanel` using the new
  `strips` config. The `strips` config is like `tools` except it is designed for toolbars. The items in `strips`
  have a `dock` config to specify the edge to which they dock (`'top'`, `'left'`, `'bottom'`, or `'right'`) or,
  alternatively, `'header'` or `'pre-header'` to position the toolbar in the panel's header after or before the
  title, respectively. These items also use their `weight` config to determine their docking order. The higher the
  item's `weight`, the closer it will be to the panel's central body element ([#1837](https://github.com/bryntum/support/issues/1837))
* Refactored the tab strip of `TabPanel` into a `TabBar` widget that extends `Toolbar`. This uses the new `tabBar`
  config of `TabPanel` to add an item to the new `strips` config of `Panel`. The `tabBar` uses its `weight` config
  to order it along with `tbar` and `bbar` of the `Panel`. The `tabBar` also inherits the `overflow` feature of
  `Toolbar` ([#1827](https://github.com/bryntum/support/issues/1827))
* Panel now has a `bodyCls` config to place CSS classes on the body element
* DatePicker now supports `cellRenderer` to output custom contents into the date cells ([#2498](https://github.com/bryntum/support/issues/2498))

### BUG FIXES

* [#876](https://github.com/bryntum/support/issues/876) - `store.query` should search through all records when searchAllRecords is true
* [#1819](https://github.com/bryntum/support/issues/1819) - DatePicker styling issues
* [#2128](https://github.com/bryntum/support/issues/2128) - Support for top-positioned field labels
* [#2194](https://github.com/bryntum/support/issues/2194) - Setting `title` on item in a `TabPanel` now updates the text of the tab in the tab bar
* [#2235](https://github.com/bryntum/support/issues/2235) - Not possible to type in negative numbers to the number field
* [#2273](https://github.com/bryntum/support/issues/2273) - Toast shows blank space at right side
* [#2317](https://github.com/bryntum/support/issues/2317) - Date picker jumps to wrong month when clicking next
* [#2435](https://github.com/bryntum/support/issues/2435) - TabPanel issues
* [#2439](https://github.com/bryntum/support/issues/2439) - Drag and drop selects text in Safari

## 4.0.7 - 2021-01-12

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 4.0.6 - 2020-11-03

### BUG FIXES

* [#1413](https://github.com/bryntum/support/issues/1413) - Card layout change animation
* [#2075](https://github.com/bryntum/support/issues/2075) - Widget's `newInstance` tooltip cannot be dynamically reconfigured

## 4.0.5 - 2020-12-15

### BUG FIXES

* [#1826](https://github.com/bryntum/support/issues/1826) - Setting hidden/disabled property to tabs in TabPanel does not work as expected

## 4.0.4 - 2020-12-09

### FEATURES/ENHANCEMENTS

* Added config to specify allowed units (DurationField.allowedUnits) for the duration field ([#1891](https://github.com/bryntum/support/issues/1891))

## 4.0.3 - 2020-11-17

### BUG FIXES

* [#1811](https://github.com/bryntum/support/issues/1811) - Number field `changeOnSpin` flag doesn't work as expected

## 4.0.2 - 2020-11-04

### FEATURES / ENHANCEMENTS

* Internal code improvements and bugfixes

## 4.0.1 - 2020-11-03

### BUG FIXES

* [#1218](https://github.com/bryntum/support/issues/1218) - ComboBox list should be anchored to top/bottom sides only
* [#1729](https://github.com/bryntum/support/issues/1729) - Added border color for disabled button

## 4.0.0 - 2020-10-19

### API CHANGES

* Mask `progress` and `maxProgress` are now public properties
* The `Core/adapter` directory has been removed. There are no Widget adapters. All Widget classes register themselves
  with the `Widget` class, and the `Widget` class is the source of Widget `type` mapping and Widget registration and
  lookup by `id`
* Toolbars now have an inner element to wrap their child items with the class `'b-toolbar-content'`
  If you had customized CSS which targeted toolbar items, this may need to change

### FEATURES/ENHANCEMENTS

* Added new 'filterfield' to filter a Store
* Added new class `Core.helper.XMLHelper` with method to convert object to XML format
* Added XSS protection functions: `StringHelper.encodeHtml` and `StringHelper.xss`
* The `Toolbar` class now has an `overflow` config which may be `scroll` or `menu` to specify how overflowing toolbar
  items can be accessed

### BUG FIXES

* [#1349](https://github.com/bryntum/support/issues/1349) - Not possible to type into field with text selected
* [#1483](https://github.com/bryntum/support/issues/1483) - Fixed time format with AM/PM removing the "0" changing from 09:00 PM to 9:00 PM
* [#1542](https://github.com/bryntum/support/issues/1542) - Scheduler put inside of panel gets narrow with overlay scrollbar
* [#1555](https://github.com/bryntum/support/issues/1555) - Changed time format with AM/PM to return minutes only if is greater than "0" for `En` localization
* [#1644](https://github.com/bryntum/support/issues/1644) - Fixed `NumberField` enforcement of min/max values to allow typing beyond those ranges
* [#1694](https://github.com/bryntum/support/issues/1694) - Label overlaps start trigger in material theme
* [#1779](https://github.com/bryntum/support/issues/1779) - Label overlaps trigger icon in DateTimeField if value is empty

## 3.0.2 - 2020-01-29

### FEATURES/ENHANCEMENTS

* The core.module.js bundle is now lightly transpiled to ECMAScript 2015 using Babel to work with more browsers out of
  the box
* parentIndex is now a public field of TreeNode ([#358](https://github.com/bryntum/support/issues/358))
* Font Awesome 5 Pro was replaced with Font Awesome 5 Free as the default icon font (MIT / SIL OFL license)
* Font Awesome should be bound to font-weight 900 ([#596](https://github.com/bryntum/support/issues/596))
* The default year for our time components has been changed, they now use 2020 instead of 1970. For example,
  whatever time you set to the TimeField, the date will be Jan 1, 2020
* All widgets which contain other widgets can now be set to `readOnly : true` in addition to Field widgets
  This means it is easy to "lock" a UI to allow it to display information to users who may not have authorization
  to modify data
* The `Widget` `align` config's object form now accepts the `monitorResize` option, specifying that during
  aligned visibility, the Widget should monitor its target's size, and realign if it changes
* The `StateTrackingManager` now fires a new `disabled` event indicating its disabled state

### API CHANGES

* ObjectHelper#setPath method became chainable: it returns passed object instance
* DateHelper.getTime now accepts date as a parameter to extract time of
* Added DateHelper.defaultParseFormat property to allow separate formats for date/time parsing and formatting
* Model#copy now accepts an object with new values used to create the copy
* DEPRECATED: Model#copy no longer accepts passing `deep` property of the first parameter. Use 2nd parameter to indicate
  deep copying instead
* Removed not used localizations `DateHelper.shortWeek`, `DateHelper.shortQuarter`, `DateHelper.week`,
  `InstancePlugin.fnMissing`, `InstancePlugin.overrideFnMissing`
* Added `Model.clearChanges` method to clear record modifications without reverting them
* Added `DateHelper.getWeekNumber` method to get week number by date
* Model fields in derived classes are now merged with corresponding model fields (by name) in super classes. This allows
  serialization and other attributes to be inherited when a derived class only wants to change the `defaultValue` or
  other attribute of the field
* The `dateFormat` config for `type='date'` model fields has been simplified to `format`

### BUG FIXES

* [#742](https://github.com/bryntum/support/issues/742) - Not persistable data change may initiate a commit with an empty object
* [#756](https://github.com/bryntum/support/issues/756) - Cannot copy task when using deep: true flag
* [#330](https://github.com/bryntum/support/issues/330) - Id collision happens when you add or move records after filters are cleared
* [#422](https://github.com/bryntum/support/issues/422) - Theme switching leaks elements and crashes if changing multiple times with slow network
* [#492](https://github.com/bryntum/support/issues/492) - Button pressed/hover state sticks after click
* [#501](https://github.com/bryntum/support/issues/501) - DateHelper can't parse time with milliseconds correctly
* [#719](https://github.com/bryntum/support/issues/719) - Direction of sorting gets changed after each sort call with a sorting function provided
* [#729](https://github.com/bryntum/support/issues/729) - Field validation messages should be localizable
* [#769](https://github.com/bryntum/support/issues/769) - Popup is not aligned to target properly with constrainTo
* [#872](https://github.com/bryntum/support/issues/872) - Card layout Containers (eg `TabPanel`) now use the Widget `hide`/`show` API to hide and show child items
  meaning that apps can detect and react to these lifecycle events
* [#975](https://github.com/bryntum/support/issues/975) - STM doesn't update store changes properly
* [#1393](https://github.com/bryntum/support/issues/1393) - Combo's field overwritten during type-to-filter

## 3.0.1 - 2020-01-16

### FEATURES/ENHANCEMENTS

* Store can now remove individual filters by filter id or Filter instance using `store.removeFilter` ([#462](https://github.com/bryntum/support/issues/462))

### BUG FIXES

* [#2](https://github.com/bryntum/support/issues/2) - Not possible to enter 00:00 into time field
* [#213](https://github.com/bryntum/support/issues/213) - The `FilePicker` would fire two `change` events on each file selection. IE11 and Edge would also not
  fire the `change` event correctly, often not firing on the first user selection. Both issues have been corrected
* [#253](https://github.com/bryntum/support/issues/253) - Fixed exception when a popup (such as a context menu) would lose focus due to an active editor's
  `invalidAction: 'block'` setting. Such editors return focus to themselves when invalid, causing the popup to hide
  itself in the middle of its `show()` call
* [#258](https://github.com/bryntum/support/issues/258) - CheckBox should be usable as a field

## 3.0.0 - 2019-12-20

### FEATURES/ENHANCEMENTS

* Added `leadingZeroes` config option for NumberField (#7524)
* Localization. Common localizable words and phrases may now be added to a common `Object` block of properties and will
  be accessible to all classes
* Added support for named listeners ([#43](https://github.com/bryntum/support/issues/43))

### API CHANGES

* BREAKING: Model no longer considers `null` as a valid id on records. It is now handled the same way as if id was
  undefined, meaning that a generated id will be assigned instead. If you use `null` as id on a record in your code,
  this change might be breaking

  We recommend to always supply an id for records from your backend, and there is a new setting on Store to enforce
  that. Configuring Store with `allowNoId: false` will make it throw if a record without id is loaded (#8570)
* `Mask` now accepts a `target` config instead of an `element` config. The constructor converts an `element` in the
  config object to the new `target` config, but passing `element` is now deprecated
* BREAKING: The `element` property of a `Mask` instance is now the mask's primary element (as with widgets). This
  could break applications if they were to access this property and expect to have the mask's target (which is now
  accessed via the mask's `target` property)
* NumberField no longer uses native stepping with the arrow keys, instead it implements its own with configurable
  behaviour. See the new `changeOnSpin` config
* `DomHelper.createElement()` now accepts options as an object for its 2nd parameter. If a `Boolean`
  is passed, it is still interpreted as the `returnAll` parameter

  To pass `returnAll` in the new form: `createElement(..., { returnAll: true });`

### BUG FIXES

* #9212 - Adding FilePicker as widget for column


<p class="last-modified">Last modified on 2026-07-22 10:46:00</p>