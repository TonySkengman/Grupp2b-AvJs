export default class Parcel {
    constructor(items) {
        // items: [{ weightKg, dimensionsCm: {width,height,depth}, quantity }]
        // validerar: kastar Error om items saknas/tomt eller vikt <= 0
    }

    get totalWeightKg() { /* summera weightKg * quantity */ }
    get totalVolumeCm3() { /* summera (w*h*d) * quantity */ }
    volumetricWeightKg(divisor) { /* totalVolumeCm3 / divisor */ }
    effectiveWeightKg(divisor) { /* Math.max(totalWeightKg, volumetricWeightKg(divisor)) */ }
}