import { useState, useEffect, useRef } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Coins, Sparkles, Check, AlertTriangle, CreditCard, Star, Zap, Crown, CheckCircle } from 'lucide-react';
import './BuyCredits.css';

// Main Buy Credits page
const BuyCredits = () => {
    const { user } = useAuth();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPkg, setProcessingPkg] = useState(null);
    const [alert, setAlert] = useState(null);
    const formRef = useRef(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const { data } = await orderAPI.getPackages();
            setPackages(data);
        } catch (err) {
            console.error('Failed to load packages:', err);
            // Fallback packages if API fails
            setPackages([
                { type: 'starter', credits: 10, price: 199, priceDisplay: '₹199', name: 'Starter Pack' },
                { type: 'popular', credits: 50, price: 999, priceDisplay: '₹999', name: 'Popular Pack' },
                { type: 'premium', credits: 100, price: 1999, priceDisplay: '₹1999', name: 'Premium Pack' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyClick = async (pkg) => {
        setProcessingPkg(pkg.type);
        setAlert(null);

        try {
            // Call backend to create order and get PayU params
            const { data } = await orderAPI.createOrder(pkg.type);
            const { payuParams } = data;

            // Create a hidden form and submit to PayU
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuParams.payuBaseUrl;

            // Add all PayU params as hidden fields
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
            setProcessingPkg(null);
        }
    };

    const getPackageIcon = (type) => {
        switch (type) {
            case 'starter': return <Zap size={30} />;
            case 'popular': return <Star size={30} />;
            case 'premium': return <Crown size={30} />;
            default: return <Sparkles size={30} />;
        }
    };

    const getPackageFeatures = (type) => {
        const common = ['High-quality AI generation', 'All templates included', 'Download in HD'];
        switch (type) {
            case 'starter': return [...common, 'Perfect for trying out'];
            case 'popular': return [...common, 'Best value for money', 'Priority generation'];
            case 'premium': return [...common, 'Maximum savings', 'Priority generation', 'Premium support'];
            default: return common;
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="buy-credits-page">
            {/* Header */}
            <div className="page-header">
                <h1>Buy Credits</h1>
                <p>Purchase credits to generate stunning AI images</p>
                {user && (
                    <div className="current-credits">
                        <Coins size={20} />
                        Current Balance: {user.credits} credits
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

            {/* Packages */}
            <div className="packages-grid">
                {packages.map((pkg) => (
                    <div
                        key={pkg.type}
                        className={`package-card ${pkg.type === 'popular' ? 'popular' : ''}`}
                    >
                        {pkg.type === 'popular' && <div className="popular-badge">Most Popular</div>}

                        <div className="package-icon">
                            {getPackageIcon(pkg.type)}
                        </div>

                        <h3 className="package-name">{pkg.name}</h3>

                        <div className="package-credits">
                            {pkg.credits} <span>credits</span>
                        </div>

                        <div className="package-price">
                            {pkg.priceDisplay}
                            <span className="per-credit">
                                ₹{(pkg.price / pkg.credits).toFixed(2)} per credit
                            </span>
                        </div>

                        <ul className="package-features">
                            {getPackageFeatures(pkg.type).map((feature, i) => (
                                <li key={i}><Check size={16} /> {feature}</li>
                            ))}
                        </ul>

                        <button
                            className="buy-btn primary"
                            onClick={() => handleBuyClick(pkg)}
                            disabled={processingPkg === pkg.type}
                        >
                            {processingPkg === pkg.type ? (
                                <><span className="btn-spinner"></span> Redirecting...</>
                            ) : (
                                <><CreditCard size={18} /> Buy Now</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* PayU badge */}
            <div className="payment-provider-badge">
                <span>🔒 Secured by PayU</span>
                <span className="payment-methods">UPI · Cards · NetBanking · Wallets</span>
            </div>
        </div>
    );
};

export default BuyCredits;
