import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { NotFoundError, handleError } from '@/lib/errors';
import { parseId } from '@/lib/validation';

type Params = { params: { id: string } };

/**
 * DELETE /api/visits/:id
 * Remove a logged visit.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id, 'Visit not found');

    const { rowCount } = await pool.query('DELETE FROM visits WHERE id = $1', [id]);

    if (rowCount === 0) {
      throw new NotFoundError('Visit not found');
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
