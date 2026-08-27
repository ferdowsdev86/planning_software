const checkboxGroup = new CheckboxGroup({
    appendTo : targetElement,
    title    : 'Select cities',
    name     : 'cities',
    value    : ['London', 'Sydney'],  // the default selection
    options  : {
        London    : 'London',
        Madrid    : 'Madrid',
        Stockholm : 'Stockholm',
        Sydney    : 'Sydney',
        Miami     : 'Miami'
    },
    onChange() {
        targetElement.lastElementChild.innerText = `Selected: ${this.value.join(', ')}`;
    }
});

const label = document.createElement('span');
targetElement.appendChild(label);
checkboxGroup.onChange();
