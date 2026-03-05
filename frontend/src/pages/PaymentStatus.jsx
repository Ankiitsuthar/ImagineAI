import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Coins, ArrowRight, RotateCcw } from 'lucide-react';
import './BuyCredits.css';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const isSuccess = window.location.pathname.includes('/payment/success');
    const txnid = searchParams.get('txnid');
    const credits = searchParams.get('credits');
    const amount = searchParams.get('amount');
    const reason = searchParams.get('reason');

    useEffect(() => {
        // Refresh user data to get updated credits
        if (isSuccess && refreshUser) {
            refreshUser();
        }
    }, [isSuccess]);

    return (
        <div className="buy-credits-page">
            <div className="payment-status-container">
                <div className={`payment-status-card card-glass ${isSuccess ? 'success' : 'failure'}`}>
                    <div className={`status-icon-large ${isSuccess ? 'success' : 'failure'}`}>
                        {isSuccess ? <CheckCircle size={64} /> : <XCircle size={64} />}
                    </div>

                    <h1 className="status-title">
                        {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                    </h1>

                    <p className="status-description">
                        {isSuccess
                            ? `Your payment has been processed successfully. ${credits || ''} credits have been added to your account.`
                            : `Your payment could not be processed. ${reason === 'hash_mismatch' ? 'Payment verification failed.' : 'Please try again.'}`
                        }
                    </p>

                    {isSuccess && (
                        <div className="payment-details">
                            {amount && (
                                <div className="detail-row">
                                    <span>Amount Paid</span>
                                    <strong>₹{amount}</strong>
                                </div>
                            )}
                            {credits && (
                                <div className="detail-row">
                                    <span>Credits Added</span>
                                    <strong><Coins size={16} /> {credits}</strong>
                                </div>
                            )}
                            {txnid && (
                                <div className="detail-row">
                                    <span>Transaction ID</span>
                                    <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{txnid}</strong>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="status-actions">
                        {isSuccess ? (
                            <>
                                <button className="buy-btn primary" onClick={() => navigate('/templates')}>
                                    Start Generating <ArrowRight size={18} />
                                </button>
                                <button className="buy-btn secondary" onClick={() => navigate('/buy-credits')}>
                                    Buy More Credits
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="buy-btn primary" onClick={() => navigate('/buy-credits')}>
                                    <RotateCcw size={18} /> Try Again
                                </button>
                                <button className="buy-btn secondary" onClick={() => navigate('/dashboard')}>
                                    Go to Dashboard
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
