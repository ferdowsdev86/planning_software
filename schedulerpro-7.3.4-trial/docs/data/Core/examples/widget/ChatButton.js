targetElement.style.height = '40em';

const chatButton = new ChatButton({
    appendTo  : targetElement,
    chatPanel : {
        title         : 'Acme Sales Support',
        showTimestamp : true,
        closable      : true,
        messages      : [
            {
                fromOther : true,
                text      : `Hello, I am a fake chat agent in a docs app. I don't know anything but feel 
        free to ask me anything.`
            }
        ],

        intro : {
            html : `<h4 style="margin:0">We typically reply in a few minutes</h4>
            <br>You can contact our support team if you've checked our docs and still need help.`
        },
        // Avatar image url
        avatar : './data/Core/images/lisa.png'
    }
});
