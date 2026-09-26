import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200, headers: HeadersInit = {}): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      ...headers,
    },
  });
}

export function apiError(
  message: string,
  status = 400,
  details?: unknown,
  headers: HeadersInit = {}
): NextResponse {
  const body: { error: string; details?: unknown } = { error: message };
  if (details !== undefined && process.env.NODE_ENV !== "production") {
    body.details = details;
  }
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      ...headers,
    },
  });
}
