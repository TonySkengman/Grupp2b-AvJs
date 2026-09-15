import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import modules from "../modules/moduleMaker.js";

export default function Checkout() {
    const { lines, clearCart, priceSpec, priceError } = useCart();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const submitted = useRef(false);
    const orderSaved = useRef(false);


    const total = priceSpec ? priceSpec.total : 0;

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);

        if (!email) {
            setError("Ange en e-postadress.");
            return;
        }

        if (lines.length === 0) {
            setError("Varukorgen är tom.");
            return;
        }

        // Låset hindrar dubbelklick och ligger kvar om ordern redan sparats.
        if (submitted.current) return;
        submitted.current = true;

        setSubmitting(true);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    lines,
                    total,
                    discounts: priceSpec?.discounts ?? [],
                    date: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error("Kunde inte spara beställningen.");
            }

            orderSaved.current = true;

            // En genomförd order registreras som sale i lagret.
            for (const line of lines) {
                await modules.Inventory.run({
                    productId: line.productId,
                    type: "sale",
                    quantity: line.quantity
                }, {});
            }

            clearCart();
            navigate("/order-confirmation");
        } catch (err) {
            if (!orderSaved.current) submitted.current = false;
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (lines.length === 0) {
        return (
            <div className="checkout-page">
                <h1>Kassa</h1>
                <p>Din varukorg är tom — det finns inget att beställa.</p>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Kassa</h1>

            {priceError && <p className="checkout-error">{priceError}</p>}

            <div className="checkout-summary">
                <p>Delsumma: {priceSpec ? priceSpec.subtotal : 0} kr</p>

                {priceSpec?.discounts.map((d, i) => (
                    <p key={i} className="discount-row">
                        {d.description}: <strong>-{d.amount} kr</strong>
                    </p>
                ))}

                <p>
                    <strong>Summa: {total} kr</strong> 
                </p>
            </div>

            <ul className="checkout-list">
                {lines.map(line => (
                    <li
                        key={line.productId}
                        className="checkout-line"
                    >
                        {line.image && (
                            <img
                                src={line.image}
                                alt={line.name}
                            />
                        )}

                        <div className="checkout-line-info">
                            <div className="checkout-line-name">
                                {line.name}
                            </div>

                            <div className="checkout-line-price">
                                {line.quantity} st × {line.unitPrice} kr
                            </div>

                            <div className="checkout-line-total">
                                {line.unitPrice * line.quantity} kr
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <form
                className="checkout-form"
                onSubmit={handleSubmit}
            >
                <label htmlFor="checkout-email">
                    E-postadress
                </label>

                <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={event =>
                        setEmail(event.target.value)
                    }
                    placeholder="namn@exempel.se"
                    required
                />

                {error && (
                    <p className="checkout-error">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="checkout-confirm-btn"
                    disabled={submitting}
                >
                    {submitting
                        ? "Skickar..."
                        : "Bekräfta beställning"}
                </button>
            </form>
        </div>
    );
}
