'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { evaluatePincode, PincodeCheckResult } from '@/lib/pincode';

interface PincodeCheckerProps {
  onPincodeSelected?: (pin: string, fee: number, result?: PincodeCheckResult) => void;
  initialPin?: string;
  compact?: boolean;
}

export default function PincodeChecker({
  onPincodeSelected,
  initialPin,
  compact = false,
}: PincodeCheckerProps) {
  const [inputVal, setInputVal] = useState(initialPin || '');
  const [result, setResult] = useState<PincodeCheckResult | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Initialize from localStorage if not passed
  useEffect(() => {
    if (!initialPin) {
      try {
        const saved = localStorage.getItem('mbs_pincode');
        if (saved && saved.length === 6) {
          setInputVal(saved);
          const res = evaluatePincode(saved);
          setResult(res);
          setIsSaved(true);
        }
      } catch (e) {
        // ignore
      }
    } else {
      const res = evaluatePincode(initialPin);
      setResult(res);
    }
  }, [initialPin]);

  const runCheck = useCallback(
    (pin: string) => {
      const clean = pin.trim().replace(/\D/g, '');
      if (clean.length !== 6) {
        setValidationError('Please enter a valid 6-digit PIN code (e.g. 190001, 110001)');
        setResult(null);
        return;
      }

      setValidationError('');
      const res = evaluatePincode(clean);
      setResult(res);

      if (res.isServiceable) {
        try {
          localStorage.setItem('mbs_pincode', clean);
        } catch (e) {
          // ignore
        }
        setIsSaved(true);
        if (onPincodeSelected) {
          onPincodeSelected(clean, res.shippingFee, res);
        }
      }
    },
    [onPincodeSelected]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setInputVal(val);
    setValidationError('');
    setIsSaved(false);

    // Auto-evaluate when 6 digits are reached
    if (val.length === 6) {
      runCheck(val);
    } else if (val.length === 0) {
      setResult(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) {
      setValidationError('Please enter a 6-digit postal code');
      return;
    }
    runCheck(inputVal);
  };

  const handleQuickSelect = (pin: string) => {
    setInputVal(pin);
    runCheck(pin);
  };

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit PIN (e.g. 190001)"
            maxLength={6}
            value={inputVal}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: compact ? '0.55rem 0.75rem' : '0.7rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: result?.isServiceable
                ? '1.5px solid #2EB85C'
                : validationError
                ? '1.5px solid var(--brand-primary)'
                : '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: compact ? '0.85rem' : '0.92rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
          />
          {result?.isServiceable && (
            <span
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#2EB85C',
                fontSize: '1rem',
                fontWeight: 800,
              }}
            >
              ✓
            </span>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-secondary"
          style={{
            padding: compact ? '0.55rem 0.95rem' : '0.7rem 1.25rem',
            fontSize: compact ? '0.8rem' : '0.88rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            whiteSpace: 'nowrap',
          }}
        >
          Check
        </button>
      </form>

      {validationError && (
        <div
          style={{
            color: 'var(--brand-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Result Display Box */}
      {result && (
        <div
          style={{
            marginTop: '0.5rem',
            background: result.isServiceable ? 'rgba(46, 125, 50, 0.08)' : 'rgba(192, 74, 38, 0.08)',
            border: `1px solid ${result.isServiceable ? 'rgba(46, 125, 50, 0.28)' : 'rgba(192, 74, 38, 0.28)'}`,
            padding: compact ? '0.65rem 0.85rem' : '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: compact ? '0.8rem' : '0.86rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {result.isServiceable ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.35rem',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>📍</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {result.city ? `${result.city}, ${result.state}` : result.regionName}
                  </strong>
                </div>
                <span
                  style={{
                    background: result.shippingFee === 0 ? 'rgba(46, 184, 92, 0.15)' : 'rgba(192, 74, 38, 0.12)',
                    color: result.shippingFee === 0 ? '#2EB85C' : 'var(--brand-primary)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ₹{result.shippingFee} Delivery
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  marginBottom: '0.35rem',
                }}
              >
                <div>⏱️ {result.estimatedDeliveryDays}</div>
                <div style={{ color: result.codAvailable ? '#2e7d32' : 'var(--brand-primary)', fontWeight: 600 }}>
                  {result.codAvailable ? '✓ Cash on Delivery (COD) Available' : '⚠️ Prepaid Only (Air Cargo)'}
                </div>
              </div>

              {result.freeShippingAbove && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ✨ Free delivery unlocks on orders above ₹{result.freeShippingAbove}
                </div>
              )}

              {isSaved && (
                <div
                  style={{
                    marginTop: '0.45rem',
                    paddingTop: '0.45rem',
                    borderTop: '1px solid rgba(46, 125, 50, 0.15)',
                    fontSize: '0.74rem',
                    color: '#2e7d32',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>✓</span>
                  <span>PIN {result.pincode} remembered for checkout & cart</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              ⚠️ {result.message}
            </div>
          )}
        </div>
      )}

      {/* Helpful quick test links on expanded view */}
      {!compact && !result && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Quick check sample postcodes:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {[
              { label: 'Srinagar (190001)', pin: '190001' },
              { label: 'Budgam (191111)', pin: '191111' },
              { label: 'Anantnag (192101)', pin: '192101' },
              { label: 'Delhi NCR (110001)', pin: '110001' },
              { label: 'Bengaluru (560001)', pin: '560001' },
              { label: 'Mumbai (400001)', pin: '400001' },
              { label: 'Leh (194101)', pin: '194101' },
            ].map((chip) => (
              <button
                key={chip.pin}
                type="button"
                onClick={() => handleQuickSelect(chip.pin)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
