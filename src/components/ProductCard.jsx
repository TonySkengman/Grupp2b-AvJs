export default function ProductCard({ product }) {
    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p className="product-price">
                {product.price}kr
            </p>
            <p>
                I lager: {product.stock}
            </p>
            <button>
                Lägg i varukorg
            </button>
        </div>
    )
}