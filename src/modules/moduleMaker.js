import CampaignModule from "./Tony/index.js";
import InventoryModule from "./inventory/index.js";
import CurrencyModule from "./currency-tax/index.js";
import ShippingModule from "./shipping/index.js";

const campaign = new CampaignModule();
const inventory = new InventoryModule();
const currency = new CurrencyModule();
const shipping = new ShippingModule();

export default {
  Campaign: campaign,
  CampaignDescriptor: CampaignModule.descriptor,

  Inventory: inventory,
  InventoryDescriptor: InventoryModule.descriptor,

  Currency: currency,
  CurrencyDescriptor: CurrencyModule.descriptor,

  Shipping: shipping,
  ShippingDescriptor: ShippingModule.descriptor,
};