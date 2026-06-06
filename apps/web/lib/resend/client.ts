type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

class ResendClient {
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
    if (!process.env.RESEND_API_KEY) {
      return { success: true };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Awahouse <noreply@awahouse.com>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    return { success: response.ok };
  }
}

export const resendClient = new ResendClient();
