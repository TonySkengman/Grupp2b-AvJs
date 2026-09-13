import CampaignModule from "./campaign/index.js";
import CurrencyModule from "./currency-tax/index.js";

const campaign = new CampaignModule();
const currency = new CurrencyModule();
export default {

  Campaign: campaign,
  CampaignDescriptor: CampaignModule.descriptor,
  
  Currency: currency,
  CurrencyDescriptor: CurrencyModule.descriptor,
}
