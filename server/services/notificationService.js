const nodemailer = require('nodemailer');

// In-memory buffer of recent server-dispatched notifications for inspection / dev testing
const recentNotifications = [];
const MAX_HISTORY = 50;

function recordNotification(item) {
  recentNotifications.unshift({
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    ...item
  });
  if (recentNotifications.length > MAX_HISTORY) {
    recentNotifications.pop();
  }
}

let transporter = null;
let etherealTransporter = null;
let isInitializingEthereal = false;

/**
 * Configure Nodemailer Transporter
 */
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  // 1. Production custom SMTP (Gmail, SendGrid, Amazon SES, Brevo, Mailgun)
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    return transporter;
  }

  // 2. Direct Gmail integration
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });
    return transporter;
  }

  // 3. Ethereal Live Test Mailer (generates real webmail preview links for test accounts)
  if (etherealTransporter) return etherealTransporter;

  if (!isInitializingEthereal) {
    isInitializingEthereal = true;
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`\n[SMTP] Connected to Live Ethereal Mail Service as: ${testAccount.user}`);
      console.log(`[SMTP] Outgoing test emails will include live web inbox preview links.\n`);
    } catch (e) {
      console.warn('[SMTP WARNING] Could not create Ethereal test account:', e.message);
    } finally {
      isInitializingEthereal = false;
    }
  }

  return etherealTransporter;
}

/**
 * Send an email via server
 */
async function sendEmail({ to, subject, html, text }) {
  const from = process.env.FROM_EMAIL || '"DataDrix Platform" <no-reply@datadrix.com>';
  const mailTransporter = await getTransporter();

  const record = {
    channel: 'email',
    recipient: to,
    subject,
    preview: text ? text.substring(0, 160) : '',
    delivered: false,
    previewUrl: null
  };

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL DISPATCHED VIA SERVER]`);
      console.log(`From:        ${from}`);
      console.log(`To:          ${to}`);
      console.log(`Subject:     ${subject}`);
      console.log(`MessageId:   ${info.messageId}`);
      if (previewUrl) {
        console.log(`🔗 LIVE WEB INBOX LINK: ${previewUrl}`);
      }
      console.log(`======================================================\n`);

      record.delivered = true;
      record.messageId = info.messageId;
      record.previewUrl = previewUrl || null;
      recordNotification(record);
      return { success: true, delivered: true, messageId: info.messageId, previewUrl };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed sending to ${to}:`, err.message);
      record.error = err.message;
      recordNotification(record);
      return { success: false, error: err.message };
    }
  } else {
    // Development / Local Simulation Fallback
    console.log(`\n======================================================`);
    console.log(`📧 [SERVER EMAIL SENT (Console Fallback)]`);
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:    ${text || '(HTML formatted)'}`);
    console.log(`======================================================\n`);
    record.delivered = true;
    record.simulated = true;
    recordNotification(record);
    return { success: true, simulated: true };
  }
}

/**
 * Send SMS message via server
 */
async function sendSms({ to, message }) {
  const record = {
    channel: 'sms',
    recipient: to,
    message,
    delivered: false
  };

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const body = new URLSearchParams({
        To: to,
        From: twilioFrom,
        Body: message
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Twilio dispatch failed');

      console.log(`[SMS DISPATCHED via Twilio] To: ${to} | SID: ${data.sid}`);
      record.delivered = true;
      record.sid = data.sid;
      recordNotification(record);
      return { success: true, delivered: true, sid: data.sid };
    } catch (err) {
      console.error(`[SMS ERROR] Failed sending SMS to ${to}:`, err.message);
      record.error = err.message;
      recordNotification(record);
      return { success: false, error: err.message };
    }
  } else {
    // Development / Local Simulation Fallback
    console.log(`\n======================================================`);
    console.log(`📱 [SERVER SMS / TEXT SENT]`);
    console.log(`To:      ${to}`);
    console.log(`Message: ${message}`);
    console.log(`======================================================\n`);
    record.delivered = true;
    record.simulated = true;
    recordNotification(record);
    return { success: true, simulated: true };
  }
}

/**
 * Notification Templates
 */

// 1. Welcome Notification on Signup
async function sendWelcomeNotification({ name, email, phone }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const results = { email: null, sms: null };

  if (email) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0d14; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">⚡ DataDrix Academy</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 15px;">Welcome to Interactive Learning</p>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Welcome aboard, ${name}! 🎉</h2>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 15px;">
            Your DataDrix account is officially active. You now have full access to our curated curriculum, interactive WebAssembly playground, coding practice challenges, and interview prep corner.
          </p>
          <div style="background: #101622; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
              <strong>Quick Tip:</strong> Head over to the <a href="${clientUrl}/python" style="color: #818cf8; text-decoration: underline;">Python Track</a> or test algorithms in the <a href="${clientUrl}/practice" style="color: #818cf8; text-decoration: underline;">Practice Hub</a>!
            </p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${clientUrl}/dashboard" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; padding: 12px 28px; font-weight: 700; border-radius: 8px; text-decoration: none; display: inline-block;">
              Go to Your Dashboard →
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
            This email was sent from your DataDrix server. If you did not create this account, please ignore this email.
          </p>
        </div>
      </div>
    `;
    const text = `Welcome to DataDrix, ${name}! Your account is now active. Access your curriculum and exercises at ${clientUrl}/dashboard.`;
    results.email = await sendEmail({ to: email, subject: '🎉 Welcome to DataDrix Academy!', html, text });
  }

  if (phone) {
    const message = `⚡ DataDrix: Welcome ${name}! Your student account is active. Explore Python, Practice Hub & CS Interview Prep at ${clientUrl}`;
    results.sms = await sendSms({ to: phone, message });
  }

  return results;
}

