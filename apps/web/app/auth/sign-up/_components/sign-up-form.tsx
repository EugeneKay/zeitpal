'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Trans } from '@kit/ui/trans';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Checkbox } from '@kit/ui/checkbox';
import { AlertCircle, Mail, Loader2 } from 'lucide-react';

import pathsConfig from '~/config/paths.config';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleOAuthSignIn = async (provider: string) => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setIsLoading(provider);
    setError(null);

    try {
      await signIn(provider, {
        callbackUrl: '/home',
      });
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(null);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setIsLoading('email');
    setError(null);

    try {
      const result = await signIn('mailgun', {
        email,
        callbackUrl: '/home',
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to send magic link. Please try again.');
      } else {
        setEmailSent(true);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
          <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold">
          <Trans i18nKey={'auth:sendLinkSuccess'} />
        </h3>
        <p className="text-sm text-muted-foreground">
          <Trans i18nKey={'auth:sendLinkSuccessDescription'} />
        </p>
        <Button
          variant="outline"
          onClick={() => setEmailSent(false)}
          className="mt-4"
        >
          <Trans i18nKey={'auth:getNewLink'} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Providers */}
      <div className="flex flex-col space-y-3">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading !== null}
          className="w-full"
        >
          {isLoading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <Trans i18nKey={'auth:signUpWithProvider'} values={{ provider: 'Google' }} />
        </Button>

        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('microsoft-entra-id')}
          disabled={isLoading !== null}
          className="w-full"
        >
          {isLoading === 'microsoft-entra-id' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M1 13h10v10H1z" />
              <path fill="#7fba00" d="M13 1h10v10H13z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
          )}
          <Trans i18nKey={'auth:signUpWithProvider'} values={{ provider: 'Microsoft' }} />
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            <Trans i18nKey={'auth:orContinueWith'} />
          </span>
        </div>
      </div>

      {/* Magic Link */}
      <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            <Trans i18nKey={'account:emailLabel'} />
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ihre@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading !== null}
          />
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            disabled={isLoading !== null}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            <Trans
              i18nKey={'auth:acceptTerms'}
              components={{
                terms: (
                  <Link
                    href={pathsConfig.legal.termsOfService}
                    className="underline hover:text-primary"
                    target="_blank"
                  />
                ),
                privacy: (
                  <Link
                    href={pathsConfig.legal.privacyPolicy}
                    className="underline hover:text-primary"
                    target="_blank"
                  />
                ),
              }}
            />
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading !== null || !email || !termsAccepted}
        >
          {isLoading === 'email' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          <Trans i18nKey={'auth:sendEmailLink'} />
        </Button>
      </form>
    </div>
  );
}
