import { useCart } from "../context/CartContext.jsx";
import modules from "../modules/moduleMaker.js";
import GenericForm from "./GenericForm.jsx";

export default function CurrencySelector() {
    const { currency, setCurrency, currencyResult, currencyError, currencyLoading } = useCart();

    return (
        <section className="currency-selector">
            <h2>Valuta och moms</h2>

            <GenericForm
                fields={modules.CurrencyDescriptor.fields}
                initialValues={{ currency }}
                submitLabel="Byt valuta"
                onSubmit={(values) => setCurrency(values.currency)}
            />

            {currencyLoading && (
                <p>Hämtar valutakurser och beräknar pris...</p>
            )}

            {currencyError && (
                <p className="field-error">{currencyError}</p>
            )}

            {currencyResult && (
                <div className="currency-result">
                    <p>
                        Vald valuta: <strong>{currencyResult.currency}</strong>
                    </p>
                    <p>
                        Totalsumma inklusive moms:{" "}
                        <strong>{currencyResult.formattedPrice}</strong>
                    </p>
                </div>
            )}
        </section>
    );
}