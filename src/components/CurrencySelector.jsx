import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import modules from "../modules/moduleMaker.js";
import GenericForm from "./GenericForm.jsx";

export default function CurrencySelector() {
    const { lines } = useCart();
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    async function handleCurrencyChange(values) {
        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const nextResult = await modules.Currency.run(
                values,
                { cartLines: lines }
            );

            setResult(nextResult);
        } catch (err) {
            setResult(null);
            setError(
                err instanceof Error
                    ? err.message
                    : "Kunde inte räkna om priset"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="currency-selector">
            <h2>Valuta och moms</h2>

            <GenericForm
                fields={modules.CurrencyDescriptor.fields}
                initialValues={{ currency: "" }}
                submitLabel={loading ? "Beräknar..." : "Visa pris"}
                onSubmit={handleCurrencyChange}
            />

            {loading && (
                <p>Hämtar valutakurser och beräknar pris...</p>
            )}

            {error && (
                <p className="field-error">{error}</p>
            )}

            {result && (
                <div className="currency-result">
                    <p>
                        Vald valuta:{" "}
                        <strong>{result.currency}</strong>
                    </p>

                    <p>
                        Totalsumma inklusive moms:{" "}
                        <strong>{result.formattedPrice}</strong>
                    </p>
                </div>
            )}
        </section>
    );
}