import AjaxHelper from '../../../lib/Core/helper/AjaxHelper.js';
import AsyncHelper from '../../../lib/Core/helper/AsyncHelper.js';

/**
 * A simple example of saving a StateProvider's data to a backend.
 */
export default class BackendState {
    constructor(stateProvider) {
        this.stateProvider = stateProvider;
    }

    async init() {
        // Here you would fetch saved state from the server.
        const response = await AjaxHelper.get('data/state.json');

        this.stateProvider.data = await response.json();

        // Start listening for changes after we load up the data:
        this.stateProvider.on({
            save : this.onSave.bind(this)
        });
    }

    onSave() {
        // Grab data to save and call save() if it is not running already. We could
        // use the "stateIds" we receive to deal with only those properties that are
        // changing. See Core.state.StateProvider "save" event for more details.
        this.stateData = this.stateProvider.data;

        if (!this.saving) {
            this.save().catch(err => console.warn('Failed to persist state', err));
        }
    }

    async save() {
        this.saving = true;

        try {
            while (this.stateData) {
                // Grab the changes and save them. Keep doing so until all are saved.
                const data = this.stateData;

                this.stateData = null;

                await this.saveChanges(data);
            }
        }
        finally {
            this.saving = false;
        }
    }

    async saveChanges() {
        // Here you would implement saving "data" to the server
        await AsyncHelper.sleep(250);
    }
}
