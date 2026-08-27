// Core imports are loaded statically (used by all widgets)
// Product bundles (grid, scheduler, schedulerpro, gantt, calendar, taskboard, chart) are lazy loaded
import { DateHelper, Container, Toolbar, Widget, Menu, Popup, Tooltip, Mask, MessageDialog, DomHelper, TextField, TextAreaField, NumberField, PasswordField, DateField, TimeField, DateTimeField, ColorField, DurationField, DisplayField, DateRangeField, Checkbox, RadioGroup, ProgressBar, SlideToggle, Slider, Combo, Button, ButtonGroup, Panel, TabPanel, DatePicker, ColorPicker, Label, ChipView, FileField, FilePicker, FieldSet, Toast, Splitter, List, CheckboxGroup, MonthPicker, YearPicker, PagingToolbar, ConfirmationBar, ChatPanel, ChatButton } from '../../../build/thin/core.module.thin.js';

const components = [
    {
        name        : 'Scheduler - Horizontal',
        type : 'scheduler',
        category    : 'Scheduling',
        description : 'Horizontal timeline scheduler',
        docsUrl     : 'scheduler/docs/api/Scheduler/view/Scheduler',
        bundle      : 'schedulerpro',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { Scheduler }) => {
            const
                resources = [
                    { id : 1, name : 'Lisa Wong', type : 'developer', image : 'lisa.png' },
                    { id : 2, name : 'Mike Chen', type : 'developer', image : 'mike.png' },
                    { id : 3, name : 'Kate Anderson', type : 'designer', image : 'kate.png' },
                    { id : 4, name : 'Dave Miller', type : 'developer', image : 'dave.png' },
                    { id : 5, name : 'Emilia Rodriguez', type : 'trainer', image : 'emilia.png' },
                    { id : 6, name : 'Mark Johnson', type : 'manager', image : 'mark.png' },
                    { id : 7, name : 'Sarah Lee', type : 'developer', image : 'hitomi.png' },
                    { id : 8, name : 'Tom Wilson', type : 'designer', image : 'steve.png' },
                    { id : 9, name : 'Anna Davis', type : 'developer', image : 'angelo.png' },
                    { id : 10, name : 'James Brown', type : 'qa', image : 'arnold.png' },
                    { id : 11, name : 'Linda Martinez', type : 'developer', image : 'celia.png' },
                    { id : 12, name : 'Chris Taylor', type : 'manager', image : 'dan.png' }
                ],
                events    = [
                    {
                        id           : 1,
                        resourceId   : 1,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Team Standup',
                        iconCls      : 'fa fa-users',
                        eventColor   : 'blue'
                    },
                    {
                        id           : 2,
                        resourceId   : 1,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 1.5,
                        durationUnit : 'h',
                        name         : 'Sprint Planning',
                        iconCls      : 'fa fa-calendar-check',
                        eventColor   : 'green'
                    },
                    {
                        id           : 3,
                        resourceId   : 2,
                        startDate    : new Date(2027, 0, 1, 10),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Client Presentation',
                        iconCls      : 'fa fa-presentation',
                        eventColor   : 'purple'
                    },
                    {
                        id           : 4,
                        resourceId   : 3,
                        startDate    : new Date(2027, 0, 1, 8),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : '1-on-1 Meeting',
                        iconCls      : 'fa fa-user-friends',
                        eventColor   : 'orange'
                    },
                    {
                        id           : 5,
                        resourceId   : 3,
                        startDate    : new Date(2027, 0, 1, 15),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Design Review',
                        iconCls      : 'fa fa-palette',
                        eventColor   : 'pink'
                    },
                    {
                        id           : 6,
                        resourceId   : 4,
                        startDate    : new Date(2027, 0, 1, 11),
                        duration     : 1.5,
                        durationUnit : 'h',
                        name         : 'Code Review',
                        iconCls      : 'fa fa-code',
                        eventColor   : 'cyan'
                    },
                    {
                        id           : 7,
                        resourceId   : 5,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 4,
                        durationUnit : 'h',
                        name         : 'Technical Workshop',
                        iconCls      : 'fa fa-chalkboard-teacher',
                        eventColor   : 'indigo'
                    },
                    {
                        id           : 8,
                        resourceId   : 6,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Board Meeting',
                        iconCls      : 'fa fa-briefcase',
                        eventColor   : 'red'
                    },
                    {
                        id           : 9,
                        resourceId   : 7,
                        startDate    : new Date(2027, 0, 1, 8),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Feature Development',
                        iconCls      : 'fa fa-laptop-code',
                        eventColor   : 'teal'
                    },
                    {
                        id           : 10,
                        resourceId   : 7,
                        startDate    : new Date(2027, 0, 1, 13),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Bug Fixes',
                        iconCls      : 'fa fa-bug',
                        eventColor   : 'orange'
                    },
                    {
                        id           : 11,
                        resourceId   : 8,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 2.5,
                        durationUnit : 'h',
                        name         : 'UI Mockups',
                        iconCls      : 'fa fa-pencil-ruler',
                        eventColor   : 'purple'
                    },
                    {
                        id           : 12,
                        resourceId   : 9,
                        startDate    : new Date(2027, 0, 1, 10),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'API Integration',
                        iconCls      : 'fa fa-plug',
                        eventColor   : 'green'
                    },
                    {
                        id           : 13,
                        resourceId   : 9,
                        startDate    : new Date(2027, 0, 1, 15),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Documentation',
                        iconCls      : 'fa fa-book',
                        eventColor   : 'blue'
                    },
                    {
                        id           : 14,
                        resourceId   : 10,
                        startDate    : new Date(2027, 0, 1, 8),
                        duration     : 4,
                        durationUnit : 'h',
                        name         : 'Test Planning',
                        iconCls      : 'fa fa-clipboard-list',
                        eventColor   : 'cyan'
                    },
                    {
                        id           : 15,
                        resourceId   : 10,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Regression Tests',
                        iconCls      : 'fa fa-vial',
                        eventColor   : 'lime'
                    },
                    {
                        id           : 16,
                        resourceId   : 11,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Code Refactoring',
                        iconCls      : 'fa fa-recycle',
                        eventColor   : 'yellow'
                    },
                    {
                        id           : 17,
                        resourceId   : 11,
                        startDate    : new Date(2027, 0, 1, 13),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Performance Tuning',
                        iconCls      : 'fa fa-tachometer-alt',
                        eventColor   : 'pink'
                    },
                    {
                        id           : 18,
                        resourceId   : 12,
                        startDate    : new Date(2027, 0, 1, 10),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Team Sync',
                        iconCls      : 'fa fa-sync',
                        eventColor   : 'indigo'
                    },
                    {
                        id           : 19,
                        resourceId   : 12,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 2.5,
                        durationUnit : 'h',
                        name         : 'Project Review',
                        iconCls      : 'fa fa-tasks',
                        eventColor   : 'red'
                    }
                ];

            new Scheduler({
                appendTo          : container,
                width             : '100%',
                height            : '100%',
                border            : true,
                resources,
                events,
                startDate         : new Date(2027, 0, 1, 6),
                endDate           : new Date(2027, 0, 1, 20),
                viewPreset        : 'hourAndDay',
                rowHeight         : 50,
                barMargin         : 4,
                forceFit          : true,
                resourceImagePath : '../_shared/images/transparent-users/',
                columns           : [
                    {
                        type             : 'resourceInfo',
                        text             : 'Resource',
                        field            : 'name',
                        width            : 200,
                        defaultImageName : 'lisa.png',
                        validNames       : {
                            'lisa.png'   : 1,
                            'mike.png'   : 1,
                            'kate.png'   : 1,
                            'dave.png'   : 1,
                            'emilia.png' : 1,
                            'mark.png'   : 1,
                            'hitomi.png' : 1,
                            'steve.png'  : 1,
                            'angelo.png' : 1,
                            'arnold.png' : 1,
                            'celia.png'  : 1,
                            'dan.png'    : 1
                        }
                    }
                ],
                features : {
                    eventTooltip : {
                        template : data => `
                            <div style="padding: 0.5em;">
                                <div style="font-weight: 600; margin-bottom: 0.5em;">${data.eventRecord.name}</div>
                                <div style="font-size: 0.9em;">
                                    ${data.startDate.toLocaleTimeString([], { hour : '2-digit', minute : '2-digit' })} -
                                    ${data.endDate.toLocaleTimeString([], { hour : '2-digit', minute : '2-digit' })}
                                </div>
                            </div>
                        `
                    },
                    eventMenu : false,
                    eventEdit : false
                }
            });
        }
    },
    {
        name        : 'Scheduler - Vertical',
        type : 'scheduler',
        category    : 'Scheduling',
        description : 'Vertical timeline scheduler',
        docsUrl     : 'scheduler/docs/api/Scheduler/view/Scheduler',
        bundle      : 'schedulerpro',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { Scheduler, DateHelper }) => {
            const
                resources = [
                    { id : 1, name : 'Sarah Chen', role : 'Developer', image : 'lisa.png' },
                    { id : 2, name : 'Marcus Webb', role : 'Designer', image : 'mike.png' },
                    { id : 3, name : 'Rachel Kim', role : 'PM', image : 'kate.png' },
                    { id : 4, name : 'David Torres', role : 'QA', image : 'dave.png' },
                    { id : 5, name : 'Emma Garcia', role : 'DevOps', image : 'emilia.png' },
                    { id : 6, name : 'Mark Robinson', role : 'Developer', image : 'mark.png' },
                    { id : 7, name : 'Hitomi Tanaka', role : 'UX Designer', image : 'hitomi.png' },
                    { id : 8, name : 'Steve Johnson', role : 'Tech Lead', image : 'steve.png' }
                ],
                events    = [
                    {
                        id           : 1,
                        resourceId   : 1,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Backend Development',
                        iconCls      : 'fa fa-server',
                        eventColor   : 'blue'
                    },
                    {
                        id           : 2,
                        resourceId   : 1,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'API Integration',
                        iconCls      : 'fa fa-plug',
                        eventColor   : 'cyan'
                    },
                    {
                        id           : 3,
                        resourceId   : 2,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 4,
                        durationUnit : 'h',
                        name         : 'UI Mockups',
                        iconCls      : 'fa fa-paint-brush',
                        eventColor   : 'purple'
                    },
                    {
                        id           : 4,
                        resourceId   : 2,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Design System',
                        iconCls      : 'fa fa-palette',
                        eventColor   : 'pink'
                    },
                    {
                        id           : 5,
                        resourceId   : 3,
                        startDate    : new Date(2027, 0, 1, 8),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Team Sync',
                        iconCls      : 'fa fa-users',
                        eventColor   : 'green'
                    },
                    {
                        id           : 6,
                        resourceId   : 3,
                        startDate    : new Date(2027, 0, 1, 11),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Roadmap Planning',
                        iconCls      : 'fa fa-map',
                        eventColor   : 'orange'
                    },
                    {
                        id           : 7,
                        resourceId   : 4,
                        startDate    : new Date(2027, 0, 1, 8),
                        duration     : 4,
                        durationUnit : 'h',
                        name         : 'Testing Sprint',
                        iconCls      : 'fa fa-check-circle',
                        eventColor   : 'lime'
                    },
                    {
                        id           : 8,
                        resourceId   : 4,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Bug Triage',
                        iconCls      : 'fa fa-bug',
                        eventColor   : 'red'
                    },
                    {
                        id           : 9,
                        resourceId   : 5,
                        startDate    : new Date(2027, 0, 1, 7),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'CI/CD Pipeline',
                        iconCls      : 'fa fa-cogs',
                        eventColor   : 'teal'
                    },
                    {
                        id           : 10,
                        resourceId   : 5,
                        startDate    : new Date(2027, 0, 1, 12),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Infrastructure Review',
                        iconCls      : 'fa fa-server',
                        eventColor   : 'gray'
                    },
                    {
                        id           : 11,
                        resourceId   : 6,
                        startDate    : new Date(2027, 0, 1, 9),
                        duration     : 4,
                        durationUnit : 'h',
                        name         : 'Frontend Refactor',
                        iconCls      : 'fa fa-code',
                        eventColor   : 'blue'
                    },
                    {
                        id           : 12,
                        resourceId   : 6,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Code Review',
                        iconCls      : 'fa fa-code-branch',
                        eventColor   : 'cyan'
                    },
                    {
                        id           : 13,
                        resourceId   : 7,
                        startDate    : new Date(2027, 0, 1, 8),
                        duration     : 4,
                        durationUnit : 'h',
                        name         : 'User Research',
                        iconCls      : 'fa fa-users',
                        eventColor   : 'purple'
                    },
                    {
                        id           : 14,
                        resourceId   : 7,
                        startDate    : new Date(2027, 0, 1, 13),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Wireframe Review',
                        iconCls      : 'fa fa-pencil-ruler',
                        eventColor   : 'pink'
                    },
                    {
                        id           : 15,
                        resourceId   : 8,
                        startDate    : new Date(2027, 0, 1, 7),
                        duration     : 2,
                        durationUnit : 'h',
                        name         : 'Stand-up',
                        iconCls      : 'fa fa-coffee',
                        eventColor   : 'orange'
                    },
                    {
                        id           : 16,
                        resourceId   : 8,
                        startDate    : new Date(2027, 0, 1, 10),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Architecture Review',
                        iconCls      : 'fa fa-sitemap',
                        eventColor   : 'indigo'
                    },
                    {
                        id           : 17,
                        resourceId   : 8,
                        startDate    : new Date(2027, 0, 1, 14),
                        duration     : 3,
                        durationUnit : 'h',
                        name         : 'Sprint Retro',
                        iconCls      : 'fa fa-comments',
                        eventColor   : 'green'
                    }
                ];

            new Scheduler({
                appendTo         : container,
                width            : '100%',
                height           : '100%',
                mode             : 'vertical',
                border           : true,
                tickSize         : 65,
                resources,
                events,
                startDate        : new Date(2027, 0, 1, 6),
                endDate          : new Date(2027, 0, 1, 18),
                viewPreset       : 'hourAndDay',
                barMargin        : 4,
                resourceMargin   : 5,
                narrowEventWidth : 80,
                tbar             : [
                    {
                        icon    : 'fa fa-chevron-left',
                        tooltip : 'Previous',
                        onClick : 'up.onPrevClick',
                        style   : 'margin-inline-start: auto'
                    },
                    { text : 'Today', onClick : 'up.onTodayClick' },
                    {
                        icon    : 'fa fa-chevron-right',
                        tooltip : 'Next',
                        onClick : 'up.onNextClick',
                        style   : 'margin-inline-end: auto'
                    }
                ],
                resourceColumns : {
                    columnWidth    : 170,
                    headerRenderer : ({ resourceRecord }) => `
                        <div style="text-align: center;">
                            <img src="../_shared/images/transparent-users/${resourceRecord.image}"
                                 style="width: 2.5em; height: 2.5em; margin-bottom: 0.25em;" />
                            <div style="font-weight: 600; font-size: 0.9em;">${resourceRecord.name}</div>
                            <div style="font-size: 0.75em; opacity: 0.7;">${resourceRecord.role}</div>
                        </div>
                    `
                },
                verticalTimeAxisColumn : {
                    width : 80
                },
                features : {
                    stickyEvents : false,
                    eventTooltip : {
                        template : data => `
                            <div style="padding: 0.5em;">
                                <div style="font-weight: 600; margin-bottom: 0.5em;">${data.eventRecord.name}</div>
                                <div style="font-size: 0.9em;">
                                    ${data.startDate.toLocaleTimeString([], { hour : '2-digit', minute : '2-digit' })} -
                                    ${data.endDate.toLocaleTimeString([], { hour : '2-digit', minute : '2-digit' })}
                                </div>
                            </div>
                        `
                    }
                },

                onTodayClick({ source }) {
                    const today = DateHelper.clearTime(new Date());
                    today.setHours(6);
                    this.startDate = today;
                },

                onPrevClick() {
                    this.shiftPrevious();
                },

                onNextClick() {
                    this.shiftNext();
                }

            });
        }
    },
    {
        name        : 'TaskBoard',
        type        : 'taskboard',
        category    : 'Kanban',
        description : 'Kanban-style task board',
        docsUrl     : 'taskboard/docs/api/TaskBoard/view/TaskBoard',
        bundle      : 'taskboard',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { TaskBoard }) => {
            new TaskBoard({
                appendTo          : container,
                width             : '100%',
                height            : '100%',
                border            : true,
                // Url for resource avatar images
                resourceImagePath : '../_shared/images/transparent-users/',

                // Enable smooth transitions
                useDomTransition : true,

                // Column configuration
                columns : [
                    { id : 'todo', text : 'To Do', color : 'blue' },
                    { id : 'progress', text : 'In Progress', color : 'orange' },
                    { id : 'review', text : 'Review', color : 'purple' },
                    { id : 'done', text : 'Done', color : 'green' }
                ],

                columnField : 'status',

                // Show task count in column headers
                showCountInHeader : true,

                // Enable features
                features : {
                    taskTooltip : {
                        template : data => `
                            <div style="padding: 0.75em; min-width: 200px;">
                                <div style="font-weight: 600; font-size: 1.1em; margin-bottom: 0.5em;">${data.taskRecord.name}</div>
                                ${data.taskRecord.description ? `<div style="margin-bottom: 0.5em; color: #666;">${data.taskRecord.description}</div>` : ''}
                                <div style="font-size: 0.85em; color: #888;">
                                    Priority: <strong>${data.taskRecord.prio || 'none'}</strong>
                                </div>
                            </div>
                        `
                    },
                    taskMenu : true,
                    taskEdit : true
                },

                // Body items
                bodyItems : {
                    // Uncomment to add a progress bar
                    // progress : {
                    //     type : 'progress'
                    // }
                },

                // Footer items (tags on the right)
                footerItems : {
                    tags : {
                        type : 'tags'
                    }
                },

                project : {
                    taskStore : {
                        fields : ['tags', 'description']
                    },

                    tasks : [
                        {
                            id          : 1,
                            name        : 'Design new landing page',
                            description : 'Create modern, responsive landing page with hero section',
                            prio        : 'high',
                            status      : 'todo',
                            progress    : 15,
                            rating      : 4,
                            tags        : 'design,frontend'
                        },
                        {
                            id          : 2,
                            name        : 'Implement authentication',
                            description : 'Add OAuth and JWT support with refresh tokens',
                            prio        : 'high',
                            status      : 'progress',
                            progress    : 65,
                            rating      : 5,
                            tags        : 'backend,security'
                        },
                        {
                            id          : 3,
                            name        : 'Write API documentation',
                            description : 'Document all REST endpoints with examples',
                            prio        : 'medium',
                            status      : 'progress',
                            progress    : 40,
                            rating      : 3,
                            tags        : 'docs'
                        },
                        {
                            id          : 4,
                            name        : 'Set up CI/CD pipeline',
                            description : 'Configure automated testing and deployment',
                            prio        : 'high',
                            status      : 'review',
                            progress    : 90,
                            rating      : 5,
                            tags        : 'devops,automation'
                        },
                        {
                            id          : 5,
                            name        : 'Fix mobile responsiveness',
                            description : 'Address layout issues on tablets and phones',
                            prio        : 'medium',
                            status      : 'todo',
                            progress    : 0,
                            rating      : 3,
                            tags        : 'frontend,mobile'
                        },
                        {
                            id          : 6,
                            name        : 'Database optimization',
                            description : 'Add indexes and optimize slow queries',
                            prio        : 'low',
                            status      : 'todo',
                            progress    : 0,
                            rating      : 2,
                            tags        : 'backend,performance'
                        },
                        {
                            id          : 7,
                            name        : 'User testing session',
                            description : 'Schedule and conduct usability testing',
                            prio        : 'high',
                            status      : 'review',
                            progress    : 80,
                            rating      : 4,
                            tags        : 'ux,research'
                        },
                        {
                            id          : 8,
                            name        : 'Update dependencies',
                            description : 'Upgrade to latest stable versions',
                            prio        : 'low',
                            status      : 'done',
                            progress    : 100,
                            rating      : 3,
                            tags        : 'maintenance'
                        },
                        {
                            id          : 9,
                            name        : 'Create unit tests',
                            description : 'Achieve 80% code coverage',
                            prio        : 'high',
                            status      : 'progress',
                            progress    : 55,
                            rating      : 5,
                            tags        : 'testing,quality'
                        },
                        {
                            id          : 10,
                            name        : 'Release v2.0',
                            description : 'Production deployment with rollback plan',
                            prio        : 'high',
                            status      : 'done',
                            progress    : 100,
                            rating      : 5,
                            tags        : 'release'
                        }
                    ],

                    resources : [
                        { id : 1, name : 'Lisa Wong', image : 'lisa.png' },
                        { id : 2, name : 'Mike Chen', image : 'mike.png' },
                        { id : 3, name : 'Kate Anderson', image : 'kate.png' },
                        { id : 4, name : 'Dave Miller', image : 'dave.png' },
                        { id : 5, name : 'Emilia Rodriguez', image : 'emilia.png' },
                        { id : 6, name : 'Mark Johnson', image : 'mark.png' }
                    ],

                    assignments : [
                        { id : 1, event : 1, resource : 3 },
                        { id : 2, event : 2, resource : 2 },
                        { id : 3, event : 2, resource : 4 },
                        { id : 4, event : 3, resource : 1 },
                        { id : 5, event : 3, resource : 2 },
                        { id : 6, event : 4, resource : 5 },
                        { id : 7, event : 4, resource : 4 },
                        { id : 8, event : 5, resource : 3 },
                        { id : 9, event : 5, resource : 4 },
                        { id : 10, event : 6, resource : 6 },
                        { id : 11, event : 7, resource : 3 },
                        { id : 12, event : 7, resource : 1 },
                        { id : 13, event : 8, resource : 2 },
                        { id : 14, event : 9, resource : 1 },
                        { id : 15, event : 9, resource : 4 },
                        { id : 16, event : 9, resource : 6 },
                        { id : 17, event : 10, resource : 2 },
                        { id : 18, event : 10, resource : 5 },
                        { id : 19, event : 10, resource : 6 }
                    ]
                }
            });
        }
    },
    {
        name        : 'Calendar',
        type        : 'calendar',
        category    : 'Scheduling',
        description : 'Month view calendar with travel time',
        docsUrl     : 'calendar/docs/api/Calendar/view/Calendar',
        bundle      : 'calendar',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { Calendar }) => {
            new Calendar({
                appendTo : container,
                width    : '100%',
                height   : 600,
                border   : true,
                // Start with month view
                mode     : 'month',

                // Set initial date
                date : new Date(2027, 0, 15),

                // Resource avatar images
                resourceImagePath : '../_shared/images/transparent-users/',

                // Sidebar disabled for this demo
                sidebar      : false,
                modeDefaults : {
                    hourHeight   : 60,
                    dayStartTime : 8,
                    dayEndTime   : 18
                },
                // Enable travel time feature
                features : {
                    eventBuffer : {
                        tooltipTemplate : ({ duration }) => `<i class="fa fa-car"></i> Travel time: ${duration}`,
                        showDuration    : true
                    },
                    eventTooltip : {
                        template : data => `
                            <div style="padding: 0.75em; min-width: 250px;">
                                ${data.eventRecord.resource ? `
                                    <div style="display: flex; align-items: center; gap: 0.75em; margin-bottom: 0.75em; padding-bottom: 0.75em; border-bottom: 1px solid #e5e7eb;">
                                        <img src="../_shared/images/transparent-users/${data.eventRecord.resource.image}"
                                             style="width: 2.5em; height: 2.5em; border-radius: 50%;" />
                                        <div>
                                            <div style="font-weight: 600;">${data.eventRecord.resource.name}</div>
                                            <div style="font-size: 0.85em; color: #666;">${data.eventRecord.resource.role}</div>
                                        </div>
                                    </div>
                                ` : ''}
                                <div style="font-weight: 600; font-size: 1.1em; margin-bottom: 0.5em;">
                                    <i class="b-icon ${data.eventRecord.iconCls}"></i> ${data.eventRecord.name}
                                </div>
                                <div style="font-size: 0.9em; color: #666; margin-bottom: 0.5em;">
                                    ${DateHelper.format(data.eventRecord.startDate, 'MMM DD, LT')} - ${DateHelper.format(data.eventRecord.endDate, 'LT')}
                                </div>
                                ${data.eventRecord.preamble || data.eventRecord.postamble ? `
                                    <div style="margin-top: 0.75em; padding-top: 0.75em; border-top: 1px solid #e5e7eb;">
                                        <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 0.5em;">
                                            <i class="fa fa-car"></i> Travel Time
                                        </div>
                                        ${data.eventRecord.preamble ? `
                                            <div style="font-size: 0.85em; color: #666;">
                                                <i class="fa fa-arrow-right"></i> To event: ${data.eventRecord.preamble}
                                            </div>
                                        ` : ''}
                                        ${data.eventRecord.postamble ? `
                                            <div style="font-size: 0.85em; color: #666;">
                                                <i class="fa fa-arrow-left"></i> From event: ${data.eventRecord.postamble}
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `
                    }
                },

                // Project with inline data
                project : {
                    eventStore : {
                        fields : ['preamble', 'preambleIcon', 'postamble', 'postambleIcon']
                    },

                    events : [
                        {
                            id           : 1,
                            name         : 'Client Meeting',
                            startDate    : '2027-01-12T10:00',
                            duration     : 2,
                            durationUnit : 'h',
                            eventColor   : 'blue',
                            iconCls      : 'fa fa-circle',
                            preamble     : '30min',
                            postamble    : '25min',
                            resourceId   : 1
                        },
                        {
                            id           : 2,
                            name         : 'Product Demo',
                            startDate    : '2027-01-14T14:00',
                            duration     : 1.5,
                            durationUnit : 'h',
                            eventColor   : 'green',
                            iconCls      : 'fa fa-circle',
                            preamble     : '45min',
                            postamble    : '35min',
                            resourceId   : 2
                        },
                        {
                            id           : 3,
                            name         : 'Team Workshop',
                            startDate    : '2027-01-15T09:00',
                            duration     : 4,
                            durationUnit : 'h',
                            eventColor   : 'purple',
                            iconCls      : 'fa fa-circle',
                            preamble     : '40min',
                            postamble    : '45min',
                            resourceId   : 3
                        },
                        {
                            id           : 4,
                            name         : 'Site Visit',
                            startDate    : '2027-01-16T13:00',
                            duration     : 3,
                            durationUnit : 'h',
                            eventColor   : 'orange',
                            iconCls      : 'fa fa-circle',
                            preamble     : '55min',
                            postamble    : '45min',
                            resourceId   : 4
                        },
                        {
                            id           : 5,
                            name         : 'Conference',
                            startDate    : '2027-01-19T08:00',
                            duration     : 8,
                            durationUnit : 'h',
                            eventColor   : 'red',
                            iconCls      : 'fa fa-circle',
                            preamble     : '90min',
                            postamble    : '75min',
                            resourceId   : 5
                        },
                        {
                            id           : 6,
                            name         : 'Customer Training',
                            startDate    : '2027-01-20T10:00',
                            duration     : 3,
                            durationUnit : 'h',
                            eventColor   : 'cyan',
                            iconCls      : 'fa fa-circle',
                            preamble     : '40min',
                            postamble    : '30min',
                            resourceId   : 6
                        },
                        {
                            id           : 7,
                            name         : 'Strategy Session',
                            startDate    : '2027-01-21T14:00',
                            duration     : 2,
                            durationUnit : 'h',
                            eventColor   : 'indigo',
                            iconCls      : 'fa fa-circle',
                            preamble     : '35min',
                            postamble    : '60min',
                            resourceId   : 1
                        },
                        {
                            id           : 8,
                            name         : 'Partner Meeting',
                            startDate    : '2027-01-22T11:00',
                            duration     : 2.5,
                            durationUnit : 'h',
                            eventColor   : 'teal',
                            iconCls      : 'fa fa-circle',
                            preamble     : '50min',
                            postamble    : '40min',
                            resourceId   : 2
                        },
                        {
                            id           : 9,
                            name         : 'Quarterly Review',
                            startDate    : '2027-01-23T09:00',
                            duration     : 3,
                            durationUnit : 'h',
                            eventColor   : 'pink',
                            iconCls      : 'fa fa-circle',
                            preamble     : '25min',
                            postamble    : '30min',
                            resourceId   : 3
                        },
                        {
                            id           : 10,
                            name         : 'Vendor Evaluation',
                            startDate    : '2027-01-26T15:00',
                            duration     : 1.5,
                            durationUnit : 'h',
                            eventColor   : 'lime',
                            iconCls      : 'fa fa-circle',
                            preamble     : '35min',
                            postamble    : '30min',
                            resourceId   : 4
                        }
                    ],

                    resources : [
                        { id : 1, name : 'Lisa Wong', role : 'Sales Manager', image : 'lisa.png' },
                        { id : 2, name : 'Mike Chen', role : 'Product Lead', image : 'mike.png' },
                        { id : 3, name : 'Kate Anderson', role : 'Team Lead', image : 'kate.png' },
                        { id : 4, name : 'Dave Miller', role : 'Engineer', image : 'dave.png' },
                        { id : 5, name : 'Emilia Rodriguez', role : 'Speaker', image : 'emilia.png' },
                        { id : 6, name : 'Mark Johnson', role : 'Trainer', image : 'mark.png' }
                    ]
                }
            });
        }
    },
    {
        name        : 'Gantt',
        type        : 'gantt',
        category    : 'Scheduling',
        description : 'Project timeline with dependencies',
        docsUrl     : 'gantt/docs/api/Gantt/view/Gantt',
        bundle      : 'gantt',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { Gantt }) => {
            new Gantt({
                appendTo : container,
                width    : '100%',
                height   : 600,

                // Visual styling
                rowHeight         : 45,
                barMargin         : 14,
                border            : true,
                // Resource avatar images
                resourceImagePath : '../_shared/images/transparent-users/',

                // Columns to display in the grid
                columns : [
                    { type : 'name', width : 250, text : 'Task Name' },
                    { type : 'resourceassignment', width : 110, text : 'Assignee', showAvatars : true },
                    { type : 'percentdone', width : 70, text : 'PercentDone', mode : 'circle' },
                    { type : 'duration', width : 80, hidden : true }
                ],

                // Enable features
                features : {
                    projectLines : false,
                    dependencies : true,
                    columnLines  : false,
                    taskTooltip  : {
                        template : data => `
                            <div style="padding: 0.75em; min-width: 200px;">
                                <div style="font-weight: 600; font-size: 1.1em; margin-bottom: 0.5em;">${data.taskRecord.name}</div>
                                <div style="font-size: 0.9em; margin-bottom: 0.25em;">
                                    <strong>Duration:</strong> ${data.taskRecord.duration} days
                                </div>
                                <div style="font-size: 0.9em; margin-bottom: 0.25em;">
                                    <strong>Progress:</strong> ${data.taskRecord.percentDone}%
                                </div>
                                <div style="font-size: 0.9em;">
                                    <strong>Dates:</strong> ${DateHelper.format(data.taskRecord.startDate, 'MMM DD')} - ${DateHelper.format(data.taskRecord.endDate, 'MMM DD')}
                                </div>
                            </div>
                        `
                    },
                    labels : {
                        left : {
                            field  : 'name',
                            editor : { type : 'textfield' }
                        }
                    }
                },

                // Project configuration
                project : {
                    startDate : '2027-01-05',

                    tasks : [
                        {
                            id          : 1,
                            name        : 'Website Redesign Project',
                            startDate   : '2027-01-05',
                            duration    : 60,
                            percentDone : 35,
                            expanded    : true,
                            children    : [
                                {
                                    id          : 2,
                                    name        : 'Planning Phase',
                                    startDate   : '2027-01-05',
                                    duration    : 5,
                                    percentDone : 100,
                                    eventColor  : 'blue'
                                },
                                {
                                    id          : 3,
                                    name        : 'Design mockups',
                                    startDate   : '2027-01-12',
                                    duration    : 8,
                                    percentDone : 90,
                                    eventColor  : 'purple'
                                },
                                {
                                    id          : 4,
                                    name        : 'Client approval',
                                    startDate   : '2027-01-22',
                                    duration    : 3,
                                    percentDone : 100,
                                    eventColor  : 'green'
                                },
                                {
                                    id          : 5,
                                    name        : 'Frontend development',
                                    startDate   : '2027-01-27',
                                    duration    : 12,
                                    percentDone : 60,
                                    eventColor  : 'orange'
                                },
                                {
                                    id          : 6,
                                    name        : 'Backend API',
                                    startDate   : '2027-01-27',
                                    duration    : 10,
                                    percentDone : 45,
                                    eventColor  : 'red'
                                },
                                {
                                    id          : 7,
                                    name        : 'Database setup',
                                    startDate   : '2027-02-01',
                                    duration    : 5,
                                    percentDone : 80,
                                    eventColor  : 'teal'
                                },
                                {
                                    id          : 8,
                                    name        : 'Integration testing',
                                    startDate   : '2027-02-10',
                                    duration    : 7,
                                    percentDone : 30,
                                    eventColor  : 'cyan'
                                },
                                {
                                    id          : 9,
                                    name        : 'User acceptance testing',
                                    startDate   : '2027-02-19',
                                    duration    : 5,
                                    percentDone : 20,
                                    eventColor  : 'pink'
                                },
                                {
                                    id          : 10,
                                    name        : 'Performance optimization',
                                    startDate   : '2027-02-24',
                                    duration    : 6,
                                    percentDone : 15,
                                    eventColor  : 'indigo'
                                },
                                {
                                    id          : 11,
                                    name        : 'Security audit',
                                    startDate   : '2027-02-26',
                                    duration    : 4,
                                    percentDone : 10,
                                    eventColor  : 'yellow'
                                },
                                {
                                    id          : 12,
                                    name        : 'Content migration',
                                    startDate   : '2027-03-02',
                                    duration    : 5,
                                    percentDone : 5,
                                    eventColor  : 'lime'
                                },
                                {
                                    id          : 13,
                                    name        : 'SEO optimization',
                                    startDate   : '2027-03-05',
                                    duration    : 4,
                                    percentDone : 0,
                                    eventColor  : 'green'
                                },
                                {
                                    id          : 14,
                                    name        : 'Final review',
                                    startDate   : '2027-03-09',
                                    duration    : 3,
                                    percentDone : 0,
                                    eventColor  : 'purple'
                                },
                                {
                                    id          : 15,
                                    name        : 'Deployment',
                                    startDate   : '2027-03-12',
                                    duration    : 2,
                                    percentDone : 0,
                                    eventColor  : 'red'
                                },
                                {
                                    id          : 16,
                                    name        : 'Launch!',
                                    startDate   : '2027-03-14',
                                    duration    : 0,
                                    percentDone : 0,
                                    milestone   : true,
                                    eventColor  : 'green'
                                }
                            ]
                        }
                    ],

                    dependencies : [
                        { id : 1, fromTask : 2, toTask : 3 },
                        { id : 2, fromTask : 3, toTask : 4 },
                        { id : 3, fromTask : 4, toTask : 5 },
                        { id : 4, fromTask : 4, toTask : 6 },
                        { id : 5, fromTask : 6, toTask : 7 },
                        { id : 6, fromTask : 5, toTask : 8 },
                        { id : 7, fromTask : 6, toTask : 8 },
                        { id : 8, fromTask : 7, toTask : 8 },
                        { id : 9, fromTask : 8, toTask : 9 },
                        { id : 10, fromTask : 8, toTask : 10 },
                        { id : 11, fromTask : 9, toTask : 11 },
                        { id : 12, fromTask : 10, toTask : 12 },
                        { id : 13, fromTask : 11, toTask : 13 },
                        { id : 14, fromTask : 12, toTask : 14 },
                        { id : 15, fromTask : 13, toTask : 14 },
                        { id : 16, fromTask : 14, toTask : 15 },
                        { id : 17, fromTask : 15, toTask : 16 }
                    ],

                    resources : [
                        { id : 1, name : 'Lisa Wong', role : 'Project Manager', image : 'lisa.png' },
                        { id : 2, name : 'Mike Chen', role : 'Frontend Developer', image : 'mike.png' },
                        { id : 3, name : 'Kate Anderson', role : 'UI Designer', image : 'kate.png' },
                        { id : 4, name : 'Dave Miller', role : 'Backend Developer', image : 'dave.png' },
                        { id : 5, name : 'Emilia Rodriguez', role : 'QA Engineer', image : 'emilia.png' },
                        { id : 6, name : 'Mark Johnson', role : 'DevOps', image : 'mark.png' }
                    ],

                    assignments : [
                        { id : 1, event : 2, resource : 1 },
                        { id : 2, event : 3, resource : 3 },
                        { id : 3, event : 4, resource : 1 },
                        { id : 4, event : 5, resource : 2 },
                        { id : 5, event : 6, resource : 4 },
                        { id : 6, event : 7, resource : 4 },
                        { id : 7, event : 8, resource : 5 },
                        { id : 8, event : 8, resource : 2 },
                        { id : 9, event : 9, resource : 5 },
                        { id : 10, event : 10, resource : 2 },
                        { id : 11, event : 11, resource : 6 },
                        { id : 12, event : 12, resource : 4 },
                        { id : 13, event : 13, resource : 2 },
                        { id : 14, event : 14, resource : 1 },
                        { id : 15, event : 15, resource : 6 },
                        { id : 16, event : 16, resource : 1 }
                    ]
                }
            });
        }
    },
    {
        name        : 'Resource Histogram',
        type        : 'resourcehistogram',
        category    : 'Scheduling',
        description : 'Resource allocation histogram',
        docsUrl     : 'schedulerpro/docs/api/SchedulerPro/view/ResourceHistogram',
        bundle      : 'schedulerpro',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { ResourceHistogram }) => {
            const
                resources   = [
                    { id : 'r1', name : 'Celia', image : 'celia', calendar : 'business' },
                    { id : 'r2', name : 'Lee', image : 'lee', calendar : 'business' },
                    { id : 'r3', name : 'Macy', image : 'macy', calendar : 'business' },
                    { id : 'r4', name : 'Madison', image : 'madison', calendar : 'business' },
                    { id : 'r5', name : 'Rob', image : 'rob', calendar : 'business' },
                    { id : 'r6', name : 'George', image : 'george', calendar : 'business' }
                ],
                events      = [
                    { id : 1, name : 'Sprint Planning', startDate : '2027-01-05', duration : 28, durationUnit : 'h' },
                    { id : 2, name : 'Design Review', startDate : '2027-01-05', duration : 3 },
                    { id : 3, name : 'Backend Development', startDate : '2027-01-10', duration : 5 },
                    { id : 4, name : 'Frontend Development', startDate : '2027-01-12', duration : 4 },
                    { id : 5, name : 'Code Review', startDate : '2027-01-16', duration : 2 },
                    { id : 6, name : 'Testing', startDate : '2027-01-13', duration : 3 },
                    { id : 7, name : 'Documentation', startDate : '2027-01-14', duration : 2 },
                    { id : 8, name : 'Deployment', startDate : '2027-01-15', duration : 1 },
                    { id : 9, name : 'Client Meeting', startDate : '2027-01-06', duration : 1 },
                    { id : 10, name : 'Bug Fixes', startDate : '2027-01-10', duration : 4 },
                    { id : 11, name : 'Meeting', startDate : '2027-01-06', duration : 5, durationUnit : 'h' },
                    { id : 12, name : 'Conference', startDate : '2027-01-12', duration : 3, durationUnit : 'h' },
                    { id : 13, name : 'Conference', startDate : '2027-01-06', duration : 2 }

                ],
                assignments = [
                    { id : 1, resource : 'r1', event : 1 },
                    { id : 2, resource : 'r2', event : 1 },
                    { id : 3, resource : 'r3', event : 2 },
                    { id : 4, resource : 'r2', event : 3, units : 10 },
                    { id : 5, resource : 'r4', event : 3 },
                    { id : 7, resource : 'r5', event : 5 },
                    { id : 8, resource : 'r4', event : 5 },
                    { id : 10, resource : 'r6', event : 7 },
                    { id : 11, resource : 'r1', event : 11 },
                    { id : 12, resource : 'r3', event : 12 },
                    { id : 13, resource : 'r5', event : 13 },
                    { id : 14, resource : 'r6', event : 13 },
                    { id : 15, resource : 'r4', event : 11 }
                ];

            new ResourceHistogram({
                appendTo       : container,
                width          : '100%',
                height         : '100%',
                border         : true,
                rowHeight      : 50,
                showBarTip     : true,
                startDate      : new Date(2027, 0, 5),
                endDate        : new Date(2027, 0, 19),
                viewPreset     : 'dayAndWeek',
                resourceImages : {
                    path      : '../_shared/images/transparent-users/',
                    extension : '.png'
                },
                columns : [
                    {
                        type           : 'resourceInfo',
                        text           : 'Resource',
                        field          : 'name',
                        width          : 180,
                        showEventCount : false
                    }
                ],
                project : {
                    resources,
                    events,
                    assignments,
                    calendar     : 'business',
                    startDate    : '2024-01-14',
                    endDate      : '2024-03-20',
                    hoursPerDay  : 24,
                    daysPerWeek  : 5,
                    daysPerMonth : 20,
                    calendars    : [
                        {
                            id        : 'general',
                            name      : 'General',
                            intervals : [
                                {
                                    recurrentStartDate : 'on Sat',
                                    recurrentEndDate   : 'on Mon',
                                    isWorking          : false
                                }
                            ],
                            children : [
                                {
                                    id        : 'business',
                                    name      : 'Business',
                                    intervals : [
                                        {
                                            recurrentStartDate : 'every weekday at 12:00',
                                            recurrentEndDate   : 'every weekday at 13:00',
                                            isWorking          : false
                                        },
                                        {
                                            recurrentStartDate : 'every weekday at 17:00',
                                            recurrentEndDate   : 'every weekday at 08:00',
                                            isWorking          : false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            });
        }
    },
    {
        name        : 'Timeline Histogram',
        type        : 'timelinehistogram',
        category    : 'Scheduling',
        description : 'Time-based histogram chart',
        docsUrl     : 'scheduler/docs/api/Scheduler/view/TimelineHistogram',
        bundle      : 'schedulerpro',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { TimelineHistogram }) => {
            const
                // Seeded random generator based on current date (changes daily)
                today    = new Date(),
                dateSeed = today.getFullYear() * 400 + (today.getMonth() + 1) * 32 + today.getDate(),

                // Mulberry32 PRNG - returns a function that generates random numbers
                mulberry32 = (seed) => () => {
                    let t = seed += 0x6D2B79F5;
                    t = Math.imul(t ^ t >>> 15, t | 1);
                    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                    return ((t ^ t >>> 14) >>> 0) / 4294967296;
                },

                // Generate histogram data for a team
                generateHistogramData = (teamSeed, baseWork, tickCount) => {
                    const
                        rand = mulberry32(dateSeed + teamSeed * 17),
                        data = [];

                    for (let i = 0; i < tickCount; i++) {
                        data.push({ work : Math.round(baseWork * (0.3 + rand() * 1.0)) });
                    }
                    return data;
                },

                teams = [
                    { id : 1, name : 'Developer Team', baseWork : 40 },
                    { id : 2, name : 'Design Team', baseWork : 24 },
                    { id : 3, name : 'QA Team', baseWork : 24 },
                    { id : 4, name : 'DevOps Team', baseWork : 16 },
                    { id : 5, name : 'Marketing Team', baseWork : 32 },
                    { id : 6, name : 'Sales Team', baseWork : 28 },
                    { id : 7, name : 'Support Team', baseWork : 36 },
                    { id : 8, name : 'Research Team', baseWork : 20 }
                ];

            new TimelineHistogram({
                appendTo   : container,
                width      : '100%',
                height     : '100%',
                border     : true,
                rowHeight  : 60,
                startDate  : new Date(2027, 0, 1),
                endDate    : new Date(2027, 2, 1),
                tickSize   : 50,
                showBarTip : true,
                columns    : [
                    {
                        text  : 'Resource',
                        field : 'name',
                        width : 150
                    }
                ],
                series : {
                    work : {
                        type : 'bar'
                    }
                },
                store : {
                    data : teams.map(team => ({
                        id            : team.id,
                        name          : team.name,
                        histogramData : generateHistogramData(team.id, team.baseWork, 59)
                    }))
                }
            });
        }
    },
    {
        name        : 'Resource Utilization',
        type        : 'resourceutilization',
        category    : 'Scheduling',
        description : 'Resource allocation breakdown',
        docsUrl     : 'schedulerpro/docs/api/SchedulerPro/view/ResourceUtilization',
        bundle      : 'schedulerpro',
        colSpan     : 2,
        rowSpan     : 2,
        create      : async(container, { ResourceUtilization }) => {
            const
                resources   = [
                    { id : 'r1', name : 'Angelo', image : 'angelo' },
                    { id : 'r2', name : 'Gloria', image : 'gloria' },
                    { id : 'r3', name : 'Maxim', image : 'maxim' },
                    { id : 'r4', name : 'Linda', image : 'linda' },
                    { id : 'r5', name : 'Dave', image : 'dave' },
                    { id : 'r6', name : 'Kate', image : 'kate' },
                    { id : 'r7', name : 'Mike', image : 'mike' },
                    { id : 'r8', name : 'Lisa', image : 'lisa' },
                    { id : 'r9', name : 'Mark', image : 'mark' },
                    { id : 'r10', name : 'Emilia', image : 'emilia' }
                ],
                events      = [
                    { id : 1, name : 'API Development', startDate : '2027-01-05', duration : 3 },
                    { id : 2, name : 'UI Design', startDate : '2027-01-05', duration : 4 },
                    { id : 3, name : 'Database Setup', startDate : '2027-01-07', duration : 2 },
                    { id : 4, name : 'Integration', startDate : '2027-01-09', duration : 3 },
                    { id : 5, name : 'Testing', startDate : '2027-01-10', duration : 4 },
                    { id : 6, name : 'Code Review', startDate : '2027-01-12', duration : 2 },
                    { id : 7, name : 'Documentation', startDate : '2027-01-06', duration : 3 },
                    { id : 8, name : 'Deployment', startDate : '2027-01-13', duration : 2 },
                    { id : 9, name : 'Security Audit', startDate : '2027-01-08', duration : 3 },
                    { id : 10, name : 'Performance Tuning', startDate : '2027-01-11', duration : 2 }
                ],
                assignments = [
                    { id : 1, resource : 'r1', event : 1, units : 100 },
                    { id : 2, resource : 'r2', event : 2, units : 80 },
                    { id : 3, resource : 'r3', event : 2, units : 50 },
                    { id : 4, resource : 'r1', event : 3, units : 60 },
                    { id : 5, resource : 'r4', event : 3, units : 100 },
                    { id : 6, resource : 'r2', event : 4, units : 100 },
                    { id : 7, resource : 'r4', event : 4, units : 50 },
                    { id : 8, resource : 'r3', event : 5, units : 100 },
                    { id : 9, resource : 'r1', event : 6, units : 40 },
                    { id : 10, resource : 'r4', event : 6, units : 80 },
                    { id : 11, resource : 'r5', event : 7, units : 100 },
                    { id : 12, resource : 'r6', event : 7, units : 60 },
                    { id : 13, resource : 'r5', event : 5, units : 50 },
                    { id : 14, resource : 'r6', event : 8, units : 100 },
                    { id : 15, resource : 'r5', event : 8, units : 80 },
                    { id : 16, resource : 'r7', event : 9, units : 100 },
                    { id : 17, resource : 'r8', event : 9, units : 70 },
                    { id : 18, resource : 'r7', event : 1, units : 50 },
                    { id : 19, resource : 'r8', event : 4, units : 60 },
                    { id : 20, resource : 'r9', event : 10, units : 100 },
                    { id : 21, resource : 'r10', event : 10, units : 80 },
                    { id : 22, resource : 'r9', event : 6, units : 50 },
                    { id : 23, resource : 'r10', event : 5, units : 40 }
                ];

            const utilization = new ResourceUtilization({
                appendTo    : container,
                width       : '100%',
                height      : '100%',
                border      : true,
                rowHeight   : 40,
                showBarTip  : true,
                showBarText : true,
                startDate   : new Date(2027, 0, 5),
                endDate     : new Date(2027, 0, 17),
                viewPreset  : 'dayAndWeek',
                columns     : [
                    {
                        type       : 'tree',
                        text       : 'Resource / Task',
                        field      : 'name',
                        width      : 200,
                        htmlEncode : false,
                        renderer({ record, grid }) {
                            const origin = grid.resolveRecordToOrigin(record);

                            if (origin?.isResourceModel) {
                                return `
                                    <div style="display: flex; align-items: center; gap: 0.5em;">
                                        <img src="../_shared/images/transparent-users/${origin.image}.png"
                                             style="width: 1.75em; height: 1.75em; border-radius: 50%;" />
                                        <span>${origin.name}</span>
                                    </div>
                                `;
                            }
                            else if (origin?.isAssignmentModel) {
                                return origin.event?.name || '';
                            }
                            return record.name || '';
                        }
                    }
                ],
                project : {
                    resources,
                    events,
                    assignments
                }
            });
        }
    },
    {
        name        : 'DayButtons',
        type        : 'daybuttons',
        category    : 'Date & Time',
        description : 'Day of week selector buttons',
        docsUrl     : 'calendar/docs/api/Calendar/widget/DayButtons',
        bundle      : 'schedulerpro',
        colSpan     : 2,
        create      : (container, { DayButtons }) => {
            new DayButtons({
                appendTo      : container,
                dayNameLength : 10,
                value         : ['MO', 'WE', 'FR'],
                rendition     : 'padded',
                onAction() {
                    Toast.show({
                        html  : `Selected days: ${this.value || 'none'}`,
                        color : 'b-blue'
                    });
                }
            });

            new DayButtons({
                appendTo      : container,
                value         : ['TU', 'TH'],
                color         : 'b-green',
                dayNameLength : 3,
                onAction() {
                    Toast.show({
                        html  : `Selected days: ${this.value || 'none'}`,
                        color : 'b-green'
                    });
                }
            });
        }
    },
    {
        name        : 'Button',
        type        : 'button',
        category    : 'Buttons & Actions',
        description : 'Various button styles and states',
        docsUrl     : 'grid/docs/api/Core/widget/Button',
        create      : container => {
            const onClick = () => Toast.show({ html : '✓ Button clicked!' });

            container.style.display = 'grid';
            container.style.gridTemplateColumns = '1fr 1fr';
            container.style.gap = '1em';

            const
                leftColumn  = DomHelper.createElement({
                    parent : container,
                    style  : {
                        display       : 'flex',
                        flexDirection : 'column',
                        gap           : '0.5em',
                        alignItems    : 'flex-start'
                    }
                }),
                rightColumn = DomHelper.createElement({
                    parent : container,
                    style  : {
                        display       : 'flex',
                        flexDirection : 'column',
                        gap           : '0.5em',
                        alignItems    : 'flex-start'
                    }
                });

            ['text', 'outlined', 'tonal'].forEach(rendition => {
                new Button({
                    appendTo : leftColumn,
                    text     : rendition.charAt(0).toUpperCase() + rendition.slice(1),
                    icon     : 'fa fa-star',
                    rendition,
                    width    : '10em',
                    onClick
                });
            });

            new Button({
                appendTo  : leftColumn,
                text      : 'Messages',
                icon      : 'fa fa-envelope',
                badge     : '5',
                rendition : 'tonal',
                color     : 'b-blue',
                width     : '10em',
                onClick
            });

            ['filled', 'elevated'].forEach(rendition => {
                new Button({
                    appendTo : rightColumn,
                    text     : rendition.charAt(0).toUpperCase() + rendition.slice(1),
                    icon     : 'fa fa-star',
                    rendition,
                    width    : '10em',
                    onClick
                });
            });

            new Button({
                appendTo  : rightColumn,
                text      : 'Actions',
                icon      : 'fa fa-bolt',
                rendition : 'outlined',
                width     : '10em',
                menu      : {
                    items : {
                        edit      : { icon : 'fa fa-edit', text : 'Edit' },
                        duplicate : { icon : 'fa fa-copy', text : 'Duplicate' },
                        delete    : { icon : 'fa fa-trash', text : 'Delete' }
                    },
                    onItem : ({ item }) => Toast.show(`${item.text} clicked`)
                }
            });

            new Button({
                appendTo  : rightColumn,
                text      : 'Split',
                split     : true,
                icon      : 'fa fa-bolt',
                rendition : 'outlined',
                width     : '10em',
                onClick,
                menu      : {
                    items : {
                        edit      : { icon : 'fa fa-edit', text : 'Edit' },
                        duplicate : { icon : 'fa fa-copy', text : 'Duplicate' },
                        delete    : { icon : 'fa fa-trash', text : 'Delete' }
                    },
                    onItem : ({ item }) => Toast.show(`${item.text} clicked`)
                }
            });

            new Button({
                appendTo  : rightColumn,
                icon      : 'fa fa-gear',
                rendition : 'text',
                tooltip   : 'Icon only button with menu',
                menu      : {
                    items : {
                        details  : { icon : 'fa fa-info-circle', text : 'Details' },
                        share    : { icon : 'fa fa-share-alt', text : 'Share' },
                        download : { icon : 'fa fa-download', text : 'Download' }
                    },
                    onItem : ({ item }) => Toast.show(`${item.text} clicked`)
                }
            });
        }
    },
    {
        name        : 'ButtonGroup',
        type        : 'buttongroup',
        category    : 'Buttons & Actions',
        description : 'Group of related toggle buttons',
        docsUrl     : 'grid/docs/api/Core/widget/ButtonGroup',
        create      : container => {
            new ButtonGroup({
                appendTo    : container,
                toggleGroup : true,
                items       : {
                    alignLeft    : { icon : 'fa fa-align-left', tooltip : 'Align Left', pressed : true },
                    alignCenter  : { icon : 'fa fa-align-center', tooltip : 'Align Center' },
                    alignRight   : { icon : 'fa fa-align-right', tooltip : 'Align Right' },
                    alignJustify : { icon : 'fa fa-align-justify', tooltip : 'Justify' }
                }
            });

            new ButtonGroup({
                appendTo    : container,
                toggleGroup : true,
                color       : 'b-blue',
                items       : {
                    bold      : { icon : 'fa fa-bold', tooltip : 'Bold' },
                    italic    : { icon : 'fa fa-italic', tooltip : 'Italic' },
                    underline : { icon : 'fa fa-underline', tooltip : 'Underline' }
                }
            });

            new ButtonGroup({
                appendTo    : container,
                toggleGroup : true,
                color       : 'b-blue',
                items       : {
                    easy   : { text : 'Easy' },
                    medium : { text : 'Medium', pressed : true },
                    hard   : { text : 'Hard' }
                }
            });

            new ButtonGroup({
                appendTo   : container,
                toggleable : [0, Infinity],
                color      : 'b-blue',
                rendition  : 'padded',
                items      : {
                    xs   : { text : 'XS' },
                    s    : { text : 'S' },
                    m    : { text : 'M', pressed : true },
                    l    : { text : 'L' },
                    xl   : { text : 'XL' },
                    xxl  : { text : 'XXL' },
                    xxxl : { text : 'XXXL' }
                }
            });
        }
    },
    {
        name        : 'Checkbox',
        type        : 'checkbox',
        category    : 'Form Inputs',
        description : 'Checkbox with multiple states',
        docsUrl     : 'grid/docs/api/Core/widget/Checkbox',
        create      : container => {
            new Checkbox({
                appendTo : container,
                text     : 'Subscribe to newsletter'
            });
            new Checkbox({
                appendTo : container,
                checked  : true,
                text     : 'I have not read them, but I agree to the terms and conditions',
                color    : 'b-green'
            });
            new Checkbox({
                appendTo : container,
                disabled : true,
                checked  : true,
                text     : 'Disabled option'
            });
        }
    },
    {
        name        : 'CheckboxGroup',
        type        : 'checkboxgroup',
        category    : 'Form Inputs',
        description : 'Group of related checkboxes',
        docsUrl     : 'grid/docs/api/Core/widget/CheckboxGroup',
        create      : container => {
            new CheckboxGroup({
                appendTo      : container,
                label         : 'Select Features',
                labelPosition : 'above',
                items         : {
                    darkMode  : { text : 'Dark Mode', checked : true },
                    autoSave  : { text : 'Auto Save', checked : true },
                    analytics : { text : 'Analytics' }
                }
            });
        }
    },
    {
        name        : 'ChatButton',
        type        : 'chatbutton',
        category    : 'Chat',
        description : 'Button that toggles a chat panel',
        docsUrl     : 'grid/docs/api/Core/widget/chat/ChatButton',
        create      : container => {
            new ChatButton({
                appendTo  : container,
                tooltip   : 'Chat with Support',
                chatPanel : {
                    title         : 'Acme Sales Support',
                    showAnimation : false,
                    showTimestamp : true,
                    closable      : true,
                    messages      : [
                        {
                            fromOther : true,
                            text      : `Hello, I am a fake chat agent in a docs app. I don't know anything but feel
        free to ask me anything.`
                        }
                    ],

                    intro : {
                        html : `<h4 style="margin:0">We typically reply in a few minutes</h4>
            <br>You can contact our support team if you've checked our docs and still need help.`
                    },
                    // Avatar image url
                    avatar : '../_shared/images/transparent-users/lisa.png'
                }
            });
        }
    },
    {
        name        : 'ChatPanel',
        type        : 'chatpanel',
        category    : 'Chat',
        rowSpan     : 2,
        description : 'Interactive chat interface',
        docsUrl     : 'grid/docs/api/Core/widget/chat/ChatPanel',
        create      : container => {
            new ChatPanel({
                appendTo      : container,
                width         : '100%',
                height        : 500,
                maxHeight     : '100%',
                title         : 'Chat Demo',
                intro         : 'Welcome! Type a message below.',
                showTimestamp : true,
                border        : true,
                onLocalMessage({ text }) {
                    // Echo the message back
                    setTimeout(() => {
                        this.addMessage({
                            fromOther : true,
                            text      : [
                                'Did you try turning it off and on again?',
                                'Try clearing the cache',
                                'Sounds like a race condition to me',
                                'Works on my machine',
                                'Not sure about that'
                            ][Math.round(Math.random() * 3)]
                        });
                    }, 500);
                }
            });
        }
    },
    {
        name        : 'Chart - Bar',
        type        : 'chart',
        category    : 'Charts',
        description : 'Bar chart visualization',
        docsUrl     : 'grid/docs/api/Chart/widget/Chart',
        bundle      : 'chart',
        create      : (container, { Chart }) => {
            let chart;

            new Button({
                insertBefore : container.closest('.widget-card').querySelector('.widget-card-category'),
                icon         : 'fa fa-sync',
                tooltip      : 'Refresh Data',
                rendition    : 'text',
                cls          : 'refresh-button',
                onClick() {
                    const
                        newData = [
                            { month : 'Jan', sales : Math.floor(Math.random() * 30) + 10 },
                            { month : 'Feb', sales : Math.floor(Math.random() * 30) + 10 },
                            { month : 'Mar', sales : Math.floor(Math.random() * 30) + 10 },
                            { month : 'Apr', sales : Math.floor(Math.random() * 30) + 10 },
                            { month : 'May', sales : Math.floor(Math.random() * 30) + 10 },
                            { month : 'Jun', sales : Math.floor(Math.random() * 30) + 10 }
                        ];

                    chart.data = newData;
                }
            });
            chart = new Chart({
                appendTo     : container,
                ref          : 'chart',
                width        : '100%',
                height       : 200,
                chartType    : 'bar',
                showControls : false,
                labels       : { field : 'month' },
                series       : [{
                    field : 'sales',
                    label : 'Sales 2027'
                }],
                data : [
                    { month : 'Jan', sales : 12 },
                    { month : 'Feb', sales : 19 },
                    { month : 'Mar', sales : 15 },
                    { month : 'Apr', sales : 25 },
                    { month : 'May', sales : 22 },
                    { month : 'Jun', sales : 30 }
                ]
            });
        }
    },
    {
        name        : 'Chart - Line',
        type        : 'chart',
        category    : 'Charts',
        description : 'Line chart with trend data',
        docsUrl     : 'grid/docs/api/Chart/widget/Chart',
        bundle      : 'chart',
        create      : (container, { Chart }) => {
            let chart;

            new Button({
                insertBefore : container.closest('.widget-card').querySelector('.widget-card-category'),
                icon         : 'fa fa-sync',
                tooltip      : 'Refresh Data',
                rendition    : 'text',
                cls          : 'refresh-button',
                onClick() {
                    const newData = [
                        { day : 'Mon', visits : Math.floor(Math.random() * 50) + 50 },
                        { day : 'Tue', visits : Math.floor(Math.random() * 50) + 50 },
                        { day : 'Wed', visits : Math.floor(Math.random() * 50) + 50 },
                        { day : 'Thu', visits : Math.floor(Math.random() * 50) + 50 },
                        { day : 'Fri', visits : Math.floor(Math.random() * 50) + 50 },
                        { day : 'Sat', visits : Math.floor(Math.random() * 50) + 50 },
                        { day : 'Sun', visits : Math.floor(Math.random() * 50) + 50 }
                    ];

                    chart.data = newData;
                }
            });

            chart = new Chart({
                appendTo     : container,
                ref          : 'chart',
                width        : '100%',
                height       : 200,
                chartType    : 'line',
                showControls : false,
                labels       : { field : 'day' },
                series       : [{
                    field : 'visits',
                    label : 'Website Visits'
                }],
                data : [
                    { day : 'Mon', visits : 65 },
                    { day : 'Tue', visits : 72 },
                    { day : 'Wed', visits : 81 },
                    { day : 'Thu', visits : 78 },
                    { day : 'Fri', visits : 95 },
                    { day : 'Sat', visits : 88 },
                    { day : 'Sun', visits : 76 }
                ]
            });
        }
    },
    {
        name        : 'Chart - Pie',
        type        : 'chart',
        category    : 'Charts',
        description : 'Pie chart for proportional data',
        docsUrl     : 'grid/docs/api/Chart/widget/Chart',
        bundle      : 'chart',
        create      : (container, { Chart }) => {
            let chart;

            new Button({
                insertBefore : container.closest('.widget-card').querySelector('.widget-card-category'),
                icon         : 'fa fa-sync',
                tooltip      : 'Refresh Data',
                rendition    : 'text',
                cls          : 'refresh-button',
                onClick() {
                    const
                        total   = 100,
                        desktop = Math.floor(Math.random() * 50) + 30,
                        mobile  = Math.floor(Math.random() * (total - desktop - 5)) + 5,
                        tablet  = total - desktop - mobile,
                        newData = [
                            { device : 'Desktop', users : desktop },
                            { device : 'Mobile', users : mobile },
                            { device : 'Tablet', users : tablet }
                        ];

                    chart.data = newData;
                }
            });

            chart = new Chart({
                appendTo     : container,
                ref          : 'chart',
                width        : '100%',
                height       : 200,
                chartType    : 'pie',
                showControls : false,
                chartPadding : {
                    top : 0
                },
                labels : { field : 'device' },
                series : [{
                    field : 'users',
                    label : 'Users by Device'
                }],
                data : [
                    { device : 'Desktop', users : 55 },
                    { device : 'Mobile', users : 35 },
                    { device : 'Tablet', users : 10 }
                ]
            });
        }
    },
    {
        name        : 'ChipView',
        type        : 'chipview',
        category    : 'Display',
        description : 'Display items as interactive chips/tags',
        docsUrl     : 'grid/docs/api/Core/widget/ChipView',
        create      : container => {
            new ChipView({
                appendTo : container,
                width    : '100%',
                closable : true,
                iconTpl  : item => `<i class="fa ${item.icon}" ></i>`,
                items    : [
                    { text : 'JavaScript', icon : 'fa fa-brands fa-js' },
                    { text : 'React', icon : 'fa fa-brands fa-react' },
                    { text : 'Vue', icon : 'fa fa-brands fa-vuejs' },
                    { text : 'Angular', icon : 'fa fa-brands fa-angular' }
                ]
            });
        }
    },
    {
        name        : 'ColorField',
        type        : 'colorfield',
        category    : 'Form Inputs',
        description : 'Color picker field',
        docsUrl     : 'grid/docs/api/Core/widget/ColorField',
        create      : container => {
            const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--b-primary').trim() || '#3498db';

            new ColorField({
                appendTo : container,
                label    : 'Primary Color',
                width    : '100%',
                value    : initialColor,
                onChange({ value }) {
                    document.documentElement.style.setProperty('--b-primary', value);
                }
            });
        }
    },
    {
        name        : 'ColorPicker',
        type        : 'colorpicker',
        category    : 'Pickers',
        description : 'Visual color selection palette',
        docsUrl     : 'grid/docs/api/Core/widget/ColorPicker',
        create      : container => {
            const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--b-primary').trim() || '#3498db';

            new ColorPicker({
                appendTo : container,
                width    : '100%',
                maxWidth : '20em',
                value    : initialColor,
                onColorSelected({ color }) {
                    document.documentElement.style.setProperty('--b-primary', color);
                }
            });
        }
    },
    {
        name        : 'Combo',
        type        : 'combo',
        category    : 'Form Inputs',
        description : 'Searchable dropdown selection',
        docsUrl     : 'grid/docs/api/Core/widget/Combo',
        create      : container => {
            new Container({
                appendTo      : container,
                labelPosition : 'align-before',
                items         : {
                    assignCombo : {
                        type        : 'combo',
                        label       : 'Assign to',
                        width       : '100%',
                        editable    : true,
                        multiSelect : true,
                        value       : [2, 3],
                        listItemTpl : item => `
                            <div style="display: flex; align-items: center; gap: 0.75em;">
                                <img src="../_shared/images/transparent-users/${item.avatar}"
                                     style="width: 2em;" />
                                <div>
                                    <div style="margin-bottom: 0.25em;">${item.name}</div>
                                    <div style="font-size: 0.75em; opacity: 0.5;">${item.role}</div>
                                </div>
                            </div>
                        `,
                        displayField : 'name',
                        valueField   : 'id',
                        items        : [
                            { id : 1, name : 'Lisa Anderson', role : 'Product Manager', avatar : 'lisa.png' },
                            { id : 2, name : 'Mike Chen', role : 'Lead Developer', avatar : 'mike.png' },
                            { id : 3, name : 'Kate Wilson', role : 'UX Designer', avatar : 'kate.png' },
                            { id : 4, name : 'Dave Miller', role : 'QA Engineer', avatar : 'dave.png' },
                            { id : 5, name : 'Emma Garcia', role : 'DevOps', avatar : 'emilia.png' }
                        ]
                    },
                    categoryCombo : {
                        type         : 'combo',
                        label        : 'Category',
                        width        : '100%',
                        value        : 'bug',
                        displayField : 'text',
                        valueField   : 'id',
                        listItemTpl  : item => `<i class="fa ${item.icon}" style="margin-inline-end: 0.5em;"></i>${item.text}`,
                        items        : [
                            {
                                id    : 'feature',
                                text  : 'Feature Request',
                                icon  : 'fa fa-fw fa-lightbulb',
                                group : 'Development'
                            },
                            { id : 'bug', text : 'Bug Report', icon : 'fa fa-fw fa-bug', group : 'Development' },
                            { id : 'refactor', text : 'Refactoring', icon : 'fa fa-fw fa-code', group : 'Development' },
                            { id : 'docs', text : 'Documentation', icon : 'fa fa-fw fa-book', group : 'Other' },
                            { id : 'support', text : 'Support', icon : 'fa fa-fw fa-life-ring', group : 'Other' }
                        ],
                        store : {
                            groupers : [{ field : 'group' }]
                        }
                    },
                    statusCombo : {
                        type  : 'combo',
                        label : 'Status',
                        width : '100%',
                        value : 'active',
                        color : 'b-green',
                        items : [
                            { id : 'active', text : 'Active' },
                            { id : 'pending', text : 'Waiting' },
                            { id : 'completed', text : 'Completed' },
                            { id : 'archived', text : 'Archived' }
                        ]
                    }
                }
            });
        }
    },
    {
        name        : 'ConfirmationBar',
        type        : 'confirmationbar',
        category    : 'Dialogs & Overlays',
        description : 'Action confirmation bar',
        docsUrl     : 'grid/docs/api/Core/widget/ConfirmationBar',
        create      : container => {
            const bar = new ConfirmationBar({
                appendTo : container,
                width    : '100%',
                border   : true,
                message  : 'Would you like to save your changes?',
                onConfirm() {
                    Toast.show('✓ Changes saved!');
                    bar.hide();
                },
                onCancel() {
                    Toast.show('✗ Changes discarded');
                    bar.hide();
                }
            });
        }
    },
    {
        name        : 'Container',
        type        : 'container',
        category    : 'Layout',
        description : 'Basic container for grouping widgets',
        docsUrl     : 'grid/docs/api/Core/widget/Container',
        rowSpan     : 2,
        create      : container => {
            new Container({
                appendTo : container,
                width    : '100%',
                style    : 'padding: 1em; background: var(--panel-background-color);  border-radius: 0.5em;',
                border   : true,
                items    : {
                    profileHeader : {
                        type : 'label',
                        html : `
                            <div style="display: flex; align-items: center; gap: 1em; margin-bottom: 1em;">
                                <img src="../_shared/images/transparent-users/john.png"
                                     style="width: 4em;" />
                                <h3 style="margin:0;">User Profile</h3>
                            </div>
                        `
                    },
                    nameRow : {
                        type   : 'container',
                        layout : 'hbox',
                        style  : 'gap: 0.5em;',
                        items  : {
                            firstName : {
                                type          : 'textfield',
                                label         : 'First Name',
                                labelPosition : 'above',
                                value         : 'John',
                                flex          : 1
                            },
                            lastName : {
                                type          : 'textfield',
                                label         : 'Last Name',
                                labelPosition : 'above',
                                value         : 'Doe',
                                flex          : 1
                            }
                        }
                    },
                    emailField : {
                        type          : 'textfield',
                        label         : 'Email',
                        labelPosition : 'above',
                        value         : 'john.doe@example.com'
                    },
                    roleCombo : {
                        type          : 'combo',
                        label         : 'Role',
                        labelPosition : 'above',
                        value         : 'Developer',
                        items         : ['Developer', 'Designer', 'Manager', 'QA Engineer', 'DevOps']
                    },
                    notificationsToggle : {
                        type    : 'slidetoggle',
                        text    : 'Email notifications',
                        checked : true,
                        style   : 'margin-top: 0.5em;'
                    },
                    buttonContainer : {
                        type   : 'container',
                        layout : 'hbox',
                        style  : 'gap: 0.5em; margin-top: 1em;',
                        items  : {
                            saveButton : {
                                type      : 'button',
                                text      : 'Save',
                                icon      : 'fa fa-save',
                                rendition : 'filled',
                                color     : 'b-blue',
                                flex      : 1
                            },
                            cancelButton : {
                                type : 'button',
                                text : 'Cancel',
                                flex : 1
                            }
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'DateField',
        type        : 'datefield',
        category    : 'Date & Time',
        description : 'Date selection field',
        docsUrl     : 'grid/docs/api/Core/widget/DateField',
        create      : container => {
            new Container({
                appendTo      : container,
                labelPosition : 'align-before',
                items         : {
                    eventDate : {
                        type  : 'datefield',
                        label : 'Event Date',
                        width : '100%',
                        value : new Date()
                    },
                    withSteppers : {
                        type  : 'datefield',
                        label : 'With Steppers',
                        width : '100%',
                        value : new Date(),
                        step  : '1d'
                    },
                    disabledDate : {
                        type     : 'datefield',
                        label    : 'Disabled',
                        width    : '100%',
                        value    : new Date(),
                        disabled : true
                    }
                }
            });
        }
    },
    {
        name        : 'DatePicker',
        type        : 'datepicker',
        category    : 'Pickers',
        description : 'Calendar date picker',
        docsUrl     : 'grid/docs/api/Core/widget/DatePicker',
        rowSpan     : 2,
        centered    : true,
        create      : container => {
            // Generate some fake event data for demo
            const today = new Date();
            const eventData = {};
            for (let i = -15; i < 20; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                const key = DateHelper.format(date, 'YYYY-MM-DD');
                // Random events on some days
                if (Math.random() > 0.6) {
                    eventData[key] = Math.floor(Math.random() * 5) + 1;
                }
            }

            const datePicker = new DatePicker({
                appendTo     : container,
                trapFocus    : false,
                width        : '100%',
                maxWidth     : '25em',
                multiSelect  : 'simple',
                weekStartDay : 1,
                showDots     : true, // Custom property to toggle dots
                strips       : {
                    top : {
                        side  : 'top',
                        style : 'order : -1;',
                        items : {
                            modeToggle : {
                                type        : 'buttongroup',
                                toggleGroup : true,
                                rendition   : 'padded',
                                items       : {
                                    single : { text : 'Single', pressed : false },
                                    simple : { text : 'Range', pressed : true }
                                },
                                onToggle({ source }) {
                                    const mode = source.ref;
                                    datePicker.multiSelect = mode === 'single' ? false : mode;
                                }
                            }
                        }
                    }
                },
                bbar : {
                    items : {
                        dotsToggle : {
                            type    : 'slidetoggle',
                            text    : 'Show events',
                            checked : true,
                            onChange({ source, checked }) {
                                datePicker.showDots = checked;
                                datePicker.refresh();
                            }
                        },
                        weeksToggle : {
                            type : 'slidetoggle',
                            text : 'Show weeks',
                            onChange({ source, checked }) {
                                datePicker.showWeekColumn = checked;
                            }
                        }
                    }
                },
                selection : [
                    new Date(today.getFullYear(), today.getMonth(), 10),
                    new Date(today.getFullYear(), today.getMonth(), 17)
                ],
                cellRenderer({ cell, cellPayload, date }) {
                    const
                        key      = DateHelper.format(date, 'YYYY-MM-DD'),
                        events   = eventData[key],
                        showDots = events && this.showDots;

                    cell.dataset.btip = showDots ? `${events} event${events > 1 ? 's' : ''} scheduled` : '';
                    cellPayload.innerHTML = showDots ? '<div class="b-event-dot"></div>' : '';
                },
                onSelectionChange({ selection }) {
                    if (selection.length === 1) {
                        Toast.show(`${DateHelper.format(selection[0], 'MMM DD')} selected`);
                    }
                    else if (selection.length > 1) {
                        Toast.show(`${selection.length} dates selected`);
                    }
                }
            });
        }
    },
    {
        name        : 'DateRangeField',
        type        : 'daterangefield',
        category    : 'Date & Time',
        description : 'Date range selection',
        docsUrl     : 'grid/docs/api/Core/widget/DateRangeField',
        create      : container => {
            new DateRangeField({
                appendTo      : container,
                width         : '100%',
                autoExpand    : true,
                value         : [new Date(), new Date(new Date().setDate(new Date().getDate() + 7))],
                rendition     : 'outlined',
                label         : 'Book your stay',
                labelPosition : 'above',
                picker        : {
                    align : 't-b',
                    cellRenderer({ cell, innerCell, cellPayload, date }) {
                        const
                            weatherIcons = ['☀️', '⛅', '🌤️', '☁️', '🌦️', '⛈️', '🌧️'],
                            weatherDesc  = ['Sunny', 'Partly Cloudy', 'Mostly Sunny', 'Cloudy', 'Rain Showers', 'Stormy', 'Rainy'],
                            icon         = weatherIcons[date.getDay()];

                        cell.dataset.btip = `<h4>Weather forecast</h4> ${weatherDesc[date.getDay()]} `;
                        innerCell.style.padding = '0 .8em .8em .8em';
                        innerCell.style.fontSize = '.9em';
                        cellPayload.innerHTML = `${icon}`;
                        cellPayload.style.fontSize = '.8em';
                        cellPayload.style.bottom = '3px';
                    },
                    datePickerDefaults : {
                        shadePastDates : true
                    }
                },
                fieldStartDate : {
                    placeholder : 'Check-in'
                },
                fieldEndDate : {
                    placeholder : 'Check-out'
                }
            });
        }
    },
    {
        name        : 'DateTimeField',
        type        : 'datetimefield',
        category    : 'Date & Time',
        description : 'Combined date and time input',
        docsUrl     : 'grid/docs/api/Core/widget/DateTimeField',
        create      : container => {
            new DateTimeField({
                appendTo      : container,
                label         : 'Meeting Time',
                labelPosition : 'above',
                width         : '100%',
                value         : new Date()
            });
        }
    },
    {
        name        : 'DisplayField',
        type        : 'displayfield',
        category    : 'Form Inputs',
        description : 'Read-only display field',
        docsUrl     : 'grid/docs/api/Core/widget/DisplayField',
        create      : container => {
            new DisplayField({
                appendTo : container,
                label    : 'Build Status',
                value    : '✓ All tests passed locally',
                width    : '100%'
            });
        }
    },
    {
        name        : 'DurationField',
        type        : 'durationfield',
        category    : 'Date & Time',
        description : 'Duration input with units',
        docsUrl     : 'grid/docs/api/Core/widget/DurationField',
        create      : container => {
            new DurationField({
                appendTo : container,
                label    : 'Estimated vs Actual',
                width    : '100%',
                value    : 2,
                unit     : 'week'
            });
        }
    },
    {
        name        : 'FieldSet',
        type        : 'fieldset',
        category    : 'Layout',
        description : 'Grouped form fields with legend',
        docsUrl     : 'grid/docs/api/Core/widget/FieldSet',
        create      : container => {
            new FieldSet({
                appendTo      : container,
                width         : '100%',
                icon          : 'fa fa-user',
                title         : 'User Information',
                labelPosition : 'align-before',
                items         : {
                    nameField  : { type : 'textfield', label : 'Full Name', value : 'John Doe' },
                    emailField : { type : 'textfield', label : 'Email', value : 'john@example.com' }
                }
            });
        }
    },
    {
        name        : 'FileField',
        type        : 'filefield',
        category    : 'Form Inputs',
        description : 'File upload field',
        docsUrl     : 'grid/docs/api/Core/widget/FileField',
        create      : container => {
            new FileField({
                appendTo : container,
                label    : 'Upload Document',
                width    : '100%',
                accept   : 'image/*,.pdf'
            });
        }
    },
    {
        name        : 'FilePicker',
        type        : 'filepicker',
        category    : 'Pickers',
        description : 'File browser and selector',
        docsUrl     : 'grid/docs/api/Core/widget/FilePicker',
        create      : container => {
            new FilePicker({
                appendTo  : container,
                rendition : 'tonal',
                width     : '100%',
                height    : 200
            });
        }
    },
    {
        name        : 'Grid',
        type        : 'grid',
        category    : 'Data Display',
        description : 'Data grid with rows and columns',
        docsUrl     : 'grid/docs/api/Grid/view/Grid',
        bundle      : 'grid',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { Grid }) => {
            new Grid({
                appendTo : container,
                width    : '100%',
                height   : '100%',
                border   : true,
                features : {
                    stripe     : true,
                    filterBar  : true,
                    rowReorder : true
                },
                columns : [
                    {
                        text       : 'Person',
                        field      : 'name',
                        flex       : 1,
                        htmlEncode : false,
                        renderer   : ({ record }) => `
                            <div style="display: flex; align-items: center; gap: 0.75em;">
                                <img src="../_shared/images/transparent-users/${record.avatar}"
                                     style="width: 2em; height: 2em; border-radius: 50%;" />
                                <span>${record.name}</span>
                            </div>
                        `
                    },
                    { text : 'Age', field : 'age', width : 200 },
                    { text : 'City', field : 'city', width : 220 },
                    { type : 'percent', text : 'Score', field : 'score', width : 200 }
                ],
                data : [
                    { id : 1, name : 'Alice Johnson', age : 28, city : 'New York', score : 85, avatar : 'lisa.png' },
                    { id : 2, name : 'Bob Smith', age : 34, city : 'Los Angeles', score : 92, avatar : 'mike.png' },
                    { id : 3, name : 'Carol White', age : 25, city : 'Chicago', score : 78, avatar : 'kate.png' },
                    { id : 4, name : 'David Brown', age : 42, city : 'Houston', score : 95, avatar : 'dave.png' },
                    { id : 5, name : 'Emma Davis', age : 31, city : 'Phoenix', score : 88, avatar : 'emilia.png' },
                    { id : 6, name : 'Frank Miller', age : 29, city : 'Philadelphia', score : 91, avatar : 'mark.png' },
                    { id : 7, name : 'Grace Lee', age : 37, city : 'San Antonio', score : 82, avatar : 'hitomi.png' },
                    { id : 8, name : 'Henry Wilson', age : 45, city : 'San Diego', score : 76, avatar : 'steve.png' },
                    { id : 9, name : 'Iris Chen', age : 26, city : 'Dallas', score : 89, avatar : 'jane.png' },
                    { id : 10, name : 'Jack Taylor', age : 33, city : 'San Jose', score : 94, avatar : 'john.png' },
                    { id : 11, name : 'Kate Martinez', age : 30, city : 'Austin', score : 87, avatar : 'karen.png' },
                    { id : 12, name : 'Leo Garcia', age : 38, city : 'Jacksonville', score : 79, avatar : 'malik.png' },
                    { id : 13, name : 'Maya Patel', age : 27, city : 'Fort Worth', score : 93, avatar : 'macy.png' },
                    { id : 14, name : 'Noah Anderson', age : 41, city : 'Columbus', score : 81, avatar : 'peter.png' },
                    { id : 15, name : 'Olivia Thomas', age : 35, city : 'Charlotte', score : 86, avatar : 'linda.png' }
                ],
                bbar : {
                    items : {
                        addRow : {
                            type      : 'button',
                            text      : 'Add Row',
                            icon      : 'fa fa-plus',
                            rendition : 'tonal',
                            color     : 'b-blue',
                            onAction({ source }) {
                                const
                                    grid      = source.up('grid'),
                                    avatars   = ['adam.png', 'barbara.png', 'sam.png', 'madison.png', 'rob.png'],
                                    newRecord = grid.store.add({
                                        name   : 'New Person',
                                        age    : 25,
                                        city   : 'Boston',
                                        score  : 75,
                                        avatar : avatars[Math.floor(Math.random() * avatars.length)]
                                    })[0];

                                grid.scrollRowIntoView(newRecord);
                            }
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'Label',
        type        : 'label',
        category    : 'Display',
        description : 'Text label',
        docsUrl     : 'grid/docs/api/Core/widget/Label',
        create      : container => {
            new Label({
                appendTo : container,
                text     : 'Simple Text Label'
            });
        }
    },
    {
        name        : 'Widget',
        type        : 'widget',
        category    : 'Core',
        description : 'A div with superpowers',
        docsUrl     : 'grid/docs/api/Core/widget/Widget',
        centered    : true,
        create      : container => {
            new Widget({
                appendTo : container,
                html     : '<div style="text-align: center; padding: 2em;"><i class="fa fa-cube fa-3x" style="color: var(--b-primary); margin-bottom: 0.5em;"></i><div style="font-size: 1.2em; font-weight: 600;">Base Widget</div><div style="color: var(--b-neutral-60); margin-top: 0.5em;">The foundation for all Bryntum widgets.<br>Handles rendering, events, configs & lifecycle.</div></div>'
            });
        }
    },
    {
        name        : 'List',
        type        : 'list',
        category    : 'Display',
        rowSpan     : 2,
        description : 'Selectable item list',
        docsUrl     : 'grid/docs/api/Core/widget/List',
        create      : container => {
            const
                items = [
                    { id : 1, name : 'Slack', icon : 'fa fa-brands fa-slack', color : '#E01E5A', status : 'connected', version : 'v2.4.1', category : 'Communication' },
                    { id : 2, name : 'Telegram', icon : 'fa fa-brands fa-telegram', color : '#0088cc', status : 'connected', version : 'v1.8.0', category : 'Communication' },
                    { id : 3, name : 'Discord', icon : 'fa fa-brands fa-discord', color : '#5865F2', status : 'importing', version : 'v3.1.2', category : 'Communication' },
                    { id : 4, name : 'GitHub', icon : 'fa fa-brands fa-github', color : '#333', status : 'connected', version : 'v4.0.0', category : 'Development' },
                    { id : 5, name : 'GitLab', icon : 'fa fa-brands fa-gitlab', color : '#FC6D26', status : 'pending', version : 'v2.1.0', category : 'Development' },
                    { id : 6, name : 'Jira', icon : 'fa fa-brands fa-jira', color : '#0052CC', status : 'importing', version : 'v1.5.3', category : 'Development' },
                    { id : 7, name : 'Figma', icon : 'fa fa-brands fa-figma', color : '#F24E1E', status : 'connected', version : 'v2.0.1', category : 'Design' },
                    { id : 8, name : 'Teams', icon : 'fa fa-brands fa-microsoft', color : '#6264A7', status : 'pending', version : 'v1.2.0', category : 'Communication' }
                ],
                statusIcon = {
                    connected : '<i class="fa fa-circle-check"></i>',
                    importing : '<i class="fa fa-circle-notch fa-spin"></i>',
                    pending   : ''
                },
                list       = new List({
                    flex    : 1,
                    itemTpl : item => `
                        <div class="integration-item">
                            <div class="integration-icon" style="color: ${item.color};">
                                <i class="${item.icon}"></i>
                            </div>
                            <div class="integration-info">
                                <div class="integration-name">${item.name}</div>
                                <div class="integration-version">${item.version}</div>
                            </div>
                            <span class="integration-status status-${item.status}">${statusIcon[item.status]} ${item.status}</span>
                        </div>
                    `,
                    items
                });

            new Container({
                adopt  : container,
                layout : 'vbox',
                items  : {
                    toggles : {
                        type   : 'container',
                        layout : 'hbox',
                        cls    : 'list-toggles',
                        items  : {
                            multiSelect : {
                                type     : 'slidetoggle',
                                text     : 'Multi-select',
                                onChange : ({ checked }) => list.multiSelect = checked
                            },
                            grouped : {
                                type     : 'slidetoggle',
                                text     : 'Grouped',
                                onChange : ({ checked }) => checked ? list.store.group('category') : list.store.clearGroupers()
                            }
                        }
                    },
                    list
                }
            });
        }
    },
    {
        name        : 'Menu',
        type        : 'menu',
        category    : 'Dialogs & Overlays',
        description : 'Context menu',
        docsUrl     : 'grid/docs/api/Core/widget/Menu',
        create      : container => {
            const trigger = new Widget({
                appendTo : container,
                style    : {
                    background        : '#3498db',
                    color             : '#fff',
                    display           : 'flex',
                    'align-items'     : 'center',
                    'justify-content' : 'center',
                    padding           : '1em 2em',
                    'border-radius'   : '0.25em',
                    cursor            : 'pointer'
                },
                html : '🖱️ Right-click to show menu'
            });

            trigger.element.addEventListener('contextmenu', event => {
                event.preventDefault();
                if (!trigger.menu) {
                    trigger.menu = new Menu({
                        anchor : true,
                        owner  : trigger,
                        items  : {
                            newItem : {
                                icon : 'b-icon-add',
                                text : 'New',
                                menu : {
                                    items : {
                                        file   : { icon : 'fa-file', text : 'File' },
                                        folder : { icon : 'fa-folder', text : 'Folder' },
                                        from   : {
                                            icon : 'fa-upload',
                                            text : 'Import from...',
                                            menu : {
                                                items : {
                                                    local : { text : 'Local file' },
                                                    cloud : { text : 'Cloud storage' },
                                                    url   : { text : 'URL' }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            edit     : { icon : 'b-icon-edit', text : 'Edit' },
                            delete   : { icon : 'b-icon-trash', text : 'Delete', cls : 'b-separator' },
                            disabled : { icon : 'fa-lock', disabled : true, text : 'Disabled' }
                        },
                        onItem({ item }) {
                            Toast.show(`Clicked: ${item.text}`);
                        }
                    });
                }
                trigger.menu.showBy(trigger);
            });
        }
    },
    {
        name        : 'MessageDialog',
        type        : 'messagedialog',
        category    : 'Dialogs & Overlays',
        description : 'Modal message dialogs',
        docsUrl     : 'grid/docs/api/Core/widget/MessageDialog',
        create      : container => {
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '0.5em';

            new Button({
                appendTo  : container,
                text      : 'Info',
                icon      : 'fa fa-info-circle',
                color     : 'b-blue',
                width     : '10em',
                rendition : 'tonal',
                onClick   : () => MessageDialog.alert({
                    title   : 'Reminder',
                    message : 'Have you tried turning it off and on again?'
                })
            });

            new Button({
                appendTo  : container,
                text      : 'Confirm',
                icon      : 'fa fa-question-circle',
                color     : 'b-orange',
                width     : '10em',
                rendition : 'tonal',
                onClick   : async() => {
                    await MessageDialog.confirm({
                        title   : 'Deploy to Production?',
                        message : 'Are you sure? It\'s Friday at 4:45 PM...'
                    });
                    Toast.show('🚀 Deployed! What could go wrong?');
                }
            });

            new Button({
                appendTo  : container,
                text      : 'Prompt',
                icon      : 'fa fa-edit',
                color     : 'b-green',
                width     : '10em',
                rendition : 'tonal',
                onClick   : async() => {
                    const result = await MessageDialog.prompt({
                        title   : 'Commit Message',
                        message : 'Please enter your commit message:',
                        value   : 'WIP'
                    });
                    if (result) {
                        Toast.show(`✓ Committed: "${result.text}"`);
                    }
                }
            });
        }
    },
    {
        name        : 'MonthPicker',
        type        : 'monthpicker',
        category    : 'Pickers',
        description : 'Month and year selection',
        docsUrl     : 'grid/docs/api/Core/widget/MonthPicker',
        create      : container => {
            container.classList.add('b-centered');
            new MonthPicker({
                appendTo : container,
                width    : '100%',
                maxWidth : '20em',
                value    : new Date()
            });
        }
    },
    {
        name        : 'NumberField',
        type        : 'numberfield',
        category    : 'Form Inputs',
        description : 'Numeric input with spinner',
        docsUrl     : 'grid/docs/api/Core/widget/NumberField',
        create      : container => {
            new Container({
                appendTo      : container,
                labelPosition : 'align-before',
                items         : {
                    sprintPoints : {
                        type  : 'numberfield',
                        label : 'Sprint Points',
                        width : '100%',
                        value : 3,
                        min   : 1,
                        max   : 100,
                        step  : 1
                    },
                    priceField : {
                        type   : 'numberfield',
                        label  : 'Price',
                        width  : '100%',
                        value  : 99.99,
                        min    : 0,
                        step   : 0.01,
                        format : '9,999.00',
                        color  : 'b-green'
                    },
                    bugCount : {
                        type  : 'numberfield',
                        label : 'Bug Count',
                        width : '100%',
                        value : 0,
                        min   : 0,
                        max   : 999,
                        step  : 1,
                        color : 'b-orange'
                    }
                }
            });
        }
    },
    {
        name        : 'Panel',
        type        : 'panel',
        category    : 'Layout',
        description : 'Container with header and tools',
        docsUrl     : 'grid/docs/api/Core/widget/Panel',
        rowSpan     : 2,
        create      : container => {
            const datasets = [
                {
                    name  : 'Dev Life',
                    total : '$2,847',
                    items : [
                        {
                            icon   : 'fa fa-robot',
                            color  : 'var(--b-color-blue)',
                            label  : 'OpenAI API tokens',
                            amount : '$1,250'
                        },
                        {
                            icon   : 'fa fa-coffee',
                            color  : 'var(--b-color-blue)',
                            label  : 'Coffee & Energy Drinks',
                            amount : '$342'
                        },
                        {
                            icon   : 'fa fa-brands fa-bitcoin',
                            color  : 'var(--b-color-blue)',
                            label  : 'Crypto wallet',
                            amount : '$1,255'
                        }
                    ]
                },
                {
                    name  : 'Side Hustle',
                    total : '$4,127',
                    items : [
                        {
                            icon   : 'fa fa-brands fa-stack-overflow',
                            color  : 'var(--b-color-blue)',
                            label  : 'Stack Overflow',
                            amount : '$29'
                        },
                        {
                            icon   : 'fa fa-keyboard',
                            color  : 'var(--b-color-blue)',
                            label  : 'New keyboard',
                            amount : '$890'
                        },
                        { icon : 'fa fa-globe', color : 'var(--b-color-blue)', label : 'Domain names', amount : '$3,208' }
                    ]
                },
                {
                    name  : 'Office Setup',
                    total : '$3,299',
                    items : [
                        {
                            icon   : 'fa fa-lightbulb',
                            color  : 'var(--b-color-green)',
                            label  : 'RGB lighting upgrades',
                            amount : '$234'
                        },
                        {
                            icon   : 'fa fa-desktop',
                            color  : 'var(--b-color-green)',
                            label  : '"Just one more monitor"',
                            amount : '$2,100'
                        },
                        {
                            icon   : 'fa fa-bath',
                            color  : 'var(--b-color-green)',
                            label  : 'Rubber duck collection',
                            amount : '$965'
                        }
                    ]
                },
                {
                    name  : 'Startup Dreams',
                    total : '$5,892',
                    items : [
                        {
                            icon   : 'fa fa-rocket',
                            color  : 'var(--b-color-orange)',
                            label  : 'Failed startup ideas',
                            amount : '$4,200'
                        },
                        {
                            icon   : 'fa fa-tshirt',
                            color  : 'var(--b-color-orange)',
                            label  : 'Conference swag',
                            amount : '$180'
                        },
                        {
                            icon   : 'fa fa-pizza-slice',
                            color  : 'var(--b-color-orange)',
                            label  : '"Friday Deploy" pizza',
                            amount : '$1,512'
                        }
                    ]
                }
            ];

            let currentIndex = 0;

            const panel = new Panel({
                appendTo : container,
                width    : '100%',
                maxWidth : '35em',
                title    : datasets[0].name,
                border   : true,
                tools    : {
                    refresh : {
                        cls     : 'fa fa-sync',
                        tooltip : 'Switch dataset',
                        handler() {
                            currentIndex = (currentIndex + 1) % datasets.length;
                            const
                                data       = datasets[currentIndex],
                                itemKeys   = ['tokenUsage', 'drinksConsumed', 'crypto'];

                            // Update panel title
                            this.title = data.name;

                            // Update total
                            panel.widgetMap.total.html = data.total;

                            // Update chart with random data
                            const chartData = Array.from({ length : 7 }, (_, i) => ({
                                day    : i + 1,
                                amount : Math.floor(Math.random() * 400) + 200
                            }));
                            panel.widgetMap.chart.data = chartData;

                            // Update items
                            data.items.forEach((item, i) => {
                                const itemWidgetMap = panel.widgetMap[itemKeys[i]].widgetMap;
                                itemWidgetMap.icon.html = `<i class="fa ${item.icon}" style="font-size: 1.2em; color: ${item.color};"></i>`;
                                itemWidgetMap.content.html = `<div style="font-weight: 600;">${item.label}</div>`;
                                itemWidgetMap.amount.html = `- ${item.amount}`;
                            });
                        }
                    }
                },
                layout : 'vbox',
                style  : 'gap: 0.5em;',
                items  : {
                    // Total Expenses Card
                    totalCard : {
                        type   : 'container',
                        layout : 'hbox',
                        style  : 'align-items: center; justify-content: space-between; padding: 1em; background: var(--b-neutral-95); border-radius: 0.5em;',
                        items  : {
                            total : {
                                ref   : 'total',
                                style : 'font-size: 2em; font-weight: bold;',
                                html  : datasets[0].total
                            },
                            chart : {
                                type         : 'chart',
                                ref          : 'chart',
                                width        : 100,
                                height       : 70,
                                chartType    : 'line',
                                labels       : { field : 'day' },
                                background   : 'var(--b-neutral-95)',
                                showAxes     : false,
                                showLegend   : false,
                                showTooltips : false,
                                showControls : false,
                                pointSize    : 2,
                                chartPadding : 0,
                                series       : [{
                                    field : 'amount',
                                    color : '#667eea'
                                }],
                                data : [
                                    { day : 1, amount : 200 },
                                    { day : 2, amount : 250 },
                                    { day : 3, amount : 220 },
                                    { day : 4, amount : 280 },
                                    { day : 5, amount : 300 },
                                    { day : 6, amount : 320 },
                                    { day : 7, amount : 350 }
                                ]
                            }
                        }
                    },
                    // Item 1
                    tokenUsage : {
                        type   : 'container',
                        layout : 'hbox',
                        style  : 'align-items: center; padding: 1em; background: var(--b-neutral-95); border-radius: 0.5em;',
                        items  : {
                            icon : {
                                ref   : 'icon',
                                style : 'width: 3em; height: 3em; background: var(--b-neutral-90); border-radius: 50%; display: flex; align-items: center; justify-content: center; ',
                                html  : `<i class="fa ${datasets[0].items[0].icon}" style="font-size: 1.2em; color: ${datasets[0].items[0].color};"></i>`
                            },
                            content : {
                                ref  : 'content',
                                flex : 1,
                                html : `<div style="font-weight: 600;">${datasets[0].items[0].label}</div>`
                            },
                            amount : {
                                ref   : 'amount',
                                style : 'font-weight: 700; font-size: 1.1em;',
                                html  : `- ${datasets[0].items[0].amount}`
                            }
                        }
                    },
                    // Item 2
                    drinksConsumed : {
                        type   : 'container',
                        layout : 'hbox',
                        style  : 'align-items: center; padding: 1em; background: var(--b-neutral-95); border-radius: 0.5em;',
                        items  : {
                            icon : {
                                ref   : 'icon',
                                style : 'width: 3em; height: 3em; background: var(--b-neutral-90); border-radius: 50%; display: flex; align-items: center; justify-content: center;',
                                html  : `<i class="fa ${datasets[0].items[1].icon}" style="font-size: 1.2em; color: ${datasets[0].items[1].color};"></i>`
                            },
                            content : {
                                ref  : 'content',
                                flex : 1,
                                html : `<div style="font-weight: 600;">${datasets[0].items[1].label}</div>`
                            },
                            amount : {
                                ref   : 'amount',
                                style : 'font-weight: 700; font-size: 1.1em;',
                                html  : `- ${datasets[0].items[1].amount}`
                            }
                        }
                    },
                    // Item 3
                    crypto : {
                        type   : 'container',
                        layout : 'hbox',
                        style  : 'align-items: center; padding: 1em; background: var(--b-neutral-95); border-radius: 0.5em;',
                        items  : {
                            icon : {
                                ref   : 'icon',
                                style : 'width: 3em; height: 3em; background: var(--b-neutral-90); border-radius: 50%; display: flex; align-items: center; justify-content: center;',
                                html  : `<i class="fa ${datasets[0].items[2].icon}" style="font-size: 1.2em; color: ${datasets[0].items[2].color};"></i>`
                            },
                            content : {
                                ref  : 'content',
                                flex : 1,
                                html : `<div style="font-weight: 600;">${datasets[0].items[2].label}</div>`
                            },
                            amount : {
                                ref   : 'amount',
                                style : 'font-weight: 700; font-size: 1.1em;',
                                html  : `- ${datasets[0].items[2].amount}`
                            }
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'Mask',
        type        : 'mask',
        category    : 'Mask',
        description : 'Mask any element',
        docsUrl     : 'grid/docs/api/Core/widget/Mask',
        create      : container => {
            container.style.minHeight = '15em';
            Mask.mask({
                target : container,
                icon   : 'fa fa-spin fa-circle-notch',
                text   : 'Please hold for the president...'
            });
        }
    },
    {
        name        : 'Mask with progress',
        type        : 'maskprogress',
        category    : 'Mask',
        description : 'Mask with custom progress bar',
        docsUrl     : 'grid/docs/api/Core/widget/Mask',
        create      : container => {
            container.style.minHeight = '15em';
            const mask = Mask.mask({
                target      : container,
                icon        : 'fa fa-spin fa-gear',
                text        : 'AI is refactoring your app (don\'t worry)',
                progress    : 100,
                maxProgress : 4000
            });

            const timer = setInterval(() => {
                mask.progress += 5;
                if (mask.progress >= mask.maxProgress) {
                    mask.progress = 0; // loop for demo
                }
            }, 100);
        }
    },
    {
        name        : 'ProgressBar',
        type        : 'progressbar',
        category    : 'Display',
        description : 'Progress indicator with label and value',
        docsUrl     : 'grid/docs/api/Core/widget/ProgressBar',
        create      : container => {
            new Button({
                appendTo  : container,
                text      : 'Reload data',
                icon      : 'fa fa-sync',
                style     : 'margin-bottom: 0.5em;',
                rendition : 'tonal',
                maxWidth  : '10em',
                onClick() {
                    const progressBars = bryntum.queryAll('progressbar', container);
                    progressBars[0].value = Math.floor(Math.random() * 12) + 1;
                    progressBars[1].value = Math.random();
                    progressBars[2].value = Math.random();
                }
            });

            new ProgressBar({
                appendTo      : container,
                label         : 'Backend API Development',
                valueRenderer : (value, max) => `${value} / ${max} tasks`,
                value         : 5,
                max           : 12
            });

            new ProgressBar({
                appendTo : container,
                label    : 'Frontend Components',
                value    : 0.8,
                color    : 'b-green'
            });

            new ProgressBar({
                appendTo  : container,
                label     : 'Database Migration',
                valueText : 'Nearly there',
                value     : 3 / 8,
                color     : 'b-orange'
            });
        }
    },
    {
        name        : 'PasswordField',
        type        : 'passwordfield',
        category    : 'Form Inputs',
        description : 'Masked password input',
        docsUrl     : 'grid/docs/api/Core/widget/PasswordField',
        create      : container => {
            new PasswordField({
                appendTo      : container,
                label         : 'Enter Nuclear Launch Code',
                labelPosition : 'above',
                width         : '100%',
                value         : 'THE-GREATEST-CODE-IN-THE-HISTORY-OF-CODES-BIG-LEAGUE-45-47-WINNING',
                triggers      : {
                    reveal : {
                        cls : 'fa fa-eye',
                        handler() {
                            this.input.type = this.input.type === 'text' ? 'password' : 'text';
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'Popup',
        type        : 'popup',
        category    : 'Dialogs & Overlays',
        description : 'Modal and anchored popups',
        docsUrl     : 'grid/docs/api/Core/widget/Popup',
        create      : container => {
            container.style.display = 'flex';

            new Button({
                appendTo : container,
                text     : 'Modal Popup',
                icon     : 'fa fa-window-maximize',
                onClick({ source }) {
                    new Popup({
                        owner       : source,
                        header      : '📝 Modal Popup',
                        autoShow    : true,
                        closeAction : 'destroy',
                        modal       : true,
                        closable    : true,
                        width       : '30em',
                        html        : 'This is a modal popup',
                        bbar        : {
                            items : {
                                close : {
                                    text     : 'Close',
                                    minWidth : 100,
                                    onAction : 'up.close'
                                }
                            }
                        }
                    });
                }
            });

            new Button({
                appendTo : container,
                text     : 'Form Popup',
                icon     : 'fa fa-edit',
                onClick({ source }) {
                    new Popup({
                        owner         : source,
                        title         : 'Edit User Detail',
                        autoShow      : true,
                        closeAction   : 'destroy',
                        modal         : true,
                        closable      : true,
                        maximizable   : true,
                        resizable     : true,
                        width         : '30em',
                        labelPosition : 'above',
                        items         : {
                            firstName : {
                                type        : 'textfield',
                                label       : 'First Name',
                                placeholder : 'Enter first name',
                                value       : 'John'
                            },
                            lastName : {
                                type        : 'textfield',
                                label       : 'Last Name',
                                placeholder : 'Enter last name',
                                value       : 'Doe'
                            },
                            email : {
                                type        : 'textfield',
                                label       : 'Email',
                                placeholder : 'Enter email',
                                value       : 'john.doe@example.com'
                            },
                            checkboxGroup : {
                                type   : 'checkboxgroup',
                                label  : 'This popup is',
                                inline : true,
                                items  : {
                                    draggable   : { text : 'Draggable', checked : true },
                                    resizable   : { text : 'Resizable', checked : true },
                                    maximizable : { text : 'Maximizable', checked : true }
                                },
                                onChange : 'up.onCheckboxGroupChange'
                            }
                        },
                        bbar : {
                            items : {
                                cancel : {
                                    text     : 'Cancel',
                                    minWidth : 100,
                                    onAction : 'up.close'
                                },
                                save : {
                                    text      : 'Save',
                                    minWidth  : 100,
                                    color     : 'b-blue',
                                    rendition : 'filled',
                                    onAction() {
                                        Toast.show('✓ Changes saved!');
                                        this.up('popup').close();
                                    }
                                }
                            }
                        },
                        onCheckboxGroupChange({ source, value }) {
                            const { draggable, resizable, maximizable } = source.widgetMap;
                            this.draggable = draggable.value;
                            this.resizable = resizable.value;
                            this.maximizable = maximizable.value;
                        }
                    });
                }
            });

            new Button({
                appendTo : container,
                text     : 'Form Drawer',
                icon     : 'fa fa-edit',
                onClick({ source }) {
                    const drawer = this.drawer || (this.drawer = new Panel({
                        owner         : source,
                        title         : 'Edit User Detail',
                        width         : '30em',
                        labelPosition : 'above',
                        drawer        : {
                            type : 'overlay',
                            tool : null
                        },
                        items : {
                            firstName : {
                                type        : 'textfield',
                                label       : 'First Name',
                                placeholder : 'Enter first name',
                                value       : 'John'
                            },
                            lastName : {
                                type        : 'textfield',
                                label       : 'Last Name',
                                placeholder : 'Enter last name',
                                value       : 'Doe'
                            },
                            email : {
                                type        : 'textfield',
                                label       : 'Email',
                                placeholder : 'Enter email',
                                value       : 'john.doe@example.com'
                            }
                        }
                    }));
                    drawer.collapsible.toggleReveal(true);
                }
            });
        }
    },
    {
        name        : 'Radio & RadioGroup',
        type        : 'radiogroup',
        category    : 'Form Inputs',
        description : 'Single-choice radio buttons',
        docsUrl     : 'grid/docs/api/Core/widget/RadioGroup',
        create      : container => {
            new RadioGroup({
                appendTo      : container,
                label         : 'Notification Preference',
                labelPosition : 'above',
                width         : '100%',
                items         : {
                    email : { text : 'Email', checked : true },
                    sms   : { text : 'SMS' },
                    push  : { text : 'Smoke signals' },
                    none  : { text : 'None' }
                }
            });
        }
    },
    {
        name        : 'SlideToggle',
        type        : 'slidetoggle',
        category    : 'Form Inputs',
        description : 'Toggle switch',
        docsUrl     : 'grid/docs/api/Core/widget/SlideToggle',
        create      : container => {
            new SlideToggle({
                appendTo : container,
                text     : 'Enable Feature'
            });
            new SlideToggle({
                appendTo : container,
                checked  : true,
                text     : 'Dark Mode',
                color    : 'b-purple'
            });
            new SlideToggle({
                appendTo : container,
                checked  : true,
                text     : 'Auto Save',
                color    : 'b-green'
            });
            new SlideToggle({
                appendTo : container,
                checked  : true,
                disabled : true,
                text     : 'Premium Feature (Locked)'
            });
        }
    },
    {
        name        : 'Slider',
        type        : 'slider',
        category    : 'Form Inputs',
        description : 'Range slider control',
        docsUrl     : 'grid/docs/api/Core/widget/Slider',
        create      : container => {
            new Container({
                appendTo      : container,
                labelPosition : 'align-before',
                height        : '100%',
                items         : {
                    volumeSlider : {
                        type        : 'slider',
                        label       : 'Volume',
                        width       : '100%',
                        showValue   : true,
                        showTooltip : true,
                        unit        : ' dB',
                        min         : 0,
                        max         : 11,
                        value       : 7,
                        color       : 'b-blue'
                    },
                    qualitySlider : {
                        type      : 'slider',
                        label     : 'Code Quality',
                        width     : '100%',
                        showValue : true,
                        min       : 0,
                        max       : 100,
                        value     : 80,
                        color     : 'b-orange'
                    },
                    optimismSlider : {
                        type  : 'slider',
                        label : 'Optimism',
                        width : '100%',
                        min   : 0,
                        max   : 100,
                        value : 15,
                        color : 'b-green'
                    },
                    legacySlider : {
                        type     : 'slider',
                        label    : 'Legacy Code (disabled)',
                        width    : '100%',
                        disabled : true,
                        unit     : '%',
                        min      : 0,
                        max      : 100,
                        value    : 99
                    },
                    budgetSlider : {
                        type        : 'slider',
                        label       : 'Budget',
                        width       : '100%',
                        showValue   : 'thumb',
                        min         : 0,
                        max         : 100,
                        value       : 65,
                        showTooltip : true,
                        step        : 10,
                        showSteps   : true,
                        unit        : ' USD',
                        color       : 'b-red'
                    }
                }
            });
        }
    },
    {
        name        : 'Splitter',
        type        : 'splitter',
        category    : 'Layout',
        description : 'Resizable split panels',
        docsUrl     : 'grid/docs/api/Core/widget/Splitter',
        create      : container => {
            new Container({
                adopt  : container,
                layout : 'hbox',
                items  : {
                    navigationPanel : {
                        type  : 'panel',
                        icon  : 'fa fa-th-list',
                        title : 'Navigation',
                        flex  : 1.5,
                        html  : `
                            <div style="padding: 0.75em 1em; margin-inline-start:-.75em; white-space: nowrap; cursor: pointer; border-radius: 0.25em;" onmouseover="this.style.background='var(--b-neutral-95)'" onmouseout="this.style.background=''"><i class="fa fa-tachometer-alt" style="margin-inline-end: 0.75em;"></i>Dashboard</div>
                            <div style="padding: 0.75em 1em;margin-inline-start:-.75em; white-space: nowrap; cursor: pointer; border-radius: 0.25em;" onmouseover="this.style.background='var(--b-neutral-95)'" onmouseout="this.style.background=''"><i class="fa fa-chart-line" style="margin-inline-end: 0.75em;"></i>Analytics</div>
                            <div style="padding: 0.75em 1em; margin-inline-start:-.75em;white-space: nowrap; cursor: pointer; border-radius: 0.25em;" onmouseover="this.style.background='var(--b-neutral-95)'" onmouseout="this.style.background=''"><i class="fa fa-cog" style="margin-inline-end: 0.75em;"></i>Settings</div>
                            <div style="padding: 0.75em 1em; margin-inline-start:-.75em;white-space: nowrap; cursor: pointer; border-radius: 0.25em;" onmouseover="this.style.background='var(--b-neutral-95)'" onmouseout="this.style.background=''"><i class="fa fa-user" style="margin-inline-end: 0.75em;"></i>Profile</div>
                        `
                    },
                    splitter : {
                        type : 'splitter'
                    },
                    contentPanel : {
                        type  : 'panel',
                        icon  : 'fa fa-file-alt',
                        title : 'Content',
                        flex  : 2,
                        html  : `
                            <h3 style="margin-top: 0;">Welcome</h3>
                            <p>Drag the splitter to resize panels.</p>
                            <p>This demonstrates how content areas can be resized interactively.</p>
                        `
                    }
                }
            });
        }
    },
    {
        name        : 'TabPanel',
        type        : 'tabpanel',
        category    : 'Layout',
        description : 'Tabbed interface container',
        docsUrl     : 'grid/docs/api/Core/widget/TabPanel',
        create      : container => {
            let tabCount = 0;

            const tabPanel = new TabPanel({
                appendTo : container,
                width    : '100%',
                height   : '100%',
                border   : true,
                tabBar   : {
                    items : {
                        spacer    : { type : 'widget', style : 'flex: 1;' },
                        addButton : {
                            type      : 'button',
                            icon      : 'b-icon-add',
                            tooltip   : 'Add tab',
                            rendition : 'text',
                            onClick() {
                                tabCount++;
                                tabPanel.add({
                                    title : `Tab ${tabCount}`,
                                    html  : `<div style="padding: 1em;">Content for Tab ${tabCount}</div>`
                                });
                                tabPanel.activeTab = tabPanel.items.length - 1;
                            }
                        },
                        moreButton : {
                            type      : 'button',
                            icon      : 'b-icon-menu-horizontal',
                            tooltip   : 'More options',
                            rendition : 'text',
                            menuIcon  : false,
                            menu      : {
                                items : {
                                    duplicate : { icon : 'b-icon-copy', text : 'Duplicate tab' },
                                    rename    : { icon : 'b-icon-edit', text : 'Rename tab' },
                                    closeAll  : { icon : 'b-icon-trash', text : 'Close all tabs', cls : 'b-separator' }
                                },
                                onItem({ item }) {
                                    Toast.show(`Clicked: ${item.text}`);
                                }
                            }
                        }
                    }
                },
                items : {
                    overview : {
                        title : 'Overview',
                        tab   : {
                            icon : 'fa fa-home'
                        },
                        html : `<div style="padding: 1em;">
                            <p>Welcome to your dashboard! Here you can view key metrics and statistics.</p>
                            <div style="display: flex; gap: 1em; margin-top: 1em;">
                                <div style="flex: 1; padding: 1em; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5em; color: white;">
                                    <div style="font-size: 2em; font-weight: bold;">1,234</div>
                                    <div>Total Users</div>
                                </div>
                                <div style="flex: 1; padding: 1em; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 0.5em; color: white;">
                                    <div style="font-size: 2em; font-weight: bold;">89%</div>
                                    <div>Success Rate</div>
                                </div>
                            </div>
                        </div>`
                    },
                    settings : {
                        title : 'Settings',
                        icon  : 'fa fa-cog',
                        items : {
                            settingsFieldset : {
                                type  : 'fieldset',
                                items : {
                                    emailNotifications : {
                                        type    : 'slidetoggle',
                                        text    : 'Email Notifications',
                                        checked : true
                                    },
                                    soundEffects : { type : 'slidetoggle', text : 'Sound Effects' },
                                    themeCombo   : {
                                        type  : 'combo',
                                        label : 'Theme',
                                        items : ['Light', 'Dark', 'Auto'],
                                        value : 'Auto'
                                    }
                                }
                            }
                        }
                    },
                    activity : {
                        title : 'Activity',
                        icon  : 'fa fa-chart-line',
                        html  : `
                            <ul class="activity-list">
                                <li><i class="fa fa-check"></i>Project Alpha completed</li>
                                <li><i class="fa fa-check"></i>New task assigned</li>
                                <li><i class="fa fa-check"></i>Team meeting scheduled</li>
                                <li><i class="fa fa-check"></i>3 new messages</li>
                            </ul>
                        `
                    }
                }
            });
        }
    },
    {
        name        : 'TextAreaField',
        type        : 'textareafield',
        category    : 'Form Inputs',
        description : 'Multi-line text input',
        docsUrl     : 'grid/docs/api/Core/widget/TextAreaField',
        create      : container => {
            new TextAreaField({
                appendTo      : container,
                label         : 'Bug Report',
                labelPosition : 'above',
                width         : '100%',
                height        : '100%',
                resize        : 'none',
                value         : 'Steps to reproduce:\n\n1. Write code\n2. Run code\n3. ???\n4. It works in production but not locally',
                placeholder   : 'Describe the issue in detail...'
            });
        }
    },
    {
        name        : 'TextField',
        type        : 'textfield',
        category    : 'Form Inputs',
        description : 'Basic text input field',
        docsUrl     : 'grid/docs/api/Core/widget/TextField',
        create      : container => {
            new TextField({
                appendTo    : container,
                label       : 'Email',
                labelWidth  : '7em',
                width       : '100%',
                placeholder : 'spam@example.com'
            });
            new TextField({
                appendTo    : container,
                label       : 'API Key',
                labelWidth  : '7em',
                rendition   : 'filled',
                width       : '100%',
                value       : 'sk_live_definitely_not_committed_to_git',
                placeholder : 'Paste your secret key here'
            });
            new TextField({
                appendTo      : container,
                label         : 'Username',
                labelWidth    : '7em',
                labelPosition : 'above',
                width         : '100%',
                value         : 'admin',
                placeholder   : 'Surely not admin...'
            });
        }
    },
    {
        name        : 'TimeField',
        type        : 'timefield',
        category    : 'Date & Time',
        description : 'Time selection field',
        docsUrl     : 'grid/docs/api/Core/widget/TimeField',
        create      : container => {
            new TimeField({
                appendTo : container,
                label    : 'Daily Standup',
                width    : '100%',
                value    : '09:00'
            });
        }
    },
    {
        name        : 'Toast',
        type        : 'toast',
        category    : 'Dialogs & Overlays',
        description : 'Temporary notification messages',
        docsUrl     : 'grid/docs/api/Core/widget/Toast',
        create      : container => {
            new Button({
                appendTo  : container,
                text      : 'Simple Toast',
                icon      : 'fa fa-comment',
                rendition : 'outlined',
                onClick() {
                    Toast.show('Simple message');
                }
            });

            new Button({
                appendTo  : container,
                text      : 'With Timeout',
                icon      : 'fa fa-clock',
                rendition : 'outlined',
                onClick() {
                    Toast.show({
                        html    : 'This will close in 10 seconds',
                        timeout : 10000
                    });
                }
            });

            new Button({
                appendTo  : container,
                text      : 'Rich Content',
                icon      : 'fa fa-info-circle',
                color     : 'b-blue',
                rendition : 'tonal',
                onClick() {
                    Toast.show({
                        timeout : 10000,
                        html    : `
                            <div style="display: flex; align-items: center; gap: 1em;">
                                <i class="fa fa-bell" style="font-size: 1.5em;"></i>
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25em;">New Update Available</div>
                                    <div style="font-size: 0.9em; opacity: 0.8;">Version 7.1 is ready to install</div>
                                </div>
                            </div>
                        `,
                        color : 'b-blue'
                    });
                }
            });
        }
    },
    {
        name        : 'Tooltip',
        type        : 'tooltip',
        category    : 'Dialogs & Overlays',
        description : 'Contextual hover information',
        docsUrl     : 'grid/docs/api/Core/widget/Tooltip',
        create      : container => {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '1em';

            // Simple tooltip on button
            new Button({
                appendTo  : container,
                text      : 'Hover for tooltip',
                icon      : 'fa fa-info-circle',
                rendition : 'outlined',
                tooltip   : {
                    hoverDelay : 200,
                    hideDelay  : 200,
                    html       : 'This is a simple tooltip'
                }
            });

            // Rich HTML tooltip with Chart and Tools
            new Button({
                appendTo  : container,
                text      : 'Rich tooltip with chart',
                icon      : 'fa fa-chart-line',
                color     : 'b-blue',
                rendition : 'tonal',
                tooltip   : {
                    cls        : 'rich-tooltip-demo',
                    width      : 440,
                    hoverDelay : 200,
                    hideDelay  : 200,
                    header     : {
                        title : 'Performance Metrics',
                        dock  : 'top'
                    },
                    tools : {
                        info : {
                            cls     : 'fa fa-info-circle',
                            handler : () => Toast.show('📊 Tooltip tool clicked!')
                        },
                        settings : {
                            cls     : 'fa fa-cog',
                            handler : () => Toast.show('⚙️ Settings clicked!')
                        }
                    },
                    layoutStyle : 'display : grid; grid-template-columns : 1fr 1fr;',
                    items       : {
                        metrics : {
                            type : 'container',
                            html : `
                                <div style="padding: 0.75em 1em; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5em; margin-bottom: 0.75em;">
                                    <div style="color: white; opacity: 0.9; font-size: 0.85em; margin-bottom: 0.25em;">Total Revenue</div>
                                    <div style="color: white; font-size: 1.75em; font-weight: bold;">$47,250</div>
                                    <div style="color: white; opacity: 0.8; font-size: 0.85em; margin-top: 0.25em;">
                                        <i class="fa fa-arrow-up"></i> +12.5% this month
                                    </div>
                                </div>
                                <div style="padding: 0.75em 1em; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 0.5em; margin-bottom: 0.75em;">
                                    <div style="color: white; opacity: 0.9; font-size: 0.85em; margin-bottom: 0.25em;">Active Users</div>
                                    <div style="color: white; font-size: 1.75em; font-weight: bold;">12,847</div>
                                    <div style="color: white; opacity: 0.8; font-size: 0.85em; margin-top: 0.25em;">
                                        <i class="fa fa-arrow-up"></i> +8.3% this week
                                    </div>
                                </div>
                            `
                        },
                        chartContainer : {
                            type   : 'container',
                            layout : 'vbox',
                            style  : 'padding: 0 1em 0.75em 1em;gap:0',
                            items  : {
                                chart : {
                                    type         : 'chart',
                                    ref          : 'chart',
                                    width        : 180,
                                    height       : 140,
                                    chartType    : 'line',
                                    labels       : { field : 'day' },
                                    gridColor    : 'transparent',
                                    showAxes     : false,
                                    showLegend   : false,
                                    showControls : false,
                                    pointSize    : 2,
                                    chartPadding : 10,
                                    series       : [{
                                        field     : 'visits',
                                        label     : 'Website Visits',
                                        fill      : true,
                                        fillColor : 'rgba(33, 150, 243, 0.2)'
                                    }],
                                    data : [
                                        { day : 'Mon', visits : 65 },
                                        { day : 'Tue', visits : 72 },
                                        { day : 'Wed', visits : 81 },
                                        { day : 'Thu', visits : 78 },
                                        { day : 'Fri', visits : 95 },
                                        { day : 'Sat', visits : 88 },
                                        { day : 'Sun', visits : 76 }
                                    ]
                                },
                                statsGrid : {
                                    type  : 'container',
                                    style : 'display: grid; grid-template-columns: 1fr 1fr;',
                                    items : {
                                        avgOrder : {
                                            style : 'padding: 0.5em; background: var(--panel-background-color); display: flex; flex-direction: column;',
                                            html  : `
                                                <div style="font-size: 0.75em; opacity: 0.6; margin-bottom: 0.25em; white-space:nowrap">Avg. Order</div>
                                                <div style="font-weight: 600;">$127</div>
                                            `
                                        },
                                        totalOrders : {
                                            style : 'padding: 0.5em; background: var(--panel-background-color); display: flex; flex-direction: column;',
                                            html  : `
                                                <div style="font-size: 0.75em; opacity: 0.6; margin-bottom: 0.25em;">Orders</div>
                                                <div style="font-weight: 600;">372</div>
                                            `
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'TreeCombo',
        type        : 'treecombo',
        category    : 'Form Inputs',
        description : 'Combo with hierarchical tree data',
        docsUrl     : 'grid/docs/api/Grid/widget/TreeCombo',
        bundle      : 'grid',
        create      : (container, { TreeCombo }) => {
            new TreeCombo({
                appendTo : container,
                label    : 'Select Tasks',
                width    : '100%',
                value    : [1, 2],
                picker   : {
                    columns : [
                        { type : 'tree', text : 'Task', field : 'name', flex : 1 },
                        { text : 'Priority', field : 'priority', width : 100 }
                    ]
                },
                store : {
                    data : [
                        {
                            id       : 100,
                            name     : 'Development',
                            expanded : true,
                            children : [
                                { id : 1, name : 'Frontend', priority : 'High' },
                                { id : 2, name : 'Backend', priority : 'Medium' }
                            ]
                        },
                        {
                            id       : 101,
                            name     : 'Design',
                            expanded : true,
                            children : [
                                { id : 3, name : 'UI/UX', priority : 'High' },
                                { id : 4, name : 'Branding', priority : 'Low' }
                            ]
                        }
                    ]
                }
            });
        }
    },
    {
        name        : 'TreeGrid',
        type        : 'treegrid',
        category    : 'Data Display',
        description : 'Hierarchical data grid with tree structure',
        docsUrl     : 'grid/docs/api/Grid/view/TreeGrid',
        bundle      : 'grid',
        colSpan     : 2,
        rowSpan     : 2,
        create      : (container, { TreeGrid }) => {
            new TreeGrid({
                appendTo : container,
                width    : '100%',
                height   : '100%',
                border   : true,
                columns  : [
                    {
                        type       : 'tree',
                        text       : 'Project Structure',
                        field      : 'name',
                        flex       : 2,
                        minWidth   : 300,
                        htmlEncode : false,
                        renderer   : ({ record }) => {
                            const
                                icons = {
                                    project : 'fa fa-folder',
                                    feature : 'fa fa-code-branch',
                                    task    : 'fa fa-tasks',
                                    file    : 'fa fa-file-code'
                                },
                                icon  = icons[record.type] || 'fa fa-file';

                            return `<i class="fa ${icon}" style="margin-inline-end: 0.5em; opacity: 0.6;"></i>${record.name}`;
                        }
                    },
                    {
                        text       : 'Status',
                        field      : 'status',
                        width      : 200,
                        htmlEncode : false,
                        renderer   : ({ value }) => {
                            const
                                badges = {
                                    Done          : { color : '#27ae60', bg : 'rgba(39, 174, 96, 0.1)' },
                                    Active        : { color : '#3498db', bg : 'rgba(52, 152, 219, 0.1)' },
                                    'In Progress' : { color : '#3498db', bg : 'rgba(52, 152, 219, 0.1)' },
                                    Pending       : { color : '#f39c12', bg : 'rgba(243, 156, 18, 0.1)' },
                                    Planning      : { color : '#9b59b6', bg : 'rgba(155, 89, 182, 0.1)' }
                                },
                                badge  = badges[value] || { color : '#95a5a6', bg : 'rgba(149, 165, 166, 0.1)' };

                            return `<span style="display: inline-block; padding: 0.25em 0.75em; border-radius: 1em; font-size: 0.85em; font-weight: 500; color: ${badge.color}; background: ${badge.bg};">${value}</span>`;
                        }
                    },
                    { text : 'Assignee', field : 'assignee', width : 200 }
                ],
                store : {
                    tree : true,
                    data : [
                        {
                            id       : 1,
                            name     : 'Website Redesign',
                            type     : 'project',
                            status   : 'In Progress',
                            assignee : 'Team Alpha',
                            expanded : true,
                            children : [
                                {
                                    id       : 2,
                                    name     : 'Frontend Development',
                                    type     : 'feature',
                                    status   : 'Active',
                                    assignee : 'Lisa',
                                    expanded : true,
                                    children : [
                                        {
                                            id       : 3,
                                            name     : 'Homepage Layout',
                                            type     : 'task',
                                            status   : 'Done',
                                            assignee : 'Lisa'
                                        },
                                        {
                                            id       : 4,
                                            name     : 'Navigation Menu',
                                            type     : 'task',
                                            status   : 'Done',
                                            assignee : 'Mike'
                                        },
                                        {
                                            id       : 5,
                                            name     : 'Footer Component',
                                            type     : 'task',
                                            status   : 'Active',
                                            assignee : 'Kate'
                                        }
                                    ]
                                },
                                {
                                    id       : 6,
                                    name     : 'Backend API',
                                    type     : 'feature',
                                    status   : 'Pending',
                                    assignee : 'Dave',
                                    expanded : false,
                                    children : [
                                        {
                                            id       : 7,
                                            name     : 'User Authentication',
                                            type     : 'task',
                                            status   : 'Pending',
                                            assignee : 'Dave'
                                        },
                                        {
                                            id       : 8,
                                            name     : 'Database Schema',
                                            type     : 'task',
                                            status   : 'Pending',
                                            assignee : 'Emma'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id       : 9,
                            name     : 'Mobile App',
                            type     : 'project',
                            status   : 'Planning',
                            assignee : 'Team Beta',
                            expanded : true,
                            children : [
                                {
                                    id       : 10,
                                    name     : 'iOS Development',
                                    type     : 'feature',
                                    status   : 'Planning',
                                    assignee : 'Mark',
                                    children : [
                                        {
                                            id       : 11,
                                            name     : 'Login Screen',
                                            type     : 'task',
                                            status   : 'Planning',
                                            assignee : 'Mark'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                bbar : {
                    items : {
                        expandAll : {
                            type      : 'button',
                            text      : 'Expand All',
                            icon      : 'fa fa-angle-double-down',
                            rendition : 'outlined',
                            onAction({ source }) {
                                source.up('treegrid').expandAll();
                            }
                        },
                        collapseAll : {
                            type      : 'button',
                            text      : 'Collapse All',
                            icon      : 'fa fa-angle-double-up',
                            rendition : 'outlined',
                            onAction({ source }) {
                                source.up('treegrid').collapseAll();
                            }
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'Toolbar',
        type        : 'toolbar',
        category    : 'Layout',
        description : 'Horizontal toolbar with items',
        docsUrl     : 'grid/docs/api/Core/widget/Toolbar',
        create      : container => {
            new Toolbar({
                appendTo : container,
                width    : '100%',
                items    : {
                    addButton : {
                        type      : 'button',
                        icon      : 'fa fa-plus',
                        text      : 'Add user',
                        rendition : 'tonal',
                        color     : 'b-blue'
                    },
                    messagesButton : {
                        type    : 'button',
                        icon    : 'fa fa-envelope',
                        badge   : '3',
                        tooltip : '3 Unread Messages'
                    },
                    spacer     : '->',
                    menuButton : {
                        type : 'button',
                        text : 'Button with menu',
                        icon : 'fa fa-cog',
                        menu : {
                            items : {
                                settings    : { text : 'Settings' },
                                preferences : { text : 'Preferences' }
                            }
                        }
                    }
                }
            });
        }
    },
    {
        name        : 'YearPicker',
        type        : 'yearpicker',
        category    : 'Pickers',
        description : 'Year selection picker',
        docsUrl     : 'grid/docs/api/Core/widget/YearPicker',
        create      : container => {
            container.classList.add('b-centered');
            new YearPicker({
                appendTo : container,
                width    : '100%',
                maxWidth : '20em'
            });
        }
    }
];

export default components;
