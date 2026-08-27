import React from 'react';
import { ISchedulerProProps } from './ISchedulerProps';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react-thin';

import { schedulerProProps } from './SchedulerProConfig';
import { BryntumSplitter } from '@bryntum/core-react-thin';
import { UnplannedGrid } from '../UnplannedGrid/UnplannedGrid';

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

import styles from '../App.module.scss';

/**
 * SchedulerPro React component.
 *
 * This component renders the Bryntum Scheduler and Grid widget.
 */
export default class SchedulerPro extends React.Component<ISchedulerProProps> {

    constructor(props: Readonly<ISchedulerProProps>) {
        super(props);
        // Add a reference to the scheduler engine in the service
        props.service.schedulerProRef = React.createRef();
        props.service.gridRef         = React.createRef();
    }

    public render(): React.ReactNode {
        return (
            <div className={styles.content}>
                <BryntumSchedulerPro
                    ref={this.props.service.schedulerProRef}
                    project={this.props.service.getTaskListModel()}
                    {...schedulerProProps}
                />
                <BryntumSplitter />
                <UnplannedGrid gridRef={this.props.service.gridRef} schedulerProRef={this.props.service.schedulerProRef} />
            </div>
        );
    }

    public shouldComponentUpdate(): boolean {
        // This component should never update
        return false;
    }
}
