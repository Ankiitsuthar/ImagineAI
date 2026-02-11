import { Palette, Camera, Sparkles, Download, Check } from 'lucide-react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <h1>About Imagine AI</h1>
                    <p>Transforming ordinary moments into extraordinary memories</p>
                </div>
            </section>

            <section className="about-content">
                <div className="container">
                    <div className="about-section">
                        <h2>Our Mission</h2>
                        <p>
                            At Imagine AI, to make AI-powered image generation easy, accessible, and reliable for everyone. We aim to help users create high-quality, professional images by combining their photos with intelligent templates, without any technical complexity.
                        </p>
                        <p>
                            We focus on providing a secure, user-friendly, and scalable platform where users can generate, store, and access their images anytime. Through a transparent credit-based system, we ensure fair usage while delivering real value. Our goal is to empower individuals and businesses to enhance their digital presence efficiently and creatively.
                        </p>
                    </div>

                    <div className="about-section">
                        <h2>How It Works</h2>
                        <div className="how-it-works-grid">
                            <div className="how-card card-glass">
                                <div className="how-icon"><Palette size={28} /></div>
                                <h3>Choose a Theme</h3>
                                <p>Select from our collection of themes.</p>
                            </div>
                            <div className="how-card card-glass">
                                <div className="how-icon"><Camera size={28} /></div>
                                <h3>Upload Your Photo</h3>
                                <p>Simply upload your favorite photo. Our AI works with any photo quality.</p>
                            </div>
                            <div className="how-card card-glass">
                                <div className="how-icon"><Sparkles size={28} /></div>
                                <h3>AI Magic</h3>
                                <p>Our advanced AI transforms your photo while preserving your unique features.</p>
                            </div>
                            <div className="how-card card-glass">
                                <div className="how-icon"><Download size={28} /></div>
                                <h3>Download & Share</h3>
                                <p>Get your stunning photo in seconds. Download and share with loved ones.</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-section">
                        <h2>Why Choose Us?</h2>
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-check"><Check size={18} /></span>
                                <div>
                                    <h4>50+ Professional Themes</h4>
                                    <p>From Professional to Creative, we have themes for every style</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check"><Check size={18} /></span>
                                <div>
                                    <h4>Lightning Fast</h4>
                                    <p>Get your transformed photos in seconds, not days</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check"><Check size={18} /></span>
                                <div>
                                    <h4>High Quality Results</h4>
                                    <p>Professional-grade images suitable for printing and sharing</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check"><Check size={18} /></span>
                                <div>
                                    <h4>Secure & Private</h4>
                                    <p>Your photos are encrypted and never shared with third parties</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-check"><Check size={18} /></span>
                                <div>
                                    <h4>Affordable Pricing</h4>
                                    <p>Get started with 5 free credits, then pay only for what you use</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </section>
        </div>
    );
};

export default About;
