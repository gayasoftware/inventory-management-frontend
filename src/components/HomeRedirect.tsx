import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
    const { user, isAuthenticated } = useAuth();

    // Wait for authentication and user data to load
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect based on role
    if (user.role === 'customer') {
        return <Navigate to="/shop" replace />;
    } else {
        return <Navigate to="/dashboard" replace />;
    }
};

export default HomeRedirect;
