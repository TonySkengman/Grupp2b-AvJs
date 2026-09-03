import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
    const { id } = useParams();
    const { lines, addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getProduct() {
            const response = await fetch(`/api/products/${id}`);
            if (response.ok) {
                const result = await response.json();
                setProduct(result);
            }
            setLoading(false);
        }
        getProduct();
    }, [id]);

    if (loading) return <p>Laddar...</p>;
    if (!product) return <p>Produkten hittades inte.</p>;

    const inCart = lines.find(l => l.productId === product.id)?.quantity ?? 0;
    const available = product.stock - inCart;

    return (
        <div>
            <Link to="/">← Tillbaka</Link>
            <h1>{product.name}</h1>
            {product.image && (
                <img
                    src={product.image}
                    alt={product.name}
                    style={{ maxWidth: "400px", width: "100%" }}
                />
            )}
            <p className="product-price">{product.price} kr</p>
            <p>{available > 0 ? "Finns i lager" : "Slut i lager"}</p>
            {product.description && <p>{product.description}</p>}
            <button
                onClick={() => addToCart(product)}
                disabled={available <= 0}
            >
                Lägg i varukorg
            </button>
        </div>
    );
}