// 2. Sign In Alert Notification
async function sendLoginAlert({ name, email, phone, ip, userAgent }) {
  const time = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const results = { email: null, sms: null };

  if (email) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0d14; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b; padding: 24px;">
        <h2 style="color: #818cf8; margin-top: 0; font-size: 18px;">🔒 DataDrix Security Alert: New Sign-In</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          Hello ${name}, a new sign-in was detected for your DataDrix account:
        </p>
        <div style="background: #101622; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.7;">
          • <strong>Time:</strong> ${time}<br/>
          • <strong>IP Address:</strong> ${ip || 'Unknown'}<br/>
          • <strong>Device/Client:</strong> ${userAgent ? userAgent.substring(0, 80) : 'Web Browser'}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">
          If this was you, you can safely disregard this message. If you didn't sign in, please <a href="${clientUrl}/forgot-password" style="color: #ef4444; text-decoration: underline;">reset your password immediately</a>.
        </p>
      </div>
    `;
    const text = `DataDrix Security: New login detected for ${name} at ${time} from IP ${ip || 'unknown'}. If not you, reset your password at ${clientUrl}/forgot-password.`;
    results.email = await sendEmail({ to: email, subject: '🔒 Security Alert: New Sign-In to DataDrix', html, text });
  }

  if (phone) {
    const message = `DataDrix Security: New sign-in detected on your account at ${time}. If this wasn't you, reset password at ${clientUrl}/forgot-password`;
    results.sms = await sendSms({ to: phone, message });
  }

  return results;
}

// 3. Password Reset Notification
async function sendPasswordResetNotification({ name, email, phone, token, otp }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password/${token}`;
  const results = { email: null, sms: null };

  if (email) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0a0d14; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🔑 Reset Your Password</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #cbd5e1; font-size: 15px;">Hello ${name},</p>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 14px;">
            We received a request to reset your DataDrix account password. You can reset your password using the secure button below or by using your 6-digit verification code.
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #6366f1; color: #ffffff; padding: 12px 28px; font-weight: 700; border-radius: 8px; text-decoration: none; display: inline-block;">
              Reset My Password →
            </a>
          </div>

          <div style="background: #101622; border: 1px dashed #6366f1; border-radius: 8px; padding: 14px; text-align: center; margin: 20px 0;">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Or Enter Verification Code (OTP)</div>
            <div style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; margin-top: 6px;">${otp}</div>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
            This link and verification code expire in <strong>1 hour</strong>. If you did not request this password reset, you can safely ignore this email; your password will remain unchanged.
          </p>
        </div>
      </div>
    `;
    const text = `DataDrix Password Reset: Reset your password at ${resetUrl} or enter OTP code: ${otp}. This code expires in 1 hour.`;
    results.email = await sendEmail({ to: email, subject: '🔑 Reset Your DataDrix Password', html, text });
  }

  if (phone) {
    const message = `DataDrix: Your password reset verification code is: ${otp}. Valid for 1 hour. Reset link: ${resetUrl}`;
    results.sms = await sendSms({ to: phone, message });
  }

  return results;
}

// 4. Password Successfully Changed Notification
async function sendPasswordChangedConfirmation({ name, email, phone }) {
  const time = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const results = { email: null, sms: null };

  if (email) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0d14; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b; padding: 24px;">
        <h2 style="color: #10b981; margin-top: 0; font-size: 18px;">✅ Password Successfully Updated</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Hello ${name}, your DataDrix account password was successfully updated on ${time}.
        </p>
        <p style="color: #94a3b8; font-size: 13px;">
          You can now <a href="${clientUrl}/login" style="color: #818cf8; text-decoration: underline;">log in with your new password</a>.
        </p>
      </div>
    `;
    const text = `DataDrix: Your account password was successfully changed at ${time}.`;
    results.email = await sendEmail({ to: email, subject: '✅ Your DataDrix Password Has Been Changed', html, text });
  }

  if (phone) {
    const message = `DataDrix Security: Your password was successfully updated at ${time}.`;
    results.sms = await sendSms({ to: phone, message });
  }

  return results;
}

function getRecentNotifications() {
  return recentNotifications;
}

module.exports = {
  sendEmail,
  sendSms,
  sendWelcomeNotification,
  sendLoginAlert,
  sendPasswordResetNotification,
  sendPasswordChangedConfirmation,
  getRecentNotifications
};
