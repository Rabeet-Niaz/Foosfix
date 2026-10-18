const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function call(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");
  return data;
}

export const api = {
  getTables: () => call("/tables"),
  getHotNews: () => call("/hotnews"),

  getRequests: ({ status, lastMonth, page = 1 } = {}) => {
    const params = new URLSearchParams({ page });
    if (status) params.set("status", status);
    if (lastMonth) params.set("lastMonth", "true");
    return call(`/requests?${params}`);
  },

  // formData holds tableId, description, rollNo and the photos
  submitRequest: (formData) => call("/requests", { method: "POST", body: formData }),
};