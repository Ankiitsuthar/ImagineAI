/**
 * Quick test: verify Nodemailer can send an email via SMTP port 465.
 * Usage:  node test-email.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

console.log('--- SMTP Configuration ---');
console.log('Host :', SMTP_HOST);
console.log('Port :', SMTP_PORT);
console.log('User :', SMTP_USER);
console.log('Pass :', SMTP_PASS ? '****' + SMTP_PASS.slice(-4) : 'NOT SET');
console.log('To   :', ADMIN_EMAIL);
console.log('--------------------------\n');

const port = parseInt(SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: port,
    secure: port === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
});

(async () => {
    try {
        // Step 1: Verify connection
        console.log('🔌 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified!\n');

        // Step 2: Send a test email
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail({
            from: `"ImagineAI Test" <${SMTP_USER}>`,
            to: ADMIN_EMAIL,
            subject: '🧪 ImagineAI — Test Email (Port 465)',
            html: '<h2>✅ Email is working!</h2><p>This is a test email sent from ImagineAI backend using Nodemailer on port 465.</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response  :', info.response);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('   Code:', error.code);
    }
    process.exit(0);
})();
