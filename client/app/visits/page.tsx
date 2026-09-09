import { getRestaurants, getVisits, getVisitSummary } from '@/lib/apiClient';
import { VisitForm } from './VisitForm';
import { VisitList } from './VisitList';

// Server component. Fetches restaurants (for the form's dropdown), all
// visits, and the spend summary on each request, then hands them to the
// client components below that handle the interactive parts (logging and
// deleting a visit).
export default async function VisitsPage() {
  const [restaurants, visits, summary] = await Promise.all([
    getRestaurants(),
    getVisits(),
    getVisitSummary(),
  ]);

  const restaurantNames: Record<number, string> = Object.fromEntries(
    restaurants.map((r) => [r.id, r.name])
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-medium">Log a visit</h2>
        <VisitForm restaurants={restaurants} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Spending summary</h2>
        <p className="mb-4">
          <span className="text-2xl font-semibold">
            ${summary.totalSpent.toFixed(2)}
          </span>{' '}
          <span className="text-sm text-gray-500">total spent</span>
        </p>
        {summary.byDate.length === 0 ? (
          <p className="text-sm text-gray-500">No spending logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Spent</th>
              </tr>
            </thead>
            <tbody>
              {summary.byDate.map((row) => (
                <tr key={row.date} className="border-t border-gray-100">
                  <td className="py-1.5">{row.date}</td>
                  <td className="py-1.5 text-right">${row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Visits</h2>
        <VisitList visits={visits} restaurantNames={restaurantNames} />
      </section>
    </div>
  );
}
