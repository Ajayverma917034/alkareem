import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true only for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Fail fast on boot instead of on first email send
transporter.verify((err) => {
    if (err) console.error("SMTP connection failed:", err.message);
    else console.log("SMTP server ready to send emails");
});

export const sendEmail = async ({ to, subject, html }) => {

    console.log({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        passSet: !!process.env.SMTP_PASS,
    });
    if (!to || !subject || !html) {
        throw new Error("sendEmail: 'to', 'subject' and 'html' are required");
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"All Kareem Tarbiyat" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        console.error("sendEmail error:", error.message);
        throw error; // let the caller decide how to respond to the client
    }
};