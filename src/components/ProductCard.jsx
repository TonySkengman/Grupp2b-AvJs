import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
    const { lines, addToCart } = useCart();

    const inCart = lines.find(l => l.productId === product.id)?.quantity ?? 0;
    const available = product.stock - inCart;

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p className="product-price">
                {product.price}kr
            </p>
            <p>
                {available > 0 ? "Finns i lager" : "Slut i lager"}
            </p>
            <button
                onClick={() => addToCart(product)}
                disabled={available <= 0}
            >
                Lägg i varukorg
            </button>
            <Link to={`/products/${product.id}`}>
                <button>Produktdetaljer</button>
            </Link>
        </div>
    )
}