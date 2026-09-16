import { useState } from "react";
import GenericForm from "./GenericForm.jsx";
import { useCart } from "../context/CartContext.jsx";
import modules from "../modules/moduleMaker.js";

// Läser fields från descriptorn,
// låter GenericForm sköta validering,
// anropar sedan modulens run()
//
// cartLines behöver weightKg/dimensionsCm. Fälten sätts av
// CartContext.addToCart() utifrån produktens data i db.json
//
// onQuoteSelected(quote): anropas när kunden väljer transportör, så att
// Checkout.jsx kan räkna in fraktkostnaden i totalsumman

export default function ShippingEstimate({ onQuoteSelected }) {
    const { lines } = useCart();
    const [quotes, setQuotes] = useState(null);
    const [selectedCarrierId, setSelectedCarrierId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(values) {
        setError(null);
        setQuotes(null);
        setSelectedCarrierId(null);
        onQuoteSelected?.(null);
        setLoading(true);

        try {
            const cartLines = lines.map((line) => ({
                name: line.name,
                weightKg: line.weightKg,
                dimensionsCm: line.dimensionsCm,
                quantity: line.quantity
            }));

            const result = await modules.Shipping.run(values, { cartLines });

            setQuotes(result);

            // ShippingQuoteService sorterar på pris
            // Billigaste alternativet är förvalt

            if (result.length > 0) {
                setSelectedCarrierId(result[0].carrierId);
                onQuoteSelected?.(result[0]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleSelect(quote) {
        setSelectedCarrierId(quote.carrierId);
        onQuoteSelected?.(quote);
    }

    return (
        <div className="shipping-estimate">
            <h2>Fraktalternativ</h2>
            <GenericForm
                fields={modules.ShippingDescriptor.fields}
                initialValues={{ destinationZone: "" }}
                submitLabel="Beräkna frakt"
                onSubmit={handleSubmit}
            />

            {loading && <p className="shipping-estimate-message">Beräknar frakt...</p>}
            {error && <p className="field-error">{error}</p>}

            {quotes && (
                <ul className="shipping-quotes">
                    {quotes.map((quote) => (
                        <li key={quote.carrierId} className="shipping-quote-option">
                            <label>
                                <input
                                    type="radio"
                                    name="shippingCarrier"
                                    checked={selectedCarrierId === quote.carrierId}
                                    onChange={() => handleSelect(quote)}
                                />
                                {quote.name}: {quote.price} kr
                            </label>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}