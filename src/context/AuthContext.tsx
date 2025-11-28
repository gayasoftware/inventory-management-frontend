import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/services';

interface User {
    id: number;
    username: string;
    role: string;
    full_name?: string;
    email?: string;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await getMe();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    // If /me fails, user might be invalid, clear data
                    setToken(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Decode token to get user info (simplified: we'll fetch or expect it)
        // For this implementation, let's assume we get user info or we just set it.
        // We will modify the login page to set user info.
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
