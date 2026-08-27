import StringHelper from '../../../../lib/Core/helper/StringHelper.js';
import Container from '../../../../lib/Core/widget/Container.js';
import Toast from '../../../../lib/Core/widget/Toast.js';
import ProjectWebSocketSubscriberMixin from '../websocket/ProjectWebSocketSubscriberMixin.js';
import DataGenerator from '../../../../lib/Core/helper/util/DataGenerator.js';

/**
 * This widget listens to websocket messages and shows user login
 */
export default class LoginWidget extends ProjectWebSocketSubscriberMixin(Container) {
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
