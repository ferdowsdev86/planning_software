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
                    color    : 'b-blue',
                    ref      : 'zoomInButton',
                    icon     : 'fa fa-search-plus',
                    tooltip  : 'Zoom in',
                    onAction : () => service.schedulerPro.zoomIn()
                },
                {
                    type     : 'button',
                    color    : 'b-blue',
                    ref      : 'zoomOutButton',
                    icon     : 'fa fa-search-minus',
                    tooltip  : 'Zoom out',
                    onAction : () => service.schedulerPro.zoomOut()
                },
                {
                    type     : 'button',
                    color    : 'b-blue',
                    ref      : 'zoomToFitButton',
                    icon     : 'fa fa-compress-arrows-alt',
                    tooltip  : 'Zoom to fit',
                    onAction : () => service.schedulerPro.zoomToFit({
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
                    onAction : () => service.schedulerPro.shiftPrevious()
                },
                {
                    type     : 'button',
                    ref      : 'nextButton',
                    icon     : 'fa fa-angle-right',
                    tooltip  : 'Next time span',
                    onAction : () => service.schedulerPro.shiftNext()
                }
            ]
        }
    ];

    return (
        <BryntumToolbar items={items} />
    );
};

export default Toolbar;
