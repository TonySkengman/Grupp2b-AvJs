export class ModuleError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCartError extends ModuleError {
  constructor(reason) {
    super(`Varukorgen är ogiltig: ${reason}.`);
  }
}

export class UnknownCampaignCodeError extends ModuleError {
  constructor(code) {
    super(`Kampanjkoden "${code}" finns inte eller är inte aktiv.`);
  }
}

export class UnknownCampaignTypeError extends ModuleError {
  constructor(type) {
    super(`Okänd kampanjtyp: "${type}".`);
  }
}
