import shared from '../_shared/shared.module.js';
import { AjaxHelper, AsyncHelper, StateProvider, Scheduler, Toast } from '../../build/schedulerpro.module.js';
//region "lib/BackendState.js"

/**
 * A simple example of saving a StateProvider's data to a backend.
 */
class BackendState {
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

//endregion

const stateId = 'SchedulerState';

function launch() {

    const scheduler = new Scheduler({
        appendTo         : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom       : true,
        stateId,
        startDate        : new Date(2023, 1, 7, 6),
        endDate          : new Date(2023, 1, 7, 20),
        viewPreset       : 'hourAndDay',
        rowHeight        : 50,
        barMargin        : 5,
        multiEventSelect : true,
        resourceImages   : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        crudManager : {
            autoLoad : true,
            loadUrl  : 'data/data.json'
        },
        columns : [
            {
                id    : 'name',
                type  : 'resourceInfo',
                text  : 'Staff',
                width : 200
            },
            {
                id     : 'role',
                text   : 'Role',
                field  : 'role',
                flex   : 1,
                editor : {
                    type        : 'combo',
                    items       : ['Sales', 'Developer', 'Marketing', 'Product manager', 'CEO', 'CTO'],
                    editable    : false,
                    pickerWidth : 140
                }
            },
            {
                id       : 'eventCount',
                text     : 'Assignments',
                width    : 130,
                editor   : false,
                renderer : ({ record : resource }) => resource.events.length
            }
        ],
        tbar : [
            {
                type  : 'slidetoggle',
                ref   : 'autoSaveCheckbox',
                label : 'Auto save',
                value : true,
                onChange({ checked }) {
                    scheduler.stateId = checked ? stateId : null;
                }
            },
            {
                type    : 'button',
                ref     : 'resetButton',
                color   : 'b-red',
                icon    : 'fa fa-times',
                text    : 'Reset to default',
                tooltip : 'Resets application to the default state',
                onAction() {
                    scheduler.resetDefaultState();

                    Toast.show('Default state restored');
                }
            }
        ]
    });
}

/*
    By default, state is saved locally in localStorage. State can also be saved to
    a backend server, however, there are some caveats to consider when doing so:

    #1 - State must be ready at app launch time

    Stateful widgets consume state data during their construction, which cannot be
    done asynchronously. This can be handled with an AJAX fetch issued before
    widgets are created (as in this example), or by "rendering" the state data on
    the server and returning it as content in the page.

    If the state is loaded asynchronously and applied after widget creation, there
    will be a noticeable flicker as the defaults are replaced with the state values.

    #2 - State is not always the same as settings or preferences

    Users may use an application on different device types (desktop, phone, and
    tablet) and expect their experience on each device to be what they had when
    they last used that device.

    #3 - Undesired state is harder to clear

    Potentially undesired application state will not be cleared by clearing browser
    user data (a common troubleshooting strategy) and will follow the user to other
    browsers as well (another common troubleshooting technique).
 */

if ((new URL(window.location)).searchParams.get('state') === 'remote') {  // if ('?state=remote' in URL)
    // For server-side state, initialize the page widgets after the state is loaded from the server.
    (new BackendState(StateProvider.setup('memory'))).init().then(launch);
}
else {
    // To use localStorage instead of a backend for state, the launch process is simply this:
    StateProvider.setup('local');
    launch();
}
