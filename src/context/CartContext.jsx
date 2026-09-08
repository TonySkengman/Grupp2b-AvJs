import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [lines, setLines] = useState(() => {
        const savedCart = localStorage.getItem("cart");

        return savedCart
            ? JSON.parse(savedCart)
            : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(lines));
    }, [lines]);

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
                    image: product.image
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

    function clearCart() {
        setLines([]);
    }

    return (
        <CartContext.Provider
            value={{
                lines,
                addToCart,
                removeFromCart,
                clearCart,
                updateQuantity
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}