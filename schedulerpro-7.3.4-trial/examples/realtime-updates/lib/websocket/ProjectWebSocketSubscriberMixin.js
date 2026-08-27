/**
 * This mixin is used to allow target classes to track login state.
 */
export default Target => class ProjectWebSocketSubscriberMixin extends Target {

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
