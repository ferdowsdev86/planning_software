const grid = new Grid({
    appendTo   : targetElement,
    autoHeight : true,
    rowHeight  : 50,
    flex       : 1,

    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],

    data : [
        { id : 1, name : 'Mr Boss' }
    ],

    features : {
        cellMenu : {
            disabled : true
        },
        headerMenu : {
            disabled : true
        }
    },

    tbar : [
        {
            text        : 'Disable Cell menu',
            toggleable  : true,
            pressed     : true,
            icon        : 'fa fa-square',
            pressedIcon : 'fa fa-check-square',
            onToggle({ pressed }) {
                grid.features.cellMenu.disabled = pressed;
            }
        },
        {
            text        : 'Disable Header menu',
            style       : 'margin-inline-start: 10px',
            toggleable  : true,
            pressed     : true,
            icon        : 'fa fa-square',
            pressedIcon : 'fa fa-check-square',
            onToggle({ pressed }) {
                grid.features.headerMenu.disabled = pressed;
            }
        }
    ]
});
