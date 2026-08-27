import * as React from 'react';
import Service from '../../data/service/Service';
import { BryntumToolbar } from '@bryntum/core-react-thin';

export interface IToolbarProps {
    service: Service
}

const Toolbar: React.FC<IToolbarProps> = (props) => {

    const service = props.service;

    const items = [
        {
            type  : 'buttonGroup',
            items : [
                {
                    type     : 'button',
                    ref      : 'zoomInButton',
                    icon     : 'fa fa-search-plus',
                    tooltip  : 'Zoom in',
                    onAction : () => service.scheduler.zoomIn()
                },
                {
                    type     : 'button',
                    ref      : 'zoomOutButton',
                    icon     : 'fa fa-search-minus',
                    tooltip  : 'Zoom out',
                    onAction : () => service.scheduler.zoomOut()
                },
                {
                    type     : 'button',
                    ref      : 'zoomToFitButton',
                    icon     : 'fa fa-compress-arrows-alt',
                    tooltip  : 'Zoom to fit',
                    onAction : () => service.scheduler.zoomToFit({
                        leftMargin  : 50,
                        rightMargin : 50
                    })
                }
            ]
        },
        {
            type  : 'buttonGroup',
            items : [
                {
                    type     : 'button',
                    ref      : 'previousButton',
                    icon     : 'fa fa-angle-left',
                    tooltip  : 'Previous time span',
                    onAction : () => service.scheduler.shiftPrevious()
                },
                {
                    type     : 'button',
                    ref      : 'nextButton',
                    icon     : 'fa fa-angle-right',
                    tooltip  : 'Next time span',
                    onAction : () => service.scheduler.shiftNext()
                }
            ]
        }
    ];

    return (
        <BryntumToolbar items={items} />
    );
};

export default Toolbar;
