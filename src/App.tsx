import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Items from './pages/Items';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';

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
                            <Route path="/" element={<Shop />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/items" element={<Items />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/transactions" element={<Transactions />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
