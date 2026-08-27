const panel = new CodeEditor({
    codePath : window.bryntum.editorPath,
    appendTo : targetElement,
    height   : '30em',
    width    : '55em',
    header   : 'Editing this example\'s code. No, it does not reload on change'
});

fetch('../docs/data/Core/examples/widget/CodeEditor.js').then(response => {
    response.text().then(t => panel.text = t);
});
