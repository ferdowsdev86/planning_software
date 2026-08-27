import shared from '../_shared/shared.module.js';
import { EventModel, Base, Toast, BrowserHelper, Events, ProjectModel, StringHelper, Container, DataGenerator, AssignmentModel, SchedulerPro } from '../../build/schedulerpro.module.js';
//region "lib/model/Event.js"

class Event extends EventModel {
    static $name = 'Event';

    static fields = [
        // Time zone information should be used carefully with real time demo and clients in different time zones. It
        // may lead to events moving back and forth indefinitely while clients in different time zones recalculate start
        { name : 'startDate', format : 'YYYY-MM-DDTHH:mm:ss' },
        { name : 'endDate', format : 'YYYY-MM-DDTHH:mm:ss' },
        { name : 'constraintDate', format : 'YYYY-MM-DDTHH:mm:ss' },
        { name : 'parentIndex', persist : true },
        { name : 'orderedParentIndex', persist : true }
    ];

    // This demo works with the same server as the Gantt demo, we need to disable incompatible config
    static usesDelayFromParent = false;
}

//endregion

//region "lib/websocket/ProjectWebSocketHandlerMixin.js"

/**
 * This mixin allows project to communicate changes over websocket connection to stay in sync with other clients. By
 * default, project will automatically sync changes, to temporarily suspend autoSync call {@link Scheduler.crud.AbstractCrudManager#function-suspendAutoSync}
 * and to resume {@link Scheduler.crud.AbstractCrudManager#function-resumeAutoSync}. These methods use counter, meaning for every suspendAutoSync call
 * there should be resumeAutoSync.
 */
