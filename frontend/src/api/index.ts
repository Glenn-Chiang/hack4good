// ======================
// Backend API helper
// ======================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json();
}
