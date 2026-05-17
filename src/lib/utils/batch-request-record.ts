import cryptoPolyfill from '@/lib/crypto-polyfill';
import db from '@/lib/db';
import logger from '@/lib/logger';
import { isLLMProvider, isPaidProvider } from '@/types/provider';
import type { ProviderConfig } from '@/types/provider';

export async function putBatchRequestRecord({
  originalRequestCount,
  providerConfig
}: {
  originalRequestCount: number;
  providerConfig: ProviderConfig;
}) {
  if (!isLLMProvider(providerConfig)) return;

  if (isPaidProvider(providerConfig)) {
    throw new Error('putBatchRequestRecord: go/zen provider not implemented');
  }

  const { provider, model } = providerConfig;
  if (!model.name) {
    throw new Error('putBatchRequestRecord: model must be provided');
  }

  try {
    await db.batchRequestRecord.put({
      key: cryptoPolyfill.getUUID(),
      createdAt: new Date(),
      originalRequestCount,
      provider,
      model: model.name
    });
  } catch (error) {
    logger.error('Failed to put batch request record', { error });
  }
}
