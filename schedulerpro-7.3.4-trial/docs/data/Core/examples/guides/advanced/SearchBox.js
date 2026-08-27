// Composite SearchBox widget example

class SearchBox extends Container {
    static $name = 'SearchBox';
    static type = 'searchbox';

    static configurable = {
        placeholder : 'Search...',
        buttonText  : 'Search',
        layout      : 'hbox',

        items : {
            searchField : {
                type        : 'textfield',
                ref         : 'searchField',
                flex        : 1,
                placeholder : 'up.placeholder',
                clearable   : true,
                triggers    : {
                    search : {
                        cls : 'fa fa-search'
                    }
                }
            },
            searchButton : {
                type      : 'button',
                ref       : 'searchButton',
                text      : 'up.buttonText',
                icon      : 'fa fa-search',
                rendition : 'filled',
                color     : 'b-blue',
                onClick   : 'up.onSearchClick'
            }
        }
    };

    get searchValue() {
        return this.widgetMap.searchField.value;
    }

    set searchValue(value) {
        this.widgetMap.searchField.value = value;
    }

    onSearchClick() {
        const value = this.searchValue;
        Toast.show(`Searching for: "${value}"`);
    }

    construct(config) {
        super.construct(config);

        this.widgetMap.searchField.on({
            change  : () => this.onSearchChange(),
            keydown : (e) => {
                if (e.key === 'Enter') {
                    this.onSearchClick();
                }
            }
        });
    }

    onSearchChange() {
        console.log('Search input changed:', this.searchValue);
    }
}

SearchBox.initClass();

// Create an instance
new SearchBox({
    appendTo    : targetElement,
    placeholder : 'Search docs...',
    buttonText  : 'Go'
});
