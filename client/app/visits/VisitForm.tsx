'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Restaurant } from '@/lib/types';

/**
 * Logs a new visit via a real HTTP call to `POST /api/visits` - no Server
 * Action, this is a plain client-side `fetch` against the route handler.
 */
export function VisitForm({ restaurants }: { restaurants: Restaurant[] }) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(String(restaurants[0]?.id ?? ''));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amountSpent, setAmountSpent] = useState('0.00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          date,
          amountSpent: Number(amountSpent),
          notes: notes === '' ? null : notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setAmountSpent('0.00');
      setNotes('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (restaurants.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
        Add a restaurant first.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Restaurant
          <select
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Date
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </label>

        <label className="text-sm">
          Amount spent
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </label>

        <label className="text-sm">
          Notes
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Log visit'}
      </button>
    </form>
  );
}
