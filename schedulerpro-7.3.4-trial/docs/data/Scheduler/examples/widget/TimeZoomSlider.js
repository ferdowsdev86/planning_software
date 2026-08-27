const scheduler = new Scheduler({
    appendTo : targetElement,

    viewPreset  : 'amPm',
    height      : 250,
    smoothZoom  : true,
    startDate   : new Date(2026, 4, 6),
    endDate     : new Date(2026, 4, 13),
    visibleDate : new Date(2026, 4, 8),

    resources : [
        { id : 1, name : 'Invincible' },
        { id : 2, name : 'Atom Eve' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Prevent alien invasion',  startDate : '2026-05-07', endDate : '2026-05-10' },
        { id : 2, resourceId : 2, name : 'Stop Doc Seismic', startDate : '2026-05-10', endDate : '2026-05-12' }
    ],

    tbar : [
        { type : 'timezoomslider' }
    ],

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    presets : [
        'weekAndDayLetter',
        'amPm',
        'hourAndDay'
    ]
});
