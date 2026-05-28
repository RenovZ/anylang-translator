import { z } from 'zod';

import {
  ALL_PROVIDER_TYPES,
  BUILTIN_PROVIDERS,
  COMPATIBLE_PROVIDERS,
  CUSTOM_PROVIDER_TYPES,
  LLM_PROVIDER_TYPES,
  OPENAI_COMPATIBLE_PROVIDER
} from '@/preset/provider';

import { featuresSchema } from './feature';

// Provider types
export const aiProviderTypeSchema = z.enum(['go', 'zen', 'custom']);
export type AIProviderType = z.infer<typeof aiProviderTypeSchema>;

export const providerTypeSchema = z.enum(ALL_PROVIDER_TYPES);
export type ProviderType = z.infer<typeof providerTypeSchema>;

export const llmProviderTypeSchema = z.enum(LLM_PROVIDER_TYPES);
export type LLMProviderType = z.infer<typeof llmProviderTypeSchema>;
export function isLLMProvider(config: Pick<ProviderConfig, 'provider'>): config is AIProvider {
  return LLM_PROVIDER_TYPES.includes(config.provider);
}
export function isCompatibleProvider(
  config: Pick<ProviderConfig, 'provider'>
): config is AIProvider {
  return COMPATIBLE_PROVIDERS.some((p) => p.provider === config.provider);
}

export const customProviderTypeSchema = z.enum(CUSTOM_PROVIDER_TYPES);
export type CustomProviderType = z.infer<typeof customProviderTypeSchema>;
export function isCustomProvider(config: Pick<ProviderConfig, 'type'>): config is CustomProvider {
  return config.type === 'custom';
}

export function isPaidProvider(
  config: Pick<ProviderConfig, 'type'>
): config is GoProvider | ZenProvider {
  return config.type === 'go' || config.type === 'zen';
}

const baseProviderSchema = z.object({
  provider: providerTypeSchema,
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  features: featuresSchema
});

export const freeProviderSchema = baseProviderSchema.extend({
  type: z.literal('free')
});
export type FreeProvider = z.infer<typeof freeProviderSchema>;

export const goProviderSchema = baseProviderSchema.extend({
  type: z.literal('go'),
  model: z.string(),
  temperature: z.number().min(0).optional()
});
export type GoProvider = z.infer<typeof goProviderSchema>;

export const zenProviderSchema = goProviderSchema.extend({
  type: z.literal('zen')
});
export type ZenProvider = z.infer<typeof zenProviderSchema>;

function createCustomProviderSchema(
  providers: readonly { provider: ProviderType; models: readonly string[] }[],
  options: { baseUrlRequired?: boolean; name: string }
) {
  const modelSchema = z.object({
    name: z.string().optional(),
    isCustom: z.boolean()
  });

  const customProviderSchema = baseProviderSchema.extend({
    type: z.literal('custom'),
    apiKey: z.string().optional(),
    baseURL: z.string().optional(),
    temperature: z.number().min(0).optional(),
    providerOptions: z.record(z.string(), z.any()).optional(),
    connectionOptions: z.record(z.string(), z.any()).optional(),
    headers: z.record(z.string(), z.any()).optional(),
    model: modelSchema
  });
  type CustomProvider = z.infer<typeof customProviderSchema>;

  const createProviderValidations = (
    providers: readonly { provider: ProviderType; models: readonly string[] }[]
  ) => {
    return {
      provider: (data: CustomProvider) =>
        (providers.map((p) => p.provider) as readonly string[]).includes(data.provider),
      model: (data: CustomProvider) => {
        if (!data.model.name) return true;
        const provider = providers.find((p) => p.provider === data.provider);
        if (!provider) return true;
        if (data.provider === OPENAI_COMPATIBLE_PROVIDER || data.model.isCustom) {
          return data.model.name.trim().length > 0;
        }
        return (provider.models as readonly string[]).includes(data.model.name);
      }
    } as const;
  };

  const { provider, model } = createProviderValidations(providers);

  if (options.baseUrlRequired) {
    return customProviderSchema
      .required({ baseURL: true })
      .refine(provider, { message: `Invalid ${options.name} provider`, path: ['provider'] })
      .refine(model, {
        message: `Model not available for this ${options.name} provider`,
        path: ['model']
      });
  }

  return customProviderSchema
    .refine(provider, { message: `Invalid ${options.name} provider`, path: ['provider'] })
    .refine(model, {
      message: `Model not available for this ${options.name} provider`,
      path: ['model']
    });
}

export const builtinProviderSchema = createCustomProviderSchema(BUILTIN_PROVIDERS, {
  name: 'builtin'
});
export const compatibleProviderSchema = createCustomProviderSchema(COMPATIBLE_PROVIDERS, {
  baseUrlRequired: true,
  name: OPENAI_COMPATIBLE_PROVIDER
});
export const customProviderSchema = z.union([builtinProviderSchema, compatibleProviderSchema]);
export type CustomProvider = z.infer<typeof customProviderSchema>;

export const aiProviderSchema = z.union([
  goProviderSchema,
  zenProviderSchema,
  customProviderSchema
]);
export type AIProvider = z.infer<typeof aiProviderSchema>;

// Provider union type with custom type to match existing usage
export const providerSchema = z.union([freeProviderSchema, aiProviderSchema]);
export type ProviderConfig = FreeProvider | AIProvider;

/**
 * Shape of a provider preset template (BUILTIN_PROVIDERS / COMPATIBLE_PROVIDERS).
 * These are NOT runtime Provider configs — they're UI templates that get
 * converted into a CustomProvider when the user adds one.
 */
export interface PresetItem {
  provider: ProviderType;
  models: readonly string[];
  name: string;
  icon: string;
  company?: string;
}
