const nodemailer = require('nodemailer');
const net = require('net');

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    const port = parseInt(SMTP_PORT) || 587;

    // Use Gmail service shorthand for reliable connectivity
    const isGmail = SMTP_HOST.includes('gmail');

    const config = {
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        tls: {
            rejectUnauthorized: false
        },
        // Force IPv4 — Render doesn't support outbound IPv6
        dnsOptions: { family: 4 },
        // Override socket creation to force IPv4
        connection: undefined
    };

    if (isGmail) {
        config.service = 'gmail';
    } else {
        config.host = SMTP_HOST;
        config.port = port;
        config.secure = port === 465;
        config.pool = true;
        config.maxConnections = 3;
    }

    // Create custom socket connect to force IPv4
    const transport = nodemailer.createTransport(config);

    // Override the socket connection to force IPv4
    const originalGetSocket = transport.getSocket;
    transport.getSocket = function(options, callback) {
        if (options && !options.family) {
            options.family = 4;
        }
        if (originalGetSocket) {
            return originalGetSocket.call(this, options, callback);
        }
    };

    return transport;
};

/**
 * Send email with one retry on failure.
 */
const sendMailWithRetry = async (transporter, mailOptions, retries = 1) => {
    try {
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        if (retries > 0) {
            console.log('Email send failed, retrying in 3s...', err.message);
            await new Promise(r => setTimeout(r, 3000));
            return sendMailWithRetry(transporter, mailOptions, retries - 1);
        }
        throw err;
    }
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
        await sendMailWithRetry(transporter, {
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
        await sendMailWithRetry(transporter, {
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

/**
 * Send confirmation email to user after contact form submission.
 */
const sendContactConfirmation = async ({ name, email }) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn('⚠️  SMTP not configured – skipping contact confirmation email to', email);
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
                            <h1 style="margin:0;font-size:28px;color:#fff;font-weight:700;">📩 We Got Your Message!</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:10px 40px 30px;">
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                Hi <strong style="color:#fff;">${name || 'there'}</strong>,
                            </p>
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                Thank you for reaching out to us! We've received your message and our team will review it shortly.
                            </p>
                            <!-- Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                                <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:24px;text-align:center;">
                                    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:1px;">Expected Response Time</p>
                                    <p style="margin:0;font-size:36px;font-weight:800;color:#fff;">24 Hours</p>
                                    <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">We'll get back to you as soon as possible</p>
                                </td></tr>
                            </table>
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                In the meantime, feel free to explore our templates and start creating amazing AI-generated images!
                            </p>
                            <p style="color:#888;font-size:14px;line-height:1.6;margin:0;">
                                If your matter is urgent, you can also reach us directly at
                                <a href="mailto:support@imagineai.com" style="color:#667eea;text-decoration:none;">support@imagineai.com</a>.
                            </p>
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
        await sendMailWithRetry(transporter, {
            from: `"ImagineAI" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '📩 We received your message — ImagineAI will contact you soon!',
            html
        });
        console.log('✅ Contact confirmation email sent to', email);
    } catch (error) {
        console.error('❌ Failed to send contact confirmation email:', error.message);
    }
};

/**
 * Notify admin about a new contact form submission.
 */
const sendContactNotificationToAdmin = async ({ name, email, eventDate, message }) => {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!transporter) {
        console.warn('⚠️  SMTP not configured – skipping admin contact notification');
        return;
    }
    if (!adminEmail) {
        console.warn('⚠️  ADMIN_EMAIL not set – skipping admin contact notification');
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
                            <h1 style="margin:0;font-size:24px;color:#fff;font-weight:700;">📬 New Contact Form Submission</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:10px 40px 30px;">
                            <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 20px;">
                                A visitor has submitted the contact form on <strong style="color:#fff;">ImagineAI</strong>:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
                                <tr>
                                    <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                                        <span style="color:#888;font-size:13px;">Name</span><br>
                                        <span style="color:#fff;font-size:15px;font-weight:600;">${name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                                        <span style="color:#888;font-size:13px;">Email</span><br>
                                        <a href="mailto:${email}" style="color:#667eea;font-size:15px;font-weight:600;text-decoration:none;">${email}</a>
                                    </td>
                                </tr>
                                ${eventDate ? `<tr>
                                    <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                                        <span style="color:#888;font-size:13px;">Event Date</span><br>
                                        <span style="color:#fff;font-size:15px;font-weight:600;">${new Date(eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </td>
                                </tr>` : ''}
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <span style="color:#888;font-size:13px;">Message</span><br>
                                        <span style="color:#e0e0e0;font-size:15px;line-height:1.5;">${message}</span>
                                    </td>
                                </tr>
                            </table>
                            <p style="color:#888;font-size:13px;margin:16px 0 0;">
                                Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </p>
                            <!-- Reply Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                                <tr><td align="center">
                                    <a href="mailto:${email}?subject=Re: Your inquiry on ImagineAI"
                                       style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                                        Reply to ${name} →
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
        await sendMailWithRetry(transporter, {
            from: `"ImagineAI" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `📬 New Contact: ${name} — ${email}`,
            html
        });
        console.log('✅ Admin notification sent for contact form from:', email);
    } catch (error) {
        console.error('❌ Failed to send admin contact notification:', error.message);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendNewUserNotificationToAdmin,
    sendContactConfirmation,
    sendContactNotificationToAdmin
};
