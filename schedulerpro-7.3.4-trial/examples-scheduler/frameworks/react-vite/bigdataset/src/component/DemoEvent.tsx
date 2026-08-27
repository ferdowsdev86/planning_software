import React from 'react';
import { DateHelper, SchedulerEventModel } from '@bryntum/schedulerpro';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class AppEventModel extends SchedulerEventModel {
    percentage? : number;
}

interface DemoEventProps {
    eventRecord : AppEventModel
}

const DemoEvent = (props : DemoEventProps) => {
    const { name, percentage, id, startDate, endDate } = props.eventRecord;

    return (
        <>
            <div className="progress">
                <CircularProgressbar
                    value={percentage!}
                    text={`${percentage}%`}
                    styles={buildStyles({
                        textSize  : '1.9em',
                        textColor : 'var(--b-primary)',
                        pathColor : 'var(--b-primary)'
                    })}
                />
            </div>
            <div className="article">
                <div className="title">{name} <span>(#{id})</span></div>
                <div className="dates">{DateHelper.formatRange([startDate as Date, endDate as Date], 'S{MMM D} - E{MMM D}')}</div>
            </div>
        </>
    );
};

export default DemoEvent;
