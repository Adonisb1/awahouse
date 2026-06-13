export type PaymentProviderName = 'monnify' | 'paystack';

export interface InitiateTransactionParams {
  amountKobo: bigint;
  customerEmail: string;
  customerName?: string;
  reference: string;
  redirectUrl?: string;
}

export interface InitiateTransactionResult {
  checkoutUrl: string;
  transactionReference: string;
}

export interface InitiateTransferParams {
  amountKobo: bigint;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  narration: string;
  reference: string;
}

export interface InitiateTransferResult {
  success: boolean;
  transferReference: string;
}

export interface VerifyTransactionResult {
  status: 'success' | 'pending' | 'failed';
  amount?: bigint;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  initiateTransaction(_params: InitiateTransactionParams): Promise<InitiateTransactionResult>;
  initiateTransfer(_params: InitiateTransferParams): Promise<InitiateTransferResult>;
  verifyTransaction(_reference: string): Promise<VerifyTransactionResult>;
  validateWebhookSignature(_body: string, _signature: string): boolean;
}
