class Link extends Widget {
    static configurable = {
        external : null,
        href     : null,
        target   : '_blank',
        text     : null
    };

    compose() {
        const { external, href, target, text } = this;

        return {
            children : {
                linkElement : {
                    tag : 'a',
                    href,
                    text
                },

                externalLinkElement : external && {
                    tag   : 'a',
                    class : {
                        fa                     : 1,
                        'fa-external-link-alt' : 1
                    },
                    href,
                    target
                }
            }
        };
    }
}

class CopyableLink extends Link {
    static configurable = {
        copyIcon : 'fa-copy'
    };

    compose() {
        const { copyIcon } = this;

        return {
            style : {
                display       : 'flex',
                gap           : '.5em',
                'align-items' : 'center'
            },
            children : {
                // Insert copyIconElement before inherited externalLinkElement:
                'copyIconElement > externalLinkElement' : {
                    tag   : 'span',
                    style : { cursor : 'pointer' },
                    class : {
                        fa         : 1,
                        [copyIcon] : 1
                    },
                    listeners : {
                        click : 'onCopyLink'
                    }
                }
            }
        };
    }

    onCopyLink(event) {
        navigator.clipboard?.writeText(this.linkElement.href);
        Toast.show('Link copied to clipboard!');
    }
}

const link = new CopyableLink({
    appendTo : targetElement,
    text     : 'Copyable link',
    href     : 'https://bryntum.com'
});
