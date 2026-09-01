import ProductCard from "./ProductCard";

export default function ProductsList({ products }) {
    return (
        <div className="product-grid">
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}