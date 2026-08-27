const checkboxGroup = new CheckboxGroup({
    appendTo : targetElement,
    title    : 'Select cities',
    name     : 'cities',
    disabled : true,
    value    : 'London',  // the default choice
    options  : {
        London    : 'London',
        Madrid    : 'Madrid',
        Stockholm : 'Stockholm',
        Sydney    : 'Sydney'
    }
});
