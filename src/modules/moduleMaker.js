import CampaignModule from "./campaign/index.js";
import InventoryModule from "./inventory/index.js";

const campaign = new CampaignModule();
const inventory = new InventoryModule();
export default {
  Campaign: campaign,
  CampaignDescriptor: CampaignModule.descriptor,
  Inventory: inventory,
  InventoryDescriptor: InventoryModule.descriptor,
}
