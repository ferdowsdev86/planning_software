import mapboxgl from 'mapbox-gl';
import { Duration, EventModel } from '@bryntum/schedulerpro';
import Address from './Address';

export default class Task extends EventModel {
    declare address: Address & { display_name?: string };
    declare marker: mapboxgl.Marker;
    declare preamble: Duration;
    declare postamble: Duration;
    declare duration: number;

    static override get fields() {
        return [
            { name : 'address' },
            // in this demo, default duration for tasks will be 1 hour (instead of days)
            { name : 'duration', defaultValue : 1 },
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    get shortAddress() {
        return (this.address?.display_name || '').split(',')[0];
    }
}
