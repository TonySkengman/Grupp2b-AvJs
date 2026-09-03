import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
    const { lines, addToCart } = useCart();
    const navigate = useNavigate();

    const inCart =
        lines.find(line => line.productId === product.id)?.quantity ?? 0;

    const available = product.stock - inCart;

    function openProduct() {
        navigate(`/products/${product.id}`);
    }

    function handleAddToCart(event) {
        event.stopPropagation();
        addToCart(product);
    }

    return (
        <div
            className="product-card"
            onClick={openProduct}
        >
            <img
                src={product.image}
                alt={product.name}
                className="product-card-image"
            />

            <div className="product-card-content">
                <h3>{product.name}</h3>

                <p className="product-price">
                    {product.price} kr
                </p>

                <p className="product-stock">
                    {available > 0
                    ? "Finns i lager"
                    : "Slut i lager"}
                    </p>

                <button
                    className="add-to-cart-button"
                    onClick={handleAddToCart}
                    disabled={available <= 0}
                >
                    Lägg i varukorg
                </button>
            </div>
        </div>
    );
}