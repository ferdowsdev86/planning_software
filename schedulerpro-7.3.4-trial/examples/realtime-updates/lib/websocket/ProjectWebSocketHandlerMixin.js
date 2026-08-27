import Base from '../../../../lib/Core/Base.js';
import WebSocketManager from './WebSocketManager.js';
import Toast from '../../../../lib/Core/widget/Toast.js';

/**
 * This mixin allows project to communicate changes over websocket connection to stay in sync with other clients. By
 * default, project will automatically sync changes, to temporarily suspend autoSync call {@link Scheduler.crud.AbstractCrudManager#function-suspendAutoSync}
 * and to resume {@link Scheduler.crud.AbstractCrudManager#function-resumeAutoSync}. These methods use counter, meaning for every suspendAutoSync call
 * there should be resumeAutoSync.
 */
export default Target => class ProjectWebSocketHandlerMixin extends (Target || Base) {
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
