const names = ['Arnold', 'Dave', 'Emilia', 'Gloria', 'Rob'];

// Generate some avatars
names.forEach(name => DomHelper.createElement({
    parent : targetElement,
    tag    : 'img',
    class  : 'avatar',
    style  : {
        width           : '5em',
        'border-radius' : '50%'
    },
    dataset : {
        name
    },
    src : `data/Grid/images/transparent-users/${name.toLowerCase()}.png`
}));

new Tooltip({
    forSelector : 'img.avatar',
    rootElement : document.body,
    getHtml     : ({ source : tip, activeTarget }) => {
        return activeTarget.dataset.name;
    }
});
