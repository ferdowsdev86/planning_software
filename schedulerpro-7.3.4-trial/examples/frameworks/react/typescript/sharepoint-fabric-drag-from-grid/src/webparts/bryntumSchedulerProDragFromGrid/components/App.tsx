import React, { useEffect } from 'react';
import styles from './App.module.scss';
import { IAppProps } from './IAppProps';
import Toolbar from './Toolbar/Toolbar';
import SchedulerPro from './Scheduler/SchedulerPro';
import { DateHelper } from '@bryntum/core-thin';

/**
 * The WebPart App component. Includes a Toolbar and the Scheduler Component
 *
 * @param props
 * @constructor
 */
const App: React.FC<IAppProps> = props => {

    // Listen for property changes on the listId
    useEffect(() => {
        // Will trigger a loading operation on the provided listId
        props.service.listId = props.listId;
    }, [props.listId]);

    // Listen for a timespan change set in the PropertyPane
    useEffect(() => {
        const
            startDate: Date = props.startDate || new Date(),
            range           = props.range || 1;

        if (startDate instanceof Date) {
            props.service.setTimeSpan(startDate, range);
        }
        else {
            props.service.setTimeSpan(DateHelper.parse(startDate, DateHelper.defaultFormat), range);
        }
    }, [props.startDate, props.range]);

    return (
        <>
            <div className={styles.app}>
                <div className={styles.container}>
                    <Toolbar
                        service={props.service}
                    />
                    <SchedulerPro
                        service={props.service}
                    />
                </div>
            </div>
        </>
    );
};

export default App;
