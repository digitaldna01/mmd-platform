const REQUEST_TIMEOUT_MS = 30_000;

const FALLBACK_MESSAGE = "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
const NETWORK_MESSAGE = "서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.";
const TIMEOUT_MESSAGE = "응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";

interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    detail?: string;
  };
  traceId?: string;
}

interface ApiRequestErrorInit {
  /** 서버 응답이 없으면 0입니다. */
  status: number;
  code: string;
  message: string;
  traceId: string;
  detail?: string;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId: string;
  readonly detail?: string;

  constructor({ status, code, message, traceId, detail }: ApiRequestErrorInit) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.traceId = traceId;
    this.detail = detail;
  }
}

/** Orval이 생성하는 훅의 에러 타입입니다. */
export type ErrorType<_Error> = ApiRequestError;

// crypto.randomUUID는 HTTPS에서만 동작해서, 사내망 HTTP에서도 되는 방식을 씁니다.
function createTraceId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit): Promise<T> {
  const traceId = createTraceId();
  const headers = new Headers(options.headers);
  headers.set("X-Trace-Id", traceId);

  const controller = new AbortController();
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    cancel();
  }, REQUEST_TIMEOUT_MS);

  let response: Response;
  let text: string;
  try {
    response = await fetch(path, { ...options, headers, signal: controller.signal });
    text = await response.text();
  } catch (cause) {
    if (options.signal?.aborted) {
      throw cause;
    }
    throw new ApiRequestError(
      timedOut
        ? { status: 0, code: "CLIENT-TIMEOUT", message: TIMEOUT_MESSAGE, traceId }
        : { status: 0, code: "CLIENT-NETWORK", message: NETWORK_MESSAGE, traceId },
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
  }

  const body = text ? parseJson(text) : undefined;
  if (!response.ok || (text && body === undefined)) {
    const { error, traceId: serverTraceId } = (body ?? {}) as ErrorBody;
    throw new ApiRequestError({
      status: response.status,
      code: error?.code ?? `HTTP-${response.status}`,
      message: error?.message ?? FALLBACK_MESSAGE,
      traceId: serverTraceId ?? traceId,
      detail: error?.detail,
    });
  }
  return body as T;
}
