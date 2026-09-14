import { useState, useEffect } from "react";
import modules from "../modules/moduleMaker.js";


export default function Admin() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function getInventoryReport() {
        try {
            const report = await modules.Inventory.run({}, {});
            setProducts(report);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getInventoryReport();
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
                                <tr key={product.productId}>
                                    <td>{product.name}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.reorderPoint}</td>
                                    <td>
                                        {product.lowStock
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
