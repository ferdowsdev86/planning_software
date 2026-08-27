import { Model } from '@bryntum/schedulerpro';

// The data model for a task address
export default class Address extends Model {
    declare place_id: string;
    declare display_name: string;
    declare lat: number;
    declare lon: number;

    static override idField = 'place_id'; // The identifier Mapbox uses for its places

    static override get fields() {
        return [
            'place_id',
            'display_name',
            'lat',
            'lon'
        ];
    }
}
