import crypto from 'crypto';

type TokenData = {
  access_token: string;
  expires_at: number;
};

type InitTransactionResponse = {
  requestSuccessful: boolean;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    checkoutUrl: string;
  };
};

type QueryTransactionResponse = {
  requestSuccessful: boolean;
  responseBody: {
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REVERSED';
    amount: number;
  };
};

type SingleTransferResponse = {
  requestSuccessful: boolean;
  responseBody: {
    reference: string;
  };
};

class MonnifyClient {
  private token: TokenData | null = null;

  private get baseUrl(): string {
    return process.env.MONNIFY_BASE_URL ?? 'https://sandbox.monnify.com';
  }

  private get apiKey(): string {
    return process.env.MONNIFY_API_KEY ?? '';
  }

  private get secretKey(): string {
    return process.env.MONNIFY_SECRET_KEY ?? '';
  }

  get contractCode(): string {
    return process.env.MONNIFY_CONTRACT_CODE ?? '';
  }

  private isConfigured(): boolean {
    return !!(this.apiKey && this.secretKey && this.contractCode);
  }

  async authenticate(): Promise<string> {
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    if (!this.isConfigured()) {
      throw new Error('Monnify is not configured. Set MONNIFY_API_KEY, MONNIFY_SECRET_KEY, and MONNIFY_CONTRACT_CODE.');
    }

    const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}` },
    });

    if (!response.ok) {
      throw new Error(`Monnify auth failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { requestSuccessful: boolean; responseBody: { accessToken: string; expiresIn: number } };
    if (!data.requestSuccessful) {
      throw new Error('Monnify auth returned unsuccessful');
    }

    this.token = {
      access_token: data.responseBody.accessToken,
      expires_at: Date.now() + (data.responseBody.expiresIn - 60) * 1000,
    };

    return this.token.access_token;
  }

  private async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Monnify is not configured. Set MONNIFY_API_KEY, MONNIFY_SECRET_KEY, and MONNIFY_CONTRACT_CODE.');
    }

    const token = await this.authenticate();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null;
      }
      throw new Error(`Monnify API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async initiateTransaction(
    amountKobo: bigint,
    customerEmail: string,
    customerName: string,
    paymentReference: string,
    redirectUrl: string,
  ): Promise<{ transactionReference: string; checkoutUrl: string }> {
    const data = await this.request<InitTransactionResponse>('/api/v1/merchant/transactions/init-transaction', {
      amount: Number(amountKobo),
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription: 'Awahouse property escrow payment',
      currencyCode: 'NGN',
      contractCode: this.contractCode,
      redirectUrl,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
    });

    return {
      transactionReference: data.responseBody.transactionReference,
      checkoutUrl: data.responseBody.checkoutUrl,
    };
  }

  async queryTransaction(paymentReference: string): Promise<{ paymentStatus: string; amount: number }> {
    const data = await this.request<QueryTransactionResponse>('/api/v1/merchant/transactions/query', {
      paymentReference,
    });

    return {
      paymentStatus: data.responseBody.paymentStatus,
      amount: data.responseBody.amount,
    };
  }

  async singleTransfer(
    amountKobo: bigint,
    bankCode: string,
    accountNumber: string,
    accountName: string,
    narration: string,
    reference: string,
  ): Promise<{ success: boolean; reference: string }> {
    const data = await this.request<SingleTransferResponse>('/api/v1/disbursements/single', {
      amount: Number(amountKobo),
      reference,
      narration,
      bankCode,
      accountNumber,
      accountName,
      currency: 'NGN',
    });

    return {
      success: data.requestSuccessful,
      reference: data.responseBody.reference,
    };
  }

  validateWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHash('sha512')
      .update(this.secretKey + body)
      .digest('hex');
    return hash === signature;
  }
}

export const monnifyClient = new MonnifyClient();