const ProjectWebSocketHandlerMixin = Target => class extends (Target || Base) {
    messages = [];

    static configurable = {
        /**
         * Address of the websocket server. If configured websocket will be opened during
         * instantiation.
         * @config {String}
         */
        wsAddress : null,

        /**
         * Username config for websocket connection
         * @config {String}
         */
        wsUserName : '',

        /**
         * Set to `false` to not request dataset automatically
         * @config {Boolean}
         * @category Websocket
         * @default
         */
        wsAutoLoad : true,

        /**
         * Websocket connection timeout
         * @config {Number}
         * @category Websocket
         * @default
         */
        wsConnectionTimeout : 60000,

        /**
         * ID of the project to use for load/sync requests. When changed project will load the dataset if
         * {@link #config-wsAutoLoad} is true. Otherwise, you need to call {@link #function-wsLoad} manually.
         * @config {String|Number}
         * @category Websocket
         * @default
         */
        wsProjectId : null
    };

    doDestroy() {
        this.websocketManager?.destroy();

        super.doDestroy();
    }

    //#region Config handlers

    updateWsAddress(address) {
        const me = this;

        me.websocketManager?.destroy();

        me.detachListeners('websocket-listeners');

        if (address) {
            me.websocketManager = new WebSocketManager({
                address,
                userName          : me.wsUserName,
                internalListeners : {
                    message : 'handleWebsocketMessage',
                    close   : 'handleWebsocketClose',
                    error   : 'handleWebsocketError',
                    thisObj : me
                }
            });

            if (me.wsAutoLoad) {
                me.wsLoad().then();
            }

            me.ion({
                name                 : 'websocket-listeners',
                revisionNotification : 'handleRevisionNotification'
            });
        }
    }

    updateWsProjectId(value) {
        if (value != null && this.wsAutoLoad) {
            this.wsLoad().then();
        }
    }

    //#endregion

    /**
     * Sends message over configured websocket connection. Requires {@link #config-wsAddress} to be configured.
     * @param {String} command
     * @param {Object} [data] Data object to send to the websocket
     * @param {Boolean} silent Pass true to not trigger {@link #event-wsSendMessage} event
     * @returns {Promise} Returns true if message was sent
     */
    async wsSend(command, data, silent = false) {
        const me = this;

        if (await me.wsOpen()) {
            if (command === 'project_change') {
                data.client = me.clientId;
            }

            if (me.LOGMESSAGES) {
                me.messages.push({ type : 'send', command, data });
            }

            me.websocketManager.send(command, data);

            /**
             * Fires after project has sent a message over websocket connection
             * @event wsSendMessage
             * @param {Object} data Data object with mandatory `command` key and arbitrary data keys.
             * @param {String} data.command Mandatory command to send
             * @category Websocket
             */
            if (!silent) {
                me.trigger('wsSendMessage', { command, data });
            }
            return true;
        }

        return false;
    }

    /**
     * Template function which might be implemented to process messages from the websocket server
     * @param {Object} data Data object with mandatory `command` key and arbitrary data keys.
     * @param {String} data.command Mandatory command to send
     */
    wsReceive(data) {
    }

    handleWebsocketClose() {
        /**
         * Fires when websocket connection is closed
         * @event wsClose
         * @category Websocket
         */
        this.trigger('wsClose');
    }

    handleWebsocketError({ error }) {
        /**
         * Fires when websocket manager throws error onn connection or trying to process the response
         * @event wsError
         * @param {Error} error Error event
         * @category Websocket
         */
        this.trigger('wsError', { error });
    }

    async handleWebsocketMessage({ data }) {
        const
            me              = this,
            { wsProjectId } = me,
            {
                command,
                data : payload
            }               = data;

        let project;

        if (me.LOGMESSAGES) {
            me.messages.push({ type : 'receive', ...data });
        }

        /**
         * Fires when project receives message from the websocket server
         * @event wsMessage
         * @param {Object} data Data object with mandatory `command` key and arbitrary data keys.
         * @param {String} data.command Mandatory command to send
         * @category Websocket
         */
        me.trigger('wsMessage', { data });

        if (command === 'error' || 'error' in data) {
            Toast.show(data.error || data.message);

            return;
        }

        if (command !== 'error') {
            project = payload.project;
        }

        if (project === wsProjectId && command === 'project_change') {

            /**
             * Fires before project has applied project changes from the websocket server
             * @event wsBeforeReceiveChanges
             * @category Websocket
             */
            me.trigger('wsBeforeReceiveChanges');

            await me.applyRevisions(payload.revisions.map(r => ({
                revisionId            : r.revision,
                localRevisionId       : r.localRevision,
                conflictResolutionFor : r.conflictResolutionFor,
                clientId              : r.client,
                changes               : r.changes
            })));

            /**
             * Fires after project has applied project changes from the websocket server
             * @event wsReceiveChanges
             * @category Websocket
             */
            me.trigger('wsReceiveChanges');
        }
        else if (project === wsProjectId && command === 'dataset') {
            await me.queue(async() => {
                me.stm.disable();

                me.stm.resetQueue();

                // Silence deprecations until web socket server has been updated
                me.dataPropertyDeprecationShown = true;

                await me.loadInlineData(payload.dataset);

                me.stm.enable();

                me.initRevisions(me.clientId, 'base');
            });

            /**
             * Fires after project has applied dataset from the websocket server
             * @event wsReceiveDataset
             * @category Websocket
             */
            me.trigger('wsReceiveDataset');
        }
        else if (project === wsProjectId && command === 'versionAutoSaveOK') {
            /**
             * Fires when client receives permission to proceed with a version auto-save.
             * @event versionAutoSaveOK
             */
            me.trigger('wsVersionAutoSaveOK');
        }
        else if (project === wsProjectId && command === 'loadVersionContent') {
            /**
             * Fires when client receives version content.
             * @event loadVersionContent
             */
            const { versionId, content } = payload;
            me.trigger('loadVersionContent', { versionId, project, content });
        }
        else {
            me.wsReceive(data);
        }
    }

    /**
     * Open websocket connection
     * @returns {Promise}
     */
    async wsOpen() {
        const { websocketManager } = this;

        if (websocketManager) {
            const trigger = !websocketManager.isOpened && await websocketManager.open();

            if (trigger) {
                /**
                 * Fires when websocket is opened
                 * @event wsOpen
                 * @category Websocket
                 */
                this.trigger('wsOpen');
            }

            return websocketManager.isOpened;
        }

        return false;
    }

    /**
     * Loads data to the project and calculates it:
     *
     * ```javascript
     * await project.wsLoad();
     * ```
     *
     * @category Websocket
     */
    async wsLoad() {
        const me = this;

        if (me.wsProjectId == null) {
            return;
        }

        // Send request for dataset
        await me.wsSend('dataset', { project : me.wsProjectId });

        // Await for `wsReceiveDataset` event. When such event arrives `inlineData` is set and project committed
        await new Promise(resolve => {
            const detacher = me.ion({
                wsReceiveDataset() {
                    detacher();
                    resolve(true);
                },
                expires : {
                    delay : me.wsConnectionTimeout,
                    alt   : () => {
                        detacher();
                        resolve(false);
                    }
                }
            });
        });

        await me.commitAsync();

        /**
         * Fires when dataset is loaded
         * @event wsLoad
         * @category Websocket
         */
        me.trigger('wsLoad');
    }

    async handleRevisionNotification({ localRevisionId, conflictResolutionFor, clientId, changes, revisionType }) {
        const
            me              = this,
            { wsProjectId } = me;

        if (wsProjectId == null) {
            return;
        }

        const revision = { revision : localRevisionId, clientId, changes, revisionType };

        if (conflictResolutionFor) {
            revision.conflictResolutionFor = conflictResolutionFor;
        }

        if (me.isAutoSyncSuspended) {
            this._queuedRevisions = (this._queuedRevisions || []);

            this._queuedRevisions.push(revision);

            this.trigger('revisionQueued', { length : this._queuedRevisions.length });
        }
        else {
            const revisions = [];

            if (me._queuedRevisions?.length) {
                revisions.push(...me._queuedRevisions);

                delete me._queuedRevisions;
            }

            revisions.push(revision);

            await me.sendRevisions(revisions);
        }
    }

    async sendRevisions(revisions) {
        const
            me = this,
            trigger = await me.wsSend('project_change', {
                project : me.wsProjectId,
                revisions
            });

        if (trigger) {
            /**
             * Fires after project has sent changes over websocket connection
             * @event wsSendChanges
             * @category Websocket
             */
            me.trigger('wsSendChanges');
        }
    }

    /**
     * Closes websocket connection
     */
    wsClose() {
        this.websocketManager?.close();
    }

    resumeAutoSync() {
        const me = this;

        super.resumeAutoSync();

        if (!me.isAutoSyncSuspended && me._queuedRevisions?.length) {
            const revisions = me._queuedRevisions;

            delete me._queuedRevisions;

            me.sendRevisions(revisions).then();

            me.trigger('revisionQueueClear');
        }
    }
};

