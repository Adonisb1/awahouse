import { paystackClient, validatePaystackSignature } from '@/lib/paystack/client';
import type {
  PaymentProvider,
  InitiateTransactionParams,
  InitiateTransactionResult,
  InitiateTransferParams,
  InitiateTransferResult,
  VerifyTransactionResult,
} from '../types';

export const paystackProvider: PaymentProvider = {
  name: 'paystack',

  async initiateTransaction(params: InitiateTransactionParams): Promise<InitiateTransactionResult> {
    const charge = await paystackClient.initiateCharge(
      params.amountKobo,
      params.customerEmail,
      params.reference,
      params.redirectUrl,
    );
    return {
      checkoutUrl: charge.authorizationUrl,
      transactionReference: charge.reference,
    };
  },

  async initiateTransfer(params: InitiateTransferParams): Promise<InitiateTransferResult> {
    return { success: true, transferReference: params.reference };
  },

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    const result = await paystackClient.verifyTransaction(reference);
    return {
      status: result.status,
      amount: result.amount,
    };
  },

  validateWebhookSignature(body: string, signature: string): boolean {
    return validatePaystackSignature(body, signature);
  },
};
