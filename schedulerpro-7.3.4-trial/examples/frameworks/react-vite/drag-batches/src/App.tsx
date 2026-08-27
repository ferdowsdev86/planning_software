import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BryntumDemoHeader, BryntumGrid, BryntumGridProps, BryntumSchedulerPro, BryntumSchedulerProProjectModel, BryntumSchedulerProProps, BryntumSplitter } from '@bryntum/schedulerpro-react';
import { ButtonListenersTypes, DateHelper, Grid, GridListenersTypes, SchedulerProListenersTypes, Store } from '@bryntum/schedulerpro';
import { Drag } from './lib/Drag';
import { OrderForm } from './lib/OrderForm';
import { Order } from './lib/Order';
import { gridProps, projectProps, schedulerProProps } from './AppConfig';
import { Task } from './lib/Task';
import './App.scss';

function App() {
    const projectRef      = useRef<BryntumSchedulerProProjectModel>(null);
    const schedulerProRef = useRef<BryntumSchedulerPro>(null);
    const gridRef         = useRef<BryntumGrid>(null);
    const getSchedulerPro = () => schedulerProRef.current?.instance;
    const getGrid         = () => gridRef.current?.instance;

    const onToggleOrderList = () => {
        const grid = getGrid()!;
        return grid!.hidden = !grid!.hidden;
    };

    const onTimeAxisChange = () => {
        const schedulerPro = getSchedulerPro()!;
        return schedulerPro.widgetMap.dateLabel.html = DateHelper.format(schedulerPro!.startDate, 'MMM D YYYY');
    };

    const onEventSelectionChange: SchedulerProListenersTypes['eventSelectionChange'] = ({ selected }) => {
        const task = selected[0] as Task;
        const grid = getGrid()!;
        if (task?.order) {
            grid.selectedRecord = task.order;
        }
    };

    const onGridSelectionChange: GridListenersTypes['selectionChange'] = ({ selected }) => {
        const order        = selected[0] as Order;
        const schedulerPro = getSchedulerPro()!;
        if (order?.firstTask) {
            schedulerPro!.selectEvent(order.firstTask);
        }
        else {
            schedulerPro!.clearEventSelection();
        }
    };

    // Add new order handler
    const onAddClick = useCallback<ButtonListenersTypes['click']>(async({ source }) => {
        const
            grid          = source.up(Grid.type) as Grid,
            templateStore = (grid as any).extraData.project.getCrudStore('templates'),
            form          = new OrderForm({
                templateStore,
                bbar : [
                    {
                        text : 'Cancel',
                        onClick() {
                            form.destroy();
                        }
                    },
                    {
                        text    : 'Create',
                        onClick : () => {
                            const data = form.values;

                            if (form.isValid) {
                                const added = (grid.store as Store).add({
                                    id   : Order.generateNewOrderId(),
                                    name : templateStore.getById(data.type).name,
                                    ...data
                                });

                                grid.scrollRowIntoView(added[0], { highlight : true });

                                form.destroy();
                            }
                        }
                    }
                ]
            });

        await form.showBy({
            target : source,
            anchor : true
        });
    }, []);

    // Runs only once. Dependencies are not going to change
    useEffect(() => {
        const grid         = getGrid()!;
        const schedulerPro = getSchedulerPro()!;

        schedulerPro.project.on({
            refresh : (grid as any).extraData.updateOrderDates,
            thisObj : grid
        });

        // Update the date label in the on app start
        onTimeAxisChange();

        // Setup dragging
        const dragInstance = new Drag({
            grid,
            schedule     : schedulerPro,
            constrain    : false,
            outerElement : grid!.element
        });

        // project is referenced in onAddClick function
        (grid as any).extraData.project = schedulerPro.project;

        // Setup grid's store
        grid.store = schedulerPro.project.getCrudStore('orders');

        return () => {
            dragInstance?.destroy();
        };
    }, []);

    const [appGridProps]         = useState<BryntumGridProps>(gridProps(onAddClick));
    const [appSchedulerProProps] = useState<BryntumSchedulerProProps>(schedulerProProps(
        onToggleOrderList
    ));

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <div id="content" className="demo-app">
                <BryntumSchedulerProProjectModel
                    ref={projectRef}
                    {...projectProps}
                />
                <BryntumSchedulerPro
                    ref={schedulerProRef}
                    {...appSchedulerProProps}
                    project={projectRef}
                    onTimeAxisChange={onTimeAxisChange}
                    onEventSelectionChange={onEventSelectionChange}
                />
                <BryntumSplitter/>
                <BryntumGrid
                    ref={gridRef}
                    {...appGridProps}
                    onSelectionChange={onGridSelectionChange}
                />
            </div>
        </>
    );
}

export default App;
