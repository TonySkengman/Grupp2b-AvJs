import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import modules from "../modules/moduleMaker.js";

export default function ProductCard({
    product,
    includeTax
}) {
    const {
        lines,
        addToCart,
        currency
    } = useCart();

    const navigate = useNavigate();

    const [formattedPrice, setFormattedPrice] = useState(null);
    const [priceError, setPriceError] = useState(null);

    const inCart =
        lines.find(
            line => line.productId === product.id
        )?.quantity ?? 0;

    const available = product.stock - inCart;

    useEffect(() => {
        let cancelled = false;

        async function calculatePrice() {
            try {
                const result = await modules.Currency.run(
                    {
                        currency,
                        includeTax
                    },
                    {
                        cartLines: [
                            {
                                name: product.name,
                                unitPrice: product.price,
                                quantity: 1,
                                currency: product.currency,
                                taxCategory: product.taxCategory
                            }
                        ]
                    }
                );

                if (!cancelled) {
                    setFormattedPrice(result.formattedPrice);
                    setPriceError(null);
                }
            } catch (error) {
                if (!cancelled) {
                    setFormattedPrice(null);

                    setPriceError(
                        error instanceof Error
                            ? error.message
                            : "Kunde inte beräkna priset"
                    );
                }
            }
        }

        calculatePrice();

        return () => {
            cancelled = true;
        };
    }, [
        currency,
        includeTax,
        product.name,
        product.price,
        product.currency,
        product.taxCategory
    ]);

    function openProduct() {
        navigate(`/products/${product.id}`);
    }

    function handleAddToCart(event) {
        event.stopPropagation();
        addToCart(product);
    }

    return (
        <div
            className="product-card"
            onClick={openProduct}
        >
            <img
                src={product.image}
                alt={product.name}
                className="product-card-image"
            />

            <div className="product-card-content">
                <h3>{product.name}</h3>

                <p className="product-price">
                    {formattedPrice ?? "Beräknar pris..."}
                </p>

                <p className="product-tax-label">
                    {includeTax
                        ? "inkl. moms"
                        : "exkl. moms"}
                </p>

                {priceError && (
                    <p className="field-error">
                        {priceError}
                    </p>
                )}

                <p className="product-stock">
                    {available > 0
                        ? "Finns i lager"
                        : "Slut i lager"}
                </p>

                <button
                    className="add-to-cart-button"
                    onClick={handleAddToCart}
                    disabled={available <= 0}
                >
                    Lägg i varukorg
                </button>
            </div>
        </div>
    );
}