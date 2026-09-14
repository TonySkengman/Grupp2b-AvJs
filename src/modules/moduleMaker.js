import CampaignModule from "./campaign/index.js";
import InventoryModule from "./inventory/index.js";
import CurrencyModule from "./currency-tax/index.js";

const campaign = new CampaignModule();
const inventory = new InventoryModule();
const currency = new CurrencyModule();

export default {
  Campaign: campaign,
  CampaignDescriptor: CampaignModule.descriptor,

  Inventory: inventory,
  InventoryDescriptor: InventoryModule.descriptor,

  Currency: currency,
  CurrencyDescriptor: CurrencyModule.descriptor,
};