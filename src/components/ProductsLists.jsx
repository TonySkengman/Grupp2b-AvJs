import ProductCard from "./ProductCard";

export default function ProductsList({
    products,
    includeTax
}) {
    return (
        <div className="product-grid">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    includeTax={includeTax}
                />
            ))}
        </div>
    );
}