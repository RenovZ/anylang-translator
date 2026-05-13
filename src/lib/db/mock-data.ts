import db from '.';

import { faker } from '@faker-js/faker';

import logger from '@/lib/logger';
import { BUILTIN_PROVIDERS, LLM_PROVIDER_TYPES } from '@/preset/provider';

import { REQUEST_RECORD_MAX_AGE_DAYS, REQUEST_RECORD_MAX_COUNT } from './cleanup';

export async function generateMockBatchRequestRecords(
  count = REQUEST_RECORD_MAX_COUNT,
  daysBack = REQUEST_RECORD_MAX_AGE_DAYS
) {
  const records = Array.from({ length: count }, () => {
    const provider = faker.helpers.arrayElement(LLM_PROVIDER_TYPES);
    const models = BUILTIN_PROVIDERS.find((p) => p.provider === provider)?.models ?? [];

    return {
      key: faker.string.uuid(),
      createdAt: faker.date.recent({ days: daysBack }),
      originalRequestCount: faker.number.int({ min: 1, max: 8 }),
      provider,
      model: faker.helpers.arrayElement(models)
    };
  });

  await db.batchRequestRecord.bulkAdd(records);
  logger.info(`✅ Generated ${count} mock batch request records`);
}

/**
 * Clear all batch request records from the database
 */
export async function clearMockData() {
  await db.batchRequestRecord.clear();
  logger.info('🗑️  Cleared all batch request records');
}
