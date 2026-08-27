import React, { useEffect } from 'react';
import { Scheduler } from '@bryntum/schedulerpro';
import { schedulerProps } from '../components/schedulerConfig.js';

const Content = props => {

    useEffect(() => {
        new Scheduler({
            ...schedulerProps,
            appendTo : 'content'
        });
    }, []);

    return (
        <div id='content' className="demo-app"></div>
    );

};

export default Content;
