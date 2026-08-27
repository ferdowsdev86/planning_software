import BrowserHelper from '../../../../lib/Core/helper/BrowserHelper.js';
import Toast from '../../../../lib/Core/widget/Toast.js';

/**
 * This class is required for the demo to extend interaction with websocket server. By default, project will handle the
 * data, but we also need to show list of users and handle login/logout. Therefore, we connect project from here and
 * start listening to project events to handle messages from the server.
 * For more information about the demo please refer to the guide:
 * https://bryntum.com/products/gantt/docs/guide/Gantt/integration/websockets
 */
export default class WebSocketHelper {
    //region Constructor

    /**
     * Constructs WebSocketHelper class for the Gantt instance
     * @param client
     * @param host
     */
    constructor(client, host) {
        const
            me        = this,
            autoLogin = BrowserHelper.searchParam('auto');

        me.client = client;

        me.project = client.project;

        me.setConnectedState(false);

        if (autoLogin) {
            client.project.wsAddress = host;
            client.project.wsSend('login', { login : 'auto' }).then(() => client.project.wsProjectId = 1);
        }
    }

    //endregion

    get project() {
        return this._project;
    }

    set project(project) {
        const me = this;

        me._project = project;

        project.on({
            wsError() {
                me.client.maskBody('Error connecting to server');
            },
            wsMessage({ data }) {
                me.wsReceive(data);
            },
            wsOpen() {
                me.setConnectedState(true);
            },
            wsClose() {
                me.setConnectedState(false);
            }
        });

        return project;
    }

    //region WebSocket methods

    /**
     * Processes received data
     * @data {Object} data JSON data object
     */
    wsReceive(data) {
        const
            me       = this,
            userName = data?.data?.userName;

        switch (data.command) {
            case 'login':
                if (data.error) {
                    Toast.show(`Error: ${data.error}`);
                }
                break;
            case 'reset':
                Toast.show(`${userName} reset the data`);
                break;
            case 'error':
                Toast.show(data.error);
                break;
            default:
                break;
        }
    }

    //endregion

    /**
     * Sets visual state for login / logout controls
     * @param {Boolean} connected Connected status
     */
    setConnectedState(connected) {
        const { client } = this;

        if (connected) {
            client.unmask();
        }
        else {
            client.maskBody('<div style="text-align: center">OFFLINE</div>');
        }
    }

    //endregion
}
