new Button({
    appendTo  : targetElement,
    rendition : 'filled',
    text      : 'Show menu',
    menu      : {
        colorMenu : {
            type : 'colorpicker',
            colorSelected({ color }) {
                colorBox.style.color = color;
            }
        }
    }
});

const colorBox = DomHelper.createElement({
    parent : targetElement,
    class  : 'b-color-box',
    style  : {
        width             : '2em',
        height            : '2em',
        color             : '#fff',
        borderRadius      : '4px',
        marginInlineStart : '1em'
    }
});
