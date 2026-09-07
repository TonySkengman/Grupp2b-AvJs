import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Checkout() {
    const { lines, clearCart } = useCart();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const subtotal = lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0
    );

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
                    total: subtotal,
                    date: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error("Kunde inte spara beställningen.");
            }

            clearCart();
            navigate("/order-confirmation");
        } catch (err) {
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

            <div className="checkout-summary">
                <strong>Summa: {subtotal} kr</strong>
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