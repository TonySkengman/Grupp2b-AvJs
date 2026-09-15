/**
 * Basklass för alla fel Kampanjmotorn kastar. this.name gör att felet
 * heter t.ex. "InvalidCartError" istället för bara "Error" i loggar,
 * och anroparen kan fånga alla våra fel med instanceof ModuleError
 * utan att bry sig om exakt vilket av de tre nedan det är.
 */
export class ModuleError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Varukorgen som skickades in är tom eller inte en lista. Se Cart.js. */
export class InvalidCartError extends ModuleError {
  constructor(reason) {
    super(`Varukorgen är ogiltig: ${reason}.`);
  }
}

/** Kampanjkoden matchar ingen aktiv kampanj i databasen. */
export class UnknownCampaignCodeError extends ModuleError {
  constructor(code) {
    super(`Kampanjkoden "${code}" finns inte eller är inte aktiv.`);
  }
}

/**
 * Skyddsnät mot felaktig data i db.json - triggas inte i normal drift
 * så länge alla kampanjer har en giltig type, se Discount.js.
 */
export class UnknownCampaignTypeError extends ModuleError {
  constructor(type) {
    super(`Okänd kampanjtyp: "${type}".`);
  }
}