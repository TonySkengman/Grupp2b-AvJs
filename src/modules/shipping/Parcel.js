// Representerar den samlade försändelsen (varukorgen) som en enda paket
// och räkna ut vikt, volym och volymvikt utifrån den

export default class Parcel {

    constructor(items) {
        // Stoppar ifall varukorgen är tom
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Paketet måste innehålla minst en produkt.');
        }

        // Validerar varje rad innan något sparas
        for (const item of items) {
            this.#validateItem(item);
        }

        this.items = items;
    }

    // Kontrollerar att en produkt har allt som behövs för att räkna ut frakt
    #validateItem(item) {
        const label = item?.name ?? 'okänd produkt';

        if (!item || typeof item.weightKg !== 'number' || item.weightKg <= 0) {
            throw new Error(`Ogiltig vikt för produkt: ${label}.`);
        }

        const dims = item.dimensionsCm;

        if (
            !dims ||
            typeof dims.width !== 'number' ||
            typeof dims.height !== 'number' ||
            typeof dims.depth !== 'number' ||
            dims.width <= 0 ||
            dims.height <= 0 ||
            dims.depth <= 0
        ) {
            throw new Error(`Ogiltiga mått för produkt: ${label}.`);
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error(`Ogiltigt antal för produkt: ${label}.`);
        }
    }

    // Summerar vikten för alla produkter i varukorgen
    get totalWeightKg() {
        return this.items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);
    }

    // Summerar volymen (bredd * höjd * djup) för alla produkter i varukorgen
    get totalVolumeCm3() {
        return this.items.reduce((sum, item) => {
            const { width, height, depth } = item.dimensionsCm;
            return sum + width * height * depth * item.quantity;
        }, 0);
    }

    // Räknar ut volymvikt enligt branschstandard: volym delat med en divisor
    // Stora men lätta paket ska kosta mer än den faktiska vikten
    volumetricWeightKg(divisor) {
        if (typeof divisor !== 'number' || divisor <= 0) {
            throw new Error('Ogiltig volymviktsdivisor.');
        }

        return this.totalVolumeCm3 / divisor;
    }

    // Vikten som debiteras är den högsta av verklig vikt och volymvikt
    effectiveWeightKg(divisor) {
        return Math.max(this.totalWeightKg, this.volumetricWeightKg(divisor));
    }
}