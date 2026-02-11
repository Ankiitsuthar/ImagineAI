import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X } from 'lucide-react';
import './AuthModal.css';

const AuthModal = () => {
    const { isModalOpen, closeModal, modalMode } = useAuth();

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeModal]);

    if (!isModalOpen) return null;

    const handleGoogleAuth = () => {
        // Store current page URL to redirect back after auth
        localStorage.setItem('authRedirect', window.location.pathname);
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
    };

    return (
        <div className="auth-modal-overlay" onClick={closeModal}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>

                <div className="auth-modal-header">
                    <span className="auth-modal-icon"><Sparkles size={28} /></span>
                    <h2 className="auth-modal-title">Imagine AI</h2>
                    <p className="auth-modal-subtitle">
                        {modalMode === 'login'
                            ? 'Welcome back! Sign in to continue.'
                            : 'Sign up to get 5 free credits!'}
                    </p>
                </div>

                <div className="auth-modal-action">
                    <button onClick={handleGoogleAuth} className="btn-google-modal">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            style={{ width: '20px', height: '20px' }}
                        />
                        Continue with Google
                    </button>
                </div>

                <div className="auth-modal-footer">
                    <p>
                        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
