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
      return {
        success: true,
        accessCode: 'stub_access_code',
        reference,
        authorizationUrl: `https://checkout.paystack.com/stub/${reference}`,
      };
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
      return { success: true, transferCode: 'stub_transfer', reference };
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

  async verifyTransaction(reference: string): Promise<VerifyResponse> {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return { success: true, status: 'success', amount: 0n };
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