//endregion

//region "lib/websocket/ProjectWebSocketSubscriberMixin.js"

/**
 * This mixin is used to allow target classes to track login state.
 */
const ProjectWebSocketSubscriberMixin = Target => class extends Target {

    static $name = 'ProjectWebSocketSubscriberMixin';

    static configurable = {
        loggedIn : false,
        project  : null
    };

    updateProject(project) {
        // detach old listeners
        this.detachListeners('projectListeners');

        // attach listeners to the new project
        project.on({
            name      : 'projectListeners',
            wsMessage : this.handleWebSocketMessage,
            wsClose   : this.handleWebSocketClose,
            thisObj   : this
        });
    }

    handleWebSocketMessage({ data }) {
        const { command, error } = data;

        if (command === 'login' && !this.loggedIn && !error) {
            this.handleLogin();
        }
        // Username is only missing in case current client is logged out
        else if (command === 'logout' && !data.data.userName && this.loggedIn) {
            this.handleLogout();
        }
    }

    handleWebSocketClose() {
        this.handleLogout();
    }

    handleLogin() {
        this.loggedIn = true;
        this.trigger('login');
    }

    handleLogout() {
        this.loggedIn = false;
        this.trigger('logout');
    }
};

//endregion

//region "lib/websocket/WebSocketHelper.js"

