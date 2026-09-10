export default class Carrier {
    constructor(config, pricingStrategy) {
        this.config = config;             // {id, name, basePrice, pricePerKg, zones, volumetricDivisor}
        this.pricingStrategy = pricingStrategy;
    }

    quote(parcel, zoneKey) {
        // om zoneKey saknas i config.zones -> kasta Error (ogiltig destination)
        // annars: pris = this.pricingStrategy.calculate(parcel, this.config, this.config.zones[zoneKey])
        // returnera { carrierId, name, price, zone: zoneKey }
    }
}