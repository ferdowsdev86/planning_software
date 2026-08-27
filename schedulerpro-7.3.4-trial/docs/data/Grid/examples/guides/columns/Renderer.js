const grid = new Grid({
    appendTo : targetElement,

    autoHeight : true,

    data : [
        { id : 1, name : 'Don Taylor', color : 'blue' },
        { id : 2, name : 'John Adams', color : 'pink' },
        { id : 3, name : 'Linda Moore', color : 'lime' }
    ],

    columns : [
        {
            field : 'name',
            text  : 'Name',
            flex  : 1,
            renderer({ cellElement, record }) {
                cellElement.style.backgroundColor = `color-mix(in srgb, var(--b-color-${record.color}), var(--b-mix) 90%)`;
                cellElement.style.color           = `color-mix(in srgb, var(--b-color-${record.color}), var(--b-opposite) 20%)`;
                return record.name;
            }
        },
        {
            field      : 'color',
            text       : 'Color',
            flex       : 1,
            htmlEncode : false,
            renderer({ value }) {
                return `
                        <div style="
                            width: 1em;
                            height: 1em;
                            border-radius: 3px;
                            background-color: var(--b-color-${value});
                            margin-right: .5em"></div>
                        ${value}
                    `;
            }
        }
    ]
});
