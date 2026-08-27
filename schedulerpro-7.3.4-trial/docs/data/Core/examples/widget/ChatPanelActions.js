//<code-header>
CSSHelper.insertRule('.b-panel .b-slidetoggle .b-label { flex : 1; }', targetElement.getRootNode());
CSSHelper.insertRule('.b-panel .b-slidetoggle .b-field-inner { flex : none; }', targetElement.getRootNode());
//</code-header>
let voices;

const chatPanel = new ChatPanel({
    appendTo      : targetElement,
    title         : 'Acme Sales Support',
    height        : '30em',
    showTimestamp : true,
    style         : 'margin-inline:auto;margin-block:5em',
    hidden        : false,
    floating      : false, // force panel to stay in the normal DOM flow
    messages      : [
        {
            fromOther : true,
            text      : 'Hello, to get to know you better - please pick your favorite JS framework.',
            options   : ['react', 'vue', 'angular', 'svelte', 'jQuery']
        }
    ],

    // Avatar image url
    avatar : './data/Core/images/lisa.png',

    onLocalMessage() {
        // Fake a response
        setTimeout(() => {
            this.addMessage({ fromOther : true, text : 'Good choice! I like vanilla JS myself.' });
        }, 1500);
    }
});
