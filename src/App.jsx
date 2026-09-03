import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

function Nav() {
    const { lines } = useCart();
    const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

    return (
        <nav>
            <Link to="/">Hem</Link>
            <Link to="/cart">Varukorg ({totalItems})</Link>
            <Link to="/admin">Butiksadmin</Link>
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
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;