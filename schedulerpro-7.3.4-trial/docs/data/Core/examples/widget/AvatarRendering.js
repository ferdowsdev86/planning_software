//<code-header>
CSSHelper.insertRule('.b-resource-wrap { margin-inline-end:1em; transition: margin-inline-end .5s; }', targetElement.getRootNode());
CSSHelper.insertRule('.b-resource-avatar { height: 3.5em;width:3.5em}', targetElement.getRootNode());
CSSHelper.insertRule('.overlap .b-resource-wrap { margin-inline-end : -2em; }', targetElement.getRootNode());
targetElement.innerHTML = '<div id="avatars" class="centeredColumn" style="display:flex;flex-direction:row;width:100%"></div>';
//</code-header>
new SlideToggle({
    insertFirst : targetElement,
    label       : 'Overlap',
    onChange({ value }) {
        targetElement.classList.toggle('overlap', value);
    }
});

const avatarRendering = new AvatarRendering({
    element : targetElement,
    tooltip : {
        onBeforeShow() {
            const
                target = this.triggeredByEvent.target.closest('.b-resource-info'),
                index  = Array.from(target.parentElement.children).indexOf(target);

            this.html = names[index];
        }
    }
});

class Resource extends Model {
    static fields = [
        'name',
        'imageUrl'
    ];

    get initials() {
        return this.name?.split(' ').map(part => part[0]).join('') || '';
    }
}

// Last person has no image so the initials are used
const names = ['Arnold', 'Dave', 'Emilia', 'Gloria', 'Rob', 'Andrew Bird'];

// Generate one avatar per person
names.forEach(name => DomHelper.createElement({
    parent   : 'avatars',
    class    : 'b-resource-wrap',
    children : [
        avatarRendering.getResourceAvatar(new Resource({
            name,
            imageUrl : name.includes('Andrew') ? null : `data/Grid/images/transparent-users/${name.toLowerCase()}.png`
        })
        )
    ]
})
);
