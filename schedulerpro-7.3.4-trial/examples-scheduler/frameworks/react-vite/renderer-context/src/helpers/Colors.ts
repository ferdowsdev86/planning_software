export const colors = {

    colorful : {
        progressBarTrailColor : 'color-mix(in srgb, var(--b-primary), var(--b-mix) 30%)',
        iconColor             : 'color-mix(in srgb, var(--b-primary), var(--b-opposite) 40%)',
        progressBarColor      : 'color-mix(in srgb, var(--b-primary), var(--b-opposite) 40%)',
        textColor             : 'color-mix(in srgb, var(--b-primary), var(--b-opposite) 40%)'
    },
    gray : {
        progressBarTrailColor : 'var(--b-neutral-80)',
        iconColor             : 'var(--b-neutral-30)',
        progressBarColor      : 'var(--b-neutral-30)',
        textColor             : 'var(--b-neutral-30)'
    }
} as {
    [key: string]: {
        progressBarTrailColor: string
        iconColor: string
        progressBarColor: string
        textColor: string
    }
};

export const progressColorComboOptions = [
    {
        text  : 'Blue',
        value : '#2196f3'
    },
    {
        text  : 'Amber',
        value : '#ffb703'
    },
    {
        text  : 'Green',
        value : '#43aa8b'
    },
    {
        text  : 'Indigo',
        value : '#5a4fcf'
    },
    {
        text  : 'Lime',
        value : '#a3e635'
    },
    {
        text  : 'Orange',
        value : '#fb8500'
    },
    {
        text  : 'Pink',
        value : '#ff5eae'
    },
    {
        text  : 'Purple',
        value : '#b967ff'
    },
    {
        text  : 'Red',
        value : '#f94144'
    },
    {
        text  : 'Violet',
        value : '#9d4edd'
    },
    {
        text  : 'Gray',
        value : 'gray'
    }
];
