# Creating custom features

This guide explains how to create custom features (plugins) for Grid and other Bryntum widgets.

## Introduction

All Bryntum features extend [InstancePlugin](#Core/mixin/InstancePlugin). A plugin attaches to a "client" (Grid, Scheduler, etc.)
and can:

- Add new methods to the client
- Hook into existing methods (before or after)
- Override methods while retaining access to the original

The `pluginConfig` static getter defines how your plugin's methods integrate with the client.

## Basic feature structure

Here's the basic structure of a custom feature:

```javascript
import InstancePlugin from 'PATH_TO_SOURCE/Core/mixin/InstancePlugin.js';
import GridFeatureManager from 'PATH_TO_SOURCE/Grid/feature/GridFeatureManager.js';

export default class MyFeature extends InstancePlugin {
    // Required: Name used to access the feature via grid.features.myFeature
    static $name = 'MyFeature';

    // Define how methods integrate with the client
    static get pluginConfig() {
        return {
            after : ['onElementClick']
        };
    }

    // Called when feature is constructed
    construct(client, config) {
        super.construct(client, config);

        // Your initialization code here
        console.log('MyFeature initialized on', client);
    }

    // This method will be called after Grid's onElementClick
    onElementClick(event) {
        console.log('Click detected:', event.target);
    }
}

// Register the feature with Grid (second argument: enabled by default?)
GridFeatureManager.registerFeature(MyFeature, false);
```

## The pluginConfig system

The `pluginConfig` getter returns an object defining how your plugin's methods connect to the client. There are four
connection types:

### assign - Add new methods to the client

Use `assign` to add new methods to the client (the owning widget, e.g. Grid, Scheduler):

```javascript
class SelectionExporter extends InstancePlugin {
    static $name = 'SelectionExporter';

    static get pluginConfig() {
        return {
            assign : ['exportSelection', 'getSelectionAsCSV']
        };
    }

    // These methods will be callable directly on the grid:
    // grid.exportSelection() and grid.getSelectionAsCSV()

    exportSelection(format = 'json') {
        const selected = this.client.selectedRecords;
        if (format === 'json') {
            return JSON.stringify(selected.map(r => r.data));
        }
        return this.getSelectionAsCSV();
    }

    getSelectionAsCSV() {
        const
            records = this.client.selectedRecords,
            columns = this.client.columns.visibleColumns;

        // Generate CSV...
        return records.map(record =>
            columns.map(col => record.get(col.field)).join(',')
        ).join('\n');
    }
}
```

### after - Run after original method

Use `after` when your code should run **after** the client's method:

```javascript
class ClickLogger extends InstancePlugin {
    static $name = 'ClickLogger';

    static get pluginConfig() {
        return {
            after : ['onElementClick']
        };
    }

    construct(client, config) {
        super.construct(client, config);

        // Listen for paint event
        client.ion({
            paint   : 'onPaint',
            thisObj : this
        });
    }

    // Called after Grid's onElementClick runs
    onElementClick(event) {
        console.log('Click detected:', event.target);
    }

    // Called when Grid is painted
    onPaint({ firstPaint }) {
        if (firstPaint) {
            console.log('Grid painted with', this.client.store.count, 'rows');
        }
    }
}
```

### before - Run before original method

Use `before` when your code should run **before** the client's method. Return `false` to prevent the original from
running:

```javascript
class ClickBlocker extends InstancePlugin {
    static $name = 'ClickBlocker';

    static get pluginConfig() {
        return {
            before : ['onElementClick']
        };
    }

    // Called before Grid's onElementClick
    // Return false to prevent the original method from running
    onElementClick(event) {
        // Block clicks on cells with 'readonly' CSS class
        if (event.target.closest('.readonly')) {
            event.stopPropagation();
            return false; // Prevents Grid's onElementClick from running
        }
    }
}
```

### override - Replace method but keep access to original

Use `override` for complete control while retaining access to the original via `this.overridden.methodName()`:

```javascript
class DataTransformer extends InstancePlugin {
    static $name = 'DataTransformer';

    static get pluginConfig() {
        return {
            override : ['getRecordFromElement']
        };
    }

    // Completely replaces Grid's getRecordFromElement
    getRecordFromElement(element) {
        // Call the original implementation
        const record = this.overridden.getRecordFromElement(element);

        // Add custom logic
        if (record && this.shouldTransform(record)) {
            return this.createTransformedRecord(record);
        }

        return record;
    }

    shouldTransform(record) {
        return record.get('type') === 'special';
    }

    createTransformedRecord(record) {
        // Custom transformation logic
        return record;
    }
}
```

## Complete example

A feature that tracks cell hover time and fires an event when the threshold is exceeded:

```javascript
import InstancePlugin from 'PATH_TO_SOURCE/Core/mixin/InstancePlugin.js';
import GridFeatureManager from 'PATH_TO_SOURCE/Grid/feature/GridFeatureManager.js';
import Delayable from 'PATH_TO_SOURCE/Core/mixin/Delayable.js';

export default class CellHoverTracker extends InstancePlugin.mixin(Delayable) {
    static $name = 'CellHoverTracker';

    static configurable = {
        // Hover threshold in milliseconds before firing the longHover event
        hoverThreshold : 2000
    };

    static get pluginConfig() {
        return {
            // Add new methods to the grid
            assign : ['getHoverStats']
        };
    }

    construct(client, config) {
        super.construct(client, config);

        this.hoverStats = new Map();
        this.currentHover = null;

        // Listen for cell mouse events
        client.ion({
            cellMouseOver : 'onCellMouseOver',
            cellMouseOut  : 'onCellMouseOut',
            thisObj       : this
        });
    }

    // Assigned to grid, callable as grid.getHoverStats()
    getHoverStats() {
        return Object.fromEntries(this.hoverStats);
    }

    // Called when mouse enters a cell
    onCellMouseOver({ record, column }) {
        if (record) {
            this.startHoverTracking({ record, column });
        }
    }

    // Called when mouse leaves a cell
    onCellMouseOut() {
        this.stopHoverTracking();
    }

    startHoverTracking(cellData) {
        this.stopHoverTracking();

        const key = `${cellData.record.id}-${cellData.column.field}`;

        this.currentHover = {
            key,
            startTime : Date.now()
        };

        // Use Delayable's setTimeout for automatic cleanup on destroy
        this.setTimeout({
            fn    : () => this.onLongHover(cellData),
            delay : this.hoverThreshold,
            name  : 'hoverTimeout'
        });
    }

    stopHoverTracking() {
        if (this.currentHover) {
            this.clearTimeout('hoverTimeout');

            const
                duration     = Date.now() - this.currentHover.startTime,
                prevDuration = this.hoverStats.get(this.currentHover.key) || 0;

            this.hoverStats.set(this.currentHover.key, prevDuration + duration);

            this.currentHover = null;
        }
    }

    onLongHover(cellData) {
        /**
         * Fired when a cell has been hovered for longer than the threshold
         * @event longHover
         * @param {Core.data.Model} record The hovered record
         * @param {Grid.column.Column} column The hovered column
         * @param {Number} duration Hover duration in ms
         */
        this.client.trigger('longHover', {
            record   : cellData.record,
            column   : cellData.column,
            duration : this.hoverThreshold
        });
    }

    doDestroy() {
        this.stopHoverTracking();
        this.hoverStats.clear();
        super.doDestroy();
    }
}

// Register with Grid, disabled by default
GridFeatureManager.registerFeature(CellHoverTracker, false);
```

Usage:

```javascript
const grid = new Grid({
    features : {
        cellHoverTracker : {
            hoverThreshold : 3000 // 3 seconds
        }
    },

    listeners : {
        longHover({ record, column }) {
            console.log(`Long hover on ${record.id}, column ${column.field}`);
        }
    }
});

// Access the assigned method
console.log(grid.getHoverStats());
```

## Disabled state

Features can be enabled/disabled at runtime using the inherited `disabled` config:

```javascript
class ToggledFeature extends InstancePlugin {
    static $name = 'ToggledFeature';

    static get pluginConfig() {
        return {
            after : ['onElementClick']
        };
    }

    onElementClick(event) {
        // Always check disabled state in your handlers
        if (this.disabled) {
            return;
        }

        // Feature logic here
    }

    // Override doDisable to add custom enable/disable behavior
    doDisable(disable) {
        super.doDisable(disable);

        if (disable) {
            // Clean up when disabled
            this.cleanup();
        }
        else {
            // Re-initialize when enabled
            this.initialize();
        }
    }
}
```

Usage:

```javascript
// Disable at runtime
grid.features.toggledFeature.disabled = true;

// Re-enable
grid.features.toggledFeature.disabled = false;
```

## Accessing the client

Inside your plugin, `this.client` refers to the attached widget:

```javascript
onCellClick({ record, column }) {
    const
        { client }  = this,
        store       = client.store,
        columns     = client.columns,
        sortFeature = client.features.sort;

    // Trigger events on the client
    client.trigger('myCustomEvent', { record, column });
}
```

## Feature registration

Register your feature to make it available via the `features` config:

```javascript
import GridFeatureManager from 'PATH_TO_SOURCE/Grid/feature/GridFeatureManager.js';

// Second argument: true = enabled by default, false = disabled by default
GridFeatureManager.registerFeature(MyFeature, false);
```

For Scheduler-specific features:

```javascript
import GridFeatureManager from 'PATH_TO_SOURCE/Grid/feature/GridFeatureManager.js';

// Third argument: product name
GridFeatureManager.registerFeature(MySchedulerFeature, false, 'Scheduler');
```

## Best practices

1. **Check `disabled` state** in handlers before executing logic
2. **Clean up in `doDestroy`** - Remove listeners, timers, and DOM elements
3. **Use `this.client`** - Don't store separate widget references
4. **Prefer `before`/`after` over `override`** - Less intrusive
5. **Return `false` from `before`** only to prevent default behavior
6. **Document with JSDoc** - Include events and configs
7. **Keep features focused** - One responsibility per feature

## See also

- [InstancePlugin](#Core/mixin/InstancePlugin) - Base class API documentation
- [GridFeatureManager](#Grid/feature/GridFeatureManager) - Feature registration
- [Grid features guide](#Grid/guides/basics/features.md) - Overview of built-in features


<p class="last-modified">Last modified on 2026-07-22 10:38:53</p>