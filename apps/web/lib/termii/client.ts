const NIGERIAN_PHONE_REGEX = /^\+234\d{10}$/;

type TermiiResponse = { success: boolean; messageId?: string };

class TermiiClient {
  async sendSms(phone: string, message: string): Promise<TermiiResponse> {
    if (!NIGERIAN_PHONE_REGEX.test(phone)) {
      return { success: false };
    }

    if (!process.env.TERMII_API_KEY) {
      throw new Error('Termii is not configured. Set TERMII_API_KEY.');
    }

    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        to: phone,
        from: process.env.TERMII_SENDER_ID ?? 'AwaHouse',
        sms: message.slice(0, 160),
        type: 'plain',
        channel: 'generic',
      }),
    });

    const data = await response.json() as { message_id?: string };
    return { success: true, messageId: data.message_id };
  }
}

export const termiiClient = new TermiiClient();
