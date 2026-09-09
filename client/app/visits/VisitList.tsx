'use client';

import { useRouter } from 'next/navigation';
import type { Visit } from '@/lib/types';

/** Lists visits and deletes one via a real HTTP call to `DELETE /api/visits/:id`. */
export function VisitList({
  visits,
  restaurantNames,
}: {
  visits: Visit[];
  restaurantNames: Record<number, string>;
}) {
  const router = useRouter();

  async function handleDelete(id: number) {
    await fetch(`/api/visits/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  if (visits.length === 0) {
    return <p className="text-sm text-gray-500">No visits logged yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {visits.map((visit) => (
        <li
          key={visit.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm"
        >
          <div>
            <span className="font-medium">
              {restaurantNames[visit.restaurantId] ?? `Restaurant #${visit.restaurantId}`}
            </span>
            <span className="ml-2 text-gray-500">{visit.date}</span>
            {visit.notes && <span className="ml-2 text-gray-400">· {visit.notes}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span>
              {visit.amountSpent !== null ? `$${visit.amountSpent.toFixed(2)}` : '—'}
            </span>
            <button
              onClick={() => handleDelete(visit.id)}
              aria-label="Delete visit"
              className="text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
