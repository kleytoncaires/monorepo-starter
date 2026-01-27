import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_FRONTEND_URL, ASSETS, EMAIL_SUBJECTS, EMAIL_TEMPLATES } from '../common/constants';

interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const templatePath = path.join(__dirname, 'templates', `${options.template}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', DEFAULT_FRONTEND_URL);
    const html = template({
      ...options.context,
      logoUrl: `${frontendUrl}${ASSETS.LOGO}`,
    });

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: options.to,
      subject: options.subject,
      html,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendMail({
      to,
      subject: EMAIL_SUBJECTS.WELCOME,
      template: EMAIL_TEMPLATES.WELCOME,
      context: { name, year: new Date().getFullYear() },
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void> {
    await this.sendMail({
      to,
      subject: EMAIL_SUBJECTS.PASSWORD_RESET,
      template: EMAIL_TEMPLATES.PASSWORD_RESET,
      context: { name, resetLink, year: new Date().getFullYear() },
    });
  }

  async sendVerificationEmail(to: string, name: string, verifyLink: string): Promise<void> {
    await this.sendMail({
      to,
      subject: EMAIL_SUBJECTS.EMAIL_VERIFICATION,
      template: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
      context: { name, verifyLink, year: new Date().getFullYear() },
    });
  }
}
