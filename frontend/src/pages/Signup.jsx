import { Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const handleGoogleAuth = () => {
        // Preserve existing authRedirect if coming from a protected page, otherwise default to dashboard
        if (!localStorage.getItem('authRedirect')) {
            localStorage.setItem('authRedirect', '/dashboard');
        }
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-icon">✨</span>
                    <h1 className="auth-title">Join Imagine AI</h1>
                    <p className="auth-subtitle">
                        Sign up to get 5 free credits!
                    </p>
                </div>

                <div className="auth-action">
                    <button onClick={handleGoogleAuth} className="btn-google-auth">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="google-icon"
                        />
                        Continue with Google
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>

                <div className="auth-terms">
                    <p>
                        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
