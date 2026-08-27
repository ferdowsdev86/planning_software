// A container containing three widgets
const container = new Container({
    appendTo      : targetElement,
    labelPosition : 'align-before',
    items         : {
        name  : { type : 'text', value : 'Clark Kent', label : 'Name' },
        score : { type : 'number', label : 'Score', value : 100 },
        save  : {
            type      : 'button',
            text      : 'Save',
            rendition : 'filled',
            column    : 2,
            onClick   : () => {
                const
                    name  = container.widgetMap.name.value,
                    score = container.widgetMap.score.value;

                if (score > 1000) {
                    Toast.show('New highscore!');
                }
                else {
                    Toast.show(`Saving ${name}s score, which was ${score}`);
                }
            }
        }
    }
});
