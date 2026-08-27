import { SchedulerResourceModel } from '@bryntum/schedulerpro-thin';

export default class MyResourceModel extends SchedulerResourceModel {

    public static idField = 'Id';

    static get fields() {
        return [
            { name : 'name', dataSource : 'Title' },
            { name : 'email', dataSource : 'Email' }
        ];
    }

    // Get SharePoint user photo
    T;    //@ts-ignore
    get imageUrl() {
        //@ts-ignore
        return `${document.location.origin}/_layouts/15/userphoto.aspx?size=S&username=${this.UserPrincipalName}`;
    }
}
