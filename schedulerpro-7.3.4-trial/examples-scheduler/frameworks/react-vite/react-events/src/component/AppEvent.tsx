import React from 'react';
import { DateHelper as DH } from '@bryntum/schedulerpro';
import { CircularProgressbar } from 'react-circular-progressbar';
import type AppEventModel from '../lib/AppEventModel.ts';

import 'react-circular-progressbar/dist/styles.css';

type AppEventProps = {
    eventRecord : AppEventModel;
}

const AppEvent : React.FunctionComponent<AppEventProps> = props => {

    const { name, percentage, id, startDate, endDate, icon } = props.eventRecord;

    return (
        <>
            <div className="progress">
                <CircularProgressbar
                    value={percentage}
                    text={`${percentage}%`}
                    styles={{
                        path : {
                            stroke : 'var(--b-neutral-100)'
                        },
                        trail : {
                            stroke       : 'var(--b-primary)',
                            mixBlendMode : 'multiply'
                        },
                        text : {
                            fill     : 'var(--b-primary)',
                            fontSize : '1.8em'
                        }
                    }}
                />
            </div>
            <div className="article">
                <div className="title">{name} <span>(#{id})</span></div>
                <div className="dates">{DH.formatRange([startDate as Date, endDate as Date], 'S{HH:mm} - E{HH:mm}')}</div>
            </div>
            <i className={icon}/>
        </>
    );

};

export default AppEvent;
