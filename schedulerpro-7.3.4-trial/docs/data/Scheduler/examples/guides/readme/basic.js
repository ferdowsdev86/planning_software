const scheduler = new Scheduler({
    appendTo : targetElement,

    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 0, 30),
    autoHeight       : true,
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,

    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],

    resources : [
        { id : 1,  name : 'Dan Stevenson'  },
        { id : 2,  name : 'Talisha Babin'  },
        { id : 3,  name : 'Ravi Kumar'     },
        { id : 4,  name : 'Aisha Khan'     },
        { id : 5,  name : 'Michael Chen'   },
        { id : 6,  name : 'Sofia Lopez'    },
        { id : 7,  name : 'James Anderson' },
        { id : 8,  name : 'Eddie Johnson'  },
        { id : 9,  name : 'Ethan Wright'   },
        { id : 10, name : 'Liu Wei'        }
    ],
    events : [
        { resourceId : 1,  startDate : '2026-01-01', endDate : '2026-01-05', name : 'Kickoff Meeting' },
        { resourceId : 1,  startDate : '2026-01-06', endDate : '2026-01-10', name : 'Scope Definition' },
        { resourceId : 1,  startDate : '2026-01-12', endDate : '2026-01-29', name : 'Project Plan Review' },
        { resourceId : 2,  startDate : '2026-01-02', endDate : '2026-01-06', name : 'Requirement Gathering' },
        { resourceId : 2,  startDate : '2026-01-07', endDate : '2026-01-21', name : 'Stakeholder Interviews' },
        { resourceId : 2,  startDate : '2026-01-22', endDate : '2026-01-27', name : 'Requirement Signoff' },
        { resourceId : 3,  startDate : '2026-01-05', endDate : '2026-01-14', name : 'System Design' },
        { resourceId : 3,  startDate : '2026-01-10', endDate : '2026-01-20', name : 'Database Modeling' },
        { resourceId : 3,  startDate : '2026-01-23', endDate : '2026-01-28', name : 'API Design' },
        { resourceId : 4,  startDate : '2026-01-08', endDate : '2026-01-15', name : 'Backend Setup' },
        { resourceId : 4,  startDate : '2026-01-15', endDate : '2026-01-22', name : 'Authentication Module' },
        { resourceId : 4,  startDate : '2026-01-21', endDate : '2026-01-27', name : 'Data Services' },
        { resourceId : 5,  startDate : '2026-01-02', endDate : '2026-01-14', name : 'UI Wireframes' },
        { resourceId : 5,  startDate : '2026-01-15', endDate : '2026-01-19', name : 'Frontend Components' },
        { resourceId : 5,  startDate : '2026-01-20', endDate : '2026-01-27', name : 'Styling & Theme' },
        { resourceId : 6,  startDate : '2026-01-12', endDate : '2026-01-16', name : 'API Integration' },
        { resourceId : 6,  startDate : '2026-01-17', endDate : '2026-01-21', name : 'GraphQL Setup' },
        { resourceId : 6,  startDate : '2026-01-22', endDate : '2026-01-25', name : 'Integration Testing' },
        { resourceId : 7,  startDate : '2026-01-05', endDate : '2026-01-10', name : 'Unit Testing' },
        { resourceId : 7,  startDate : '2026-01-12', endDate : '2026-01-19', name : 'Automation Scripts' },
        { resourceId : 7,  startDate : '2026-01-18', endDate : '2026-01-27', name : 'Performance Testing' },
        { resourceId : 8,  startDate : '2026-01-10', endDate : '2026-01-22', name : 'Bug Fix Round 1' },
        { resourceId : 8,  startDate : '2026-01-23', endDate : '2026-01-26', name : 'UI Fixes' },
        { resourceId : 8,  startDate : '2026-01-27', endDate : '2026-01-30', name : 'Regression Testing' },
        { resourceId : 9,  startDate : '2026-01-03', endDate : '2026-01-14', name : 'Client Demo Prep' },
        { resourceId : 9,  startDate : '2026-01-15', endDate : '2026-01-19', name : 'Client Review' },
        { resourceId : 9,  startDate : '2026-01-20', endDate : '2026-01-24', name : 'Feedback Implementation' },
        { resourceId : 10, startDate : '2026-01-02', endDate : '2026-01-16', name : 'Deployment Setup' },
        { resourceId : 10, startDate : '2026-01-19', endDate : '2026-01-22', name : 'Go-Live' },
        { resourceId : 10, startDate : '2026-01-23', endDate : '2026-01-27', name : 'Post-Deployment Support' }
    ]
});
