// Delad testdata och mock-hjälpare, återanvänds av flera testfiler i tests/

// Enkel testdata för en giltig produktrad
export function makeItem(overrides = {}) {
    return {
        name: 'Testprodukt',
        weightKg: 2,
        dimensionsCm: { width: 10, height: 10, depth: 10 },
        quantity: 1,
        ...overrides
    };
}

// Mockar globalt fetch så ShippingQuoteService inte behöver ett riktigt API
export function mockFetch(carrierConfigs, { ok = true, networkError = false } = {}) {
    global.fetch = async () => {
        if (networkError) {
            throw new Error('network down');
        }
        return {
            ok,
            json: async () => carrierConfigs
        };
    };
}

// Standarduppsättning transportörer som återanvänds i flera tester
export const carrierConfigs = [
    { id: 'postnord', name: 'PostNord', pricingModel: 'weight', basePrice: 50, pricePerKg: 10, zones: { SE: 1, EU: 1.5 } },
    { id: 'dhl', name: 'DHL', pricingModel: 'zone', basePrice: 40, pricePerKg: 12, zones: { SE: 1, EU: 2 } },
    { id: 'schenker', name: 'Schenker', pricingModel: 'volumetric', basePrice: 30, pricePerKg: 8, volumetricDivisor: 5000, zones: { EU: 1.2 } } // levererar inte SE
];