/**
 * This class is required for the demo to extend interaction with websocket server. By default, project will handle the
 * data, but we also need to show list of users and handle login/logout. Therefore, we connect project from here and
 * start listening to project events to handle messages from the server.
 * For more information about the demo please refer to the guide:
 * https://bryntum.com/products/gantt/docs/guide/Gantt/integration/websockets
 */
class WebSocketHelper {
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

//endregion

//region "lib/websocket/WebSocketManager.js"

/**
 * This class allows to send and receive messages from websocket server passing responses via events. This helper is
 * meant to be used with a demo websocket server. It sends messages that are JSON strings including "command" key and
 * arbitrary data keys. For example:
 *
 * ```javascript
 * // request string to notify other clients that new client is connected
 * "{ \"command\": \"hello\", \"userName\": \"new user\" }"
 *
 * // response message from the websocket server with list of connected users
 * "{ \"command\": \"users\", \"users\": [\"new user\"] }"
 * ```
 *
 * Usage:
 * ```javascript
 * connector = new WebSocketManager({
 *     address     : 'ws://localhost:8080',
 *     userName    : 'Test client',
 *     autoConnect : false
 * });
 *
 * const opened = await connector.open();
 *
 * if (!opened) {
 *     console.log('Could not open connection');
 * }
 *
 * connector.on({
 *     message({ data }) {
 *         console.log(data);
 *     }
 * });
 *
 * // Sends "{ \"command\": \"hello\", \"userName\": \"mark\" }" string to the websocket server
 * // When response arrives helper will log following message: "{ command: 'users', users: ['mark'] }"
 * connector.send('hello', { userName : 'mark' });
 * ```
 */
class WebSocketManager extends Events(Base) {
    // This allows to hook into for testing purposes
    static webSocketImplementation = typeof WebSocket === 'undefined' ? null : WebSocket;

    static configurable = {
        /**
         * WebSocket server address
         * @config {String}
         */
        address : '',

        /**
         * Username allowing to identify client
         * @config {String}
         */
        userName : 'User',

        /**
         * Connect to websocket server immediately after instantiation
         * @config {Boolean}
         */
        autoConnect : true
    };

    construct(config = {}) {
        const me = this;

        super.construct(config);

        me.onWsOpen = me.onWsOpen.bind(me);
        me.onWsClose = me.onWsClose.bind(me);
        me.onWsMessage = me.onWsMessage.bind(me);
        me.onWsError = me.onWsError.bind(me);

        if (me.autoConnect && me.address) {
            me.open();
        }
    }

    doDestroy() {
        const me = this;

        if (me.connector) {
            me.detachSocketListeners(me.connector);
            me.connector.close();
            me.connector = null;
        }
        super.doDestroy();
    }

    //#region Websocket state

    get isConnecting() {
        return this.connector?.readyState === this.constructor.webSocketImplementation.CONNECTING;
    }

    get isOpened() {
        return this.connector?.readyState === this.constructor.webSocketImplementation.OPEN;
    }

    get isClosing() {
        return this.connector?.readyState === this.constructor.webSocketImplementation.CLOSING;
    }

    get isClosed() {
        return this.connector?.readyState === this.constructor.webSocketImplementation.CLOSED;
    }

    //#endregion

    //#region Websocket init

    createWebSocketConnector() {
        const connector = this.connector = new this.constructor.webSocketImplementation(this.address);

        this.attachSocketListeners(connector);
    }

    destroyWebSocketConnector() {
        this.detachSocketListeners(this.connector);

        this.connector.close();

        this.connector = null;
    }

    attachSocketListeners(connector) {
        const me = this;

        connector.addEventListener('open', me.onWsOpen);
        connector.addEventListener('close', me.onWsClose);
        connector.addEventListener('message', me.onWsMessage);
        connector.addEventListener('error', me.onWsError);
    }

