import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { loginWithToken } = useAuth();
    const hasCalled = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const isNewUser = searchParams.get('newUser') === 'true';

        // Handle deactivated account error from backend
        if (error === 'account_disabled') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/?account_disabled=true';
            return;
        }

        if (token && !hasCalled.current) {
            hasCalled.current = true;

            // Store new user flag so WelcomeModal can show after redirect
            if (isNewUser) {
                sessionStorage.setItem('showWelcome', 'true');
            }

            loginWithToken(token)
                .then((userData) => {
                    // Admin users always go to admin dashboard
                    if (userData?.role === 'admin') {
                        localStorage.removeItem('authRedirect');
                        sessionStorage.removeItem('showWelcome');
                        window.location.href = '/admin';
                        return;
                    }
                    // Regular users: check for stored redirect URL, default to templates page
                    const redirectUrl = localStorage.getItem('authRedirect') || '/templates';
                    localStorage.removeItem('authRedirect');
                    window.location.href = redirectUrl;
                })
                .catch((err) => {
                    console.error('Auth failed:', err);
                    sessionStorage.removeItem('showWelcome');
                    // Clear any partial auth state before redirecting
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                });
        } else if (!token) {
            window.location.href = '/login';
        }
    }, [searchParams, loginWithToken]);

    return <LoadingScreen />;
};

export default AuthSuccess;
