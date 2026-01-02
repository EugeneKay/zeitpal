'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { AppLogo } from '~/components/app-logo';
import { getCsrfToken } from '~/lib/utils/csrf';

interface InviteDetails {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  inviterName: string;
  expiresAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Fetch invite details
  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/invite/${token}`);
        const json = await response.json();

        if (!response.ok) {
          setError(json.error || 'Failed to load invite');
          return;
        }

        // API returns { data: { ... } }
        setInvite(json.data);
      } catch {
        setError('Failed to load invite');
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  const handleAcceptInvite = async () => {
    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invite');
        return;
      }

      setAccepted(true);

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch {
      setError('Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  const isCorrectEmail =
    session?.user?.email?.toLowerCase() === invite?.email?.toLowerCase();

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AppLogo />
            </div>
            <CardTitle>Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="mt-6 text-center">
              <Button asChild variant="outline">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Welcome to {invite?.organizationName}!</CardTitle>
            <CardDescription>
              You have successfully joined the organization as{' '}
              {ROLE_LABELS[invite?.role ?? 'employee'] ?? invite?.role}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo />
          </div>
          <CardTitle>You&apos;ve Been Invited!</CardTitle>
          <CardDescription>
            {invite?.inviterName
              ? `${invite.inviterName} has invited you to join ${invite.organizationName}`
              : invite?.organizationName
                ? `You have been invited to join ${invite.organizationName}`
                : 'You have been invited to join an organization'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{invite?.organizationName}</p>
                <p className="text-sm text-muted-foreground">
                  Role: {ROLE_LABELS[invite?.role ?? 'employee'] ?? invite?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Invite email */}
          <div className="text-center text-sm text-muted-foreground">
            This invite was sent to{' '}
            <span className="font-medium text-foreground">{invite?.email}</span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions based on auth state */}
          {!session ? (
            // Not signed in
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Sign in or create an account to accept this invite
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link href={`/auth/sign-in?callbackUrl=/invite/${token}`}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/auth/sign-up?callbackUrl=/invite/${token}`}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          ) : isCorrectEmail ? (
            // Signed in with correct email
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Signed in as{' '}
                <span className="font-medium text-foreground">
                  {session.user?.email}
                </span>
              </p>
              <Button
                onClick={handleAcceptInvite}
                disabled={accepting}
                className="w-full"
                size="lg"
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Invite
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Signed in with wrong email
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Different Email</AlertTitle>
                <AlertDescription>
                  You are signed in as{' '}
                  <span className="font-medium">{session.user?.email}</span>, but
                  this invite was sent to{' '}
                  <span className="font-medium">{invite?.email}</span>.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link href="/auth/sign-out">Sign Out</Link>
                </Button>
                <Button asChild>
                  <Link href={`/auth/sign-in?callbackUrl=/invite/${token}`}>
                    Sign In as {invite?.email.split('@')[0]}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Expiry notice */}
          <p className="text-center text-xs text-muted-foreground">
            This invite expires on{' '}
            {new Date(invite?.expiresAt ?? '').toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
