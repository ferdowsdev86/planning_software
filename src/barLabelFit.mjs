// ---------------------------------------------------------------------------
// BEST-FIT LABEL OF A SMALL BAR (planner, 2026-11-21, 26H1LEV871 — a 2-day
// strip of style 009QW-0004 read "0.." on the board: "the bar is small, the
// style number cannot be seen; if it started at the bar's starting point at
// least 4/5 digits would show — make it the best fit, so that however small
// the strip is, the style / buyer / order number can be told").
//
// A bar too narrow for its one-line text gets the TINY label:
//   · the text starts at the bar's very edge (1 px), no "…" (the two dots
//     cost two characters of a bar that shows five)
//   · the font steps down (10 → 9 → 8 px) until the first line fits; at the
//     smallest size what does not fit is cut at the bar's end
//   · when the bar is tall enough for two lines, a second line names the
//     order beside the style (or the style beside the buyer / product / date
//     the colour mode puts first)
//
// Pure — the board supplies the text width (canvas measure); node-tested.
// ---------------------------------------------------------------------------

// bars at least this wide keep the normal one-line label (with "…")
export const TINY_MAX_WIDTH = 80;

/**
 * @param {object} o
 * @param {string} o.primary     first line (what the colour mode shows first)
 * @param {string} [o.secondary] second line, when two lines fit
 * @param {number} o.width       bar width in px
 * @param {number} o.height      bar height in px
 * @param {(t:string)=>number} [o.measure] width of `t` at a font size of 1 px
 * @param {number} [o.base]      the board's normal label font size (px)
 * @param {number} [o.min]       the smallest font size used (px)
 * @returns {{font:number, lines:string[], fits:boolean}}
 */
export function fitBarLabel({ primary, secondary = '', width, height, measure = t => String(t).length * 0.62, base = 10, min = 8 } = {}) {
    const p = String(primary ?? '').trim();
    const s = String(secondary ?? '').trim();
    // 1 px of air on each side + the bar's own border
    const avail = Math.max(0, (Number(width) || 0) - 4);
    const em = Math.max(0, measure(p));
    let font = min, fits = false;
    for (let f = base; f >= min; f--) {
        if (em * f <= avail) { font = f; fits = true; break; }
    }
    // two lines need the bar's height: 1.1 line height, 1 px above and below
    const twoMax = Math.floor(((Number(height) || 0) - 2) / 2.2);
    const two = !!s && s !== p && twoMax >= min;
    if (two) font = Math.min(font, twoMax);
    return { font, lines : two ? [p, s] : [p], fits };
}

/**
 * The two lines of a tiny label by colour mode: the mode's own text first,
 * then what identifies the strip beside it.
 * @param {string} mode  colour mode ('buyer' | 'product' | 'ptype' | 'delivery' | style/default)
 * @param {{buyer?:string, product?:string, style?:string, order?:string, date?:string}} id
 * @returns {{primary:string, secondary:string}}
 */
export function tinyLabelLines(mode, { buyer = '', product = '', style = '', order = '', date = '' } = {}) {
    const ident = style || order || '';
    switch (mode) {
        case 'buyer'    : return { primary : buyer || ident || 'N/A', secondary : buyer ? ident : '' };
        case 'product'  : return { primary : product || ident || 'N/A', secondary : product ? ident : '' };
        case 'delivery' : return { primary : date || ident || 'N/A', secondary : date ? ident : '' };
        // Plan type and Style modes read the style number, the order under it
        default         : return { primary : ident || buyer || 'N/A', secondary : style && order && order !== style ? order : (ident ? buyer : '') };
    }
}
