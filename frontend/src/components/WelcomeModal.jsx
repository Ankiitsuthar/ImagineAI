import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import './WelcomeModal.css';

const WelcomeModal = () => {
    const [visible, setVisible] = useState(false);

    useBodyScrollLock(visible);

    useEffect(() => {
        // Check if we should show the welcome modal
        const shouldShow = sessionStorage.getItem('showWelcome');
        if (shouldShow === 'true') {
            // Small delay so the page renders first
            const timer = setTimeout(() => setVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.removeItem('showWelcome');
    };

    if (!visible) return null;

    return (
        <div className="welcome-modal-overlay" onClick={handleDismiss}>
            <div className="welcome-modal" onClick={e => e.stopPropagation()}>
                {/* Decorative sparkles */}
                <div className="welcome-sparkles">
                    <span className="welcome-sparkle" />
                    <span className="welcome-sparkle" />
                    <span className="welcome-sparkle" />
                    <span className="welcome-sparkle" />
                    <span className="welcome-sparkle" />
                    <span className="welcome-sparkle" />
                </div>

                <span className="welcome-emoji">🎉</span>
                <h2 className="welcome-title">Welcome to ImagineAI!</h2>
                <p className="welcome-subtitle">
                    Your account has been created successfully. Here's a gift to get you started!
                </p>

                <div className="welcome-credits-card">
                    <p className="welcome-credits-label">Your Free Credits</p>
                    <p className="welcome-credits-number">5</p>
                    <p className="welcome-credits-desc">
                        Use them to generate amazing AI images
                    </p>
                </div>

                <button className="welcome-cta-btn" onClick={handleDismiss}>
                    <Sparkles size={18} />
                    Start Creating
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;
