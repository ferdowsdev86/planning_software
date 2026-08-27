new Button({
    appendTo : targetElement,
    text     : 'Show mask',
    onClick  : () => {
        Mask.mask({
            target : targetElement,
            text   : 'Masked (2 seconds)'
        });

        setTimeout(() => {
            Mask.unmask(targetElement);
        }, 2000);
    }
});

new Button({
    appendTo : targetElement,
    text     : 'Show Progress',
    style    : 'margin-inline-start: 1em',
    onClick  : () => {
        const mask = Mask.mask({
            target      : targetElement,
            text        : 'The task is in progress',
            progress    : 0,
            maxProgress : 100
        });

        const timer = setInterval(() => {
            mask.progress += 5;
            if (mask.progress >= mask.maxProgress) {
                Mask.unmask(targetElement);
                clearInterval(timer);
            }
        }, 100);
    }
});
