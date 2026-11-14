'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Lock, ArrowRight, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or expired reset link. Please request a new password reset email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
      const res = await fetch(`${backendUrl}/auth/customer/emailpass/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Password reset link has expired or is invalid.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to update password. Please request a new reset link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-hairline bg-paper p-8 sm:p-10 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-ink mb-2">Password Updated</h2>
        <p className="text-sm text-umber mb-6 max-w-sm mx-auto">
          Your password has been securely reset. You can now use your new credentials when shopping or tracking orders.
        </p>
        <Link href="/shop">
          <Button variant="primary" size="md" className="rounded-md w-full sm:w-auto">
            Continue to Shop <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hairline bg-paper p-8 sm:p-10 shadow-sm">
      <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
        <Lock className="w-5 h-5" />
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink mb-2">
        Reset Your Password
      </h1>
      <p className="text-sm text-umber mb-6">
        {email ? (
          <>
            Setting a new password for <span className="font-medium text-ink">{email}</span>
          </>
        ) : (
          'Enter your new password below.'
        )}
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-umber mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full rounded-md border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-umber mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type new password"
            className="w-full rounded-md border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
          className="w-full rounded-md mt-2"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-hairline text-center">
        <Link href="/shop" className="text-xs text-umber hover:text-terracotta transition-colors">
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-canvas">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-hairline bg-paper p-8 text-center text-sm text-umber">
              Loading security portal...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
