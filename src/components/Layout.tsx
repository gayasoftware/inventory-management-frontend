import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Layers, User, LogOut, Menu, X, Warehouse } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'staff'] },
        { name: 'Shop', href: '/shop', icon: ShoppingCart },
        { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'staff'] },
        { name: 'Orders', href: '/orders', icon: ClipboardList },
        { name: 'Categories', href: '/categories', icon: Layers, roles: ['admin', 'staff'] },
        { name: 'Inventory', href: '/inventory', icon: Warehouse, roles: ['admin', 'staff'] },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const filteredNavigation = navigation.filter(item =>
        !item.roles || (user && item.roles.includes(user.role))
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100/50">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            Stocknify
                        </span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {filteredNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary-50 text-primary-700 shadow-sm"
                                            : "text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-sm hover:translate-x-1"
                                    )}
                                >
                                    <item.icon className={clsx(
                                        "mr-3 h-5 w-5 transition-colors",
                                        isActive ? "text-primary-600" : "text-gray-400 group-hover:text-primary-500"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-100/50">
                        <div className="flex items-center p-4 bg-primary-50/50 rounded-xl mb-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                    <span className="text-xl font-bold text-gray-900">Stocknify</span>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
