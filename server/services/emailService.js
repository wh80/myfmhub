import nodemailer from "nodemailer";
import { htmlToText } from "html-to-text";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { generateSecureToken } from "../utils/generalUtils.js";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

console.log("USER:", process.env.MAILTRAP_USERNAME);
console.log("PASS:", process.env.MAILTRAP_PASSWORD);

export function renderTemplate(templateName, data) {
  const filePath = path.join(process.cwd(), "templates", `${templateName}.hbs`);
  const templateSource = fs.readFileSync(filePath, "utf-8");
  const template = Handlebars.compile(templateSource);
  return template(data);
}

export async function sendJobNotificationEmail(data) {
  try {
    const token = await generateSecureToken();

    const acceptUrl = `${process.env.APP_URL}/jobs/${data.jobId}/accept-assignment?token=${token}`;
    const rejectUrl = `${process.env.APP_URL}/jobs/${data.jobId}/reject-assignment?token=${token}`;

    const templateData = { acceptUrl, rejectUrl, ...data };
    const html = renderTemplate("jobNotification", templateData);
    const text = htmlToText(html);
    await transporter.sendMail({
      from: '"MyFmHub',
      to: data.email,
      subject: "You have been assigned a new job",
      text,
      html,
    });
  } catch (error) {
    console.error("Failed to send job notification email:", error);
    throw error;
  }
}

export async function sendAssignmentRecallEmail(data) {
  try {
    const templateData = { data };
    const html = renderTemplate("jobNotification", templateData);
    const text = htmlToText(html);
    await transporter.sendMail({
      from: '"MyFmHub',
      to: data.email,
      subject: "An assignment has been recalled",
      text,
      html,
    });
  } catch (error) {
    console.error("Failed to send assignment recall email:", error);
    throw error;
  }
}
