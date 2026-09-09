import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';

/**
 * GET /api/visits/summary
 * Aggregate spend across all logged visits: the running total, and a
 * breakdown of spend per date
 */
export async function GET() {
  try {
    const totalResult = await pool.query(
      'SELECT COALESCE(SUM("amountSpent"), 0) AS total FROM visits'
    );

    const byDateResult = await pool.query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS date, COALESCE(SUM("amountSpent"), 0) AS total
       FROM visits
       GROUP BY date
       ORDER BY date DESC`
    );

    return NextResponse.json({
      totalSpent: Number(totalResult.rows[0].total),
      byDate: byDateResult.rows.map((row) => ({
        date: row.date as string,
        total: Number(row.total),
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
