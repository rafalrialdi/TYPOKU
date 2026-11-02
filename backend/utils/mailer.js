const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
  port: parseInt((process.env.SMTP_PORT || '587').toString().trim(), 10),
  secure: (process.env.SMTP_PORT || '587').toString().trim() === '465',
  auth: {
    user: (process.env.SMTP_USER || '').trim(),
    pass: (process.env.SMTP_PASS || '').trim(),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const mailFrom = (process.env.MAIL_FROM || 'TypoKu <no-reply@typoku.id>').replace(/"/g, '').trim();

  const mailOptions = {
    from: mailFrom,
    to: toEmail,
    subject: 'Pemulihan Kata Sandi TypoKu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">TypoKu</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Academic Writing Assistant</p>
        </div>
        <p style="color: #111827; font-size: 15px; line-height: 1.6;">Halo,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Kami menerima permintaan untuk mereset kata sandi akun TypoKu Anda. Silakan klik tombol di bawah untuk membuat kata sandi baru:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            Atur Ulang Kata Sandi
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          Tautan ini hanya berlaku selama 60 menit. Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini dan akun Anda tetap aman.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          TypoKu &bull; Platform AI untuk Penulisan Skripsi &amp; Jurnal Bereputasi
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  sendPasswordResetEmail,
};
