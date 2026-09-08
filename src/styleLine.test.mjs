import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barStyleLine, fmtDateDdMmmYyyy, poDeliveryOf, orderDeliveryOf } from './planningData.js';

test('fmtDateDdMmmYyyy formats DD-MMM-YYYY', () => {
    assert.equal(fmtDateDdMmmYyyy(new Date(2026, 10, 15)), '15-Nov-2026');
    assert.equal(fmtDateDdMmmYyyy(new Date(2026, 0, 3)), '03-Jan-2026');
});

test('fmtDateDdMmmYyyy shows N/A for missing/invalid dates', () => {
    assert.equal(fmtDateDdMmmYyyy(null), 'N/A');
    assert.equal(fmtDateDdMmmYyyy(undefined), 'N/A');
    assert.equal(fmtDateDdMmmYyyy(new Date('bogus')), 'N/A');
});

test('confirm bar: Style : Color : PO delivery', () => {
    const ship = new Date(2026, 10, 20);
    const line = barStyleLine({
        style : 'MSK-1101', color : 'Black', po : 'PO-171234',
        orderType : 'confirm', ship
    });
    assert.equal(line, `MSK-1101 : Black : ${fmtDateDdMmmYyyy(poDeliveryOf(ship))}`);
});

test('projection bar: order-code fallback style, N/A color, order delivery', () => {
    const ship = new Date(2026, 10, 20);
    const line = barStyleLine({
        style : '', mbmOrder : '26WISAN106', po : '',
        orderType : 'projection', ship
    });
    assert.equal(line, `26WISAN106 : N/A : ${fmtDateDdMmmYyyy(orderDeliveryOf(ship))}`);
});

test('missing everything renders N/A, never undefined/null/blank', () => {
    const line = barStyleLine({ orderType : 'projection' });
    assert.equal(line.includes('undefined'), false);
    assert.equal(line.includes('null'), false);
    assert.match(line, /N\/A : N\/A$/);
    assert.equal(barStyleLine(null), 'N/A : N/A : N/A');
});

test('grouped bar: comma-separated colours, earliest PO delivery', () => {
    const line = barStyleLine({
        style : 'MSK-2202', color : 'Black', colors : ['Black', 'Navy', 'Black'],
        po : 'PO-9', orderType : 'confirm',
        ship : new Date(2026, 11, 5),
        poDetails : [
            { po : 'PO-9', ship : new Date(2026, 11, 5) },
            { po : 'PO-10', ship : new Date(2026, 10, 15) } // earliest
        ]
    });
    assert.equal(line, `MSK-2202 : Black, Navy : ${fmtDateDdMmmYyyy(poDeliveryOf(new Date(2026, 10, 15)))}`);
});

test('compact variant drops the date but keeps style and colour', () => {
    const line = barStyleLine({ style : 'MSK-3', color : 'Red', po : 'PO-1', orderType : 'confirm' }, true);
    assert.equal(line, 'MSK-3 : Red');
});
