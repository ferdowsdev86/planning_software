import { BryntumScheduler } from '@bryntum/schedulerpro-react-thin';
import React from 'react';
import { ISchedulerProps } from './ISchedulerProps';

import { schedulerProps } from './SchedulerConfig';

/* FontAwesome is not built-in, but used for icons */
import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
import '@bryntum/core-thin/fontawesome/css/solid.css';
/* The structural CSS for the Bryntum Scheduler*/
import '@bryntum/core-thin/core.css';
import '@bryntum/grid-thin/grid.css';
import '@bryntum/schedulerpro-thin/schedulerpro.css';
/* Theme to use */
import '@bryntum/core-thin/svalbard-light.css';

/**
 * Scheduler React component.
 *
 * This component renders the Bryntum Scheduler widget.
 */
export default class Scheduler extends React.Component<ISchedulerProps> {

    constructor(props: Readonly<ISchedulerProps>) {
        super(props);
        // Add a reference to the scheduler engine in the service
        props.service.schedulerRef = React.createRef();
    }

    public render(): React.ReactNode {
        return <BryntumScheduler
            ref={this.props.service.schedulerRef}

            crudManager={this.props.service.getTaskListModel()}

            {...schedulerProps}
        />;
    }

    public shouldComponentUpdate(): boolean {
        // This component should never update
        return false;
    }
}
