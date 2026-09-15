import { useState, useEffect } from "react";
import modules from "../modules/moduleMaker.js";
import GenericForm from "../components/GenericForm.jsx";


export default function Admin() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const inventoryFields = modules.InventoryDescriptor.fields.map(field => {
        if (field.name === "productId") {
            return {
                ...field,
                options: products.map(product => ({
                    value: product.productId,
                    label: product.name
                }))
            };
        }

        if (field.name === "type") {
            return {
                ...field,
                options: field.options.filter(option =>
                    ["delivery", "adjustment"].includes(option.value)
                )
            };
        }

        return field;
    });

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

    async function saveMovement(values) {
        if (saving) return;

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            // Inventory-modulen sköter lagerlogiken.
            // React skickar bara in värden och visar resultatet.
            await modules.Inventory.run(values, {});
            await getInventoryReport();
            setMessage("Lagerhändelsen sparades.");
        } catch (movementError) {
            setError(movementError.message);
        } finally {
            setSaving(false);
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

            {message && <p>{message}</p>}
            {error && <p>Fel: {error}</p>}

            <section>
                <h2>Registrera lagerhändelse</h2>
                <GenericForm
                    fields={inventoryFields}
                    onSubmit={saveMovement}
                    submitLabel={saving ? "Sparar..." : "Spara lagerhändelse"}
                />
            </section>

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
                                <th>Sålt 7 dagar</th>
                                <th>Försäljning/dag</th>
                                <th>Rekommenderat inköp</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.productId}>
                                    <td>{product.name}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.reorderPoint}</td>
                                    <td>{product.soldLast7Days}</td>
                                    <td>{product.salesRate.toFixed(2)}</td>
                                    <td>{product.recommendedPurchase}</td>
                                    <td>
                                        {/* lowStock används som varning i Admin. */}
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
