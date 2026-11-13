import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import { RequireRole } from './components/ui';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Invoice from './pages/Invoice';
import MyReturns from './pages/MyReturns';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Policy, { Faq } from './pages/Policy';
import { Login, Register } from './pages/Auth';
import { About, Blog, Contact, NotFound } from './pages/Info';
import AdminShell from './admin/AdminShell';
import { AdminCoupons, AdminDashboard, AdminMessages, AdminOrders, AdminProducts, AdminReturns, AdminReviews, AdminUsers } from './admin/AdminPages';
import { SellerDashboard, SellerOrders, SellerProducts, SellerReturns, SellerShell } from './seller/SellerPages';

const Auth = ({ children }) => <RequireRole>{children}</RequireRole>;

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Auth><Checkout /></Auth>} />
        <Route path="order-success/:id" element={<Auth><OrderSuccess /></Auth>} />
        <Route path="orders" element={<Auth><Orders /></Auth>} />
        <Route path="orders/:id" element={<Auth><OrderDetail /></Auth>} />
        <Route path="orders/:id/invoice" element={<Auth><Invoice /></Auth>} />
        <Route path="returns" element={<Auth><MyReturns /></Auth>} />
        <Route path="wishlist" element={<Auth><Wishlist /></Auth>} />
        <Route path="account" element={<Auth><Account /></Auth>} />
        <Route path="policy/:slug" element={<Policy />} />
        <Route path="faq" element={<Faq />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="about" element={<About />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin" element={<RequireRole roles={['ADMIN']}><AdminShell /></RequireRole>}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      <Route path="/seller" element={<RequireRole roles={['SELLER']}><SellerShell /></RequireRole>}>
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="returns" element={<SellerReturns />} />
      </Route>
    </Routes>
  );
}
