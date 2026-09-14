// Hämtar transportörer från /api/carriers
// Cachar dem som färdiga Carrier-instanser
// Producerar en sorterad offertlista för ett paket och en destination

import Carrier from './Carrier.js';
import { WeightBasedPricing, ZoneBasedPricing, VolumetricPricing } from './PricingStrategies.js';

// Kopplar samman API:ts pricingModel-fält med rätt strategiklass
const STRATEGY_FACTORY = {
    weight: () => new WeightBasedPricing(),
    zone: () => new ZoneBasedPricing(),
    volumetric: () => new VolumetricPricing()
};

export default class ShippingQuoteService {

    // Cache för transportörer så API:t inte behöver anropas varje gång
    #carrierCache = null;

    // Hämtar transportörer från API:t och bygger Carrier-instanser med rätt prisstrategi
    async #fetchCarriers() {
        let response;

        try {
            response = await fetch('/api/carriers');
        } catch {
            throw new Error('Kunde inte nå transportörernas API.');
        }

        // Stoppar körningen om API-anropet misslyckas
        if (!response.ok) {
            throw new Error('Kunde inte hämta transportörsdata.');
        }

        const carrierConfigs = await response.json();

        // Kontrollerar att API:t returnerar en lista
        if (!Array.isArray(carrierConfigs) || carrierConfigs.length === 0) {
            throw new Error('Inga transportörer tillgängliga just nu.');
        }

        // Validerar och bygger en Carrier per transportör
        this.#carrierCache = carrierConfigs.map((config) => {
            const createStrategy = STRATEGY_FACTORY[config.pricingModel];

            if (!createStrategy) {
                throw new Error(`Okänd prismodell "${config.pricingModel}" för ${config.name}.`);
            }

            return new Carrier(config, createStrategy());
        });
    }

    // Hämtar offerter från samtliga transportörer eller använder cachade transportörer
    async getQuotes(parcel, zoneKey) {
        if (!zoneKey) {
            throw new Error('Destination saknas.');
        }

        if (this.#carrierCache === null) {
            await this.#fetchCarriers();
        }

        // Frågar varje transportör om en offert
        // Hoppar över ifall dom inte levererar till vald zon
        const quotes = this.#carrierCache
            .map((carrier) => {
                try {
                    return carrier.quote(parcel, zoneKey);
                } catch {
                    return null;
                }
            })
            .filter((quote) => quote !== null);

        // Stoppar om ingen transportör kunde leverera till zonen
        if (quotes.length === 0) {
            throw new Error(`Ingen transportör kan leverera till zonen "${zoneKey}".`);
        }

        return quotes.sort((a, b) => a.price - b.price);
    }

    // Rensar cachen
    clearCache() {
        this.#carrierCache = null;
    }
}