import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [lines, setLines] = useState([]);

    function addToCart(product) {
        setLines(prev => {
            const existing = prev.find(l => l.productId === product.id);
            if (existing) {
                return prev.map(l =>
                    l.productId === product.id
                        ? { ...l, quantity: l.quantity + 1 }
                        : l
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                quantity: 1
            }];
        });
    }

    function removeFromCart(productId) {
        setLines(prev => prev.filter(l => l.productId !== productId));
    }

    function clearCart() {
        setLines([]);
    }

    return (
        <CartContext.Provider value={{ lines, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}