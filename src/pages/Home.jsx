import { useEffect, useState } from "react";
import CategoryFilter from "../components/CategoryFilter";
import ProductsList from "../components/ProductsLists";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        fetch("/api/products")
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);
                setFilteredProducts(data);
            });
    }, []);

    return (
        <>

            <CategoryFilter
                products={products}
                setFilteredProducts={setFilteredProducts}
            />

            <ProductsList products={filteredProducts} />
        </>
    );
}