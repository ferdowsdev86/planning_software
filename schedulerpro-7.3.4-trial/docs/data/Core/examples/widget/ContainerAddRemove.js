//<code-header>
CSSHelper.insertRule([
    `.b-country-widget { 
        display        : flex;
        flex-direction : column;
        gap            : .2em;
    }`,
    `.b-country-amount { 
        font-weight : 600;
    }`
], targetElement);
//</code-header>
const max = 5;

class CountryWidget extends Widget {
    static $name = 'CountryWidget';
    static type = 'countrywidget';

    static configurable = {
        name   : null,
        amount : null
    };

    compose() {
        const { name, amount } = this;

        return {
            children : {
                nameEl : {
                    class : 'b-country-title',
                    text  : name
                },
                amountEl : {
                    class : 'b-country-amount',
                    text  : `$${amount}`
                },
                barEl : {
                    style : {
                        width      : `${100 * amount / max}%`,
                        height     : '.5em',
                        background : '#0276f8'
                    },
                    class   : 'b-country-bar',
                    dataset : {
                        btip : `${name} $${amount}`
                    }
                }
            }
        };
    }
}

CountryWidget.initClass();

const container = new Container({
    appendTo : targetElement,
    width    : '26em',
    layout   : 'vbox',
    style    : {
        display         : 'flex',
        background      : 'var(--b-neutral-96)',
        'box-shadow'    : '2px 0px 5px var(--b-neutral-99)',
        'border-radius' : '1em',
        padding         : '2em',
        gap             : '.8em'
    },
    items : [
        { type : 'widget', tag : 'h2', html : 'Countries', style : 'font-size:1.8em;font-weight:500;margin:0 0 1em 0' },
        { type : 'countrywidget', name : 'United States', amount : 4.92 },
        { type : 'countrywidget', name : 'Sweden', amount : 4.02 },
        { type : 'countrywidget', name : 'Belgium', amount : 3.52 },
        { type : 'countrywidget', name : 'Denmark', amount : 2.2 },
        { type : 'countrywidget', name : 'Canada', amount : 1.74 }
    ]
});

new Button({
    appendTo  : targetElement,
    text      : 'Add country',
    rendition : 'filled',
    style     : 'margin-top:1em',
    onClick   : () => {
        const
            names = ['South Africa', 'Mexico', 'Germany', 'France', 'Italy', 'Australia', 'Singapore', 'China', 'Malaysia', 'Netherlands', 'Malta'];

        // Add a new country widget to the container
        container.add({
            type   : 'countrywidget',
            name   : names[Math.round(Math.random() * 10)],
            amount : (container.lastItem.amount * 0.8).toFixed(2)
        });
    }
});
