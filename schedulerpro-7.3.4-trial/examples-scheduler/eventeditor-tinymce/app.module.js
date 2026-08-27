import shared from '../_shared/shared.module.js';
import { GlobalEvents, BrowserHelper, DomHelper, RichTextField, Delayable, DateHelper, Scheduler, StringHelper } from '../../build/schedulerpro.module.js';
//region "lib/TinyMceField.js"

/**
 * Implementation of a tinyMCE rich text field.
 *
 * @extends Core/widget/RichTextField
 * @classtype tinymcefield
 * @inputfield
 */
class TinyMceField extends RichTextField.mixin(Delayable) {
    static $name = 'TinyMceField';
    static type = 'tinymcefield';

    tinymce = null;

    //region Config

    static configurable = {
        /**
         * The tinyMCE configuration options.
         *
         * This object is a proxy for all [tinyMCE configuration options](https://www.tiny.cloud/docs/tinymce/latest/initial-configuration/)
         * that should be passed to the editor.
         *
         * Note that some of the config options have defaults for seamless integration into the Bryntum components.
         * @config {Object}
         * @default
         */
        tinyMceConfig : {},

        /**
         * [tinyMCE license key](https://www.tiny.cloud/docs/tinymce/latest/license-key/) that needs to be provided by the customer.
         * @config {String}
         * @default
         */
        licenseKey : '',

        /**
         * The operation mode of the tinyMCE editor. Set to `true` to use content editing instead of the default
         * iFrame based editor. An inline use demonstration is provided in the
         * [Grid Rich text editor example](https://bryntum.com/products/grid/examples/tinymce-editor/).
         * @config {Boolean}
         * @default
         */
        inline : false,

        /**
         * To allow resizing in vertical or both axes, set to `true` or `'both'`.
         * @config {Boolean|'both'}
         * @default
         */
        resize : false,

        /**
         * Define if the dropdown menubar should be displayed (default false).
         * @config {Boolean}
         * @default
         */
        menubar : false,

        /**
         * Focus the editor after it becomes visible. Set to false when this is undesirable in a form where a
         * different control should be initially focused.
         * @config {Boolean}
         * @default
         */
        autoFocus : true,

        /**
         * The default root block of tinyMCE is traditionally a <p>. When integrated with Bryntum components,
         * a <div> element without browser default margins is more useful.
         * @config {String} forced_root_block
         * @default
         */
        rootBlock : 'div',

        /**
         * The default input element to be replaced by the tinyMCE editor in the Bryntum environment.
         *
         * @config {DomConfig}
         * @default
         */
        inputAttributes : {
            tag : 'textarea'
        }
    };

    updateValue(value, ...args) {
        super.updateValue(value, ...args);

        // providing a value to the field causes TinyMCE value reloading
        if (!this.inputting) {
            this.editor?.load();
        }
    }

    //endregion Config

    //region Constructor/destructor

    construct(config = {}) {
        // https://github.com/bryntum/support/issues/13291 Firefox causes uncatchable errors in tinyMCE code when using
        // classic mode in floating containers. To circumvent, always use inline mode with Firefox. Degraded user
        // experience is still better than crashing.
        if (BrowserHelper.isFirefox && !config.inline) {
            this._applyFFInlineFix = true;
            config.inline = true;
        }

        super.construct(config);

        if (this._applyFFInlineFix) {
            this.addCls('b-tiny-mce-field-ff-inline');
        }

        GlobalEvents.ion({
            theme   : 'destroyEditor',
            thisObj : this
        });

        this.ion({
            paint   : 'internalOnPaint',
            thisObj : this
        });
    }

    doDestroy() {
        this.destroyEditor();

        super.doDestroy();
    }

    destroyEditor() {
        const me = this;

        // Remove unconsumed listener if method was not called from doDestroy
        me.detachListeners('popup-hide');

        me.editor?.destroy(); // Destroy the existing instance
        me.editor = null;

        // Remove the Firefox-only docked toolbar container (recreated on next paint if still needed)
        me.toolbarContainer?.remove();
        me.toolbarContainer = null;
    }

    // endregion Constructor/destructor

    //region Event listeners

    // Catches internal TinyMCE editor keyDown events
    onEditorKeyDown(event) {
        // pass the inner <iframe> [Escape] keyDown event through
        if (event.key === 'Escape') {
            // make a new keydown event with the same data
            const newEvent = new KeyboardEvent('keydown', {
                ...event
            });

            // trigger it on the field element
            this.element.dispatchEvent(newEvent);

            return false;
        }
    }

    onEditorNodeChange({ target }) {
        if (this.isDestroying) {
            return;
        }

        const
            oldValue = this.value,
            value    = target.getContent();

        if (value === oldValue) {
            return;
        }

        // Update the TinyMceField instance value silently when the tinyMCE content changes
        this.richText = value;
        this.triggerFieldChange({
            value,
            oldValue,
            userAction : true
        });
    }

