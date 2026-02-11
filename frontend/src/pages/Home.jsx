import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Zap, Image, ShieldCheck } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { openModal, user } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        openModal('login');
    };

    const features = [
        {
            icon: <Sparkles size={28} />,
            title: 'AI-Powered',
            description: 'Powered by Gemini Nano Banana for stunning, professional-quality results.'
        },
        {
            icon: <Zap size={28} />,
            title: 'Lightning Fast',
            description: 'Generate professional images in seconds. No waiting, no hassle.'
        },
        {
            icon: <Image size={28} />,
            title: 'Multiple Templates',
            description: 'LinkedIn headshots, professional portraits, food photography, and more.'
        }
    ];

    return (
        <div className="home-page">
            <div className="container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-text fade-in-up">
                            <h1 className="hero-title">
                                Transform Your <br />
                                Photos with AI
                            </h1>
                            <p className="hero-description">
                                Create stunning professional images in seconds. choose a template, Upload your
                                photo, and let our AI generate perfect results.
                            </p>

                            {!user && (
                                <>


                                    <div className="hero-badges">
                                        <div className="badge-item">
                                            <span className="badge-icon"><Zap size={18} /></span>
                                            <div className="badge-text">
                                                <strong>5 Free Credits</strong>
                                                <span>On signup</span>
                                            </div>
                                        </div>
                                        <div className="badge-item">
                                            <span className="badge-icon"><ShieldCheck size={18} /></span>
                                            <div className="badge-text">
                                                <strong>Secure</strong>
                                                <span>Google OAuth</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hero-images fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="hero-image-grid">
                                <div className="grid-col col-main">
                                    <img
                                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop"
                                        alt="Professional Portrait"
                                        className="hero-img img-large"
                                    />
                                </div>
                                <div className="grid-col col-stack">
                                    <img
                                        src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=300&fit=crop"
                                        alt="Woman Portrait"
                                        className="hero-img img-small"
                                    />
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
                                        alt="Man Portrait"
                                        className="hero-img img-small"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="section-header text-center">
                        <h2>Why Choose Imagine AI?</h2>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="feature-icon-wrapper">
                                    <span className="feature-icon">{feature.icon}</span>
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="home-cta card-glass text-center">
                        <h2>Ready to Create Your Dream Photos?</h2>
                        <p>Join thousands of happy users who have transformed their memories</p>
                        <button onClick={() => user ? navigate('/templates') : openModal('signup')} className="btn btn-primary btn-lg">
                            Get Started Free
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
