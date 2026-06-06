import { prisma } from '@awahouse/db';
import { termiiClient } from '@/lib/termii/client';
import { resendClient } from '@/lib/resend/client';

type NotificationPayload = {
  userId: string;
  title: string;
  body: string;
  link?: string;
};

type EmailTemplate = 'EscrowReceived' | 'FundsReleased' | 'DocumentsVerified' | 'DisputeRaised' | 'InstalmentPaid' | 'InstalmentMissed' | 'ListingApproved' | 'PaymentAgreement';

const EMAIL_SUBJECTS: Record<EmailTemplate, string> = {
  EscrowReceived: 'Payment Received – Awahouse',
  FundsReleased: 'Funds Released – Awahouse',
  DocumentsVerified: 'Documents Verified – Awahouse',
  DisputeRaised: 'Dispute Raised – Awahouse',
  InstalmentPaid: 'Instalment Paid – Awahouse',
  InstalmentMissed: 'Instalment Missed – Awahouse',
  ListingApproved: 'Listing Approved – Awahouse',
  PaymentAgreement: 'Payment Agreement – Awahouse',
};

export class NotificationService {
  async sendSms(phone: string, message: string) {
    await termiiClient.sendSms(phone, message);
  }

  async sendEmail(to: string, template: EmailTemplate, data: Record<string, unknown>) {
    const subject = EMAIL_SUBJECTS[template];
    const html = this._buildEmailHtml(template, data);
    await resendClient.sendEmail({ to, subject, html });
  }

  async sendInApp(userId: string, title: string, body: string, link?: string) {
    await prisma.notification.create({
      data: { userId, title, body, link },
    });
  }

  async sendAll(
    channels: ('sms' | 'email' | 'in_app')[],
    payload: NotificationPayload & { phone?: string; email?: string },
  ) {
    const promises: Promise<unknown>[] = [];

    if (channels.includes('in_app')) {
      promises.push(
        this.sendInApp(payload.userId, payload.title, payload.body, payload.link),
      );
    }
    if (channels.includes('sms') && payload.phone) {
      promises.push(this.sendSms(payload.phone, payload.body));
    }
    if (channels.includes('email') && payload.email) {
      promises.push(
        this.sendEmail(payload.email, payload.title as EmailTemplate, { body: payload.body }),
      );
    }

    await Promise.allSettled(promises);
  }

  async listNotifications(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  async markRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  private _buildEmailHtml(template: string, _data: Record<string, unknown>): string {
    return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:#C4531C">Awahouse</h1>
      <p>${template} notification from Awahouse.</p>
      <hr style="border:none;border-top:1px solid #EDE3D0" />
      <p style="color:#8A3A10;font-size:12px">© Awahouse. Verified property marketplace.</p>
    </div>`;
  }
}

export const notificationService = new NotificationService();
