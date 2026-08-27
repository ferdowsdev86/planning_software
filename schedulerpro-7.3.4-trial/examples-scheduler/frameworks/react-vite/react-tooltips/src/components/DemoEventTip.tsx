import React from 'react';
import type { SchedulerEventModel } from '@bryntum/schedulerpro';

import './DemoEventTip.scss';

interface DemoEventTipProps {
    data: {
        eventRecord: SchedulerEventModel
        startText: string;
        endText: string;
    };
}

const DemoEventTip: React.FC<DemoEventTipProps> = ({ data }) => {
    const
        { eventRecord }               = data,
        { resource : resourceRecord } = eventRecord,
        resourceImg                   = `${resourceRecord.name.toLowerCase()}.png`;

    return (
        <div className="event-tip">
            <header>{eventRecord.name}</header>
            <dl>
                <div>
                    <dt>Assigned to</dt>
                    <dd>
                        <img
                            className="resource-image"
                            src={`./users/${resourceImg}`}
                            alt={`${resourceRecord.name}`}
                        ></img>
                        <div>{resourceRecord.name}</div>
                    </dd>
                </div>
                <div className="times">
                    <dt>Time</dt>
                    <dd>
                        <label>Start : </label>
                        <div>{data.startText}</div>
                        <label>End : </label>
                        <div>{data.endText}</div>
                    </dd>
                </div>
            </dl>
        </div>
    );
};

export default DemoEventTip;
