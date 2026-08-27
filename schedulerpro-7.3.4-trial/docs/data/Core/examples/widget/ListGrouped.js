new SlideToggle({
    appendTo   : targetElement,
    label      : 'Multiselect',
    checked    : true,
    labelWidth : '13em',
    onChange({ checked }) {
        list.multiSelect = checked;
    }
});

new SlideToggle({
    appendTo   : targetElement,
    label      : 'Collapsible groups',
    checked    : true,
    style      : 'margin-bottom:1em',
    labelWidth : '13em',
    onChange({ checked }) {
        list.collapsibleGroups = checked;
    }
});

const list = new List({
    width             : 300,
    height            : 300,
    appendTo          : targetElement,
    multiSelect       : true,
    displayField      : 'name',
    valueField        : 'id',
    collapsibleGroups : true,
    allowGroupSelect  : false,
    selected          : [1, 2, 4],
    itemTpl           : item => `
        <div style="display:flex; align-items:center; padding:.5em;flex:1">
            <img src="data/Core/images/food/${encodeURIComponent(item.image)}"
                 style="width:2em; height:2em; border-radius:.5em; object-fit:cover; margin-inline-end:1em" />
            <div style="flex:1; line-height:1.3;">
                <div>${item.name}</div>
                <div style="font-size:.8em; color:#777;">${item.desc}</div>
            </div>
            <div style="color:#999; margin-inline-start:auto">
                $${item.price.toFixed(2)}
            </div>
        </div>
    `,

    // Show icon based on group name
    groupHeaderTpl : (record, groupName) => {
        let icon;
        switch (groupName) {
            case 'Drinks':
                icon = 'wine-bottle';
                break;
            case 'Food':
                icon = 'pizza-slice';
                break;
            case 'Snacks':
                icon = 'cookie-bite';
                break;
        }
        return `<i class="fa fa-${icon}" style="margin-inline-end:.7em"></i>${groupName}`;
    },
    store : {
        fields : [
            'type'
        ],
        groupers : [
            { field : 'type', ascending : true }
        ],
        data : [
            { id : 1, name : 'Pizza', type : 'food', desc : 'Fresh from the oven', price : 12.50, image : 'pizza.png' },
            { id : 2, name : 'Bacon', type : 'food', desc : 'Crispy and smoky', price : 5.20, image : 'bacon.png'  },
            { id : 3, name : 'Egg', type : 'food', desc : 'Free range-ish', price : 2.10, image : 'egg.png'  },
            { id : 4, name : 'Gin tonic', type : 'drinks', desc : 'Classic mix', price : 8.90, image : 'gintonic.png'  },
            { id : 5, name : 'Wine', type : 'drinks', desc : 'Red, white or sweet', price : 15.00, image : 'redwine.png'  },
            { id : 6, name : 'Pepsi', type : 'drinks', desc : 'Chilled can', price : 2.70, image : 'pepsi.png'  },
            { id : 7, name : 'Potato chips', type : 'snacks', desc : 'Salted crunch', price : 3.40, image : 'chips.png'  },
            { id : 8, name : 'Pretzels', type : 'snacks', desc : 'Twisted delight', price : 2.90, image : 'pretzels.png'  },
            { id : 9, name : 'Popcorn', type : 'snacks', desc : 'Movie night', price : 3.10, image : 'popcorn.png'  },
            { id : 10, name : 'Chocolate bar', type : 'snacks', desc : 'At least 5% cocoa', price : 2.50, image : 'chocolate.png'  },
            { id : 11, name : 'Trail mix', type : 'snacks', desc : 'Nut and raisin blend', price : 4.80, image : 'nuts.png'  }
        ]
    },
    onItem({ item }) {
        Toast.show('You clicked ' + item.innerText);
    }
});
