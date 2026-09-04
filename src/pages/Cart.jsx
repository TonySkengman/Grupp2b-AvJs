import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
    const { lines, removeFromCart, updateQuantity } = useCart();
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    return (
        <div>
            <h1>Din varukorg</h1>

            {lines.length === 0 ? (
                <p>Du har inte lagt till några produkter än.</p>
            ) : (
                <>
                    <ul className="cart-line-list">
                        {lines.map(line => (
                            <li key={line.productId} className="cart-line">
                                {line.image && (
                                    <img src={line.image} alt={line.name} style={{ width: "80px" }} />
                                )}

                                <div className="cart-line-details">
                                    <div className="cart-line-name">{line.name}</div>

                                    <div className="cart-line-quantity">
                                        <button onClick={() => updateQuantity(line.productId, line.quantity - 1)}>
                                            −
                                        </button>
                                        <span>{line.quantity}</span>
                                        <button onClick={() => updateQuantity(line.productId, line.quantity + 1)}>
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-line-price">
                                        {line.unitPrice * line.quantity} kr
                                    </div>

                                    <button className="remove-btn" onClick={() => removeFromCart(line.productId)}>
                                        Ta bort
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p><strong>Summa: {subtotal} kr</strong></p>
                    <Link to="/checkout">
                        <button>Gå till kassan</button>
                    </Link>
                </>
            )}
        </div>
    );
}