import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: "gmail",
    auth: {
      user: "vhandle4u@gmail.com",
      pass: "rbalaymvfgnlskwt",
    },
  });

  await transporter.sendMail({
    to,
    subject,
    text,
  });
};
