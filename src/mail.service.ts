import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendResetCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: "Task Manager <" + process.env.MAIL_USER + ">",
      to: email,
      subject: "Reinitialisation de votre mot de passe",
      html: "<div><h1>Task Manager</h1><p>Votre code : </p><h2>" + code + "</h2><p>Expire dans 15 minutes.</p></div>",
    });
  }
}