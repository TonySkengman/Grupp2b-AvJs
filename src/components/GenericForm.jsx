import { useState } from "react";

export default function GenericForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Skicka",
  context = {},
  autoSubmit = false, 
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const isVisible = (field) => {
    if (!field.visibleWhen) return true;
    const watched = context[field.visibleWhen.field];
    if (field.visibleWhen.notEmpty) {
      return Array.isArray(watched) ? watched.length > 0 : Boolean(watched);
    }
    return true;
  };

  const validateField = (field, rawValue) => {
    const value = rawValue?.trim?.() ?? rawValue;
    if (field.required && (!value || value === "")) {
      return "Obligatoriskt fält.";
    }
    if (value && field.pattern && !new RegExp(field.pattern).test(value)) {
      return `Ogiltigt format${field.patternHint ? ` (${field.patternHint})` : ""}.`;
    }
    return null;
  };

  const handleChange = (field, value) => {
    setValues((v) => ({ ...v, [field.name]: value }));
    setErrors((e) => ({ ...e, [field.name]: null }));

    if (autoSubmit) {
      const err = validateField(field, value);
      if (!err) {
        onSubmit({ ...values, [field.name]: value });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    for (const field of fields) {
      if (!isVisible(field)) continue;
      const err = validateField(field, values[field.name]);
      if (err) nextErrors[field.name] = err;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form className="generic-form" onSubmit={handleSubmit} noValidate>
      {fields.filter(isVisible).map((field) => (
        <div className="form-field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>

          {field.type === "select" ? (
            <select
              id={field.name}
              value={values[field.name] ?? ""}
              onChange={(e) => handleChange(field, e.target.value)}
            >
              <option value="" disabled>
                Välj...
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type ?? "text"}
              value={values[field.name] ?? ""}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          )}

          {field.helpText && <p className="field-help">{field.helpText}</p>}
          {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
        </div>
      ))}
      {!autoSubmit && <button type="submit">{submitLabel}</button>}
    </form>
  );
}