const RAW = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";
const API_BASE = (
  RAW
    ? RAW.replace(/\/$/, "")
    : "http://localhost:5000/api/v1"
).replace(/\/api\/?v1$/i, "") + "/api/v1";

export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  message?: string;
  data?: T;
}

function buildUrl(endpoint: string) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: isFormData
      ? { ...(options.headers as Record<string, string>) }
      : {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        },
  });

  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data as T;
}

/** Same as apiCall; adds Bearer when token is provided (cookie auth is used regardless). */
export async function apiCallWithAuth<T>(
  endpoint: string,
  token: string | null | undefined,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return apiCall<T>(endpoint, { ...options, headers });
}

export { API_BASE };
