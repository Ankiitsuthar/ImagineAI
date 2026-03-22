import { useState } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Coins, Sparkles, Minus, Plus, AlertTriangle, CreditCard, CheckCircle, Lock, Zap, ArrowRight } from 'lucide-react';
import './BuyCredits.css';

const PRICE_PER_CREDIT = 10; // ₹10 per credit
const MIN_CREDITS = 1;
const MAX_CREDITS = 500;
const QUICK_PICKS = [5, 10, 25, 50, 100, 200];

const BuyCredits = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState(10);
    const [processing, setProcessing] = useState(false);
    const [alert, setAlert] = useState(null);

    const totalPrice = credits * PRICE_PER_CREDIT;

    const handleCreditChange = (value) => {
        const num = Math.max(MIN_CREDITS, Math.min(MAX_CREDITS, parseInt(value) || MIN_CREDITS));
        setCredits(num);
    };

    const handleIncrement = (amount) => {
        setCredits(prev => Math.min(MAX_CREDITS, prev + amount));
    };

    const handleDecrement = (amount) => {
        setCredits(prev => Math.max(MIN_CREDITS, prev - amount));
    };

    const handleBuyClick = async () => {
        setProcessing(true);
        setAlert(null);

        try {
            const { data } = await orderAPI.createCustomOrder(credits);
            const { payuParams } = data;

            // Create hidden form and submit to PayU
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuParams.payuBaseUrl;

            const fields = ['key', 'txnid', 'amount', 'productinfo', 'firstname', 'email', 'phone',
                'surl', 'furl', 'hash', 'udf1', 'udf2', 'udf3', 'udf4', 'udf5'];

            fields.forEach(field => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = field;
                input.value = payuParams[field] || '';
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error('Error initiating payment:', err);
            setAlert({
                type: 'error',
                message: err.response?.data?.message || 'Failed to initiate payment. Please try again.'
            });
            setProcessing(false);
        }
    };

    return (
        <div className="buy-credits-page">
            {/* Header */}
            <div className="page-header">
                <h1><Sparkles size={32} /> Buy Credits</h1>
                <p>Choose how many credits you want — pay only for what you need</p>
                {user && (
                    <div className="current-credits">
                        <Coins size={20} />
                        Current Balance: <strong>{user.credits}</strong> credits
                    </div>
                )}
            </div>

            {/* Alert */}
            {alert && (
                <div className={`credits-alert ${alert.type}`}>
                    {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {alert.message}
                </div>
            )}

            <div className="credits-purchase-layout">
                {/* Credit Selector Card */}
                <div className="credit-selector-card">
                    <div className="selector-header">
                        <h2>Select Credits</h2>
                        <span className="price-tag">₹{PRICE_PER_CREDIT} per credit</span>
                    </div>

                    {/* Quick Pick Buttons */}
                    <div className="quick-picks">
                        {QUICK_PICKS.map(amount => (
                            <button
                                key={amount}
                                className={`quick-pick-btn ${credits === amount ? 'active' : ''}`}
                                onClick={() => setCredits(amount)}
                            >
                                <Zap size={14} />
                                {amount}
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="credit-input-section">
                        <label className="input-label">Or enter custom amount</label>
                        <div className="credit-input-group">
                            <button
                                className="credit-adjust-btn"
                                onClick={() => handleDecrement(1)}
                                disabled={credits <= MIN_CREDITS}
                            >
                                <Minus size={18} />
                            </button>
                            <input
                                type="number"
                                className="credit-input"
                                value={credits}
                                onChange={(e) => handleCreditChange(e.target.value)}
                                min={MIN_CREDITS}
                                max={MAX_CREDITS}
                            />
                            <button
                                className="credit-adjust-btn"
                                onClick={() => handleIncrement(1)}
                                disabled={credits >= MAX_CREDITS}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="credit-range">
                            <span>Min: {MIN_CREDITS}</span>
                            <span>Max: {MAX_CREDITS}</span>
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="credit-slider-section">
                        <input
                            type="range"
                            className="credit-slider"
                            min={MIN_CREDITS}
                            max={MAX_CREDITS}
                            value={credits}
                            onChange={(e) => setCredits(parseInt(e.target.value))}
                        />
                        <div className="slider-labels">
                            <span>{MIN_CREDITS}</span>
                            <span>{Math.round(MAX_CREDITS / 4)}</span>
                            <span>{Math.round(MAX_CREDITS / 2)}</span>
                            <span>{Math.round(MAX_CREDITS * 3 / 4)}</span>
                            <span>{MAX_CREDITS}</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="order-summary-card">
                    <h3>Order Summary</h3>

                    <div className="summary-visual">
                        <div className="credit-display">
                            <span className="credit-number">{credits}</span>
                            <span className="credit-label">Credits</span>
                        </div>
                    </div>

                    <div className="summary-breakdown">
                        <div className="summary-row">
                            <span>Credits</span>
                            <span>{credits} × ₹{PRICE_PER_CREDIT}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <button
                        className="buy-btn primary"
                        onClick={handleBuyClick}
                        disabled={processing}
                    >
                        {processing ? (
                            <><span className="btn-spinner"></span> Redirecting to PayU...</>
                        ) : (
                            <><CreditCard size={18} /> Pay ₹{totalPrice.toLocaleString('en-IN')} <ArrowRight size={16} /></>
                        )}
                    </button>

                    <div className="summary-features">
                        <p><CheckCircle size={14} /> Credits never expire</p>
                        <p><CheckCircle size={14} /> All templates included</p>
                        <p><CheckCircle size={14} /> HD quality downloads</p>
                        <p><CheckCircle size={14} /> Instant credit delivery</p>
                    </div>
                </div>
            </div>

            {/* PayU badge */}
            <div className="payment-provider-badge">
                <span><Lock size={16} /> Secured by PayU</span>
                <span className="payment-methods">UPI · Cards · NetBanking · Wallets</span>
            </div>
        </div>
    );
};

export default BuyCredits;
