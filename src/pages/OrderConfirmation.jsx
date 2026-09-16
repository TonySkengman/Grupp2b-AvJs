import { Link } from "react-router-dom";

export default function OrderConfirmation() {
    return (
        <main className="order-confirmation-page">
            <section className="order-confirmation-card">
                <p className="product-eyebrow">Beställning mottagen</p>
                <h1>Tack för din beställning!</h1>
                <p>Vi har tagit emot din order och skickar en bekräftelse till din e-post.</p>
                <Link className="order-confirmation-link" to="/">
                    Tillbaka till startsidan
                </Link>
            </section>
        </main>
    );
}