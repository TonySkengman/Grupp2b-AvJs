import { Link } from "react-router-dom";

export default function OrderConfirmation() {
    return (
        <div>
            <h1>Tack för din beställning!</h1>
            <p>Vi har tagit emot din order och skickar en bekräftelse till din e-post.</p>
            <Link to="/">Tillbaka till startsidan</Link>
        </div>
    );
}