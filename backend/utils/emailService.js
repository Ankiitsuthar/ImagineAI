const nodemailer = require('nodemailer');

/**
 * Create reusable transporter.
 * Returns null if SMTP is not configured so callers can bail out gracefully.
 */
const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: (parseInt(SMTP_PORT) || 587) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        },
        pool: true,
        maxConnections: 3,
        connectionTimeout: 10000,  // 10s to establish connection
        greetingTimeout: 10000,    // 10s for SMTP greeting
        socketTimeout: 15000       // 15s for socket inactivity
    });
};

/**
 * Send a branded welcome email to a newly registered user.
 */
const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️  SMTP not configured – skipping welcome email to', user.email);
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="padding:40px 40px 20px;text-align:center;">
                            <h1 style="margin:0;font-size:28px;color:#fff;font-weight:700;">✨ Welcome to ImagineAI!</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:10px 40px 30px;">
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                Hi <strong style="color:#fff;">${user.name || 'there'}</strong>,
                            </p>
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                Your account has been created successfully. We're thrilled to have you on board!
                            </p>
                            <!-- Credits Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                                <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:24px;text-align:center;">
                                    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:1px;">Your Free Credits</p>
                                    <p style="margin:0;font-size:48px;font-weight:800;color:#fff;">5</p>
                                    <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Use them to generate amazing AI images</p>
                                </td></tr>
                            </table>
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 30px;">
                                Start exploring our templates and create stunning AI-generated images today!
                            </p>
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr><td align="center">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/templates"
                                       style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
                                        Start Creating →
                                    </a>
                                </td></tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 40px 30px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                            <p style="margin:0;color:#888;font-size:13px;">
                                © ${new Date().getFullYear()} ImagineAI. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>`;

    try {
        await transporter.sendMail({
            from: `"ImagineAI" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: '🎉 Welcome to ImagineAI — Your 5 Free Credits Await!',
            html
        });
        console.log('✅ Welcome email sent to', user.email);
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error.message);
    }
};

/**
 * Notify admin about a new user registration.
 */
const sendNewUserNotificationToAdmin = async (user) => {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!transporter) {
        console.warn('⚠️  SMTP not configured – skipping admin notification');
        return;
    }
    if (!adminEmail) {
        console.warn('⚠️  ADMIN_EMAIL not set – skipping admin notification');
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                    <tr>
                        <td style="padding:40px 40px 20px;text-align:center;">
                            <h1 style="margin:0;font-size:24px;color:#fff;font-weight:700;">🆕 New User Registered</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:10px 40px 30px;">
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                A new user has registered on <strong style="color:#fff;">ImagineAI</strong>:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
                                <tr>
                                    <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                                        <span style="color:#888;font-size:13px;">Name</span><br>
                                        <span style="color:#fff;font-size:15px;font-weight:600;">${user.name || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                                        <span style="color:#888;font-size:13px;">Email</span><br>
                                        <a href="mailto:${user.email}" style="color:#667eea;font-size:15px;font-weight:600;text-decoration:none;">${user.email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <span style="color:#888;font-size:13px;">Registered At</span><br>
                                        <span style="color:#fff;font-size:15px;font-weight:600;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                                <tr><td align="center">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/users"
                                       style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                                        View in Admin Panel →
                                    </a>
                                </td></tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 30px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                            <p style="margin:0;color:#888;font-size:13px;">
                                © ${new Date().getFullYear()} ImagineAI Admin Notification
                            </p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>`;

    try {
        await transporter.sendMail({
            from: `"ImagineAI" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `📋 New User: ${user.name || user.email} registered on ImagineAI`,
            html
        });
        console.log('✅ Admin notification sent for new user:', user.email);
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error.message);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendNewUserNotificationToAdmin
};
