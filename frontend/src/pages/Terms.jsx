import './Legal.css';

const Terms = () => {
    return (
        <div className="legal-page">
            <div className="legal-hero">
                <div className="container">
                    <h1>Terms of Service</h1>
                    <p>Please read these terms carefully before using the ImagineAI platform.</p>
                </div>
            </div>

            <div className="legal-content">
                <div className="legal-section">
                    <p>Last updated: March 13, 2026</p>
                    <p>
                        These Terms of Service ("Terms") govern your access to and use of the ImagineAI platform,
                        including all services, features, and content offered through our website. By creating an account
                        or using ImagineAI, you agree to be bound by these Terms.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Account Registration</h2>
                    <p>To use ImagineAI, you must:</p>
                    <ul>
                        <li>Sign up using Google authentication. We rely on Google for secure identity verification.</li>
                        <li>Provide accurate and complete information during registration.</li>
                        <li>Be at least 13 years of age (or the minimum age required in your jurisdiction).</li>
                        <li>Keep your account credentials secure and not share access with others.</li>
                    </ul>
                    <p>
                        You are responsible for all activity that occurs under your account. If you suspect unauthorized
                        access, contact us immediately at <a href="mailto:support@imagineai.com">support@imagineai.com</a>.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Credits & Payments</h2>
                    <p>ImagineAI operates on a credit-based system:</p>
                    <ul>
                        <li>Credits are required to generate AI images using templates.</li>
                        <li>Each template specifies the number of credits required for one generation.</li>
                        <li>Credits can be purchased through our platform via PayU, a secure third-party payment processor.</li>
                        <li>All credit purchases are final. Credits are non-refundable unless required by applicable law.</li>
                        <li>Credits do not expire and remain in your account until used.</li>
                        <li>We reserve the right to modify credit pricing and package offerings at any time.</li>
                    </ul>
                    <div className="legal-highlight">
                        <p>
                            <strong>Important:</strong> Credits are deducted at the time of generation, regardless of
                            whether you are satisfied with the AI output. Please review the template and your uploaded
                            image carefully before generating.
                        </p>
                    </div>
                </div>

                <div className="legal-section">
                    <h2>Content & Intellectual Property</h2>
                    <p>When using ImagineAI:</p>
                    <ul>
                        <li><strong>Your Uploads:</strong> You retain ownership of the original images you upload. By uploading, you grant ImagineAI a limited license to process the image through our AI pipeline.</li>
                        <li><strong>Generated Images:</strong> AI-generated images created through ImagineAI are yours to use for personal and commercial purposes, subject to applicable laws.</li>
                        <li><strong>Templates:</strong> Our templates, prompts, and underlying AI models are the intellectual property of ImagineAI and may not be copied, reverse-engineered, or redistributed.</li>
                        <li><strong>Platform Content:</strong> All branding, designs, text, and code on the ImagineAI platform are protected by copyright and trademark laws.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2>Prohibited Uses</h2>
                    <p>You agree not to use ImagineAI to:</p>
                    <ul>
                        <li>Generate images that are illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</li>
                        <li>Create deepfakes or images intended to deceive, manipulate, or impersonate individuals without consent.</li>
                        <li>Upload content that infringes on third-party intellectual property rights, privacy, or other legal rights.</li>
                        <li>Attempt to reverse-engineer, decompile, or extract the AI models or algorithms used by the platform.</li>
                        <li>Use automated bots, scrapers, or other tools to access the platform in an unauthorized manner.</li>
                        <li>Circumvent or manipulate the credit system, payment process, or any security features.</li>
                        <li>Upload content containing malware, viruses, or any harmful code.</li>
                    </ul>
                    <p>
                        Violation of these terms may result in immediate account suspension or termination without refund.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Account Suspension & Termination</h2>
                    <p>We reserve the right to:</p>
                    <ul>
                        <li>Suspend or disable your account if we detect violations of these Terms.</li>
                        <li>Remove or restrict access to content that violates our policies.</li>
                        <li>Terminate accounts that are inactive for an extended period.</li>
                    </ul>
                    <p>
                        If your account is disabled by an admin, you will see a notification when you attempt to log in.
                        You may appeal by contacting our support team.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Disclaimers & Limitation of Liability</h2>
                    <p>
                        ImagineAI is provided "as is" and "as available" without warranties of any kind, either express
                        or implied. We do not guarantee that:
                    </p>
                    <ul>
                        <li>The platform will be uninterrupted, error-free, or completely secure.</li>
                        <li>AI-generated images will meet your specific expectations or requirements.</li>
                        <li>The AI output will be free from bias, inaccuracies, or unintended content.</li>
                    </ul>
                    <p>
                        To the maximum extent permitted by law, ImagineAI shall not be liable for any indirect, incidental,
                        special, or consequential damages arising from your use of the platform.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
                        arising under these Terms shall be resolved through binding arbitration or in the courts of
                        competent jurisdiction in India.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Changes to These Terms</h2>
                    <p>
                        We may update these Terms from time to time. If we make material changes, we will notify you by
                        updating the "Last updated" date at the top of this page. Your continued use of ImagineAI after
                        changes constitutes acceptance of the revised Terms.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions about these Terms of Service, please reach out to us at{' '}
                        <a href="mailto:support@imagineai.com">support@imagineai.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
