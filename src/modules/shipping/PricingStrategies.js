// Innehåller dom tre prismodeller som en Carrier kan använda
// Varje strategi har samma form: calculate(parcel, config, zoneMultiplier).
// Carrier äger ingen prislogik själv utan delegerar hit

// Avrundar till ören så priserna blir läsbara i UI:t
function round2(value) {
    return Math.round(value * 100) / 100;
}

// Pris rakt av på verklig vikt: grundpris + vikt * pris/kg, justerat för zon
export class WeightBasedPricing {

    calculate(parcel, config, zoneMultiplier) {
        const price = config.basePrice + parcel.totalWeightKg * config.pricePerKg * zoneMultiplier;
        return round2(price);
    }
}

// Pris där destinationen väger tyngre än i viktmodellen
// Grundpriset multipliceras med zonen, inte bara vikttillägget
export class ZoneBasedPricing {

    calculate(parcel, config, zoneMultiplier) {
        const price = config.basePrice * zoneMultiplier + parcel.totalWeightKg * config.pricePerKg;
        return round2(price);
    }
}

// Pris baserat på den högsta av verklig vikt och volymvikt
// Ser till att stora men lätta paket inte blir orimligt billiga att frakta
export class VolumetricPricing {

    calculate(parcel, config, zoneMultiplier) {
        const effectiveWeight = parcel.effectiveWeightKg(config.volumetricDivisor);
        const price = config.basePrice + effectiveWeight * config.pricePerKg * zoneMultiplier;
        return round2(price);
    }
}