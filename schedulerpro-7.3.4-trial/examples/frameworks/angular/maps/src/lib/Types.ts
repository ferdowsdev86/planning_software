import { EventStore, PanelConfig, PanelListeners, ResourceModel, TimeAxis } from '@bryntum/schedulerpro';

import Task from './Task';

// MapPanel types
export interface MarkerConfig {
    color: string
}

export interface PopupConfig {
    offset: [number, number]
}

export interface MapboxGL {
    Map: any
    marker: any
    Popup: any
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

declare global {
    interface mapboxgl extends MapboxGL {}

    const mapboxgl: {
        accessToken: string
        Map: mapboxgl['Map']
        Marker: mapboxgl['marker']
        Popup: mapboxgl['Popup']
    };
}

// Extend Bryntum types
declare module '@bryntum/schedulerpro' {
    interface Panel {
        composeBody(): composeBodyParams

        initClass(): void

        onResize: () => void
        contentElement: HTMLElement
        isDestroying: boolean
        type: string
        $name: string
    }
}

export type DragDropContext = {
    // Base DragHelper context properties
    element: HTMLElement
    target: HTMLElement
    grabbed: HTMLElement
    relatedElements: HTMLElement[]
    valid: boolean
    newX: number
    newY: number

    // Custom properties
    task: Task
    totalDuration: number
    resourceRecord?: ResourceModel
    startDate?: Date
}
