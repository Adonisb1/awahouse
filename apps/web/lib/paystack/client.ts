type ChargeResponse = {
  success: boolean;
  accessCode: string;
  reference: string;
  authorizationUrl: string;
};

type TransferResponse = {
  success: boolean;
  transferCode: string;
  reference: string;
};

type TransferRecipientResponse = {
  success: boolean;
  recipientCode: string;
};

type VerifyResponse = {
  success: boolean;
  status: 'success' | 'failed' | 'pending';
  amount: bigint;
};

class PaystackClient {
  async initiateCharge(
    amountKobo: bigint,
    email: string,
    reference: string,
    callbackUrl?: string,
  ): Promise<ChargeResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY.');
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amountKobo),
        email,
        reference,
        callback_url: callbackUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/escrow`,
      }),
    });

    const data = await response.json() as { status: boolean; data: { access_code: string; reference: string; authorization_url: string } };
    return {
      success: data.status,
      accessCode: data.data.access_code,
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
    };
  }

  async initiateTransfer(
    amountKobo: bigint,
    recipientCode: string,
    reference: string,
  ): Promise<TransferResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY.');
    }

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amountKobo),
        recipient: recipientCode,
        reference,
      }),
    });

    const data = await response.json() as { status: boolean; data: { transfer_code: string; reference: string } };
    return {
      success: data.status,
      transferCode: data.data.transfer_code,
      reference: data.data.reference,
    };
  }

  async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<TransferRecipientResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY.');
    }

    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    const data = await response.json() as { status: boolean; data: { recipient_code: string } };
    return {
      success: data.status,
      recipientCode: data.data.recipient_code,
    };
  }

  async verifyTransaction(reference: string): Promise<VerifyResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY.');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json() as {
      status: boolean;
      data: { status: string; amount: number };
    };

    return {
      success: data.status,
      status: data.data.status as 'success' | 'failed' | 'pending',
      amount: BigInt(data.data.amount),
    };
  }
}

export const paystackClient = new PaystackClient();

import crypto from 'crypto';

export function validatePaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY ?? '')
    .update(body)
    .digest('hex');
  return hash === signature;
}
