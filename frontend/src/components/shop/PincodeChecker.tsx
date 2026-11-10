'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { usePincodeStore } from '@/store/pincode-store';

export interface PincodeCheckerProps {
  subtotal?: number;
  compact?: boolean;
}

const QUICK_SAMPLES = [
  { pin: '190001', label: '190001 · Srinagar' },
  { pin: '560001', label: '560001 · Bangalore' },
  { pin: '110001', label: '110001 · Delhi' },
];

export function PincodeChecker({
  subtotal = 0,
  compact = false,
}: PincodeCheckerProps) {
  const pincode = usePincodeStore((s) => s.pincode);
  const result = usePincodeStore((s) => s.result);
  const isChecking = usePincodeStore((s) => s.isChecking);
  const error = usePincodeStore((s) => s.error);
  const setPincode = usePincodeStore((s) => s.setPincode);
  const checkPincode = usePincodeStore((s) => s.checkPincode);

  useEffect(() => {
    if (pincode.length === 6) {
      void checkPincode(pincode, subtotal);
    }
  }, [pincode, subtotal, checkPincode]);

  const handleCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void checkPincode(pincode, subtotal, { force: true });
  };

  const handleQuickSample = (samplePin: string) => {
    setPincode(samplePin);
    void checkPincode(samplePin, subtotal, { force: true });
  };

  return (
    <div
      className={`rounded-2xl border border-hairline bg-paper ${
        compact ? 'p-5' : 'p-6 md:p-7'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Delivery &amp; PIN Estimator
          </p>
        </div>
        <span className="text-[11px] text-umber">India Post / Courier</span>
      </div>

      <form onSubmit={handleCheckSubmit} className="flex items-stretch gap-2">
        <label htmlFor="mbs-pincode-input" className="sr-only">
          6-digit Indian PIN code
        </label>
        <input
          id="mbs-pincode-input"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit PIN (e.g. 190001)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="flex-1 min-w-0 min-h-[42px] rounded-full border border-divider bg-canvas px-4 text-sm text-ink placeholder:text-umber/70 focus:outline-none focus:border-ink"
        />
        <Button
          type="submit"
          variant="ink"
          size="sm"
          disabled={isChecking || pincode.length < 6}
          className="min-h-[42px] rounded-full px-5 text-xs sm:text-sm"
        >
          {isChecking ? 'Checking…' : 'Check'}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-umber mr-0.5">Quick check:</span>
        {QUICK_SAMPLES.map((sample) => {
          const isCheckedSample = result?.pincode === sample.pin;
          return (
            <button
              key={sample.pin}
              type="button"
              onClick={() => handleQuickSample(sample.pin)}
              className={`rounded-full border px-2.5 py-1 transition-colors cursor-pointer ${
                isCheckedSample
                  ? 'border-ink bg-ink text-inverse'
                  : 'border-hairline bg-canvas text-ink hover:border-terracotta hover:text-terracotta'
              }`}
            >
              {sample.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-crimson">
          {error}
        </p>
      ) : null}

      {result && result.pincode.length === 6 ? (
        <div
          role="status"
          className="mt-3.5 rounded-xl border border-hairline bg-linen px-4 py-3 text-xs leading-relaxed"
        >
          {result.serviceable ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{result.label}</p>
                <p className="text-umber mt-0.5">
                  ETA: {result.estimatedDays} &middot;{' '}
                  {result.codAvailable ? 'Cash on Delivery available' : 'Prepaid only'}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-ink px-3 py-1 font-serif text-base font-medium text-inverse tabular-nums">
                {result.deliveryCharge === 0 ? 'FREE' : `₹${result.deliveryCharge}`}
              </span>
            </div>
          ) : (
            <p className="text-crimson">{result.message}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
