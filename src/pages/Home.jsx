import { useEffect, useState } from "react";

import ProductsList from "../components/ProductsLists";
import CategoryFilter from "../components/CategoryFilter";
import { useCart } from "../context/CartContext";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const { currency, setCurrency } = useCart();

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
            <div className="product-controls">
                <CategoryFilter
                    products={products}
                    setFilteredProducts={setFilteredProducts}
                />

                <label className="home-currency-picker">
                    <span>Valuta:</span>
                    <select
                        value={currency}
                        onChange={(event) =>
                            setCurrency(event.target.value)
                        }
                    >
                        <option value="SEK">SEK</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                    </select>
                </label>
            </div>

            <ProductsList products={filteredProducts} />
        </div>
    );
}