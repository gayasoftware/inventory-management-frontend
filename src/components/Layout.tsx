import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ArrowRightLeft, LogOut, Menu, X, ShoppingCart, FileText, User } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define navigation items based on user role with hierarchical permissions
    const getNavItems = () => {
        const baseItems = [];

        // All authenticated users can shop, manage orders, and update profile
        baseItems.push(
            { path: '/shop', label: 'Shop', icon: ShoppingCart },
            { path: '/orders', label: 'Orders', icon: FileText },
            { path: '/profile', label: 'Profile', icon: User }
        );

        // Staff and Admin get additional management features
        if (user?.role === 'staff' || user?.role === 'admin') {
            baseItems.splice(2, 0,  // Insert after orders
                { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/items', label: 'Items', icon: Package },
                { path: '/categories', label: 'Categories', icon: Package },
                { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft }
            );
        }

        return baseItems;
    };

    const navItems = getNavItems();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">InventorySystem</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t bg-white">
                    <div className="flex items-center mb-4 px-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-gray-900">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Inventory'}
                    </span>
                    <div className="w-6" /> {/* Spacer for centering */}
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
