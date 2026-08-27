const buttonContainer = DomHelper.createElement({
    id     : 'buttonContainer',
    parent : targetElement,
    style  : {
        display : 'flex',
        gap     : '1em'
    }
});

const toolbar = new Toolbar({
    insertFirst : targetElement,
    style       : 'margin-bottom: 2em;width:40em',
    items       : {
        button : {
            type     : 'button',
            disabled : true,
            text     : 'Drag buttons here'
        }
    }
});

new Button({
    appendTo  : buttonContainer,
    rendition : 'filled',
    text      : 'Drag me',
    icon      : 'fa fa-tree',
    onClick   : ({ source: button }) => Toast.show('Merry Xmas')
});

new Button({
    appendTo  : buttonContainer,
    rendition : 'filled',
    text      : 'Drag me to toolbar',
    icon      : 'fa fa-globe',
    onClick   : ({ source: button }) => Toast.show('Hello World')
});

const dragHelper = new DragHelper({
    outerElement : targetElement,

    // Only allow drag of buttons inside the fiddle
    targetSelector : '#buttonContainer .b-button',

    // Only allow drops on the toolbar
    dropTargetSelector : '.b-toolbar',

    callOnFunctions : true,

    onDragStart() {
        // Highlight the drop target area
        toolbar.element.style.outline = '1px dashed #aaa';
    },

    async onDrop({ context, event }) {
        // Clear the highlight
        toolbar.element.style.outline = '';

        if (context.valid) {
            const button = Widget.fromElement(context.grabbed);

            if (toolbar.widgetMap.helpLabel) {
                toolbar.remove(toolbar.widgetMap.helpLabel);
            }

            await this.animateProxyTo(toolbar.contentElement.lastElementChild || Rectangle.content(toolbar.contentElement), {
                align  : toolbar.contentElement.lastElementChild ? 'l-r' : 'l-l',
                // Some offset to account for the margin between buttons
                offset : toolbar.contentElement.lastElementChild ? [10, 0] : null
            });

            toolbar.add(button);
            Toast.show('👍 Nice drop!');
        }
    }
});

fiddle.on('destroy', () => dragHelper.destroy());
