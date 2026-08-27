import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react-thin';
import React from 'react';
import { ISchedulerProProps } from './ISchedulerProProps';

import { schedulerProProps } from './SchedulerProProps';

/* FontAwesome is not built-in, but used for icons */
import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
import '@bryntum/core-thin/fontawesome/css/solid.css';
/* The structural CSS for the Bryntum Scheduler*/
import '@bryntum/core-thin/core.css';
import '@bryntum/grid-thin/grid.css';
import '@bryntum/scheduler-thin/scheduler.css';
import '@bryntum/schedulerpro-thin/schedulerpro.css';
/* Theme to use */
import '@bryntum/core-thin/svalbard-light.css';

/**
 * SchedulerPro React component.
 *
 * This component renders the Bryntum SchedulerPro widget.
 */
export default class SchedulerPro extends React.Component<ISchedulerProProps> {

    constructor(props: Readonly<ISchedulerProProps>) {
        super(props);
        // Add a reference to the schedulerPro engine in the service
        props.service.schedulerProRef = React.createRef();
    }

    public render(): React.ReactNode {
        return <BryntumSchedulerPro
            ref={this.props.service.schedulerProRef}

            project={this.props.service.getTaskListModel()}

            {...schedulerProProps}
        />;
    }

    public shouldComponentUpdate(): boolean {
        // This component should never update
        return false;
    }
}
