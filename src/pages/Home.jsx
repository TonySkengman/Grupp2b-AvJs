import ProductsList from "../components/ProductsLists";
import CategoryFilter from "../components/CategoryFilter";
import { useEffect, useState } from "react";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    async function getProducts() {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (response.ok) {
            setProducts(result);
            setFilteredProducts(result);
        } else {
            console.log("Fetching products failed!");
        }
    }

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <div>

            <CategoryFilter
                products={products}
                setFilteredProducts={setFilteredProducts}
            />

            <ProductsList products={filteredProducts} />
        </div>
    );
}