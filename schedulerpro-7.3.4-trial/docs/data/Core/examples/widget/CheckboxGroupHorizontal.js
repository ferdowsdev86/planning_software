const checkboxGroup = new CheckboxGroup({
    appendTo : targetElement,
    title    : 'Select cities',
    inline   : true, // Horizontal layout
    name     : 'cities',
    value    : 'London',  // the default choice
    options  : {
        London    : 'London',
        Madrid    : 'Madrid',
        Stockholm : 'Stockholm',
        Sydney    : 'Sydney'
    }
});
