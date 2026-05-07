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

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: isFormData
        ? { ...(options.headers as Record<string, string>) }
        : {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
          },
    });
  } catch (fetchError) {
    const errorMsg = fetchError instanceof Error ? fetchError.message : "Network request failed";
    throw new Error(errorMsg);
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object") {
        const errorMsg = (errorData as any).message || (errorData as any).error;
        if (errorMsg) {
          message = `${message}: ${errorMsg}`;
        }
      }
    } catch {
      /* ignore parse error */
    }
    // Only log errors that aren't expected (401 is expected when logged out)
    if (response.status !== 401) {
      console.error(`API call failed to ${endpoint}: ${message}`);
    }
    throw new Error(message);
  }

  try {
    const result: ApiResponse<T> = await response.json();
    return result.data as T;
  } catch (parseError) {
    throw new Error("Failed to parse API response");
  }
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
