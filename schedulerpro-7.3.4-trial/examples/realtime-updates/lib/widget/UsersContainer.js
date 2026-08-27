import Container from '../../../../lib/Core/widget/Container.js';
import Toast from '../../../../lib/Core/widget/Toast.js';
import StringHelper from '../../../../lib/Core/helper/StringHelper.js';
import DataGenerator from '../../../../lib/Core/helper/util/DataGenerator.js';
import ProjectWebSocketSubscriberMixin from '../websocket/ProjectWebSocketSubscriberMixin.js';

/**
 * This widget is listening to the `users` command on a project instance and renders list of connected users
 */
export default class UsersContainer extends ProjectWebSocketSubscriberMixin(Container) {
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
