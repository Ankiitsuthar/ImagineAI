import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('login'); // 'login' or 'signup'

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { token, ...userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const register = async (name, email, password) => {
        const response = await authAPI.register({ name, email, password });
        const { token, ...userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const adminLogin = async (email, password) => {
        const response = await authAPI.adminLogin({ email, password });
        const { token, ...userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const loginWithToken = async (token) => {
        localStorage.setItem('token', token);
        try {
            const response = await userAPI.getProfile();
            const { user } = response.data;

            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return user;
        } catch (error) {
            console.error('Failed to fetch user profile with token:', error);
            // Don't remove token here - let AuthSuccess component handle the error
            // and decide whether to clear storage and redirect
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUserCredits = (newCredits) => {
        if (user) {
            const updatedUser = { ...user, credits: newCredits };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const openModal = (mode = 'login') => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const value = {
        user,
        loading,
        login,
        register,
        loginWithToken,
        adminLogin,

        logout,
        updateUserCredits,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isModalOpen,
        modalMode,
        openModal,
        closeModal
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
