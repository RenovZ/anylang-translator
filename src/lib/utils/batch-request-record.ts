import cryptoPolyfill from '@/lib/crypto-polyfill';
import db from '@/lib/db';
import logger from '@/lib/logger';
import { isLLMProvider } from '@/types/provider';
import type { ProviderConfig } from '@/types/provider';

export async function putBatchRequestRecord({
  originalRequestCount,
  providerConfig
}: {
  originalRequestCount: number;
  providerConfig: ProviderConfig;
}) {
  if (!isLLMProvider(providerConfig)) return;

  const { provider, model } = providerConfig;

  try {
    await db.batchRequestRecord.put({
      key: cryptoPolyfill.getUUID(),
      createdAt: new Date(),
      originalRequestCount,
      provider,
      model
    });
  } catch (error) {
    logger.error('Failed to put batch request record', { error });
  }
}
