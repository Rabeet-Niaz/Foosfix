const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const TOKEN_KEY = "foosfix_admin_token";

// Where the admin's login token is kept in the browser
export const auth = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function call(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error ?? "Something went wrong. Please try again.");
    err.status = res.status; // lets pages notice an expired login (401)
    throw err;
  }
  return data;
}

// Same as call, but sends the admin token along
function adminCall(path, options = {}) {
  return call(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${auth.get()}` },
  });
}

const json = (method, data) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export const api = {
  // ----- public -----
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

  // ----- admin -----
  adminLogin: (username, password) => call("/admin/login", json("POST", { username, password })),

  adminGetRequests: ({ status, archived, page = 1 } = {}) => {
    const params = new URLSearchParams({ page });
    if (status) params.set("status", status);
    if (archived) params.set("archived", "true");
    return adminCall(`/admin/requests?${params}`);
  },

  adminGetCounts: () => adminCall("/admin/counts"),

  adminSetStatus: (id, status) =>
    adminCall(`/admin/requests/${id}/status`, json("PATCH", { status })),

  adminAddComment: (id, text) =>
    adminCall(`/admin/requests/${id}/comments`, json("POST", { text })),

  adminArchive: (id, archived) =>
    adminCall(`/admin/requests/${id}/archive`, json("PATCH", { archived })),

  adminPostNews: (text) => adminCall("/admin/hotnews", json("POST", { text })),
};