/**
 * Contains scheduler and equipment grid
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { BryntumScheduler, BryntumSplitter, BryntumButton } from '@bryntum/schedulerpro-react';
import { scheduler1Props, scheduler2Props } from '../AppConfig';

const Content = props => {
    const scheduler1Ref = useRef();
    const scheduler2Ref = useRef();

    const onZoom = useCallback(({ source }) => {
        const { action } = source.dataset;
        scheduler1Ref.current.instance[action]();
    }, []);

    useEffect(() => {
        scheduler2Ref.current.instance.addPartner(scheduler1Ref.current.instance);
    }, []);

    return (
        <div id="content" className="demo-app">
            <div className="demo-toolbar align-right">
                <BryntumButton
                    dataset={{ action : 'zoomIn' }}
                    icon="b-icon-search-plus"
                    tooltip="Zoom in"
                    onClick={onZoom}
                />
                <BryntumButton
                    dataset={{ action : 'zoomOut' }}
                    icon="b-icon-search-minus"
                    tooltip="Zoom out"
                    onClick={onZoom}
                />
            </div>
            <BryntumScheduler
                ref={scheduler1Ref}
                {...scheduler1Props}
            />
            <BryntumSplitter/>
            <BryntumScheduler
                ref={scheduler2Ref}
                {...scheduler2Props}
            />
        </div>
    );
};

export default Content;