    detachSocketListeners(connector) {
        const me = this;

        connector.removeEventListener('open', me.onWsOpen);
        connector.removeEventListener('close', me.onWsClose);
        connector.removeEventListener('message', me.onWsMessage);
        connector.removeEventListener('error', me.onWsError);
    }

    //#endregion

    //#region Websocket methods

    /**
     * Connect to the server and start listening for messages
     * @returns {Promise} Returns true if connection was successful and false otherwise
     */
    async open() {
        const me = this;

        if (me._openPromise) {
            return me._openPromise;
        }

        if (!me.address) {
            console.warn('Server me.address cannot be empty');
            return;
        }

        if (me.isOpened) {
            return true;
        }

        me.createWebSocketConnector();

        let detacher;

        // Wait for `open` or `close` event
        me._openPromise = new Promise(resolve => {
            detacher = me.ion({
                open() {
                    resolve(true);
                },
                error() {
                    resolve(false);
                }
            });
        }).then(value => {
            // Detach listeners
            detacher();

            // Cleanup the promise
            me._openPromise = null;

            // If quit early with a timeout then remove reference to the WebSocket instance
            if (!value) {
                me.destroyWebSocketConnector();
            }

            return value;
        }).catch(() => {
            me._openPromise = null;
            me.destroyWebSocketConnector();
        });

        return me._openPromise;
    }

    /**
     * Close socket and disconnect from the server
     */
    close() {
        if (this.connector) {
            this.destroyWebSocketConnector();
            this.trigger('close');
        }
    }

    /**
     * Send data to the websocket server
     * @param {String} command
     * @param {*} data
     */
    send(command, data = {}) {
        this.connector?.send(JSON.stringify({ command, data }));
    }

    //#endregion

    //#region websocket event listeners

    onWsOpen(event) {
        this.trigger('open', { event });
    }

    onWsClose(event) {
        this.trigger('close', { event });
    }

    onWsMessage(message) {
        try {
            const data = JSON.parse(message.data);
            this.trigger('message', { data });
        }
        catch (error) {
            this.trigger('error', { error });
        }
    }

    onWsError(error) {
        this.trigger('error', { error });
    }

    //#endregion
}

//endregion

//region "lib/websocket/WebSocketProjectModel.js"

class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebsocketProjectModel';
}

//endregion

//region "lib/widget/LoginWidget.js"

/**
 * This widget listens to websocket messages and shows user login
 */
class LoginWidget extends ProjectWebSocketSubscriberMixin(Container) {
    static $name = 'LoginWidget';

    static type = 'loginwidget';

    static configurable = {
        host : '',

        layout : 'hbox',

        layoutStyle : {
            flexFlow   : 'row',
            alignItems : 'center'
        },

        items : {
            loginLabel : {
                type   : 'widget',
                hidden : true
            },
            userName : {
                type     : 'textfield',
                label    : 'Username',
                flex     : 1,
                minWidth : '20em'
            },
            serverAddress : {
                type     : 'textfield',
                label    : 'Server address',
                flex     : 1,
                minWidth : '25em'
            },
            loginButton : {
                type      : 'button',
                cls       : 'b-skip-test',
                text      : 'Log in',
                color     : 'b-blue',
                rendition : 'filled',
                onClick   : 'up.login'
            },
            logoutButton : {
                type    : 'button',
                text    : 'Log out',
                hidden  : true,
                onClick : 'up.logout'
            }
        }
    };

    //#region Config handlers

    // Handle project update

    updateHost(value) {
        this.widgetMap.serverAddress.value = value;

        this.widgetMap.userName.value = DataGenerator.generateName();
    }

    updateLoggedIn(value) {
        const { loginLabel, loginButton, logoutButton, userName, serverAddress } = this.widgetMap;

        [userName, serverAddress, loginButton].forEach(cmp => cmp.hidden = value);

        [loginLabel, logoutButton].forEach(cmp => cmp.hidden = !value);

        loginLabel.html = StringHelper.xss`${value ? `Logged in as ${userName.value}` : ''}`;
    }

