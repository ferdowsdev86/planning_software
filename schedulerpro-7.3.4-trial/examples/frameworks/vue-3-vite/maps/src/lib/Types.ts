import { EventStore, type PanelConfig, type PanelListeners, ResourceModel, TimeAxis } from '@bryntum/schedulerpro';

import Task from './Task';

// MapPanel types
export interface MarkerConfig {
    color: string
}

export interface PopupConfig {
    offset: [number, number]
}

// Bryntum types
type constructParamsListeners = PanelListeners & { markerclick: (params: { eventRecord: Task }) => void };

export type constructParams = PanelConfig & {
    appendTo: string
    eventStore: EventStore
    flex: number
    listeners: constructParamsListeners
    ref: string
    timeAxis: TimeAxis
}

export type composeBodyParams = {
    listeners: {
        click: 'onMapClick'
        delegate: '.mapboxgl-marker'
    }
}

// Extend Bryntum types
export type DragDropContext = {
    // Base DragHelper context properties
    element: HTMLElement;
    target: HTMLElement;
    grabbed: HTMLElement;
    relatedElements: HTMLElement[];
    valid: boolean;
    newX: number;
    newY: number;

    // Custom properties
    task: Task;
    totalDuration: number;
    resourceRecord?: ResourceModel;
    startDate?: Date;
}
