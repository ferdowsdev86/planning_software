import Model from '../../../lib/Core/data/Model.js';

// The data model for a task address
export default class Address extends Model {
    // The identifier Mapbox uses for its places
    static idField = 'place_id';

    static fields =  [
        'display_name',
        'lat',
        'lon'
    ];
}
