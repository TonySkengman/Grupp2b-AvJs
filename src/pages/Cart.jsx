import { useCart } from "../context/CartContext";

export default function Cart() {
    const { lines, removeFromCart } = useCart();
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    return (
        <div>
            <h1>Din varukorg</h1>

            {lines.length === 0 ? (
                <p>Du har inte lagt till några produkter än.</p>
            ) : (
                <>
                    <ul>
                        {lines.map(line => (
                            <li key={line.productId}>
                                {line.name} × {line.quantity} — {line.unitPrice * line.quantity} kr
                                <button onClick={() => removeFromCart(line.productId)}>Ta bort</button>
                            </li>
                        ))}
                    </ul>
                    <p><strong>Summa: {subtotal} kr</strong></p>
                </>
            )}
        </div>
    );
}