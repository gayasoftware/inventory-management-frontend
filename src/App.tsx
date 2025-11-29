import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Items from './pages/Items';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            {/* Home redirect based on role */}
                            <Route path="/" element={<HomeRedirect />} />

                            {/* Staff-only routes */}
                            <Route element={<RoleProtectedRoute blockedRoles={['customer']} />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                            </Route>

                            {/* Routes blocked for customers */}
                            <Route element={<RoleProtectedRoute blockedRoles={['customer']} />}>
                                <Route path="/products" element={<Products />} />
                                <Route path="/categories" element={<Categories />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/items" element={<Items />} />
                                <Route path="/transactions" element={<Transactions />} />
                            </Route>

                            {/* Routes accessible to all */}
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
