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

    if (loading) return <p className="page-status">Laddar...</p>;
    if (!product) return <p className="page-status">Produkten hittades inte.</p>;

    const inCart = lines.find(l => l.productId === product.id)?.quantity ?? 0;
    const available = product.stock - inCart;

    return (
        <main className="product-details-page">
            <Link className="back-link" to="/">← Tillbaka</Link>

            <article className="product-details-card">
                <div className="product-details-image-wrap">
                    {product.image && (
                        <img
                            className="product-details-image"
                            src={product.image}
                            alt={product.name}
                        />
                    )}
                </div>

                <div className="product-details-content">
                    <p className="product-eyebrow">Produktinformation</p>
                    <h1>{product.name}</h1>
                    <p className="product-details-price">{product.price} kr</p>
                    <p className={`product-details-stock ${available > 0 ? "in-stock" : "out-of-stock"}`}>
                        {available > 0 ? "Finns i lager" : "Slut i lager"}
                    </p>
                    {product.description && <p className="product-details-description">{product.description}</p>}
                    <button
                        className="product-details-button"
                        onClick={() => addToCart(product)}
                        disabled={available <= 0}
                    >
                        Lägg i varukorg
                    </button>
                </div>
            </article>
        </main>
    );
}