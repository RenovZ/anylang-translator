import { z } from 'zod';

import {
  BUILTIN_PROVIDERS,
  COMPATIBLE_PROVIDERS,
  OPENAI_COMPATIBLE_PROVIDER
} from '@/preset/provider';

import { featuresSchema } from './feature';
import { promptSchema } from './prompt';

// Provider types
export const aiProviderTypeSchema = z.enum(['go', 'zen', 'custom']);
export type AIProviderType = z.infer<typeof aiProviderTypeSchema>;

const providerConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  features: featuresSchema
});

export const freeProviderSchema = providerConfigSchema.extend({
  type: z.literal('free')
});
export type FreeProvider = z.infer<typeof freeProviderSchema>;

export const goProviderSchema = providerConfigSchema.extend({
  type: z.literal('go'),
  model: z.string(),
  temperature: z.number().min(0).optional()
  // prompt: promptSchema
  //   .pick({
  //     system: true,
  //     prompt: true,
  //     output: true
  //   })
  //   .partial()
});
export type GoProvider = z.infer<typeof goProviderSchema>;

export const zenProviderSchema = goProviderSchema.extend({
  type: z.literal('zen')
});
export type ZenProvider = z.infer<typeof zenProviderSchema>;

function createCustomProviderSchema(
  providers: readonly { provider: string; models: readonly string[] }[],
  options: { baseUrlRequired?: boolean; name: string }
) {
  const customProviderSchema = providerConfigSchema.extend({
    type: z.literal('custom'),
    apiKey: z.string().optional(),
    baseURL: z.string().optional(),
    temperature: z.number().min(0).optional(),
    providerOptions: z.record(z.string(), z.any()).optional(),
    connectionOptions: z.record(z.string(), z.any()).optional(),
    provider: z.string(),
    model: z.string(),
    prompt: promptSchema.pick({
      system: true,
      prompt: true,
      output: true
    })
  });
  type CustomProvider = z.infer<typeof customProviderSchema>;

  const createProviderValidations = (
    providers: readonly { provider: string; models: readonly string[] }[]
  ) => {
    return {
      provider: (data: CustomProvider) =>
        (providers.map((p) => p.provider) as readonly string[]).includes(data.provider),
      model: (data: CustomProvider) => {
        const provider = providers.find((p) => p.provider === data.provider);
        if (!provider) return true;
        if (data.provider === OPENAI_COMPATIBLE_PROVIDER) {
          return data.model.trim().length > 0;
        }
        return (provider.models as readonly string[]).includes(data.model);
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
export type Provider = FreeProvider | AIProvider;

/**
 * Shape of a provider preset template (BUILTIN_PROVIDERS / COMPATIBLE_PROVIDERS).
 * These are NOT runtime Provider configs — they're UI templates that get
 * converted into a CustomProvider when the user adds one.
 */
export interface PresetItem {
  provider: string;
  models: readonly string[];
  name: string;
  icon: string;
  company?: string;
}
