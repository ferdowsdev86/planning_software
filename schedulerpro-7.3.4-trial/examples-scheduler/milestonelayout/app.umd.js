var {
    Scheduler
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventColor : 'green',
    eventStore : {
        fields : [{
            name         : 'durationUnit',
            defaultValue : 'hour'
        }]
    },
    resources : [{
        id   : 1,
        name : 'Milestones galore'
    }, {
        id          : 2,
        name        : 'Packed milestones',
        eventLayout : 'pack'
    }],
    events : [{
        id         : 1,
        resourceId : 1,
        startDate  : '2024-12-02T04',
        duration   : 2,
        name       : 'Event 1'
    }, {
        id             : 2,
        resourceId     : 1,
        startDate      : '2024-12-02T03',
        duration       : 0,
        name           : 'Milestone with long text',
        // milestoneWidth is used if you specify `milestoneLayoutMode: 'data'`
        milestoneWidth : 180,
        eventColor     : 'blue'
    }, {
        id         : 3,
        resourceId : 1,
        startDate  : '2024-12-02T07',
        duration   : 2,
        name       : 'Event 2'
    }, {
        id             : 4,
        resourceId     : 1,
        startDate      : '2024-12-02T09',
        duration       : 0,
        name           : 'Milestone',
        milestoneWidth : 60,
        eventColor     : 'blue'
    }, {
        id             : 5,
        resourceId     : 1,
        startDate      : '2024-12-02T11',
        duration       : 0,
        name           : 'MS',
        milestoneWidth : 0,
        eventColor     : 'blue'
    }, {
        id             : 6,
        resourceId     : 1,
        startDate      : '2024-12-02T16:00',
        duration       : 0,
        name           : 'Overlaps?',
        milestoneWidth : 0,
        eventColor     : 'blue'
    }, {
        id             : 7,
        resourceId     : 1,
        startDate      : '2024-12-02T17:00',
        duration       : 0,
        name           : 'Overlaps?',
        milestoneWidth : 0,
        eventColor     : 'blue'
    }, {
        id             : 8,
        resourceId     : 2,
        startDate      : '2024-12-02T03:00',
        duration       : 0,
        name           : 'Packed #1',
        milestoneWidth : 30,
        eventColor     : 'blue'
    }, {
        id             : 9,
        resourceId     : 2,
        startDate      : '2024-12-02T03:00',
        duration       : 0,
        name           : 'Packed #2',
        milestoneWidth : 30,
        eventColor     : 'blue'
    }],
    startDate : '2024-12-02',
    endDate   : '2024-12-03',
    columns   : [{
        text  : 'Name',
        field : 'name',
        width : 160
    }],
    viewPreset            : 'hourAndDay',
    tickSize              : 50,
    // Available modes are :
    // 'default'  - no layout
    // 'data'     - from milestoneWidth
    // 'estimate' - length * char width
    // 'measure'  _ precise but slowest
    milestoneLayoutMode   : 'measure',
    // Width per char in px when using 'estimate'
    milestoneCharWidth    : 7,
    // How to align milestones in relation to their (start)date
    milestoneAlign        : 'center',
    // Always render milestone as separate diamond ◆ + label
    // (can be toggled in the demo to stretch the milestone to fit the label in the diamond)
    // milestoneTextPosition : 'always-outside',
    milestoneTextPosition : 'always-outside',
    features              : {
        eventResize : {
            lockLayout : false
        }
    },
    tbar : [{
        type        : 'combo',
        ref         : 'preset',
        placeholder : 'Mode',
        editable    : false,
        inputWidth  : '18em',
        label       : 'Layout mode',
        items       : [['default', 'Default (not part of layout)'], ['estimate', 'Estimate (using text length)'], ['data', 'Data (width from data)'], ['measure', 'Measure (slowest)']],
        value       : 'measure',
        onAction({
            value
        }) {
            scheduler.milestoneLayoutMode = value;
        }
    }, {
        type  : 'checkbox',
        ref   : 'containText',
        label : 'Contain text',
        onChange({
            checked
        }) {
            scheduler.milestoneTextPosition = checked ? 'outside' : 'always-outside';
            scheduler.widgetMap.align.disabled = !checked;
        }
    }, {
        type        : 'buttonGroup',
        ref         : 'align',
        toggleGroup : true,
        disabled    : true,
        items       : [{
            id      : 'start',
            ref     : 'alignStart',
            icon    : 'fa fa-align-left',
            tooltip : 'Align "start" (left)'
        }, {
            id      : 'center',
            ref     : 'alignCenter',
            icon    : 'fa fa-align-center',
            pressed : true,
            tooltip : 'Align "center"'
        }, {
            id      : 'end',
            ref     : 'alignEnd',
            icon    : 'fa fa-align-right',
            tooltip : 'Align "end" (right)'
        }],
        onAction({
            source: button
        }) {
            scheduler.milestoneAlign = button.id;
        }
    }]
});