    //#endregion

    handleWebSocketMessage(event) {
        const { command, data, error } = event.data;

        super.handleWebSocketMessage(event);

        if (command === 'login') {
            if (error) {
                Toast.show(error);
            }
            else if ('client' in data) {
                this.project.clientId = data.client;
                this.loggedIn = data.userName;
            }
        }
    }

    async login() {
        const { serverAddress, userName } = this.values;

        this.project.wsAddress = serverAddress;

        this.userName = userName;

        // Send command on behalf of the project to log in to the server
        await this.project.wsSend('login', { login : userName, password : '' });
        await this.project.wsSend('projects');
        this.project.wsProjectId = 1;
    }

    logout() {
        this.project.wsSend('logout');
        this.project.wsProjectId = null;
    }
}

LoginWidget.initClass();

//endregion

//region "lib/widget/UsersContainer.js"

/**
 * This widget is listening to the `users` command on a project instance and renders list of connected users
 */
class UsersContainer extends ProjectWebSocketSubscriberMixin(Container) {
    static $name = 'UsersContainer';

    static type = 'userscontainer';

    static configurable = {
        layout : 'hbox',
        users  : []
    };

    updateUsers(users, previousUsers) {
        const
            newUsers = users.filter(user => previousUsers ? !previousUsers.includes(user) : true),
            goneUsers = previousUsers ? previousUsers.filter(user => !users.includes(user)) : [];

        if (newUsers.length) {
            Toast.show(`${newUsers.join()} just connected`);
        }

        if (goneUsers.length) {
            Toast.show(`${goneUsers.join()} just disconnected`);
        }
    }

    handleWebSocketMessage({ data }) {
        const { command } = data;

        if (command === 'users') {
            this.removeAll();

            const { users } = data.data;

            this.users = users;

            for (const user of users) {
                // https://github.com/bryntum/support/issues/9592
                if (!user) continue;

                const name = user.split(' ')[0];

                let imageUrl;

                if (!DataGenerator.namesWithAvatars.includes(name)) {
                    imageUrl = '../_shared/images/transparent-users/none.png';
                }
                else {
                    imageUrl = `../_shared/images/transparent-users/${name.toLowerCase()}.png`;
                }

                this.add({
                    type : 'widget',
                    cls  : 'ws-online-user',
                    html : StringHelper.xss`<img class="b-resource-avatar" src="${imageUrl}"><label>${name}</label>`
                });
            }
        }
        else if (command === 'logout' && !data.userName) {
            this.removeAll();
        }
    }

    handleWebSocketClose() {
        this.removeAll();
    }
}

UsersContainer.initClass();

//endregion

//region "lib/model/Assignment.js"

class Assignment extends AssignmentModel {
    static $name = 'Assignment';

    static fields = [
        // In Gantt both event and eventId are persistable. In SchedulerPro only eventId is persistable. To be
        // compatible with Gantt we need to send both eventId and event. Same goes for resource.
        { name : 'event', persist : true },
        { name : 'eventId', persist : true },
        { name : 'resource', persist : true },
        { name : 'resourceId', persist : true }
    ];
}

//endregion

const
    demoServer = /bryntum.com/.test(window.location.hostname) ? 'wss://dev.bryntum.com:8090/' : undefined,
    protocol   = window.location.protocol === 'https' ? 'wss' : 'ws',
    host       = demoServer ?? BrowserHelper.searchParam('wsHost', `${protocol}://${window.location.hostname}:8080`),
    autoLogin  = BrowserHelper.searchParam('(thumbs|auto|screenshot)');

function createProject(id) {
    return new WebSocketProjectModel({
        autoSetConstraints   : true,
        wsAutoLoad           : true,
        assignmentModelClass : Assignment,
        eventModelClass      : Event,
        eventStore           : {
            id : 'tasks'
        },
        stm : {
            revisionsEnabled : true
        }
    });
}

