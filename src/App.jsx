import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";

function Nav() {
    const { lines } = useCart();
    const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

    return (
        <nav>
            <Link to="/">Hem</Link>
            <Link to="/cart">Varukorg ({totalItems})</Link>
        </nav>
    );
}

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Nav />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;