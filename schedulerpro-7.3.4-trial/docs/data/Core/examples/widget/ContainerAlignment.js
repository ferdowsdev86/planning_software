new SlideToggle({
    insertFirst : targetElement,
    label       : 'Align input elements to the right side',
    style       : 'margin-bottom: 3em',
    checked     : true,
    onChange({ value }) {
        container.inputFieldAlign = value ? 'end' : 'start';
    }
});

const container = new Container({
    appendTo        : targetElement,
    labelPosition   : 'align-before',
    inputFieldAlign : 'end',
    style           : 'grid-template-columns: 1fr 1fr;',
    items           : {
        name         : { type : 'text', value : 'Clark Kent', label : 'Name' },
        score        : { type : 'number', label : 'Score', value : 100 },
        canFly       : { type : 'slidetoggle', label : 'Can fly', value : true },
        ownsBlueSuit : { type : 'slidetoggle', label : 'Owns a blue suit', value : true },
        kryptonite   : { type : 'slidetoggle', label : 'Kryptonite allergy', value : true }
    }
});
