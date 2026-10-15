import nodemailer from "nodemailer";

/* ---------- Transporter (reused) ---------- */
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 16-char Gmail app password
    },
  });

  return transporter;
};

/* ---------- Base send ---------- */
export const sendEmail = async ({ to, subject, html, text }) => {
  const fromName = process.env.EMAIL_FROM_NAME || "HOTEL OǴ";
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
};

/* ---------- Templates ---------- */
export const sendOtpEmail = async (to, name, otp) => {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;padding:30px;background:#f7f5f0;border-radius:14px;">
      
      <h1 style="font-family:Georgia,serif;color:#bd8b32;margin:0 0 10px;">
        HOTEL <span style="color:#e53935;">OǴ</span>
      </h1>

      <h2 style="color:#171717;margin:0 0 12px;">Hi ${name}, verify your email</h2>
      <p style="color:#555;margin:0 0 20px;">Use the one-time code below to complete your signup:</p>
      <div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#fff;color:#171717;padding:20px;text-align:center;border-radius:10px;border:1px solid #e3dfd6;">
        ${otp}
      </div>
      <p style="color:#777;font-size:12px;margin-top:20px;">
        This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `${otp} is your HOTELOǴ verification code`,
    html,
    text: `Your HOTELOǴ verification code is ${otp}. It expires in 10 minutes.`,
  });
};

export const sendWelcomeEmail = async (to, name) => {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;padding:30px;background:#f7f5f0;border-radius:14px;">
    <h1 style="font-family:Georgia,serif;color:#bd8b32;margin:0 0 10px;">
      HOTEL <span style="color:#e53935;">OǴ</span>
    </h1>      <h2 style="color:#171717;">Welcome aboard, ${name}! 🎉</h2>
      <p style="color:#555;">Your email is verified and your account is ready.</p>
      <p style="color:#555;">Start exploring handpicked stays across India.</p>
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display:inline-block;margin-top:14px;background:#bd8b32;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;">Explore stays</a>
    </div>
  `;
  return sendEmail({ to, subject: "Welcome to HOTELOǴ 🎉", html });
};

export const sendBookingConfirmationEmail = async (to, name, booking) => {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#f7f5f0;border-radius:14px;">
      
    <h1 style="font-family:Georgia,serif;color:#bd8b32;margin:0 0 10px;">
      HOTEL <span style="color:#e53935;">OǴ</span>
    </h1>

      <h2 style="color:#171717;">Booking Confirmed 🎉</h2>
     
      <p style="color:#555;">
        Hi ${name}, your stay at
        <strong>
          <span style="color:#bd8b32;">HOTEL</span>
          <span style="color:#e53935;">OǴ</span>
        </strong>
        is confirmed.
      </p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e3dfd6;">
        <tr><td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Reference</td><td style="padding:10px 16px;font-weight:700;border-bottom:1px solid #eee;">${booking.bookingId}</td></tr>
        <tr><td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Check-in</td><td style="padding:10px 16px;border-bottom:1px solid #eee;">${booking.checkIn}</td></tr>
        <tr><td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Check-out</td><td style="padding:10px 16px;border-bottom:1px solid #eee;">${booking.checkOut}</td></tr>
        <tr><td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Guests</td><td style="padding:10px 16px;border-bottom:1px solid #eee;">${booking.guests}</td></tr>
        <tr><td style="padding:10px 16px;color:#777;border-bottom:1px solid #eee;">Room</td><td style="padding:10px 16px;border-bottom:1px solid #eee;">${booking.roomType}</td></tr>
        <tr><td style="padding:10px 16px;color:#777;">Total</td><td style="padding:10px 16px;font-weight:800;color:#bd8b32;">₹${Number(booking.total).toLocaleString()}</td></tr>
      </table>
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/my-bookings" style="display:inline-block;margin-top:20px;background:#bd8b32;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;">View booking</a>
    </div>
  `;
  return sendEmail({
    to,
    subject: `Booking confirmed · ${booking.bookingId}`,
    html,
  });
};
