/**
 * Application
 */
import React, { Fragment, useCallback, useRef } from 'react';

import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumButton
} from '@bryntum/schedulerpro-react';
import { StringHelper, Toast } from '@bryntum/schedulerpro';
import { schedulerProps } from './AppConfig';
import './App.scss';

const App = props => {
    const { encodeHtml } = StringHelper;
    const scheduler = useRef(null);

    const onExportClick = useCallback(() => {
        scheduler.current.instance.features.pdfExport.showExportDialog();
    }, []);

    const eventRenderer = useCallback(({ eventRecord, resourceRecord, renderData }) => {
        const bgColor = encodeHtml(resourceRecord.bg || '');

        renderData.style = `background:${bgColor};border-color:${bgColor};color:${encodeHtml(resourceRecord.textColor)}`;
        renderData.iconCls = `fa fa-${encodeHtml(resourceRecord.icon)}`;

        return encodeHtml(eventRecord.name);
    }, [encodeHtml]);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <div className="demo-toolbar align-right">
                    <BryntumButton
                        text="Export"
                        onClick={onExportClick}
                    />
                </div>
                <BryntumScheduler
                    ref={scheduler}
                    {...schedulerProps}
                    eventRenderer={eventRenderer}
                />
            </div>
        </Fragment>
    );
};

export default App;


Toast.show({
    color : 'b-orange',
    html  : `
    <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
    <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
`,
    timeout : 10000
});
