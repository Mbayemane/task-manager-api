import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendResetCode(email: string, code: string): Promise<void> {
    await this.resend.emails.send({
      from: "Task Manager <onboarding@resend.dev>",
      to: email,
      subject: "Reinitialisation de votre mot de passe",
      html: "<div style=\"font-family:Arial;max-width:600px;margin:0 auto\"><div style=\"background:#1E3A5F;padding:20px;text-align:center\"><h1 style=\"color:white\">Task Manager</h1></div><div style=\"padding:30px;background:#F0F4F8\"><h2 style=\"color:#1E293B\">Reinitialisation de mot de passe</h2><p>Votre code de verification est :</p><div style=\"background:#2563EB;color:white;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:10px;letter-spacing:8px\">" + code + "</div><p>Ce code expire dans 15 minutes.</p></div></div>",
    });
  }
}
