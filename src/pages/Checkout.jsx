import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Checkout() {
    const { lines, clearCart } = useCart();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    async function handleSubmit(e) {
        e.preventDefault();
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
                headers: { "Content-Type": "application/json" },
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
        return <p>Din varukorg är tom — det finns inget att beställa.</p>;
    }

    return (
        <div>
            <h1>Kassa</h1>

            <ul className="cart-line-list">
                {lines.map(line => (
                    <li key={line.productId} className="cart-line">
                        {line.image && (
                            <img src={line.image} alt={line.name} style={{ width: "60px" }} />
                        )}
                        <span>{line.name} × {line.quantity} — {line.unitPrice * line.quantity} kr</span>
                    </li>
                ))}
            </ul>
            <p><strong>Summa: {subtotal} kr</strong></p>

            <form onSubmit={handleSubmit}>
                <label>
                    E-postadress
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </label>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" disabled={submitting}>
                    {submitting ? "Skickar..." : "Bekräfta beställning"}
                </button>
            </form>
        </div>
    );
}