import { z } from 'zod';

/**
 * Auth configuration for ZeitPal
 *
 * This configures which authentication methods are enabled.
 * The actual providers are configured in lib/auth/auth.config.ts
 */

const AuthConfigSchema = z.object({
  displayTermsCheckbox: z
    .boolean({
      description: 'Whether to display the terms checkbox during sign-up.',
    })
    .optional(),
  providers: z.object({
    magicLink: z.boolean({
      description: 'Enable magic link authentication.',
    }),
    oAuth: z.array(z.enum(['google', 'microsoft'])),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // whether to display the terms checkbox during sign-up
  displayTermsCheckbox:
    process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === 'true',

  providers: {
    magicLink: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK !== 'false',
    oAuth: ['google', 'microsoft'],
  },
} satisfies z.infer<typeof AuthConfigSchema>);

export default authConfig;
