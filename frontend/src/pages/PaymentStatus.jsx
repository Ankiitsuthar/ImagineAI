import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, CreditCard, ArrowRight, RotateCcw, Coins, Clock, Mail, Sparkles } from 'lucide-react';
import './BuyCredits.css';

const PaymentStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [countdown, setCountdown] = useState(5);
    const [showModal, setShowModal] = useState(false);

    const isSuccess = location.pathname === '/payment/success';
    const params = new URLSearchParams(location.search);

    // Success params
    const txnid = params.get('txnid') || '';
    const credits = params.get('credits') || '0';
    const amount = params.get('amount') || '0';

    // Failure params
    const reason = params.get('reason') || 'payment_failed';

    // Generate confetti particles once (success only)
    const confettiPieces = useMemo(() => {
        if (!isSuccess) return [];
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            size: 6 + Math.random() * 6,
            color: ['#7c3aed', '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 6)]
        }));
    }, [isSuccess]);

    // Refresh user data on success to update credit balance
    useEffect(() => {
        if (isSuccess) {
            refreshUser();
        }
    }, [isSuccess]);

    // Show modal with a slight delay for entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Auto-redirect countdown
    useEffect(() => {
        if (countdown <= 0) {
            if (isSuccess) {
                navigate('/templates', { replace: true });
            } else {
                navigate('/buy-credits', { replace: true });
            }
            return;
        }

        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, isSuccess, navigate]);

    const getFailureMessage = (reason) => {
        const messages = {
            hash_mismatch: 'Payment verification failed. If money was deducted, it will be refunded within 5-7 business days.',
            order_not_found: 'We could not find your order. Please contact support if money was deducted.',
            server_error: 'Something went wrong on our end. Please try again.',
            payment_failed: 'Your payment could not be processed. Please try again with a different payment method.',
            payment_cancelled: 'Payment was cancelled. No amount has been charged.'
        };
        return messages[reason] || messages.payment_failed;
    };

    return (
        <div className={`payment-popup-overlay ${showModal ? 'visible' : ''}`}>
            {/* Confetti */}
            {isSuccess && confettiPieces.map(piece => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: `${piece.left}%`,
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        backgroundColor: piece.color
                    }}
                />
            ))}

            <div className={`payment-popup-modal ${showModal ? 'visible' : ''} ${isSuccess ? 'success' : 'failure'}`}>
                {/* Icon */}
                <div className={`popup-status-icon ${isSuccess ? 'success' : 'failure'}`}>
                    {isSuccess ? <CheckCircle size={52} /> : <XCircle size={52} />}
                </div>

                {/* Title */}
                <h2 className="popup-title">
                    {isSuccess ? (
                        <><Sparkles size={24} /> Payment Successful!</>
                    ) : (
                        'Payment Failed'
                    )}
                </h2>

                {/* Description */}
                <p className="popup-description">
                    {isSuccess
                        ? `${credits} credits have been added to your account. You're all set to create amazing AI images!`
                        : getFailureMessage(reason)
                    }
                </p>

                {/* Success Details */}
                {isSuccess && (
                    <>
                        <div className="popup-details">
                            <div className="popup-detail-row">
                                <span><Coins size={16} /> Credits Added</span>
                                <strong>{credits}</strong>
                            </div>
                            <div className="popup-detail-row">
                                <span><CreditCard size={16} /> Amount Paid</span>
                                <strong>₹{parseInt(amount).toLocaleString('en-IN')}</strong>
                            </div>
                            {txnid && (
                                <div className="popup-detail-row">
                                    <span>Transaction ID</span>
                                    <strong style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{txnid}</strong>
                                </div>
                            )}
                        </div>

                        {/* Email Notice */}
                        <div className="popup-email-notice">
                            <Mail size={16} />
                            <span>A confirmation email has been sent to your registered email address.</span>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div className="popup-actions">
                    {isSuccess ? (
                        <button
                            className="buy-btn primary"
                            onClick={() => navigate('/templates', { replace: true })}
                        >
                            Browse Templates <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            className="buy-btn primary"
                            onClick={() => navigate('/buy-credits', { replace: true })}
                        >
                            <RotateCcw size={16} /> Try Again
                        </button>
                    )}
                </div>

                {/* Countdown */}
                <p className="popup-countdown">
                    <Clock size={14} />
                    Redirecting in {countdown}s to {isSuccess ? 'Templates' : 'Buy Credits'}…
                </p>
            </div>
        </div>
    );
};

export default PaymentStatus;
