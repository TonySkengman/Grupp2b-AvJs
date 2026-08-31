import ProductsList from "../components/ProductsLists";
import { useEffect, useState } from "react";


export default function Home() {
    const [products, setProducts] = useState([]);

    async function getProducts() {

        const response = await fetch("/api/products");

        const result = await response.json();

        console.log(result);

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
            <h1>Home</h1>
            <ProductsList products={products} />
        </div>
    )
}