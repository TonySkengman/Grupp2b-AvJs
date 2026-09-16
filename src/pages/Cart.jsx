import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CampaignCodeInput from "../components/CampaignCodeInput.jsx";
import CurrencySelector from "../components/CurrencySelector.jsx";

export default function Cart() {
    const { lines, removeFromCart, updateQuantity, priceSpec, priceError } = useCart();

    return (
        <div className="cart-page">
            <header className="cart-page-header">
                <p className="product-eyebrow">Din beställning</p>
                <h1>Din varukorg</h1>
                <p>Granska dina produkter och fortsätt till kassan när du är redo.</p>
            </header>

            {lines.length === 0 ? (
                <section className="cart-empty-state">
                    <h2>Varukorgen är tom</h2>
                    <p>Du har inte lagt till några produkter än.</p>
                    <Link className="cart-continue-link" to="/">Tillbaka till produkterna</Link>
                </section>
            ) : (
                <>
                    <ul className="cart-line-list">
                        {lines.map(line => (
                            <li
                                key={line.productId}
                                className="cart-line"
                            >
                                {line.image && (
                                    <img
                                        src={line.image}
                                        alt={line.name}
                                    />
                                )}

                                <div className="cart-line-details">
                                    <div className="cart-line-name">
                                        {line.name}
                                    </div>

                                    <div className="cart-line-quantity">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    line.productId,
                                                    line.quantity - 1
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>{line.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    line.productId,
                                                    line.quantity + 1
                                                )
                                            }
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-line-price">
                                        {line.unitPrice * line.quantity} kr
                                    </div>

                                    <button
                                        className="remove-btn"
                                        onClick={() =>
                                            removeFromCart(line.productId)
                                        }
                                    >
                                        Ta bort
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <CampaignCodeInput />

                    {priceError && <p className="field-error">{priceError}</p>}

                    <div className="cart-summary">
                        <div className="price-details">
                            <p>Delsumma: {priceSpec ? priceSpec.subtotal : 0} kr</p>

                            {priceSpec?.discounts.map((d, i) => (
                                <p key={i} className="discount-row">
                                    {d.description}: <strong>-{d.amount} kr</strong>
                                </p>
                            ))}

                            <p>
                                <strong>
                                    Summa (exkl. moms): {priceSpec ? priceSpec.total : 0} kr
                                </strong>
                            </p>
                            <p className="muted">
                                Se "Valuta och moms" nedan för totalsumma inklusive moms.
                            </p>

                            <CurrencySelector />
                        </div>

                        <Link to="/checkout">
                            <button className="checkout-btn">
                                Gå till kassan
                            </button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}