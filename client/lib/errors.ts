import { NextResponse } from 'next/server';

/**
 * Base class for errors that map directly to an HTTP status + message. Throw
 * one of the subclasses below - from a route handler or a validation helper -
 * and let the route's existing `catch { return handleError(err) }` take care
 * of turning it into the right response. No route needs to know status codes
 * itself.
 */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

/**
 * Central error -> HTTP response mapper for the API route handlers. Call it
 * from a route's `catch` block so error handling lives in one place:
 *
 *   try {
 *     ...
 *   } catch (err) {
 *     return handleError(err);
 *   }
 */
export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  // `req.json()` throws this on a body that isn't valid JSON.
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  // Unexpected - don't leak internals (stack traces, raw DB errors) to the client.
  console.error('Unhandled API error:', err);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
