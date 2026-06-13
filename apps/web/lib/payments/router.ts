import { monnifyProvider } from './providers/monnify';
import { paystackProvider } from './providers/paystack';
import type {
  PaymentProvider,
  PaymentProviderName,
  InitiateTransactionParams,
  InitiateTransactionResult,
  InitiateTransferParams,
  InitiateTransferResult,
  VerifyTransactionResult,
} from './types';

type WithProvider<T> = T & { provider: PaymentProviderName };

class PaymentRouter {
  private readonly providers: PaymentProvider[] = [monnifyProvider, paystackProvider];

  private getProvider(name: PaymentProviderName): PaymentProvider {
    const provider = this.providers.find(p => p.name === name);
    if (!provider) throw new Error(`Unknown payment provider: ${name}`);
    return provider;
  }

  async initiateTransaction(
    params: InitiateTransactionParams,
  ): Promise<WithProvider<InitiateTransactionResult>> {
    const errors: { provider: PaymentProviderName; error: unknown }[] = [];

    for (const provider of this.providers) {
      try {
        const result = await provider.initiateTransaction(params);
        return { ...result, provider: provider.name };
      } catch (e) {
        errors.push({ provider: provider.name, error: e });
      }
    }

    throw new Error(
      `All payment providers failed: ${errors.map(e => `${e.provider}: ${e.error}`).join('; ')}`,
    );
  }

  async initiateTransfer(
    params: InitiateTransferParams,
  ): Promise<WithProvider<InitiateTransferResult>> {
    const errors: { provider: PaymentProviderName; error: unknown }[] = [];

    for (const provider of this.providers) {
      try {
        const result = await provider.initiateTransfer(params);
        return { ...result, provider: provider.name };
      } catch (e) {
        errors.push({ provider: provider.name, error: e });
      }
    }

    throw new Error(
      `All payment providers failed: ${errors.map(e => `${e.provider}: ${e.error}`).join('; ')}`,
    );
  }

  async verifyTransaction(
    reference: string,
  ): Promise<WithProvider<VerifyTransactionResult>> {
    const errors: { provider: PaymentProviderName; error: unknown }[] = [];

    for (const provider of this.providers) {
      try {
        const result = await provider.verifyTransaction(reference);
        return { ...result, provider: provider.name };
      } catch (e) {
        errors.push({ provider: provider.name, error: e });
      }
    }

    throw new Error(
      `All payment providers failed: ${errors.map(e => `${e.provider}: ${e.error}`).join('; ')}`,
    );
  }

  validateWebhookSignature(providerName: PaymentProviderName, body: string, signature: string): boolean {
    const provider = this.getProvider(providerName);
    return provider.validateWebhookSignature(body, signature);
  }
}

export const paymentRouter = new PaymentRouter();
