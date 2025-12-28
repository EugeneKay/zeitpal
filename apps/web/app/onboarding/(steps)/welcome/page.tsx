'use client';

import { useRouter } from 'next/navigation';

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { useOnboarding } from '~/lib/contexts/onboarding-context';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Track All Leave Types',
    description: 'Vacation, sick leave, parental leave, and more',
  },
  {
    icon: Users,
    title: 'Team Calendar',
    description: 'See who is out and plan coverage',
  },
  {
    icon: CheckCircle2,
    title: 'Approval Workflows',
    description: 'Configurable approval chains for your organization',
  },
  {
    icon: Clock,
    title: 'Holiday-Aware',
    description: 'Automatic public holiday detection by region',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { goToStep, markStepCompleted } = useOnboarding();

  const handleGetStarted = () => {
    markStepCompleted('welcome');
    goToStep('profile');
    router.push('/onboarding/profile');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to ZeitPal</CardTitle>
          <CardDescription className="mt-2 text-base">
            Your all-in-one leave management solution
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features Grid */}
          <div className="grid gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Time estimate */}
          <p className="text-center text-sm text-muted-foreground">
            Setup takes about 3 minutes
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="w-full text-base"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
