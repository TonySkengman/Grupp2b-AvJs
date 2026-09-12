import CampaignModule from "./campaign/index.js";

const campaign = new CampaignModule();
export default {
  Campaign: campaign,
  CampaignDescriptor: CampaignModule.descriptor,
}
