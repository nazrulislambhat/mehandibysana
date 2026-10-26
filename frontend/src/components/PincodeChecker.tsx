'use client';

import React, { useState } from 'react';
import { evaluatePincode } from '@/lib/pincode';

export default function PincodeChecker({ onPincodeSelected }: { onPincodeSelected?: (pin: string, fee: number) => void }) {
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal || inputVal.trim().length !== 6) return;
    const res = evaluatePincode(inputVal.trim());
    setResult(res);
    if (res.isServiceable && onPincodeSelected) {
      onPincodeSelected(inputVal.trim(), res.shippingFee);
    }
  };

  return (
    <div>
      <form onSubmit={handleCheck} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Enter 6-digit PIN (e.g. 190001)"
          maxLength={6}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value.replace(/\D/g, ''))}
          style={{
            flex: 1,
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          style={{
            padding: '0.65rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
          }}
        >
          Check
        </button>
      </form>

      {result && (
        <div
          style={{
            background: result.isServiceable ? 'rgba(46, 125, 50, 0.08)' : 'rgba(245, 85, 54, 0.08)',
            border: `1px solid ${result.isServiceable ? 'rgba(46, 125, 50, 0.25)' : 'rgba(245, 85, 54, 0.25)'}`,
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <strong>{result.regionName}</strong>
            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
              ₹{result.shippingFee} Delivery
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ⏱️ {result.estimatedDeliveryDays} • {result.codAvailable ? '💵 COD Available' : '💳 Prepaid Only'}
          </div>
        </div>
      )}
    </div>
  );
}
