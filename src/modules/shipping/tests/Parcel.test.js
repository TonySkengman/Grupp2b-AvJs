import Parcel from '../Parcel.js';
import { makeItem } from './testHelpers.js';

async function runTests() {

    try {
        const parcel = new Parcel([
            makeItem({ weightKg: 2, quantity: 3 }),
            makeItem({ weightKg: 1, quantity: 2 })
        ]);

        console.log('Parcel total vikt (förväntat 8):', parcel.totalWeightKg);
        console.log('Parcel total volym (förväntat 5000):', parcel.totalVolumeCm3);
        console.log('Parcel volymvikt vid divisor 1000 (förväntat 5):', parcel.volumetricWeightKg(1000));
        console.log('Parcel effectiveWeightKg (förväntat max(8,5)=8):', parcel.effectiveWeightKg(1000));

    } catch (error) {
        console.error('Test misslyckades (Parcel grundfall):', error.message);
    }

    try {
        new Parcel([]);
    } catch (error) {
        console.log('Feltest tom varukorg:', error.message);
    }

    try {
        new Parcel([makeItem({ weightKg: 0 })]);
    } catch (error) {
        console.log('Feltest ogiltig vikt:', error.message);
    }

    try {
        new Parcel([makeItem({ dimensionsCm: { width: 0, height: 10, depth: 10 } })]);
    } catch (error) {
        console.log('Feltest ogiltiga mått:', error.message);
    }

    try {
        new Parcel([makeItem({ quantity: 1.5 })]);
    } catch (error) {
        console.log('Feltest ogiltigt antal:', error.message);
    }
}

await runTests();