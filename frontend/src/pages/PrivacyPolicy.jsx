import { Shield, Eye, Database, Share2, Cookie, Lock, Mail, Bell, UserCheck, Globe } from 'lucide-react';
import './Legal.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <div className="legal-hero">
                <div className="container">
                    <h1><Shield size={32} /> Privacy Policy</h1>
                    <p>Your privacy matters to us. Learn how ImagineAI collects, uses, and protects your personal information.</p>
                </div>
            </div>

            <div className="legal-content">
                <div className="legal-section">
                    <p>Last updated: March 13, 2026</p>
                    <p>
                        This Privacy Policy describes how ImagineAI collects, uses, and shares
                        your personal information when you use our AI image generation platform. By using ImagineAI,
                        you agree to the collection and use of information in accordance with this policy.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Eye size={22} /> Information We Collect</h2>
                    <p>We collect different types of information to provide and improve our services:</p>
                    <ul>
                        <li><strong>Account Information:</strong> Your name, email address, and profile picture when you sign up via Google authentication.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, templates selected, and images generated.</li>
                        <li><strong>Uploaded Images:</strong> Original images you upload for AI transformation. These are stored securely on our servers to process your requests.</li>
                        <li><strong>Generated Images:</strong> AI-generated images created through our platform are stored in your account history.</li>
                        <li><strong>Payment Information:</strong> When you purchase credits, payment is processed securely through Stripe. We do not store your full credit card details on our servers.</li>
                        <li><strong>Device Information:</strong> Browser type, IP address, operating system, and device identifiers for security and analytics purposes.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><Database size={22} /> How We Use Your Information</h2>
                    <p>We use the collected information for the following purposes:</p>
                    <ul>
                        <li>To create and manage your account on ImagineAI.</li>
                        <li>To process your AI image generation requests using uploaded photos and selected templates.</li>
                        <li>To manage credits, process payments, and maintain transaction records.</li>
                        <li>To improve our AI models, templates, and overall platform experience.</li>
                        <li>To send important service updates, security alerts, and support communications.</li>
                        <li>To detect and prevent fraud, abuse, and unauthorized access.</li>
                        <li>To comply with legal obligations and enforce our terms of service.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><Share2 size={22} /> How We Share Your Information</h2>
                    <p>We do not sell your personal information. We may share your data in the following cases:</p>
                    <ul>
                        <li><strong>Payment Processors:</strong> We share necessary transaction details with Stripe to process your credit purchases securely.</li>
                        <li><strong>AI Service Providers:</strong> Your uploaded images are processed through our AI pipeline. We use industry-standard security measures to protect this data.</li>
                        <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or governmental authority.</li>
                        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the business.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><Cookie size={22} /> Cookies & Tracking</h2>
                    <p>
                        ImagineAI uses cookies and similar technologies to maintain your login session, remember your
                        preferences, and analyze platform usage. You can manage cookie preferences through your browser
                        settings, but disabling cookies may affect platform functionality.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Lock size={22} /> Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information, including
                        encrypted data transmission (HTTPS/TLS), secure server infrastructure, and access controls.
                        However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee
                        absolute security.
                    </p>
                    <div className="legal-highlight">
                        <p>
                            Your uploaded images and generated content are stored securely and are only accessible by you
                            through your authenticated account. Admin users may access generation data for platform
                            management purposes.
                        </p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2><UserCheck size={22} /> Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access the personal data we hold about you.</li>
                        <li>Request correction of inaccurate personal information.</li>
                        <li>Request deletion of your account and associated data.</li>
                        <li>Withdraw consent for data processing where applicable.</li>
                        <li>Export your data in a portable format.</li>
                    </ul>
                    <p>
                        To exercise any of these rights, please contact us at{' '}
                        <a href="mailto:support@imagineai.com">support@imagineai.com</a>.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Globe size={22} /> Data Retention</h2>
                    <p>
                        We retain your personal information for as long as your account is active or as needed to provide
                        our services. Generated images are stored indefinitely in your history unless you request deletion.
                        Transaction records are retained as required by applicable tax and financial regulations.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Bell size={22} /> Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any significant changes
                        by posting the updated policy on this page with a revised "Last updated" date. We encourage you
                        to review this page periodically for the latest information.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Mail size={22} /> Contact Us</h2>
                    <p>
                        If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
                        <a href="mailto:support@imagineai.com">support@imagineai.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
