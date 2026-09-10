// PricingStrategies.js
export class WeightBasedPricing {
    calculate(parcel, config, zoneMultiplier) {
        // basePrice + totalWeightKg * pricePerKg * zoneMultiplier
    }
}

export class ZoneBasedPricing {
    calculate(parcel, config, zoneMultiplier) {
        // basePrice * zoneMultiplier + totalWeightKg * pricePerKg
        // (zonen väger tyngre här än i weight-modellen — det är själva poängen med modellen)
    }
}

export class VolumetricPricing {
    calculate(parcel, config, zoneMultiplier) {
        // effectiveWeight = parcel.effectiveWeightKg(config.volumetricDivisor)
        // basePrice + effectiveWeight * pricePerKg * zoneMultiplier
    }
}