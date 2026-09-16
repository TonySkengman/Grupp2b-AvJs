import { createContext, useContext, useEffect, useState } from "react";
import modules from "../modules/moduleMaker.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [lines, setLines] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(lines));
    }, [lines]);

    const [campaignCodes, setCampaignCodes] = useState(() => {
        const savedCodes = localStorage.getItem("campaignCodes");
        return savedCodes ? JSON.parse(savedCodes) : [];
    });

    useEffect(() => {
        localStorage.setItem("campaignCodes", JSON.stringify(campaignCodes));
    }, [campaignCodes]);

    const [priceSpec, setPriceSpec] = useState(null);
    const [priceError, setPriceError] = useState(null);

    const [currency, setCurrency] = useState("SEK");
    const [currencyResult, setCurrencyResult] = useState(null);
    const [currencyError, setCurrencyError] = useState(null);
    const [currencyLoading, setCurrencyLoading] = useState(false);

    function addToCart(product) {
        setLines(prev => {
            const existing = prev.find(
                line => line.productId === product.id
            );

            if (existing) {
                return prev.map(line =>
                    line.productId === product.id
                        ? {
                            ...line,
                            quantity: line.quantity + 1
                        }
                        : line
                );
            }

            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    unitPrice: product.price,
                    quantity: 1,
                    image: product.image,
                    category: product.category,
                    weightKg: product.weightKg,
                    dimensionsCm: product.dimensionsCm,
                    currency: product.currency,
                    taxCategory: product.taxCategory,
                }
            ];
        });
    }

    function removeFromCart(productId) {
        setLines(prev =>
            prev.filter(
                line => line.productId !== productId
            )
        );
    }

    function updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setLines(prev =>
            prev.map(line =>
                line.productId === productId
                    ? {
                        ...line,
                        quantity
                    }
                    : line
            )
        );
    }

    function addCampaignCode(code) {
        const normalized = code.trim().toUpperCase();
        setCampaignCodes(prev =>
            prev.includes(normalized) ? prev : [...prev, normalized]
        );
    }

    function removeCampaignCode(code) {
        setCampaignCodes(prev => prev.filter(c => c !== code));
    }

    function clearCart() {
        setLines([]);
        setCampaignCodes([]);
    }

    useEffect(() => {
        if (lines.length === 0) {
            setPriceSpec(null);
            setPriceError(null);
            return;
        }

        let cancelled = false;

        modules.Campaign.run({ cart: lines, campaignCodes })
            .then((result) => {
                if (!cancelled) {
                    setPriceSpec(result);
                    setPriceError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setPriceError(err.message);
                    setPriceSpec(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [lines, campaignCodes]);

    const discountRatio =
        priceSpec && priceSpec.subtotal > 0
            ? priceSpec.total / priceSpec.subtotal
            : 1;

    const discountedLines = lines.map((line) => ({
        ...line,
        unitPrice: Math.round(line.unitPrice * discountRatio * 100) / 100,
    }));

    useEffect(() => {
        if (discountedLines.length === 0) {
            setCurrencyResult(null);
            setCurrencyError(null);
            return;
        }

        let cancelled = false;
        setCurrencyLoading(true);

        modules.Currency.run(
            { currency },
            { cartLines: discountedLines }
        )
            .then((result) => {
                if (!cancelled) {
                    setCurrencyResult(result);
                    setCurrencyError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setCurrencyError(
                        err instanceof Error ? err.message : "Kunde inte räkna om priset"
                    );
                    setCurrencyResult(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setCurrencyLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };

    }, [JSON.stringify(discountedLines), currency]);

    return (
        <CartContext.Provider
            value={{
                lines,
                addToCart,
                removeFromCart,
                clearCart,
                updateQuantity,
                campaignCodes,
                addCampaignCode,
                removeCampaignCode,
                priceSpec,
                priceError,
                discountedLines,
                currency,
                setCurrency,
                currencyResult,
                currencyError,
                currencyLoading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}