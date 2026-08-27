//<code-header>
CSSHelper.insertRule('.b-panel { --b-panel-header-background : var(--b-primary-40); --b-toolbar-background : transparent; }', targetElement);
CSSHelper.insertRule('.user-panel header { height:6em; }', targetElement);
CSSHelper.insertRule('.user-panel header.b-panel-header, .user-panel .b-panel-header .b-header-title { overflow:visible; }', targetElement);
CSSHelper.insertRule('.user-panel .b-panel-content { padding-top:0; }', targetElement);
CSSHelper.insertRule('.user-panel .b-has-label .b-label { font-weight:600; }', targetElement);
CSSHelper.insertRule(`.verified-badge { 
    position:         absolute;
    font-weight:      400;
    top:              7.5em;
    inset-inline-end: .25em;
    color:            rgb(255, 255, 255);
    background:       rgb(34, 150, 243);
    border-radius:    50%;
    display:          flex;
    align-items:      center;
    justify-content:  center;
    width:            1.25em;
    height:           1.25em;
}`, targetElement);
CSSHelper.insertRule(`.avatar { 
   margin-inline-start: 1em;
   border-radius: 50%;
   width: 6em;
   outline: 3px solid var(--b-panel-background);
   position: relative;
   top: 3em;
   background-color : var(--b-primary-90);
}`, targetElement);
//</code-header>
const userPanel = new Panel({
    appendTo : targetElement,
    // Panel CSS class applied to the panel element
    cls      : 'user-panel',
    // Optional: set a width or layout if needed
    width    : 600,

    header : {
        height : '5em',
        title  : `<div style="display: inline-flex; position: relative;">
                     <img src="data/Grid/images/transparent-users/emilia.png" alt="Emilia" class="avatar"/>
                     <span data-btip="Verified user" class="verified-badge">✓</span>
                  </div>`
    },
    // A top toolbar with quick actions (Copy link, View profile)
    tbar : [
        '->',
        {
            type     : 'button',
            text     : 'Copy link',
            cls      : 'b-transparent',
            icon     : 'fa fa-link',
            onAction : () => {
                // Handler for copying the user’s profile link to clipboard
                Toast.show('Copy link clicked');
            }
        },
        {
            type     : 'button',
            text     : 'View profile',
            cls      : 'b-transparent',
            icon     : 'fa fa-user',
            onAction : () => {
                // Handler for viewing user profile
                Toast.show('View profile clicked');
            }
        }
    ],

    items : {
        // Container for the form fields (name, email, username)
        userForm : {
            type          : 'container',
            labelPosition : 'align-before',
            cls           : 'user-form-container',
            items         : {
                header : {
                    type  : 'widget',
                    style : 'flex-direction: column; grid-column : span 4',
                    html  : `
                        <h2 style="margin-bottom:0;">Emilia Baker</h2>
                        <div style="color: #777;font-size:.9em">Regional Sales</div>
                    `
                },
                firstName : {
                    type  : 'text',
                    label : 'First name',
                    name  : 'firstName',
                    value : 'Emilia'
                },
                lastName : {
                    type  : 'text',
                    label : 'Last name',
                    name  : 'lastName',
                    value : 'Baker'
                },
                email : {
                    type  : 'text',
                    label : 'Email address',
                    name  : 'email',
                    value : 'emilia@bigcorp.com',
                    span  : 3
                },
                username : {
                    type  : 'text',
                    label : 'Username',
                    name  : 'username',
                    value : 'emilia.baker',
                    span  : 3
                }
            }
        }
    },

    // Bottom toolbar with Delete, Cancel, and Save
    bbar : {
        items : {
            deleteUser : {
                type  : 'button',
                text  : 'Delete user',
                cls   : 'delete-user-btn',
                color : 'b-red',
                style : 'margin-inline-end: auto;', // push to the left
                onAction() {
                    // Handler for deleting the user
                    Toast.show('Delete user clicked');
                }
            },
            cancel : {
                type : 'button',
                text : 'Cancel',
                onAction() {
                    // Cancel changes
                    Toast.show('Cancel clicked');
                }
            },
            save : {
                type      : 'button',
                rendition : 'filled',
                text      : 'Save changes',
                onAction() {
                    // Save form changes
                    const htmlFormatted = Object.entries(userPanel.values)
                        .map(([key, value]) => `<b>${key}:</b> ${value}<br>`)
                        .join('');
                    Toast.show(`Save changes clicked<br>${htmlFormatted}`);
                }
            }
        }
    }
});
