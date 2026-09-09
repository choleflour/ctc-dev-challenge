import { NotFoundError, ValidationError } from '@/lib/errors';

/**
 * Parses a route `:id` param as a restaurant id.
 *
 * Per the API contract, an id that isn't a positive integer (`abc`, `-1`,
 * `1.5`) is a 404 - there's no such restaurant - not a 400.
 */
export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new NotFoundError('Restaurant not found');
  }
  return id;
}

export interface RestaurantInput {
  name: string;
  cuisine: string | null;
  address: string | null;
  rating: number | null;
}

/** Validates a POST/PUT request body for a restaurant. Throws on anything invalid. */
export function parseRestaurantInput(body: unknown): RestaurantInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { name, cuisine, address, rating } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('"name" is required and must be a non-empty string');
  }

  if (cuisine !== undefined && cuisine !== null && typeof cuisine !== 'string') {
    throw new ValidationError('"cuisine" must be a string');
  }

  if (address !== undefined && address !== null && typeof address !== 'string') {
    throw new ValidationError('"address" must be a string');
  }

  if (
    rating !== undefined &&
    rating !== null &&
    (typeof rating !== 'number' || Number.isNaN(rating) || rating < 0 || rating > 5)
  ) {
    throw new ValidationError('"rating" must be a number between 0 and 5');
  }

  return {
    name: name.trim(),
    cuisine: (cuisine as string | undefined) ?? null,
    address: (address as string | undefined) ?? null,
    rating: (rating as number | undefined) ?? null,
  };
}
