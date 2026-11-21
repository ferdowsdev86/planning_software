import test from 'node:test';
import assert from 'node:assert/strict';
import { fitBarLabel, tinyLabelLines, TINY_MAX_WIDTH } from './barLabelFit.mjs';

// Tahoma bold is about 0.64 em a digit
const measure = t => String(t).length * 0.64;

test('26H1LEV871: a 43-px strip shows the style from its first character, order below', () => {
    const { primary, secondary } = tinyLabelLines('ptype', { buyer : 'LEVI', style : '009QW-0004', order : '26H1LEV871' });
    assert.equal(primary, '009QW-0004');
    assert.equal(secondary, '26H1LEV871');
    const r = fitBarLabel({ primary, secondary, width : 43, height : 24, measure });
    assert.deepEqual(r.lines, ['009QW-0004', '26H1LEV871']);
    assert.equal(r.font, 8);                    // the smallest size: 39 px / (0.64 × 8) = 7 characters and a half
    assert.equal(r.fits, false);
    assert.ok(Math.floor(39 / (0.64 * r.font)) >= 5, 'at least five characters of the style show');
});

test('the font only steps down as far as the first line needs', () => {
    assert.equal(fitBarLabel({ primary : '12345678', width : 60, height : 24, measure }).font, 10);   // 51.2 ≤ 56
    assert.equal(fitBarLabel({ primary : '123456789', width : 60, height : 24, measure }).font, 9);   // 57.6 > 56, 51.8 ≤ 56
    assert.equal(fitBarLabel({ primary : '1234567890', width : 60, height : 24, measure }).font, 8);  // 51.2 ≤ 56
    assert.equal(fitBarLabel({ primary : '1234567890', width : 60, height : 24, measure }).fits, true);
});

test('two lines only when the bar is tall enough; a compressed row keeps one line', () => {
    assert.equal(fitBarLabel({ primary : 'A1', secondary : 'B2', width : 40, height : 24, measure }).lines.length, 2);
    assert.equal(fitBarLabel({ primary : 'A1', secondary : 'B2', width : 40, height : 15, measure }).lines.length, 1);
    // 24 px: two lines of 10 px (22 px + 2) fit
    assert.equal(fitBarLabel({ primary : 'A1', secondary : 'B2', width : 40, height : 24, measure }).font, 10);
    // 20 px: two lines need 8 px
    assert.equal(fitBarLabel({ primary : 'A1', secondary : 'B2', width : 40, height : 20, measure }).font, 8);
});

test('no second line when it would repeat the first or is empty', () => {
    assert.deepEqual(fitBarLabel({ primary : 'X', secondary : 'X', width : 30, height : 24 }).lines, ['X']);
    assert.deepEqual(fitBarLabel({ primary : 'X', secondary : '', width : 30, height : 24 }).lines, ['X']);
});

test('a sliver of a bar still answers (smallest font, nothing negative)', () => {
    const r = fitBarLabel({ primary : '009QW-0004', secondary : '26H1LEV871', width : 3, height : 24, measure });
    assert.equal(r.font, 8);
    assert.equal(r.lines.length, 2);
    assert.deepEqual(fitBarLabel({ primary : '', width : 0, height : 0 }).lines, ['']);
});

test('lines by colour mode: the mode\'s text first, the strip\'s identity beside it', () => {
    const id = { buyer : 'LEVI', product : 'Shirt', style : '009QW-0004', order : '26H1LEV871', date : '24-Dec-26' };
    assert.deepEqual(tinyLabelLines('buyer', id), { primary : 'LEVI', secondary : '009QW-0004' });
    assert.deepEqual(tinyLabelLines('product', id), { primary : 'Shirt', secondary : '009QW-0004' });
    assert.deepEqual(tinyLabelLines('delivery', id), { primary : '24-Dec-26', secondary : '009QW-0004' });
    assert.deepEqual(tinyLabelLines('style', id), { primary : '009QW-0004', secondary : '26H1LEV871' });
    assert.deepEqual(tinyLabelLines('ptype', id), { primary : '009QW-0004', secondary : '26H1LEV871' });
    // a projection without a style: the order number, the buyer below
    assert.deepEqual(tinyLabelLines('ptype', { buyer : 'OVS', order : 'GSL-251203' }), { primary : 'GSL-251203', secondary : 'OVS' });
    // nothing known
    assert.deepEqual(tinyLabelLines('buyer', {}), { primary : 'N/A', secondary : '' });
    assert.ok(TINY_MAX_WIDTH >= 60);
});
