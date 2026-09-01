import ProductsList from "../components/ProductsLists";
import { useEffect, useState } from "react";

export default function Home() {
    const [products, setProducts] = useState([]);

    async function getProducts() {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (response.ok) {
            setProducts(result);
        } else {
            console.log("Fetching products failed!")
        }
    }

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <div>
            <h1 className="title">Våra Produkter</h1>
            <ProductsList products={products} />
        </div>
    )
}