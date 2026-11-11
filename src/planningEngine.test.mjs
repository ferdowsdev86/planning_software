import test from 'node:test';
import assert from 'node:assert/strict';
import { autoPlanOrders } from './planningEngine.js';

const day = s => new Date(`${s}T00:00:00`);
const ctxBase = {
    isWorking : () => true,
    today : day('2026-11-12'),
    snapStart : d => new Date(d),
    efficiencyOf : () => 60,
    workMinPerDay : 600
};
const lines = () => [
    { id : 'l1', name : 'Line 01', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-12') },   // free now, not listed
    { id : 'l2', name : 'Line 02', manpower : 50, eff : 60, hours : 10, freeFrom : day('2026-11-20') }    // listed for Chino, busy till the 20th
];
const order = { id : 'o1', mbmOrder : 'X1', po : 'P1', buyer : 'B', qty : 1000, smv : 10, pcd : day('2026-10-01'), ship : day('2027-01-15'), productType : 'Pant', profileType : 'Chino' };
const listed = (lineId, product) => lineId === 'l2' && product === 'Chino';

test('profileFirst: the line listed for the product wins even when another line is free earlier', () => {
    const { placements } = autoPlanOrders([order], lines(), { ...ctxBase, lineHasProductType : listed, profileFirst : true });
    assert.equal(placements[0].line.id, 'l2');
});

test('without profileFirst the earliest free line takes the order (profile only breaks ties)', () => {
    const { placements } = autoPlanOrders([order], lines(), { ...ctxBase, lineHasProductType : listed, profileFirst : false });
    assert.equal(placements[0].line.id, 'l1');
});

test('profileFirst: when no line lists the product, the earliest free line takes it', () => {
    const { placements } = autoPlanOrders([{ ...order, profileType : 'Jacket' }], lines(), { ...ctxBase, lineHasProductType : listed, profileFirst : true });
    assert.equal(placements[0].line.id, 'l1');
});
