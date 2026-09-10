export default class ShippingQuoteService {
    #carrierCache = null; // privat tillstånd — cachade Carrier-instanser

    async #fetchCarriers() {
        // async metod utöver run: fetch("/api/carriers"), bygger Carrier-instanser
        // väljer strategi utifrån config.pricingModel ("weight"→WeightBasedPricing osv)
        // sparar i this.#carrierCache
    }

    async getQuotes(parcel, zoneKey) {
        // om cache saknas: await this.#fetchCarriers()
        // mappar this.#carrierCache -> carrier.quote(parcel, zoneKey)
        // sorterar stigande på pris, returnerar listan
    }
}