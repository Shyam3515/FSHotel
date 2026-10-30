import nodemailer from "nodemailer";

/* ---------- Transporter (reused) ---------- */
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

  // Validate environment variables
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing from backend .env");
  }

  // Gmail SMTP using port 587 and STARTTLS
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
      user: emailUser,
      pass: emailPass,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
};

/* ---------- HTML Escape ---------- */
const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

/* ---------- SMTP Connection Test ---------- */
export const testEmailConnection = async () => {
  try {
    await getTransporter().verify();

    console.log("✅ Gmail SMTP connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Gmail SMTP connection failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
    });

    return false;
  }
};

/* ---------- Base Send Email ---------- */
export const sendEmail = async ({ to, subject, html, text }) => {
  const fromName = process.env.EMAIL_FROM_NAME || "HOTEL OG";

  const fromAddress =
    process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim();

  if (!fromAddress) {
    throw new Error("EMAIL_FROM or EMAIL_USER is missing in .env");
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("📧 Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
    });

    throw error;
  }
};

/* ---------- OTP Email ---------- */
export const sendOtpEmail = async (to, name, otp) => {
  const safeName = escapeHtml(name);

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;padding:30px;background:#f7f5f0;border-radius:14px;">

      <h1 style="font-family:Georgia,serif;color:#bd8b32;margin:0 0 10px;">
        HOTEL <span style="color:#e53935;">OG</span>
      </h1>

      <h2 style="color:#171717;margin:0 0 12px;">
        Hi ${safeName}, verify your email
      </h2>

      <p style="color:#555;margin:0 0 20px;">
        Use the one-time code below to complete your signup:
      </p>

      <div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#fff;color:#171717;padding:20px;text-align:center;border-radius:10px;border:1px solid #e3dfd6;">
        ${escapeHtml(otp)}
      </div>

      <p style="color:#777;font-size:12px;margin-top:20px;">
        This code expires in <strong>10 minutes</strong>.
        If you didn't request this, ignore this email.
      </p>

    </div>
  `;

  return sendEmail({
    to,
    subject: `${otp} is your HOTEL OG verification code`,
    html,
    text: `Your HOTEL OG verification code is ${otp}. It expires in 10 minutes.`,
  });
};

/* ---------- Welcome Email ---------- */
export const sendWelcomeEmail = async (to, name) => {
  const safeName = escapeHtml(name);

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;padding:30px;background:#f7f5f0;border-radius:14px;">

      <h1 style="font-family:Georgia,serif;color:#bd8b32;margin:0 0 10px;">
        HOTEL <span style="color:#e53935;">OG</span>
      </h1>

      <h2 style="color:#171717;">
        Welcome aboard, ${safeName}! 🎉
      </h2>

      <p style="color:#555;">
        Your email is verified and your account is ready.
      </p>

      <p style="color:#555;">
        Start exploring handpicked stays across India.
      </p>

      <a href="${clientUrl}"
        style="display:inline-block;margin-top:14px;background:#bd8b32;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;">
        Explore stays
      </a>

    </div>
  `;

  return sendEmail({
    to,
    subject: "Welcome to HOTEL OG 🎉",
    html,
    text: `Welcome to HOTEL OG, ${name}! Your account is ready.`,
  });
};

/* ---------- Booking Confirmation Email ---------- */
export const sendBookingConfirmationEmail = async (to, name, booking) => {
  const safeName = escapeHtml(name);

  const safeBookingId = escapeHtml(booking.bookingId);
  const safeCheckIn = escapeHtml(booking.checkIn);
  const safeCheckOut = escapeHtml(booking.checkOut);
  const safeGuests = escapeHtml(booking.guests);
  const safeRoomType = escapeHtml(booking.roomType);

  const total = Number(booking.total);

  if (!Number.isFinite(total)) {
    throw new Error("Invalid booking total");
  }

  const formattedTotal = total.toLocaleString("en-IN");

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#f7f5f0;border-radius:14px;">

      <h1 style="font-family:Georgia,serif;color:#bd8b32;margin:0 0 10px;">
        HOTEL <span style="color:#e53935;">OG</span>
      </h1>

      <h2 style="color:#171717;">
        Booking Confirmed 🎉
      </h2>

      <p style="color:#555;">
        Hi ${safeName}, your stay at HOTEL OG is confirmed.
      </p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e3dfd6;">

        <tr>
          <td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Reference</td>
          <td style="padding:10px 16px;font-weight:700;border-bottom:1px solid #eee;">${safeBookingId}</td>
        </tr>

        <tr>
          <td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Check-in</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eee;">${safeCheckIn}</td>
        </tr>

        <tr>
          <td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Check-out</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eee;">${safeCheckOut}</td>
        </tr>

        <tr>
          <td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Guests</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eee;">${safeGuests}</td>
        </tr>

        <tr>
          <td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Room</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eee;">${safeRoomType}</td>
        </tr>

        <tr>
          <td style="padding:10px 16px;color:#777;">Total</td>
          <td style="padding:10px 16px;font-weight:800;color:#bd8b32;">
            ₹${formattedTotal}
          </td>
        </tr>

      </table>

      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/my-bookings"
        style="display:inline-block;margin-top:20px;background:#bd8b32;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;">
        View booking
      </a>

    </div>
  `;

  return sendEmail({
    to,
    subject: `Booking confirmed - ${booking.bookingId}`,
    html,
    text: `Hi ${name}, your HOTEL OG booking ${booking.bookingId} is confirmed. Total: ₹${formattedTotal}.`,
  });
};
