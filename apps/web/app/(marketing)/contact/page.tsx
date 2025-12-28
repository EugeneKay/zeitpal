'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowRight, Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Label } from '@kit/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

function ContactPage() {
  const { t } = useTranslation('marketing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: 'Email',
      value: 'hallo@zeitpal.com',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: t('contact.location'),
      value: 'Deutschland',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t('contact.responseTime'),
      value: t('contact.responseTimeValue'),
    },
  ];

  return (
    <div className={'flex flex-col space-y-4 xl:space-y-8'}>
      <SitePageHeader
        title={t('contactHeading')}
        subtitle={t('contactSubheading')}
      />

      <div className={'container pb-16'}>
        <div className="grid gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div>
            {submitted ? (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertTitle>{t('contactSuccess')}</AlertTitle>
                <AlertDescription>
                  {t('contactSuccessDescription')}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>{t('contactError')}</AlertTitle>
                    <AlertDescription>
                      {t('contactErrorDescription')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">{t('contactName')}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={t('contactName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('contactEmail')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t('contactEmail')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contactMessage')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder={t('contactMessage')}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">...</span>
                      {t('sendMessage')}
                    </span>
                  ) : (
                    <>
                      {t('sendMessage')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="text-primary p-2 bg-primary/10 rounded-lg">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-medium">{info.label}</p>
                    <p className="text-muted-foreground">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Link */}
            <div className="p-6 bg-muted/50 rounded-xl">
              <h3 className="font-semibold mb-2">{t('contact.faqTitle')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('contact.faqDescription')}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/faq">
                  {t('faq')}
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
