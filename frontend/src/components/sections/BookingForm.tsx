'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LineDotRightHorizontalIcon } from 'lucide-react';
export interface BookingFormProps {
  initialService?: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  service: string;
  eventDate: string;
  location: string;
  message: string;
  companyWebsite: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function BookingForm({ initialService = 'bridal' }: BookingFormProps) {
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    service: initialService,
    eventDate: '',
    location: '',
    message: '',
    companyWebsite: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!values.name.trim()) next.name = 'Please enter your full name.';
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (!values.message.trim() || values.message.trim().length < 10) {
      next.message = 'Please share a short note about your inquiry or event details.';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        referenceId?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setSubmitError(
          payload.error || 'Unable to submit your request right now. Please try again.'
        );
        setSubmitting(false);
        return;
      }

      setSubmittedRef(payload.referenceId || 'INQ');
      setSubmitting(false);
    } catch {
      setSubmitError('Network error while sending your message. Please try again.');
      setSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <div
        role="status"
        className="overflow-hidden rounded-2xl border border-hairline bg-paper shadow-sm"
      >
        <div className="bg-plaque text-plaque-ink border-b border-plaque-border p-7 sm:p-9 relative">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta mb-1.5">
            Inquiry Received &middot; {submittedRef}
          </p>
          <h2 className="font-serif text-3xl font-medium text-plaque-ink">
            Thank you, {values.name}.
          </h2>
        </div>
        <div className="p-7 sm:p-9 space-y-5">
          <p className="text-sm md:text-base text-umber leading-relaxed">
            Your booking or order inquiry has been logged for review. Sana will follow up via email ({values.email}) or phone regarding availability.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="rounded-full"
            onClick={() => {
              setSubmittedRef(null);
              setValues({
                name: '',
                email: '',
                phone: '',
                service: initialService,
                eventDate: '',
                location: '',
                message: '',
                companyWebsite: '',
              });
            }}
          >
            Send Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 md:p-10 space-y-6"
    >
      <div className="border-b border-hairline pb-4">
        <span className="font-serif text-xs italic text-terracotta">
          Reservation &amp; Custom Order Form
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink mt-0.5 mb-1">
          Booking &amp; Order Inquiry
        </h2>
        <p className="text-xs text-umber">
          Fields marked with <span className="text-terracotta">*</span> are required.
        </p>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-xl border border-crimson/35 bg-canvas p-4 text-sm text-crimson"
        >
          {submitError}
        </div>
      ) : null}

      {/* Honeypot field hidden from screen readers and pointer users */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave empty</label>
        <input
          id="contact-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.companyWebsite}
          onChange={(e) =>
            setValues((v) => ({ ...v, companyWebsite: e.target.value }))
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
          >
            Full Name <span className="text-terracotta">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            value={values.name}
            onChange={(e) => {
              setValues((v) => ({ ...v, name: e.target.value }));
              if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
            }}
            className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
          />
          {errors.name ? (
            <p id="contact-name-error" role="alert" className="mt-1.5 text-xs text-crimson">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
          >
            Email Address <span className="text-terracotta">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            value={values.email}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }));
              if (errors.email) setErrors((err) => ({ ...err, email: undefined }));
            }}
            className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
          />
          {errors.email ? (
            <p id="contact-email-error" role="alert" className="mt-1.5 text-xs text-crimson">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="contact-phone"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
          >
            Phone / WhatsApp <span className="text-terracotta">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
             aria-required="true"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
          />
        </div>

        <div>
          <label
            htmlFor="contact-service"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
          >
            Inquiry Type
          </label>
          <select
            id="contact-service"
            name="service"
            value={values.service}
            onChange={(e) =>
              setValues((v) => ({ ...v, service: e.target.value }))
            }
            className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
          >
            <option value="bridal">Bridal Mehandi Booking</option>
            <option value="events">Events &amp; Celebrations</option>
            <option value="botanical">Custom Bulk Orders / Workshops</option>
            <option value="order-support">Existing Store Order Question</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="contact-date"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
          >
            Preferred Date
          </label>
          <input
            id="contact-date"
            name="eventDate"
            type="date"
            value={values.eventDate}
            onChange={(e) =>
              setValues((v) => ({ ...v, eventDate: e.target.value }))
            }
            className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
          />
        </div>

        <div>
          <label
            htmlFor="contact-location"
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
          >
            Event City / Venue
          </label>
          <input
            id="contact-location"
            name="location"
            type="text"
            value={values.location}
            onChange={(e) =>
              setValues((v) => ({ ...v, location: e.target.value }))
            }
            className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-2"
        >
          Message &amp; Details <span className="text-terracotta">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          placeholder="Share coverage preferences, guest count, or product questions…"
          value={values.message}
          onChange={(e) => {
            setValues((v) => ({ ...v, message: e.target.value }));
            if (errors.message) {
              setErrors((err) => ({ ...err, message: undefined }));
            }
          }}
          className="w-full rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className="mt-1.5 text-xs text-crimson">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
        className="w-full rounded-md min-h-[50px]"
      >
        {submitting ? 'Submitting Inquiry…' : 'Send Inquiry'} <LineDotRightHorizontalIcon className='w-3.5 h-3.5'/>
      </Button>
    </form>
  );
}
