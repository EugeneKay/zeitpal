import React from 'react';

import { cn } from '../../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../shadcn/accordion';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className={cn('w-full', className)}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left text-base font-medium">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-base leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Helper function to generate FAQ structured data
export function generateFAQStructuredData(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export interface FAQSectionProps {
  items: FAQItem[];
  heading?: string;
  subheading?: string;
  className?: string;
  includeStructuredData?: boolean;
}

export function FAQSection({
  items,
  heading,
  subheading,
  className,
  includeStructuredData = false,
}: FAQSectionProps) {
  return (
    <section className={cn('py-12 md:py-16', className)}>
      {includeStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQStructuredData(items)),
          }}
        />
      )}

      {(heading || subheading) && (
        <div className="mb-12 text-center">
          {heading && (
            <h2 className="text-foreground text-2xl font-bold md:text-3xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-muted-foreground mt-2 text-base">
              {subheading}
            </p>
          )}
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <FAQAccordion items={items} />
      </div>
    </section>
  );
}
