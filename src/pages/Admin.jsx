import { useState, useEffect } from "react";
import modules from "../modules/moduleMaker.js";
import GenericForm from "../components/GenericForm.jsx";

const inventoryColumns = [
    { key: "name", label: "Produkt" },
    { key: "stock", label: "Lagersaldo" },
    { key: "reorderPoint", label: "Beställningspunkt" },
    { key: "soldLast7Days", label: "Sålt 7 dagar" },
    { key: "salesRate", label: "Försäljning/dag" },
    { key: "recommendedPurchase", label: "Rekommenderat inköp" },
    { key: "status", label: "Status" }
];

export default function Admin() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState(
        inventoryColumns.map(column => column.key)
    );

    function toggleColumn(columnKey) {
        setVisibleColumns(columns =>
            columns.includes(columnKey)
                ? columns.filter(key => key !== columnKey)
                : [...columns, columnKey]
        );
    }

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
        return <p className="page-status">Hämtar lagersaldo...</p>;
    }

    if (error) {
        return <p className="page-status">Fel: {error}</p>;
    }

    return (
        <main className="admin-page">
            <header className="admin-page-header">
                <p className="product-eyebrow">Lagerhantering</p>
                <h1>Butiksadmin</h1>
                <p>Hantera lagerhändelser och följ butikens aktuella lagersaldo.</p>
            </header>

            {message && <p className="admin-message">{message}</p>}
            {error && <p className="admin-error">Fel: {error}</p>}

            <section className="admin-section admin-form-section">
                <h2>Registrera lagerhändelse</h2>
                <GenericForm
                    fields={inventoryFields}
                    onSubmit={saveMovement}
                    submitLabel={saving ? "Sparar..." : "Spara lagerhändelse"}
                />
            </section>

            <section className="admin-section">
                <h2>Lagerstatus</h2>
                <p className="admin-section-description">Här visas lagersaldo och varningar för produkter
                    med låg lagernivå.</p>

                <fieldset className="column-picker">
                    <legend>Visa kolumner</legend>
                    <div className="column-picker-options">
                        {inventoryColumns.map(column => (
                            <label key={column.key}>
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(column.key)}
                                    onChange={() => toggleColumn(column.key)}
                                />
                                {column.label}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div className="inventory-table-wrap">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                {inventoryColumns.map(column => visibleColumns.includes(column.key) && (
                                    <th key={column.key}>{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.productId}>
                                    {visibleColumns.includes("name") && <td>{product.name}</td>}
                                    {visibleColumns.includes("stock") && <td>{product.stock}</td>}
                                    {visibleColumns.includes("reorderPoint") && <td>{product.reorderPoint}</td>}
                                    {visibleColumns.includes("soldLast7Days") && <td>{product.soldLast7Days}</td>}
                                    {visibleColumns.includes("salesRate") && <td>{product.salesRate.toFixed(2)}</td>}
                                    {visibleColumns.includes("recommendedPurchase") && <td>{product.recommendedPurchase}</td>}
                                    {visibleColumns.includes("status") && (
                                        <td>
                                            <span className={product.lowStock ? "inventory-status low" : "inventory-status ok"}>
                                                {product.lowStock ? "Lågt lager" : "OK"}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
