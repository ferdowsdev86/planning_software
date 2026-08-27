const checkboxGroup = new CheckboxGroup({
    appendTo           : targetElement,
    title              : 'Life wishlist (select up to 3)',
    name               : 'cities',
    value              : ['A', 'B', 'C'],  // the default selection
    minSelectedOptions : 1,
    maxSelectedOptions : 3,
    options            : {
        A : 'Fame',
        B : 'Money',
        C : 'Friends',
        D : 'Long life',
        E : 'No typescript errors'
    }
});
