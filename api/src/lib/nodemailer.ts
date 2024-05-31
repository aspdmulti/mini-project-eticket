/** @format */

import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  auth: {
    user: process.env.nodemailer_email,
    pass: process.env.nodemailer_password,
  },
  host: "smtp.gmail.com",
  service: "gmail",
});

export type mailer = {
  subject: string | undefined;
  html: string | undefined;
  to: string | undefined;
  text: string | undefined;
};

export const mailer = async ({ subject, html, to, text }: mailer) => {
  await transport.sendMail({
    subject: String(subject) || "testing",
    html: String(html) || "<h1> send through api </h1>",
    to: String(to) || "udin@gmail.com",
    text: String(text) || "hello ridwan",
  });
};