function createSchedulerPro(id) {
    const project = createProject(id);

    // For this demo we create a regular Gantt component with some additional UI components to manage the websocket
    // connection. WebSocketHelper actually configures project to connect to the server.
    // For more information about the demo please refer to the guide:
    // https://bryntum.com/products/gantt/docs/guide/Gantt/integration/websockets
    const schedulerPro = new SchedulerPro({
        appendTo   : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom : true,

        enableTransactionalFeatures : true,

        id,
        project,

        features : {
            // EventSegments feature is not yet supported with revisions
            eventSegments : false
        },

        columns : [
            { text : 'Name', field : 'name', width : 250 }
        ],

        tbar : {
            items : {
                undoRedo : {
                    type   : 'undoredo',
                    hidden : true,
                    items  : {
                        transactionsCombo : null
                    }
                },
                loginWidget : {
                    type      : 'loginwidget',
                    host,
                    project,
                    listeners : {
                        login() {
                            const { widgetMap } = schedulerPro.tbar;

                            widgetMap.undoRedo.hidden = false;
                            widgetMap.reset.hidden = false;
                            widgetMap.autoSync.hidden = false;
                            widgetMap.triggerSync.hidden = widgetMap.autoSync.value;
                        },
                        logout() {
                            const { widgetMap } = schedulerPro.tbar;

                            widgetMap.undoRedo.hidden = true;
                            widgetMap.reset.hidden = true;
                            widgetMap.autoSync.hidden = true;
                            widgetMap.triggerSync.hidden = true;
                        }
                    }
                },
                reset : {
                    type   : 'button',
                    text   : 'Reset',
                    hidden : true,
                    onClick() {
                        if (schedulerPro.project.wsProjectId) {
                            schedulerPro.project.wsSend('reset', { project : schedulerPro.project.wsProjectId });
                        }
                    }
                },
                autoSync : {
                    type   : 'slidetoggle',
                    text   : 'Auto-sync',
                    hidden : true,
                    value  : true,
                    onChange({ checked }) {
                        schedulerPro.project[checked ? 'resumeAutoSync' : 'suspendAutoSync']();
                        schedulerPro.tbar.widgetMap.triggerSync.hidden = checked;
                    }
                },
                triggerSync : {
                    type   : 'button',
                    text   : 'Sync',
                    hidden : true,
                    onClick() {
                        // To sync revisions once, we resume the autosync which would take care of queued
                        // revisions, required events and other logic, and then we suspend sync again
                        schedulerPro.project.resumeAutoSync();
                        schedulerPro.project.suspendAutoSync();
                    }
                }
            }
        },

        bbar : {
            items : {
                wsPanel : {
                    type  : 'container',
                    cls   : 'ws-online',
                    items : {
                        onlineUsers : {
                            type  : 'container',
                            cls   : 'ws-online-users',
                            items : {
                                label : {
                                    type : 'widget',
                                    html : '<label>Who is online:</label>'
                                },
                                usersContainer : {
                                    type : 'userscontainer',
                                    project
                                }
                            }
                        }
                    }
                }
            }
        },

        listeners : {
            async paint() {
                if (autoLogin) {
                    const { project } = this;

                    project.wsAddress = host;
                    await project.wsSend('login', { login : DataGenerator.generateName(), password : '' });
                    await project.wsSend('projects');
                    project.wsProjectId = 1;
                }
            }
        }
    });

    schedulerPro.project.on({
        wsReceiveDataset() {
            schedulerPro.widgetMap.reset.hidden = false;
        },
        revisionQueued({ length }) {
            schedulerPro.tbar.widgetMap.triggerSync.badge = length;
        },
        revisionQueueClear() {
            schedulerPro.tbar.widgetMap.triggerSync.badge = null;
        }
    });

    schedulerPro.webSocketHelper = new WebSocketHelper(schedulerPro, host);
}

createSchedulerPro('scheduler1');

createSchedulerPro('scheduler2');
