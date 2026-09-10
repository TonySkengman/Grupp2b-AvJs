import Parcel from "./Parcel.js";
import ShippingQuoteService from "./ShippingQuoteService.js";

export default class ShippingModule {
    static descriptor = {
        name: "Fraktberäknare",
        fields: [
            {
                name: "destinationZone",
                label: "Destination",
                type: "select",
                required: true,
                options: ["SE", "EU", "WORLD"]
            }
        ]
    };

    constructor() {
        this.quoteService = new ShippingQuoteService(); // instansieras en gång, bär cachen
    }

    async run(values, context) {
        // values.destinationZone kommer från formuläret
        // context.cartLines (eller liknande) kommer från React — produkterna i varukorgen
        // bygg en Parcel från context, validera indata, kasta Error vid t.ex. tom varukorg
        // returnera await this.quoteService.getQuotes(parcel, values.destinationZone)
    }
}