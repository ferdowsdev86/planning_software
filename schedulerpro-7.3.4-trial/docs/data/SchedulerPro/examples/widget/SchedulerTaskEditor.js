const project = new ProjectModel({
    startDate : new Date(2020, 0, 1),

    events : [
        {
            id       : 1,
            name     : 'Write docs',
            expanded : true,
            children : [
                { id : 2, name : 'Proof-read docs', startDate : '2020-01-02', endDate : '2020-01-05', effort : 0 },
                { id : 3, name : 'Release docs', startDate : '2020-01-09', endDate : '2020-01-10', effort : 0 }
            ]
        }
    ],

    dependencies : [
        { fromEvent : 2, toEvent : 3 }
    ]
});

const taskEditor = new SchedulerTaskEditor({ project, rootElement : document.body });

const button = new Button({
    appendTo : targetElement,
    text     : 'Show TaskEditor',
    async onClick() {
        await project.commitAsync();

        taskEditor.loadEvent(project.eventStore.getById(2));

        taskEditor.showBy({
            target : button.element,
            align  : 'l-r',
            offset : 5
        });
    }
});
