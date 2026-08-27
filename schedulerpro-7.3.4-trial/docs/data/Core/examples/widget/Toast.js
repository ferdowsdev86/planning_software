// button that shows a toast with random text when clicked
new Button({
    appendTo : targetElement,
    text     : 'Show toast',
    onClick  : () => {
        const greetings = ['Hello', 'Hey', 'Hi', 'Greetings', 'Good day'];
        Toast.show(greetings[Math.floor(Math.random() * 5)]);
    }
});