    setupEditor(editor) {
        const me = this;

        // The 'on' below is tinyMCE's `on` method, not Bryntum's
        editor.on('NodeChange', event => me.onEditorNodeChange(event));

        if (!me.inline) {
            editor.on('keydown', event => me.onEditorKeyDown(event));
        }

        if (me.inline) {
            if (me._applyFFInlineFix) {
                editor.on('init', () => editor.ui.show());
            }

            // https://github.com/bryntum/support/issues/11434
            // inline mode in grid renders wrong toolbar width on first opening
            editor.once('focus', () =>
                me.setTimeout(() => {
                    globalThis.dispatchEvent(new Event('resize'));
                }, 0)
            );
        }
        else {
            // https://github.com/bryntum/bryntum-suite/issues/11644
            // find the parent popup and install a one-shot listener to destroy the editor on hide
            const popup = me.up('popup', true);

            me.detachListeners('popup-hide');

            popup?.ion({
                name    : 'popup-hide',
                hide    : 'destroyEditor',
                once    : true,
                thisObj : me
            });
        }
    }

    internalOnPaint() {
        const me = this;

        // tinyMCE does not cooperate well with popups and loses its connection to associated DOM elements.
        // So we need to destroy the tinyMCE instance when the owner component hides & shows back.
        if (me.editor) {
            me.destroyEditor();
        }

        // https://github.com/bryntum/support/issues/13291 In the Firefox-only inline fallback, dock the otherwise
        // floating (JS-positioned) inline toolbar into an element in the field's normal flow, placed right before
        // the content. Toolbar and content then stack naturally, giving a solid full-height frame with no overlap.
        if (me._applyFFInlineFix && !me.toolbarContainer?.isConnected) {
            me.toolbarContainer = DomHelper.createElement({
                className   : 'b-tiny-mce-field-ff-toolbar',
                nextSibling : me.input
            });
        }

        // Initialize tinyMCE when we have a target element
        globalThis.tinymce.init({
            ...me.tinyMceConfig,
            license_key       : me.licenseKey,
            auto_focus        : me.autoFocus,
            inline            : me.inline,
            forced_root_block : me.rootBlock,
            menubar           : me.menubar,
            resize            : me.resize,
            height            : me.height,
            target            : me.input,
            content_css       : !me.inline && DomHelper.isDarkTheme ? 'dark' : null,
            skin              : DomHelper.isDarkTheme  ? 'oxide-dark' : 'oxide',
            ui_mode           : 'split',

            ...(me._applyFFInlineFix && {
                toolbar_persist                : true,
                // Render the inline toolbar into our in-flow container instead of the default floating overlay
                fixed_toolbar_container_target : me.toolbarContainer
            }),

            setup : editor => me.setupEditor(editor)
        }).then(allEditors => {
            if (!me.isDestroying) {
                me.editor = allEditors.at(-1);
            }
        });
    }

    //endregion Event listeners

    // Ensure the CellEdit feature is aware of our ownership of tinyMCEs floating toolbar element
    owns(target) {
        return super.owns(target) || Boolean(target?.closest('.tox-tinymce'));
    }
}

TinyMceField.initClass();

//endregion

const scheduler = new Scheduler({

    appendTo              : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    eventStyle            : 'rounded',
    resourceImagePath     : '../_shared/images/transparent-users/',
    // Shows a color picker in the event context menu, and also shows a color field in the event editor. Both which lets
    // the user select the Event bar's background color.
    showEventColorPickers : true,

    barMargin  : 10,
    rowHeight  : 70,
    startDate  : new Date(2025, 1, 7, 8),
    endDate    : new Date(2025, 1, 7, 22),
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 100
    },

    features : {
        stripe    : true,
        eventEdit : {
            editorConfig : {
                // It is necessary to configure the editor as modal, otherwise it will close
                // when the rich text editor receives focus.
                modal : {
                    closeOnMaskTap : true
                },
                width            : '40em',
                height           : '45em',
                autoUpdateRecord : true
            },

            // Add items to the event editor
            items : {
                // A rich text editor for the event description
                descriptionField : {
                    type          : 'tinymcefield',
                    name          : 'description',
                    label         : 'Description',
                    height        : '17em',
                    weight        : 150,
                    tinyMceConfig : {
                        toolbar_mode : 'sliding'
                    }
                }
            }
        }
    },

    subGridConfigs : {
        locked : { width : 300 }
    },

    columns : [
        {
            type : 'resourceInfo',
            flex : 1,
            text : 'Staff'
        },
        {
            text   : 'Type',
            field  : 'role',
            flex   : 1,
            editor : {
                type        : 'combo',
                items       : ['Sales', 'Developer', 'Marketing', 'Product manager', 'CEO', 'CTO'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ],

    crudManager : {
        loadUrl    : 'data/data.json',
        eventStore : {
            // Extra fields used on EventModels. Store tries to be smart about it and extracts these from the first
            // record it reads, but it is good practice to define them anyway to be certain they are included.
            fields : [
                'description'
            ]
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // Specialized event bar template with header and footer
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.style = 'background-color:' + resourceRecord.color;

        return `<section>
            <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
            <div class="b-sch-event-footer">${StringHelper.encodeHtml(eventRecord.name || '')}</div>
        </section>`;
    }
});

scheduler.crudManager.load()
    .then(() => scheduler.editEvent(scheduler.eventStore.first));
