const project = new ProjectModel({
    resources : [
        {
            name             : 'John Smith',
            defaultRateTable : 'default',
            rateTables       : [
                {
                    id    : 'default',
                    name  : 'Default',
                    rates : [
                        {
                            id                     : 1,
                            startDate              : '2025-01-01',
                            standardRate           : 40,
                            standardRateEffortUnit : 'hour',
                            perUseCost             : 5
                        }
                    ]
                },
                {
                    id    : 'discount-20',
                    name  : '20% off',
                    rates : [
                        {
                            id                     : 2,
                            startDate              : '2025-01-01',
                            standardRate           : 32,
                            standardRateEffortUnit : 'hour',
                            perUseCost             : 4
                        }
                    ]
                }
            ]
        }
    ]
});

const editor = new ResourceEditor({
    resource  : project.resources[0],
    autoClose : false
});

const button = new Button({
    text     : '-> OPEN RESOURCE EDITOR <-',
    appendTo : targetElement,
    onAction() {
        editor.show();
    }
});
