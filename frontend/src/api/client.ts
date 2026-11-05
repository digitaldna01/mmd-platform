const REQUEST_TIMEOUT_MS = 30_000;

let baseUrl = "";

export function setApiBaseUrl(url: string): void {
  baseUrl = url;
}

export async function apiRequest<T>(path: string, options: RequestInit): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-Trace-Id", crypto.randomUUID());

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const body = await response.text();
  return {
    data: body ? JSON.parse(body) : undefined,
    status: response.status,
    headers: response.headers,
  } as T;
}
