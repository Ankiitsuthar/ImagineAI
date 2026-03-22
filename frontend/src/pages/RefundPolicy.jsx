import { RotateCcw, AlertCircle, Clock, CreditCard, Mail, ShieldCheck, Ban, HelpCircle, Scale } from 'lucide-react';
import './Legal.css';

const RefundPolicy = () => {
    return (
        <div className="legal-page">
            <div className="legal-hero">
                <div className="container">
                    <h1><RotateCcw size={32} /> Refund & Cancellation Policy</h1>
                    <p>Understand our policies regarding refunds, cancellations, and credit purchases on ImagineAI.</p>
                </div>
            </div>

            <div className="legal-content">
                <div className="legal-section">
                    <p>Last updated: March 22, 2026</p>
                    <p>
                        This Refund & Cancellation Policy outlines the terms and conditions under which ImagineAI
                        ("we", "us", or "our") processes refunds and handles cancellations for credit purchases
                        made on our AI image generation platform.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><CreditCard size={22} /> Credit Purchases</h2>
                    <p>
                        ImagineAI operates on a credit-based system. Credits are purchased through our platform
                        and used to generate AI-transformed images. Please note the following:
                    </p>
                    <ul>
                        <li>Credits are added to your account instantly upon successful payment.</li>
                        <li>All credit purchases are processed securely through our payment partner, PayU.</li>
                        <li>Credits do not expire and remain in your account until used.</li>
                        <li>Credits are non-transferable between accounts.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><RotateCcw size={22} /> Refund Eligibility</h2>
                    <p>We offer refunds under the following circumstances:</p>
                    <ul>
                        <li><strong>Duplicate Charges:</strong> If you were charged multiple times for the same purchase, we will refund the duplicate amount.</li>
                        <li><strong>Failed Credit Delivery:</strong> If payment was deducted but credits were not added to your account, we will either add the credits or process a full refund.</li>
                        <li><strong>Technical Failures:</strong> If our platform experienced a technical error that prevented you from using purchased credits for image generation, you may be eligible for a refund or credit restoration.</li>
                        <li><strong>Unauthorized Transactions:</strong> If you notice a charge you did not authorize, contact us immediately for investigation and possible refund.</li>
                    </ul>
                    <div className="legal-highlight">
                        <p>
                            Refund requests must be submitted within <strong>7 days</strong> of the original purchase date.
                            Requests made after this period may not be eligible for a refund.
                        </p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2><Ban size={22} /> Non-Refundable Scenarios</h2>
                    <p>Refunds will <strong>not</strong> be provided in the following cases:</p>
                    <ul>
                        <li><strong>Used Credits:</strong> Credits that have already been used to generate images cannot be refunded.</li>
                        <li><strong>Dissatisfaction with Results:</strong> Since AI-generated results vary based on input images and templates, we cannot guarantee specific outcomes. Refunds are not issued for dissatisfaction with generated images.</li>
                        <li><strong>Change of Mind:</strong> Refunds are not issued simply because you changed your mind about a purchase.</li>
                        <li><strong>Account Violations:</strong> If your account was suspended or terminated due to a violation of our Terms of Service, unused credits will not be refunded.</li>
                        <li><strong>Promotional Credits:</strong> Free or promotional credits (e.g., welcome bonuses) hold no monetary value and are not refundable.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><Clock size={22} /> How to Request a Refund</h2>
                    <p>To request a refund, please follow these steps:</p>
                    <ul>
                        <li><strong>Step 1:</strong> Email us at <a href="mailto:support@imagineai.com">support@imagineai.com</a> with the subject line "Refund Request".</li>
                        <li><strong>Step 2:</strong> Include your registered email address, the transaction ID or payment receipt, and a brief description of the issue.</li>
                        <li><strong>Step 3:</strong> Our team will review your request and respond within <strong>3–5 business days</strong>.</li>
                        <li><strong>Step 4:</strong> If approved, the refund will be processed to your original payment method within <strong>5–10 business days</strong>.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><AlertCircle size={22} /> Cancellation Policy</h2>
                    <p>
                        ImagineAI does not currently offer subscription plans. All purchases are one-time credit
                        packages. Therefore, there are no recurring charges to cancel. However:
                    </p>
                    <ul>
                        <li>You may stop using the platform at any time without any cancellation fees.</li>
                        <li>Unused credits will remain in your account indefinitely.</li>
                        <li>If you wish to delete your account, please contact us at <a href="mailto:support@imagineai.com">support@imagineai.com</a>. Note that account deletion is permanent and any unused credits will be forfeited.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><ShieldCheck size={22} /> Chargebacks</h2>
                    <p>
                        If you initiate a chargeback or payment dispute with your bank or credit card company without
                        first contacting us, we reserve the right to suspend your account pending investigation.
                        We encourage you to reach out to our support team first so we can resolve any issues directly
                        and promptly.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Scale size={22} /> Changes to This Policy</h2>
                    <p>
                        We may update this Refund & Cancellation Policy from time to time. Any changes will be posted
                        on this page with a revised "Last updated" date. We encourage you to review this policy
                        periodically. Continued use of ImagineAI after changes constitutes acceptance of the updated policy.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Mail size={22} /> Contact Us</h2>
                    <p>
                        If you have any questions about this policy or need assistance with a refund, please contact us at{' '}
                        <a href="mailto:support@imagineai.com">support@imagineai.com</a>. We're here to help!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
