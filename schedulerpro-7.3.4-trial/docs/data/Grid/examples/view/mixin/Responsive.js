targetElement.innerHTML = `
<p>Drag the slider to resize it and see GridResponsive in action. <br>Current level: <span id="responsive-level"></span></p>
<div id="responsive-container" style="position: relative"></div>`;
targetElement.style.justifyContent = 'flex-start';
targetElement = targetElement.querySelector('#responsive-container');
//START
// grid with cell editing
const grid = new Grid({
    appendTo   : targetElement,
    width      : 600,
    // makes grid as high as it needs to be to fit rows
    autoHeight : true,

    data : DataGenerator.generateData(5),

    responsiveLevels : {
        small : {
            // Width is required
            levelWidth : 400,
            // Other configs are optional, see GridState for available options
            rowHeight  : 30
        },
        medium : {
            levelWidth : 600,
            rowHeight  : 40
        },
        large : {
            levelWidth : '*', // everything above 300
            rowHeight  : 45
        }
    },

    columns : [
        {
            field : 'name',
            text  : 'Name',
            flex  : 1
        },
        {
            field : 'team',
            text  : 'Team',
            flex  : 1
        },
        {
            field            : 'score',
            text             : 'Score',
            responsiveLevels : {
                '*'    : { flex : 1, hidden : false },
                medium : { flex : 0.5, hidden : false },
                small  : { hidden : true }
            }
        },
        {
            field            : 'rank',
            text             : 'Rank',
            flex             : 1,
            responsiveLevels : {
                '*'    : { flex : 1, hidden : false },
                medium : { flex : 0.5, hidden : false },
                small  : { hidden : true }
            }
        }
    ]
});
//END

const slider = new Slider({
    insertFirst : targetElement,
    min         : 200,
    max         : 700,
    value       : 600,
    width       : 200,
    showValue   : false,
    style       : 'margin-bottom: 1em',
    onInput() {
        grid.element.style.width = this.value + 'px';
    }
});

function updateCurrentLevel() {
    const el = document.getElementById('responsive-level');
    if (el) {
        el.innerHTML = `<b>${grid.responsiveLevel}</b>`;
    }
}

updateCurrentLevel();

grid.on({
    responsive : () => updateCurrentLevel()
});
