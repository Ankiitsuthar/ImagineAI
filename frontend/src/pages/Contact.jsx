import { useState } from 'react';
import { CheckCircle, Mail, Clock, MessageCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        eventDate: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                setFormData({ name: '', email: '', eventDate: '', message: '' });
            } else {
                alert(data.message || 'Failed to submit form. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>Have questions? We'd love to hear from you</p>
                </div>
            </section>

            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-section">
                            <h2>Send Us a Message</h2>
                            <p className="text-muted mb-lg">
                                Fill out the form below and we'll get back to you within 24 hours
                            </p>

                            {submitted && (
                                <div className="success-message card-glass">
                                    <span className="success-icon"><CheckCircle size={24} /></span>
                                    <p>Thank you for your message! We'll get back to you soon.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John & Jane Doe"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="eventDate" className="form-label">Event Date (Optional)</label>
                                    <input
                                        type="date"
                                        id="eventDate"
                                        name="eventDate"
                                        className="form-input"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="form-textarea"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tell us about your needs..."
                                        rows="5"
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="contact-info-section">
                            <div className="contact-info-card card-glass">
                                <h3>Get in Touch</h3>
                                <p className="text-muted">
                                    We're here to help you create beautiful memories
                                </p>

                                <div className="contact-details">
                                    <div className="contact-detail">
                                        <div className="contact-icon"><Mail size={22} /></div>
                                        <div>
                                            <h4>Email</h4>
                                            <p><a href="mailto:support@imagineai.com" onClick={(e) => { e.preventDefault(); window.open('mailto:support@imagineai.com', '_self'); }}>support@imagineai.com</a></p>
                                        </div>
                                    </div>

                                    {/* <div className="contact-detail">
                                        <div className="contact-icon"><Clock size={22} /></div>
                                        <div>
                                            <h4>Response Time</h4>
                                            <p>Within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="contact-detail">
                                        <div className="contact-icon"><MessageCircle size={22} /></div>
                                        <div>
                                            <h4>Support Hours</h4>
                                            <p>Mon-Fri: 9AM - 6PM</p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                            <br />
                            <div className="contact-info-card card-glass mt-lg">
                                <h3>Frequently Asked Questions</h3>
                                <div className="faq-list">
                                    <div className="faq-item">
                                        <h4>How many credits do I get for free?</h4>
                                        <p>Every new user gets 5 free credits to try our service.</p>
                                    </div>
                                    <div className="faq-item">
                                        <h4>What photo formats are supported?</h4>
                                        <p>We support JPG, PNG, and WEBP formats up to 10MB.</p>
                                    </div>
                                    <div className="faq-item">
                                        <h4>How long does generation take?</h4>
                                        <p>Most photos are ready in 30-60 seconds.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
