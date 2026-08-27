Object.assign(targetElement.style, {
    'flex-direction' : 'column',
    'align-items'    : 'flex-start',
    gap              : '1em'
});

// Custom StarRating widget example
class StarRating extends Widget {
    static $name = 'StarRating';
    static type = 'starrating';

    static configurable = {
        value    : 0,
        maxStars : 5,
        editable : true
    };

    compose() {
        const
            { value, maxStars, editable, size } = this,
            stars                               = [];

        // Generate star elements
        for (let i = 1; i <= maxStars; i++) {
            const filled = i <= value;

            stars.push({
                tag   : 'i',
                class : {
                    fa        : 1,
                    'fa-star' : 1
                },
                style : {
                    cursor  : 'pointer',
                    opacity : filled ? 1 : 0.15,
                    color   : filled ? 'var(--b-color-yellow)' : undefined
                },
                dataset : {
                    starIndex : i
                }
            });
        }

        return {
            class : {
                'star-rating'          : 1,
                'star-rating-editable' : editable
            },
            children : stars
        };
    }

    onPaint({ firstPaint }) {
        if (firstPaint) {
            this.element.addEventListener('click', this.onStarClick.bind(this));
        }
    }

    onStarClick(e) {
        if (this.editable) {
            const starEl = e.target.closest('[data-star-index]');

            if (starEl) {
                const newValue = parseInt(starEl.dataset.starIndex);
                this.value = newValue;
                Toast.show(`Rated ${newValue} stars!`);
            }
        }
    }
}

StarRating.initClass();

// Create instances
new StarRating({
    appendTo : targetElement,
    value    : 1,
    maxStars : 5
});

new StarRating({
    appendTo : targetElement,
    value    : 4,
    maxStars : 5
});

new Label({ text : 'Read-only rating:', appendTo : targetElement });

new StarRating({
    appendTo : targetElement,
    value    : 5,
    maxStars : 5,
    editable : false
});

