
import { useState } from "react";

function validateField(field, value) {
  if (field.required && (value === "" || value === undefined)) {
    return `${field.label} är obligatoriskt`;
  }
  if (field.type === "number" && value !== "" && field.min !== undefined && Number(value) < field.min) {
    return `${field.label} måste vara minst ${field.min}`;
  }
  if (field.maxLength && value.length > field.maxLength) {
    return `${field.label} får vara max ${field.maxLength} tecken`;
  }
  return null;
}

export default function GenericForm({ descriptor, onSubmit }) {
  const initial = Object.fromEntries(descriptor.fields.map(f => [f.name, ""]));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  function handleChange(name, value) {
    setValues(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    descriptor.fields.forEach(field => {
      const err = validateField(field, values[field.name]);
      if (err) newErrors[field.name] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(values); // kontrollen anropar sedan modulens run(values, context)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>{descriptor.name}</h3>
      {descriptor.fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {field.type === "select" ? (
            <select
              value={values[field.name]}
              onChange={e => handleChange(field.name, e.target.value)}
            >
              <option value="">Välj...</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={values[field.name]}
              onChange={e => handleChange(field.name, e.target.value)}
            />
          )}
          {errors[field.name] && <p style={{ color: "red" }}>{errors[field.name]}</p>}
        </div>
      ))}
      <button type="submit">Skicka</button>
    </form>
  );
}


/* Exempel på en klass som använder generic form och descriptor

// src/modules/CampaignEngine/index.js
export default class CampaignEngineModule {

  static descriptor = {
    name: "Kampanjmotor",
    fields: [
      { name: "cartTotal",
        label: "Ordersumma",
        type: "number",
        required: true,
        min: 0 },
      { name: "campaignCode",
        label: "Kampanjkod",
        type: "text",
        required: false,
        maxLength: 20 },
      {
        name: "currency",
        label: "Valuta",
        type: "select",
        required: true,
        options: ["SEK", "EUR", "USD"]
      },
    ]
  };

  async run(values, context) {
    // values = { cartTotal, campaignCode, currency }
    // ... affärslogik ...
  }
} 

*/

