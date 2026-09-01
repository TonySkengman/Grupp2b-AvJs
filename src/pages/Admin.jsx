import { useState, useEffect } from "react";


export default function Admin() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function getProducts() {
        try {
            const response = await fetch("/api/products");

            if (!response.ok) {
                throw new Error("Kunde inte hämta lagersaldot");
            
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProducts();
    }, []);

    if (loading) {
        return <p>Hämtar lagersaldo...</p>;
    }

    if (error) {
        return <p>Fel: {error}</p>;
    }

    return (
        <>
            <h1>Butiksadmin</h1>

            <section>
                <h2>Lagerstatus</h2>
                <p>Här visas lagersaldo och varningar för produkter
                    med låg lagernivå.</p>

                    <table>
                        <thead>
                            <tr>
                                <th>Produkt</th>
                                <th>Lagersaldo</th>
                                <th>Beställningspunkt</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.reorderPoint}</td>
                                    <td>
                                        {product.stock <= 5 
                                        ? "Lågt lager"
                                        : "OK" }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
            </section>
        </>
    );
}