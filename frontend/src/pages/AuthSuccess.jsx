import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { loginWithToken } = useAuth();
    const hasCalled = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token && !hasCalled.current) {
            hasCalled.current = true;
            loginWithToken(token)
                .then(() => {
                    // Check for stored redirect URL, default to templates page
                    const redirectUrl = localStorage.getItem('authRedirect') || '/templates';
                    localStorage.removeItem('authRedirect'); // Clean up
                    window.location.href = redirectUrl;
                })
                .catch((err) => {
                    console.error('Auth failed:', err);
                    // Clear any partial auth state before redirecting
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                });
        } else if (!token) {
            window.location.href = '/login';
        }
    }, [searchParams, loginWithToken]);

    return (
        <div className="flex-center" style={{ height: '100vh' }}>
            <div className="spinner"></div>
            <p style={{ marginLeft: '1rem' }}>Authenticating...</p>
        </div>
    );
};

export default AuthSuccess;
