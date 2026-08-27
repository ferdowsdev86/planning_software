const project = new ProjectModel({
    startDate : new Date(2025, 0, 1),
    events    : [
        {
            id       : 1,
            name     : 'Write docs',
            expanded : true,
            children : [
                {
                    id        : 2,
                    name      : 'Proof-read docs',
                    startDate : '2025-01-02',
                    endDate   : '2025-01-05',
                    effort    : 0
                },
                {
                    id        : 3,
                    name      : 'Release docs',
                    startDate : '2025-01-09',
                    endDate   : '2025-01-10',
                    effort    : 0
                }
            ]
        }
    ]
});

project.commitAsync().then(() => {
    const constraintTypePicker = new ConstraintTypePicker({
        label      : 'Choose constraint type',
        appendTo   : targetElement,
        width      : 250,
        taskRecord : project.eventStore.getById(2)
    });
});
