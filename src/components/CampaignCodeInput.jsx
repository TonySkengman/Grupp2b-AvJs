import { useState } from "react";
import GenericForm from "./GenericForm.jsx";
import { useCart } from "../context/CartContext.jsx";
import modules from "../modules/moduleMaker.js";
import { UnknownCampaignCodeError } from "../modules/Tony/errors.js";


export default function CampaignCodeInput() {
  const { lines, campaignCodes, addCampaignCode, removeCampaignCode } = useCart();
  const [codeError, setCodeError] = useState(null);

  async function handleAddCode(values) {
    if (!values.campaignCode) return;

    const code = values.campaignCode.trim().toUpperCase();

    if (campaignCodes.includes(code)) {
      setCodeError(`Koden "${code}" är redan tillagd.`);
      return;
    }

    try {
      const activeCampaigns = await modules.Campaign.getActiveCampaigns();
      const match = activeCampaigns.find((c) => c.code === code);

      if (!match) {
        setCodeError(new UnknownCampaignCodeError(code).message);
        return;
      }

      addCampaignCode(code);
      setCodeError(null);
    } catch (err) {
      setCodeError(err.message);
    }
  }

  return (
    <div className="campaign-code-input">
      <GenericForm
        key={campaignCodes.length}
        fields={modules.CampaignDescriptor.fields}
        initialValues={{ campaignCode: "" }}
        context={{ cart: lines }}
        submitLabel="Lägg till kod"
        onSubmit={handleAddCode}
      />

      {codeError && <p className="field-error">{codeError}</p>}

      {campaignCodes.length > 0 && (
        <ul className="campaign-code-chips">
          {campaignCodes.map((code) => (
            <li key={code} className="campaign-code-chip">
              {code}{" "}
              <button
                className="link-button"
                onClick={() => removeCampaignCode(code)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}