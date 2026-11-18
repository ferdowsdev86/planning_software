// Where the bar tooltip opens (planner, 2026-11-18: "the tooltip shows to the
// RIGHT of the bar, or to its LEFT, or BELOW it — never above").
//
// All figures are viewport pixels:
//   bar   { x, y, right, bottom } — the VISIBLE part of the hovered bar
//   card  { w, h }                — the tooltip card as rendered
//   view  { w, h }                — the window
//   mouse { x, y } | null         — the pointer (a long bar: the card follows it)
//
// Order of choice — the first zone the WHOLE card fits in:
//   1. right of the bar   2. left of the bar   3. below the bar
// Beside the bar the card's top stands on the bar's top line and slides up only
// as far as the window's lower edge asks for; below, it is centred on the pointer.
// No zone has room (a bar as wide as the board, low on the screen): the card
// goes beside the POINTER — right, else left — at the same height rule. It
// then covers a part of the bar, but it never goes above it.
export function placeBarTip({ bar, card, view, mouse = null, gap = 6, pad = 8, cursorGap = 16 }) {
    const W = Math.max(0, Math.min(card.w, view.w - 2 * pad));
    const H = Math.max(0, Math.min(card.h, view.h - 2 * pad));
    const clampX = x => Math.max(pad, Math.min(x, view.w - pad - W));
    const clampY = y => Math.max(pad, Math.min(y, view.h - pad - H));
    const sideY  = clampY(bar.y);

    if (bar.right + gap + W <= view.w - pad) return { zone : 'right', x : bar.right + gap, y : sideY };
    if (bar.x - gap - W >= pad)              return { zone : 'left', x : bar.x - gap - W, y : sideY };

    const mx = Number.isFinite(mouse?.x) ? Math.max(bar.x, Math.min(mouse.x, bar.right)) : (bar.x + bar.right) / 2;
    if (bar.bottom + gap + H <= view.h - pad) return { zone : 'below', x : clampX(mx - W / 2), y : bar.bottom + gap };

    if (mx + cursorGap + W <= view.w - pad) return { zone : 'cursor-right', x : mx + cursorGap, y : sideY };
    if (mx - cursorGap - W >= pad)          return { zone : 'cursor-left', x : mx - cursorGap - W, y : sideY };
    // a window too narrow for the card beside the pointer: the wider side
    return view.w - mx >= mx
        ? { zone : 'cursor-right', x : clampX(mx + cursorGap), y : sideY }
        : { zone : 'cursor-left', x : clampX(mx - cursorGap - W), y : sideY };
}
