# Creating custom Widgets

Bryntum components extend the [Widget](#Core/widget/Widget) base class and build on its rendering capabilities to produce DOM elements and
listen for events. This guide demonstrates how to create custom widgets using the `compose()` API.

## The Widget class

At its core, a Widget is essentially a wrapper around a `<div>` element. When you create a widget, Bryntum
automatically creates a `<div>` element and provides you with a rich API to manage it:

- Lifecycle management - Construction, rendering, destruction
- Configuration system - Declarative property definitions with getters/setters
- Event handling - Built-in event system with `trigger()`, `on()`, `un()`
- DOM management - Element creation and manipulation via `compose()`
- Responsive updates - Automatic re-rendering when properties change

## The `compose()` Method

Creating a custom widget starts with a class that extends `Widget` and implements the `compose()` method. The
`compose()` method returns a [DomConfig](#Core/helper/DomHelper#typedef-DomConfig) object describing the widget's DOM 
structure.

For example, a `Link` component would look like the following:

```javascript
class Link extends Widget {
    static configurable = {
        href : null,
        text : null
    };

    compose() {
        const { href, text } = this;

        return {
            tag : 'a',
            href,
            text
        };
    }
}

const link = new Link({
    appendTo : document.body,
    text     : 'The link',
    href     : '#foo'
});
```

Widgets leverage configuration properties declared in the `static configurable` object, and these properties automatically
get getters and setters generated. Getters accessed in the first call to `compose` will trigger re-composition later 
when the property is changed.

### What is DomConfig?

[DomConfig](#Core/helper/DomHelper#typedef-DomConfig) is a plain JavaScript object that describes a DOM element and its properties. It's used throughout
Bryntum for declarative DOM generation. Think of it as a "recipe" for creating HTML elements.

Standard DomConfig properties (work with [DomHelper](#Core/helper/DomHelper)):
- `tag` - HTML tag name (default: 'div')
- `class` or `className` - CSS classes (string or object)
- `style` - Inline styles (string or object)
- `text` - Text content (XSS-safe)
- `html` - HTML content (raw HTML string)
- `children` - Array or object of child DomConfigs
- `dataset` - Data attributes
- Any standard HTML attributes (`id`, `src`, `href`, etc.)

Widget-specific extensions (only work in `compose()`):
- `reference` - Creates `this.referenceName` property pointing to the element
- `listeners` - Event handlers as method names

#### Children: Array vs Object

The `children` property can be either an array or an object:

```javascript
// Array form - anonymous children (no references created)
children : [
    { tag : 'span', text : 'Child 1' },
    { tag : 'span', text : 'Child 2' }
]

// Object form - named children (creates references)
children : {
    firstChild : {  // Creates this.firstChild reference
        tag  : 'span',
        text : 'Child 1'
    },
    secondChild : {  // Creates this.secondChild reference
        tag  : 'span',
        text : 'Child 2'
    }
}
```

Use object form when you need to access child elements later (for reading values, adding listeners, etc.). Use array
form when children are purely presentational.

### Automatic Recomposition

The key power of `compose()` is reactivity: any property you read in the first call to `compose()` becomes a dependency. 
When that property changes, `compose()` automatically re-runs and efficiently updates only the changed parts of the DOM.

Think of `compose()` as a "dependency tracker." When it runs for the first time, Bryntum records every config property you
access via this. If you read a property inside a helper method that `compose()` calls, it is still tracked. 

```javascript
link.text = 'New link text';  // compose() re-runs, DOM updates automatically
link.href = '#bar';            // compose() re-runs again
```

Changes are batched and applied on the next animation frame, making updates very efficient even when multiple
properties change in quick succession.

### When `compose()` Re-runs

The `compose()` method automatically re-runs when:

1. Any property read during `compose()` changes (detected via getter tracking)
2. The widget is hidden then shown again
3. `recompose()` is called manually (uncommon)

It does NOT re-run when:
- Properties not read during `compose()` change
- Methods are called that don't change tracked properties

```javascript
class Counter extends Widget {
    static configurable = {
        count     : 0,
        internal  : 0 
    };

    compose() {
        const { count } = this;  // count is tracked
        // `internal` is NOT read, so not tracked

        return { text : `Count: ${count}` };
    }
}

const counter = new Counter();
counter.count = 5;      // Triggers `compose()` re-run
counter._internal = 10; // Does NOT trigger `compose()` re-run
```

## Child Elements

Most widgets will need to render multiple elements. To illustrate, consider an enhancement to the `Link` widget to
add an external link icon. Instead of the simple `<a>` element, the new `Link` renders a `<div>` with one or two
child `<a>` elements.

```javascript
class Link extends Widget {
    static configurable = {
        external : null,
        href     : null,
        target   : '_blank',
        text     : null
    };

    compose() {
        const { external, href, target, text } = this;

        return {
            children : {
                linkElement : {
                    tag : 'a',
                    href,
                    text
                },

                externalLinkElement : external && {
                    tag   : 'a',
                    class : {
                        'fa'                   : 1,
                        'fa-external-link-alt' : 1
                    },
                    href,
                    target
                }
            }
        };
    }
}

const link = new Link({
    appendTo : document.body,
    text     : 'The link',
    href     : '#foo',
    external : true
});
```

The `children` property contains child elements. Element references for each named element are stored on the widget
instance using the key in the `children` object, i.e., `link.linkElement` and `link.externalLinkElement`.

Note how the `externalLinkElement` property will be `null` if the `external` config property is not set to `true`.
When `external` is true, the second child is rendered and `link.externalLinkElement` is set accordingly.

### Change Detection Pattern

Any read access to a config property which takes place during a `compose()` call is recorded and the name of the config
property accessed is added to a register of dependencies. The `compose()` call may call any helper rendering functions
that the author deems necessary.

**Note:** It is best practice to extract all used properties into `const`s first
so that all properties are registered as in use. This is in case conditional 
code does not actually *use* some of those properties on initial compose.

```javascript
compose() {
    // Extract ALL properties which *might* be read at the top — including
    // those only used inside conditional branches below.
    //
    // If `invalid` is `false` on the initial compose, the `if` branch never
    // executes, so `errorColor` and `errorMessage` would never be accessed.
    // They would therefore NOT be registered as dependencies, and a later
    // change to either would fail to trigger a recompose.
    //
    // Reading them up front guarantees they are always tracked.
    const { label, value, color, invalid, errorColor, errorMessage } = this;

    if (invalid) {
        return {
            class : `widget-${errorColor}`,
            text  : errorMessage
        };
    }

    return {
        class : `widget-${color}`,
        text  : `${label}: ${value}`
    };
}
```

## Widget Lifecycle

Understanding the widget lifecycle is crucial for proper resource management and initialization. Here are the key
lifecycle methods:

### `construct(config)`

Called during widget instantiation, before any rendering occurs. At this point, the widget's main element (the `<div>`)
has already been created and is accessible via `this.element`, but it is not yet connected to a document. This is
where you may initialize internal state if necessary. Always call `super.construct(config)` first.

This example illustrates the principles described in the [class system](#Core/guides/advanced/classes.md) guide. The
`construct` method is not actually necessary if the configuration properties are ingested and updated using changers
and updaters.

```javascript
class TimerWidget extends Widget {
    static configurable = {
        interval : 1000,

        socket : {
            $config : 'nullify',   // property is automatically set to null at destruction time to enable cleanup
            value   : 'wss://example.com/socket'
        }
    };

    // Not actually necessary unless instance properties need to be initialized. May be omitted.
    construct(config) {
        super.construct(config); 
    }

    updateInterval(interval) {
        // Stop any previous timer by its id if the interval is ever changed
        this.clearInterval(this.timerId);

        // Set up timer using `Delayable` mixin to have automatic cleanup on destroy.
        this.timerId = this.setInterval(() => {
            this._tickCount = (this._tickCount || 0) + 1;
            this.trigger('tick', { count : this._tickCount });
        }, interval);
    }

    // Previous value always passed as second parameter
    changeSocket(socket, was) {
        // Close any previous socket instance (null will be passed at destruction time)
        was?.close();

        // Create the websocket instance from the configured address
        if (socket) {
            socket = new WebSocket(socket);
            socket.addEventListener('message', (event) => {
                this.onSocketMessage(event);
            });
            return socket;
        }
    }
    
    onSocketMessage(event) {
        // Handle incoming messages
    }
}
```

### `onPaint()`

Override `onPaint()` to perform setup after the widget is in the DOM. The `firstPaint` property indicates if this is
the initial render.

```javascript
compose() {
    return {
        children : [
            {
                tag       : 'button',
                reference : 'myButton',  // Creates this.myButton automatically
                text      : 'Click Me'
            }
        ]
    };
}

// Override onPaint - called automatically when widget is painted
onPaint({ firstPaint }) {
    if (firstPaint) {
        // Reference automatically available as this.myButton
        this.myButton.addEventListener('click', (e) => {
            this.onButtonClick(e);
        });
    }
}
```

NOTE: While `onPaint()` gives you direct access to the DOM, avoid manually updating attributes, classes, or styles that
are already defined in your `compose()` method. Any manual changes made here will be overwritten the next time the widget
"recomposes" due to a property change. Use `onPaint()` strictly for non-reactive initialization, such as initializing
third-party libraries (e.g., a D3 chart). 

### `doDestroy()`

Called when the widget is being destroyed. This is where you must clean up timers, event listeners on external
objects, and any other resources. Always call `super.doDestroy()` last.

```javascript
doDestroy() {
    // Clean up timers
    if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
    }

    // Clean up external event listeners
    if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
    }

    super.doDestroy();  // ALWAYS LAST
}
```

## Inheritance, `compose()`, and Event Handling

When extending a base class such as `Link`, the derived class can customize the elements by implementing a `compose()`
method of its own. Unlike typical inherited methods, the `compose()` methods of all classes are automatically called
and their returned objects are merged key-by-key. Values returned by the base class are overwritten by the derived
class where key names match.

Let's build a `CopyableLink` widget that extends `Link` and adds a copy icon. We'll add it incrementally to show how
inheritance and event handling work together.

First, let's add the copy icon element:

```javascript
class CopyableLink extends Link {
    static configurable = {
        copyIcon : 'fa-copy'
    };

    compose() {
        const { copyIcon } = this;

        return {
            children : {
                copyIconElement : {
                    tag   : 'span',
                    class : {
                        'fa'       : 1,
                        [copyIcon] : 1
                    }
                }
            }
        };
    }
}
```

The object returned by this `compose()` is merged with the base `Link` class's `compose()` output. The result is a
`children` object with three keys: `linkElement` and `externalLinkElement` (from Link) plus `copyIconElement` (from
CopyableLink).

Now let's make it interactive by adding an event handler. We add a `listeners` property to the element:

```javascript
class CopyableLink extends Link {
    static configurable = {
        copyIcon : 'fa-copy'
    };

    compose() {
        const { copyIcon } = this;

        return {
            children : {
                copyIconElement : {
                    tag   : 'span',
                    class : {
                        'fa'       : 1,
                        [copyIcon] : 1
                    },
                    listeners : {
                        click : 'onCopyLink'  // Method name as string
                    }
                }
            }
        };
    }

    onCopyLink(event) {
        navigator.clipboard?.writeText(this.linkElement.href);
    }
}

const link = new CopyableLink({
    appendTo : document.body,
    text     : 'Copyable link',
    href     : '#foo'
});
```

The `listeners` object maps event names to method names (as strings). When clicked, the `onCopyLink` method is called
with `this` bound to the widget instance, giving access to `this.linkElement` and other properties.

## Real-World Example: ProgressBar

Let's look at Bryntum's actual `ProgressBar` widget as a perfect example of how simple and elegant compose-based
widgets can be:

```javascript
import Widget from './Widget.js';
import DomHelper from '../helper/DomHelper.js';

DomHelper.loadStylesheet('Core/widget/ProgressBar.css');

export default class ProgressBar extends Widget {
    static $name = 'ProgressBar';
    static type = 'progressbar';

    static configurable = {
        label         : '',
        valueText     : null,
        value         : 0,
        valueRenderer : null,
        max           : null,
        color         : 'b-blue'
    };

    compose() {
        const { label, max, color, value } = this;
        let percentage;

        if (max != null) {
            percentage = Math.min(100, Math.max(0, (value / max) * 100));
        }
        else {
            percentage = Math.min(100, Math.max(0, value * 100));
        }

        return {
            class : 'b-progress-bar',
            children : [
                {
                    class    : 'b-progress-bar-header',
                    children : [
                        {
                            tag   : 'label',
                            class : 'b-label b-progress-bar-label',
                            text  : label
                        },
                        {
                            tag   : 'label',
                            class : 'b-label b-progress-bar-value',
                            text  : this.getDisplayValue()
                        }
                    ]
                },
                {
                    class    : 'b-progress-bar-track',
                    children : [
                        {
                            class : 'b-progress-bar-fill',
                            style : {
                                width : `${percentage}%`
                            }
                        }
                    ]
                }
            ]
        };
    }

    getDisplayValue() {
        const me = this;
        if (me.valueRenderer) {
            return me.valueRenderer(me.value, me.max);
        }
        if (me.valueText != null) {
            return me.valueText;
        }
        if (me.max != null) {
            return `${Math.round(me.value / me.max * 100)}%`;
        }
        return `${Math.round(me.value * 100)}%`;
    }
}

ProgressBar.initClass();
```

Notice how simple this is:
- No manual DOM updates - When `value`, `color`, `label`, or `max` changes, `compose()` automatically re-runs
- Clean separation - Logic (`getDisplayValue()`) is separate from rendering (`compose()`)
- Minimal code - The entire widget is ~140 lines including JSDoc comments
- Reactive - Changes to any property used in `compose()` trigger automatic re-rendering

Here's the basic CSS used by the `ProgressBar` widget:

```css
.b-progress-bar {
    display        : flex;
    flex-direction : column;
    width          : 100%;
    margin-bottom  : 1em;

    .b-label {
        font-size : 0.95em;
    }

    .b-progress-bar-label {
        margin-inline-end: 3em;
    }
}

.b-progress-bar-header {
    display         : flex;
    justify-content : space-between;
    align-items     : center;
    margin-bottom   : 0.5em;
}

.b-progress-bar-track {
    width            : 100%;
    height           : 6px;
    background-color : var(--b-neutral-90);
    border-radius    : 3px;
    overflow         : hidden;
    position         : relative;
}

.b-progress-bar-fill {
    height           : 100%;
    border-radius    : var(--b-widget-border-radius);
    transition       : width 0.2s ease;
    background-color : var(--b-primary);
}
```

<div class="external-example" data-file="Core/guides/advanced/SimpleProgressBar.js"></div>

## Custom Rating Widget Example

Here's another example showing a more interactive widget:

```javascript
class StarRating extends Widget {
    static $name = 'StarRating';
    static type = 'starrating';

    static configurable = {
        value    : 0,
        maxStars : 5,
        editable : true
    };

    compose() {
        const { value, maxStars, editable } = this,
            stars = [];

        for (let i = 1; i <= maxStars; i++) {
            const filled = i <= value;

            stars.push({
                tag   : 'i',
                class : {
                    fa            : 1,
                    'fa-star'     : filled,
                    'fa-star-o'   : !filled,
                    'star-active' : editable
                },
                dataset : {
                    starIndex : i
                }
            });
        }

        return {
            class    : 'star-rating',
            children : stars
        };
    }

    onPaint({ firstPaint }) {
        if (firstPaint && this.editable) {
            this.element.addEventListener('click', (e) => {
                const starEl = e.target.closest('[data-star-index]');
                if (starEl) {
                    this.value = parseInt(starEl.dataset.starIndex);
                    this.trigger('change', { value : this.value });
                }
            });
        }
    }
}

StarRating.initClass();
```

<div class="external-example" data-file="Core/guides/advanced/StarRating.js"></div>

## Composite Widgets

Composite widgets are built by combining other widgets. Instead of extending `Widget`, you extend `Container` or
`Panel` and configure child widgets.

```javascript
class SearchBox extends Container {
    static $name = 'SearchBox';
    static type = 'searchbox';

    static configurable = {
        placeholder : 'Search...',
        buttonText  : 'Search',
        layout      : 'hbox',

        items : {
            searchField : {
                type        : 'textfield',
                ref         : 'searchField',
                flex        : 1,
                placeholder : 'up.placeholder',
                clearable   : true
            },
            searchButton : {
                type      : 'button',
                ref       : 'searchButton',
                text      : 'up.buttonText',
                icon      : 'fa-search',
                rendition : 'filled',
                color     : 'b-blue',
                onClick   : 'up.onSearchClick'
            }
        }
    };

    get searchValue() {
        return this.widgetMap.searchField.value;
    }

    onSearchClick() {
        const value = this.searchValue;
        this.trigger('search', { value });
    }
}

SearchBox.initClass();
```

### Accessing Child Widgets: `ref` and `widgetMap`

In composite widgets, you often need to access child widgets. The `ref` config creates entries in the parent's
`widgetMap` object:

```javascript
items : {
    searchField : {
        type : 'textfield',
        ref  : 'searchField'  // Creates this.widgetMap.searchField
    }
}

get searchValue() {
    return this.widgetMap.searchField.value;  // Access via widgetMap
}
```

The `ref` property creates a reference in `widgetMap` using the specified name. This allows you to access child widget
instances and call methods or read properties on them.

Note the difference between `compose()` references and Container `ref`:
- In `compose()`: `reference: 'myButton'` creates `this.myButton` (DOM element)
- In Container `items`: `ref: 'searchField'` creates `this.widgetMap.searchField` (Widget instance)
- `ref`s of a widget are hoisted to any parent Container's `widgetMap` as well for easy access.

### Property Resolution with 'up.'

Notice the `'up.placeholder'` and `'up.buttonText'` values in the example above. The `'up.'` prefix is a Bryntum
convention for referencing properties on an ancestor widget. This creates a property binding from child to parent.

When Bryntum encounters a string value starting with `'up.'`, it resolves the property from the owner widget:

```javascript
placeholder : 'up.placeholder'   // Resolves to this.owner.placeholder
text        : 'up.buttonText'    // Resolves to this.owner.buttonText
onClick     : 'up.onSearchClick' // Calls this.owner.onSearchClick()
```

This pattern is useful because:

1. **DRY Principle** - Define properties once on the parent, reference them in children
2. **Encapsulation** - Parent widget controls the configuration of its children

```javascript
items : {
    panel : {
        type  : 'panel',
        items : {
            button : {
                type : 'button',
                text : 'up.rootProperty'  // Resolves to grandparent.rootProperty
            }
        }
    }
}
```

For methods (like `onClick: 'up.onSearchClick'`), the method is called with the owner widget as `this`, maintaining
proper context.

<div class="external-example" data-file="Core/guides/advanced/SearchBox.js"></div>

## Child Element Order

The elements contained in the `children` object are created in the order in which they are
[declared](https://2ality.com/2015/10/property-traversal-order-es6.html) in that object. Elements added by derived
classes (as above) are appended to the inherited elements.

When this order is not desired, a derived class can use the `>` character in the keys of its `children` properties to
insert its elements before an inherited element.  The `>` syntax functions as "Insert `[Key]` before `[Reference]`. 
This allows you to inject custom elements into specific slots of a complex layout inherited from a Bryntum base class 
without having to rewrite the entire `children` object.

```javascript
class CopyableLink extends Link {
    static configurable = {
        copyIcon : 'fa-copy'
    };

    compose() {
        const { copyIcon } = this;

        return {
            children : {
                // Insert copyIconElement before inherited externalLinkElement:
                'copyIconElement > externalLinkElement' : {
                    tag   : 'span',
                    class : {
                        'fa'       : 1,
                        [copyIcon] : 1
                    },
                    listeners : {
                        click : 'onCopyLink'
                    }
                }
            }
        };
    }

    onCopyLink(event) {
        navigator.clipboard?.writeText(this.linkElement.href);
    }
}

const link = new CopyableLink({
    appendTo : document.body,
    text     : 'Copyable link',
    href     : '#foo'
});
```

<div class="external-example" data-file="Core/guides/advanced/widgets.js"></div>

## Styling Your Widget

All Bryntum widgets get a CSS class automatically added to their root element based on their class name. For example,
the ButtonGroup widget class will get the CSS class `b-button-group` (kebab-cased) added to its root element. You can 
use this class to style all instances of that widget.

Similarly, your own created custom widget also gets a CSS class added to it based on its class name. For example, a
custom widget class named: `MyWidget` will get the CSS class `b-my-widget` added to its root element. 
Use this class to scope your widget's styles.

### CSS Best Practices

Use BEM-like naming and CSS variables for theming:

```css
.b-my-widget {
    display          : flex;
    padding          : var(--b-widget-padding);
    background-color : var(--b-panel-background-color);
    border           : 1px solid var(--b-border-color);
    border-radius    : var(--b-widget-border-radius);
}

.b-my-widget-header {
    font-weight : 600;
    color       : var(--b-text-color);
}

/* Use logical properties for RTL support */
.b-my-widget-content {
    margin-inline-start : 1em;
    padding-block       : 0.5em;
}
```

## Configuration Properties

Use `configurable` for all public properties and implement change handlers when needed. Under the hood, Bryntum generates
updater and changer methods for each property. For a property named `propertyName`, the following methods are generated:

- `changeProperty(newValue, oldValue)`: Called before the property is changed. Use this to validate or transform the value.
- `updateProperty(newValue, oldValue)`: Called after the property is changed. Use this to react to the change (e.g., trigger events).

```javascript
static configurable = {
    value : 0,
    label : 'Default'
};

// Called automatically before value is set to allow mutation/validation
changeValue(newValue, oldValue) {
    // Validate value is non-negative
    return Math.max(0, newValue);
}

// Called automatically when value changes
updateValue(newValue, oldValue) {
    console.log(`Value changed from ${oldValue} to ${newValue}`);
    this.trigger('valuechange', { value : newValue, oldValue });
}
```

**The Update Flow**
 When a `configurable` property is changed, Bryntum follows a specific sequence:
 1. `changeProperty()`: Used to transform or validate the incoming value.
 2. `updateProperty()`: Used to react to the change (e.g., triggering events).
 3. `recompose()`: Automatically scheduled for the next animation frame.
 
Because `compose()` is batched, you can update multiple properties simultaneously without triggering multiple heavy 
DOM repaints.

## Boilerplate

All `Widget` classes need some additional boilerplate:

```javascript
export default class Link extends Widget {
    static $name = 'Link';  // Needed for minification
    static type = 'link';   // Short name for config objects

    // ...
}

Link.initClass();  // Registers with widget factory
```

### What Each Property Does

**`static $name`**: Required for minification. When code is minified, class names get shortened (e.g., `Link` becomes
`a`). The `$name` property preserves the original class name for debugging and reflection.

**`static type`**: Registers a short alias for the widget factory. This enables creating widgets from config objects:

```javascript
// With type registered
{ type : 'link', text : 'Click me' }  // Creates Link instance

// Without type, you must use the class directly
new Link({ text : 'Click me' })
```

**`initClass()`**: Must be called after any Widget class definition. This method registers the widget type with the 
factory (enables `{ type : 'link' }` syntax).

Forgetting `initClass()` means your widget won't work with the factory system and config objects won't be processed
correctly.

## Best Practices

### 1. Group Property Extraction at the Top

Reading properties at the top of the method makes the code cleaner and ensures all dependencies are registered 
immediately. Only properties read on the first call to `compose` will trigger recomposition when changed.

```javascript
compose() {
    const { label, value, color } = this;

    return {
        class : `widget ${color}`,
        text  : `${label}: ${value}`
    };
}
```

### 2. Use configurable for Public Properties

```javascript
static configurable = {
    // Public API properties
    label : 'Default',
    value : 0
};
```

### 3. Don't Manually Update DOM

Let `compose()` handle all DOM updates automatically:

```javascript
// BAD - Manual DOM updates
updateValue(value) {
    this.element.querySelector('.value').textContent = value;
}

// GOOD - Let compose() handle it
compose() {
    const { value } = this;

    return {
        children : [
            {
                class : 'value',
                text  : value  // Automatically updates when value changes
            }
        ]
    };
}
```

### 4. Clean Up Resources

```javascript
construct(config) {
    super.construct(config);
    this._timer = setInterval(() => this.updateTime(), 1000);
}

doDestroy() {
    if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
    }
    super.doDestroy();
}
```

### 5. Use References for DOM Access

When you use `reference: 'someName'` in `compose()`, Bryntum automatically creates `this.someName`
pointing to that DOM element.

```javascript
compose() {
    return {
        children : [
            {
                reference : 'myButton',  // Automatically creates this.myButton
                tag       : 'button',
                text      : 'Click me'
            }
        ]
    };
}

onPaint({ firstPaint }) {
    if (firstPaint) {
        this.myButton.addEventListener('click', () => this.onButtonClick());
    }
}
```

## Caveats

The `Widget` class relies on the standard getter and setter for config properties. Overriding the getter will prevent
detection of configs used by `compose()` while overriding the setter will prevent detection of changes to configs and
the automatic call to `recompose()`. Best practice is to leave the getter and setter alone and implement only the
changer or updater methods when needed.

## Further Reading

- [Widget](#Core/widget/Widget) - Base widget class documentation
- [Container](#Core/widget/Container) - Container widget for composite patterns
- [Panel](#Core/widget/Panel) - Panel widget with headers and toolbars
- [DomHelper](#Core/helper/DomHelper) - DOM manipulation utilities
- [DomConfig](#Core/helper/DomHelper#typedef-DomConfig) - DomConfig object structure


<p class="last-modified">Last modified on 2026-07-22 10:38:53</p>