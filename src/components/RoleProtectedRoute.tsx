import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleProtectedRouteProps {
    allowedRoles?: string[];
    blockedRoles?: string[];
}

const RoleProtectedRoute = ({ allowedRoles, blockedRoles }: RoleProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (blockedRoles && user?.role && blockedRoles.includes(user.role)) {
        // If customer tries to access staff-only routes, redirect to shop
        if (user.role === 'customer') {
            return <Navigate to="/shop" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        // If user doesn't have allowed role, redirect appropriately
        if (user.role === 'customer') {
            return <Navigate to="/shop" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
