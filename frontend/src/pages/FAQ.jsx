import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import './Legal.css';

const faqData = [
    {
        category: 'General',
        questions: [
            {
                q: 'What is ImagineAI?',
                a: 'ImagineAI is an AI-powered image generation platform that lets you transform your photos into stunning art using professionally crafted templates. Simply upload your image, choose a template, and our AI creates a unique result for you.'
            },
            {
                q: 'How does ImagineAI work?',
                a: 'Our platform uses advanced AI models to process your uploaded images combined with pre-designed templates. Each template has a unique artistic style and prompt — when you submit your photo, the AI generates a new image based on that combination.'
            },
            {
                q: 'Do I need to sign up to use ImagineAI?',
                a: 'Yes, you need to create an account to generate images. We use Google authentication for a quick and secure sign-up process. You can browse templates and collections without an account.'
            }
        ]
    },
    {
        category: 'Credits',
        questions: [
            {
                q: 'What are credits and how do they work?',
                a: 'Credits are the currency used on ImagineAI to generate AI images. Each template requires a specific number of credits. When you generate an image, the required credits are deducted from your balance.'
            },
            {
                q: 'How do I buy credits?',
                a: 'You can purchase credits directly from the "Buy Credits" page. We offer multiple credit packages at different price points. All payments are processed securely through PayU.'
            },
            {
                q: 'Do credits expire?',
                a: 'No, your credits never expire! Once purchased, they remain in your account until you use them.'
            },
            {
                q: 'Can I get a refund for unused credits?',
                a: 'All credit purchases are final and non-refundable. We recommend starting with a smaller package to try the platform before making larger purchases. However, if you experience technical issues that result in lost credits, please contact our support team.'
            }
        ]
    },
    {
        category: 'Generation',
        questions: [
            {
                q: 'What kind of images can I upload?',
                a: 'You can upload standard image formats like JPEG, PNG, and WebP. For best results, use clear, well-lit photos. The AI works best with images that match the template\'s intended use (e.g., portrait photos for portrait-style templates).'
            },
            {
                q: 'How long does image generation take?',
                a: 'Most image generations complete within 15-30 seconds, depending on server load and the complexity of the template. You\'ll see a progress indicator while your image is being created.'
            },
            {
                q: 'What if I\'m not satisfied with the result?',
                a: 'AI-generated results can vary. Credits are deducted at the time of generation regardless of the outcome. We recommend reviewing the template\'s example outputs before generating. You can always try again with a different photo or template.'
            },
            {
                q: 'Can I use generated images commercially?',
                a: 'Yes! All images generated through ImagineAI are yours to use for both personal and commercial purposes. However, you are responsible for ensuring the original uploaded image doesn\'t infringe on third-party rights.'
            },
            {
                q: 'Where are my generated images stored?',
                a: 'All your generated images are saved in your account\'s "History" section. You can view, download, and manage them at any time from your dashboard.'
            }
        ]
    },
    {
        category: 'Account',
        questions: [
            {
                q: 'How do I sign in?',
                a: 'ImagineAI uses Google authentication. Click "Login" and then "Continue with Google" to sign in with your Google account. It\'s quick, secure, and doesn\'t require a separate password.'
            },
            {
                q: 'Can I delete my account?',
                a: 'Yes, you can request account deletion by contacting our support team at support@imagineai.com. Please note that account deletion is permanent and will remove all your data, generated images, and remaining credits.'
            },
            {
                q: 'Why was my account disabled?',
                a: 'Accounts may be disabled for violating our Terms of Service, such as uploading prohibited content or attempting to abuse the platform. If you believe this was a mistake, please contact support@imagineai.com to appeal.'
            }
        ]
    },
    {
        category: 'Payment',
        questions: [
            {
                q: 'What payment methods are accepted?',
                a: 'We accept all major credit cards, debit cards, and UPI payments through PayU — our secure payment processor. PayU handles all payment information, so your financial data is never stored on our servers.'
            },
            {
                q: 'Is my payment information secure?',
                a: 'Absolutely. All payment processing is handled by PayU, which is PCI DSS Level 1 certified — the highest level of security in the payments industry. We never store your card details on our servers.'
            },
            {
                q: 'Will I receive a receipt for my purchase?',
                a: 'Yes, you\'ll receive a confirmation for each purchase. You can also view your transaction history from your Orders page after logging in.'
            }
        ]
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...new Set(faqData.map(c => c.category))];

    const filteredQuestions = activeCategory === 'All'
        ? faqData.flatMap(c => c.questions.map(q => ({ ...q, category: c.category })))
        : faqData
            .filter(c => c.category === activeCategory)
            .flatMap(c => c.questions.map(q => ({ ...q, category: c.category })));

    const toggleQuestion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="legal-page">
            <div className="legal-hero">
                <div className="container">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about ImagineAI's features, credits, and more.</p>
                </div>
            </div>

            <div className="legal-content">
                {/* Category Filter */}
                <div className="faq-categories">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`faq-category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => { setActiveCategory(cat); setActiveIndex(null); }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="faq-list">
                    {filteredQuestions.map((item, index) => (
                        <div
                            key={index}
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggleQuestion(index)}
                            >
                                <span>{item.q}</span>
                                <ChevronDown size={18} />
                            </button>
                            <div className="faq-answer">
                                <div className="faq-answer-inner">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="legal-section" style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <p>
                        Still have questions? We'd love to help!{' '}
                        <Link to="/contact">Contact our support team</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
