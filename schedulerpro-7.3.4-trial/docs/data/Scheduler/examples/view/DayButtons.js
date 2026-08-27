const buttons = new DayButtons({
    appendTo : targetElement,
    value    : ['MO', 'TU', 'TH'],
    onAction() {
        Toast.show(`You selected ${this.value || 'no days'}`);
    }
});

const paddedButtons = new DayButtons({
    appendTo  : targetElement,
    value     : ['MO', 'TU', 'TH'],
    rendition : 'padded',
    onAction() {
        Toast.show(`You selected ${this.value || 'no days'}`);
    }
});
