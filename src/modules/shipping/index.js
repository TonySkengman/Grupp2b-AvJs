// Modulens publika ingång som kopplar ihop Parcel och ShippingQuoteService

import Parcel from './Parcel.js';
import ShippingQuoteService from './ShippingQuoteService.js';

export default class ShippingModule {

    // Descriptorn är statisk så den kan läsas utan att modulen instansieras,
    // t.ex. för att rendera formuläret i React
    static descriptor = {
        name: 'Fraktberäknare',
        fields: [
            {
                name: 'destinationZone',
                label: 'Destination',
                type: 'select',
                required: true,
                options: [
                    { value: 'SE', label: 'Sverige' },
                    { value: 'EU', label: 'EU' },
                    { value: 'WORLD', label: 'Övriga världen' }
                ]
            }
        ]
    };

    constructor() {
        // En instans av ShippingQuoteService per modul-instans
        // Cachen bevaras mellan anrop
        this.quoteService = new ShippingQuoteService();
    }

    // values kommer från formuläret, context kommer från React (varukorgen)
    async run(values, context) {
        if (!values || !values.destinationZone) {
            throw new Error('Destination måste anges.');
        }

        const cartLines = context?.cartLines;

        // Stoppar körningen om varukorgen är tom
        if (!Array.isArray(cartLines) || cartLines.length === 0) {
            throw new Error('Varukorgen är tom — det finns inget att beräkna frakt för.');
        }

        // Plockar bara ut det Parcel faktiskt behöver från varje rad
        const items = cartLines.map((line) => ({
            name: line.name,
            weightKg: line.weightKg,
            dimensionsCm: line.dimensionsCm,
            quantity: line.quantity
        }));

        const parcel = new Parcel(items);

        return this.quoteService.getQuotes(parcel, values.destinationZone);
    }
}