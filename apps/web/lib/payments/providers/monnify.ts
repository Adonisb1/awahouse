import { monnifyClient } from '@/lib/monnify/client';
import type {
  PaymentProvider,
  InitiateTransactionParams,
  InitiateTransactionResult,
  InitiateTransferParams,
  InitiateTransferResult,
  VerifyTransactionResult,
} from '../types';

export const monnifyProvider: PaymentProvider = {
  name: 'monnify',

  async initiateTransaction(params: InitiateTransactionParams): Promise<InitiateTransactionResult> {
    const result = await monnifyClient.initiateTransaction(
      params.amountKobo,
      params.customerEmail,
      params.customerName ?? params.customerEmail,
      params.reference,
      params.redirectUrl ?? '',
    );
    return {
      checkoutUrl: result.checkoutUrl,
      transactionReference: result.transactionReference,
    };
  },

  async initiateTransfer(params: InitiateTransferParams): Promise<InitiateTransferResult> {
    const result = await monnifyClient.singleTransfer(
      params.amountKobo,
      params.bankCode,
      params.accountNumber,
      params.accountName,
      params.narration,
      params.reference,
    );
    return {
      success: result.success,
      transferReference: result.reference,
    };
  },

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    const result = await monnifyClient.queryTransaction(reference);
    const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
      PAID: 'success',
      PENDING: 'pending',
      FAILED: 'failed',
      REVERSED: 'failed',
    };
    return {
      status: statusMap[result.paymentStatus] ?? 'pending',
      amount: BigInt(result.amount),
    };
  },

  validateWebhookSignature(body: string, signature: string): boolean {
    return monnifyClient.validateWebhookSignature(body, signature);
  },
};
