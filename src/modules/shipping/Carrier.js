// Denna fil har ett ansvar:
// Representera en transportör och räknar ut en offert genom att
// delegera själva prisberäkningen till den inskickade prisstrategin

export default class Carrier {

    constructor(config, pricingStrategy) {
        // Stoppar ifall transportörskonfigurationen inte fungerar
        if (!config || typeof config !== 'object' || !config.zones) {
            throw new Error('Ogiltig transportörskonfiguration.');
        }

        // Stoppar om strategin inte kan räkna ut ett pris
        if (!pricingStrategy || typeof pricingStrategy.calculate !== 'function') {
            throw new Error('Transportören saknar en giltig prisstrategi.');
        }

        this.config = config;
        this.pricingStrategy = pricingStrategy;
    }

    get id() {
        return this.config.id;
    }

    get name() {
        return this.config.name;
    }

    // Räknar ut offert för ett paket till vald zon
    quote(parcel, zoneKey) {
        const zoneMultiplier = this.config.zones[zoneKey];

        // Tydligt fel när transportören inte levererar till vald zon
        if (zoneMultiplier === undefined) {
            throw new Error(`${this.config.name} levererar inte till zonen "${zoneKey}".`);
        }

        const price = this.pricingStrategy.calculate(parcel, this.config, zoneMultiplier);

        // Returnerar samma form oavsett prisstrategi
        return {
            carrierId: this.config.id,
            name: this.config.name,
            price,
            zone: zoneKey
        };
    }
}