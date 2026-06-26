// src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("hireos_token");
}

async function request(method, path, { body, params, form } = {}) {
  const token = getToken();

  const headers = {
    // Disable caching completely — prevents 304 "Not Modified" empty responses
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      )
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const init = { method, headers, cache: "no-store" };

  if (form) {
    init.body = form;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (networkErr) {
    // Backend not running ya CORS issue
    throw new Error(
      "Server se connect nahi ho pa raha. Backend chalu hai? (npm run dev)"
    );
  }

  // 401 → logout
  if (res.status === 401) {
    localStorage.removeItem("hireos_token");
    localStorage.removeItem("hireos_user");
    window.location.href = "/login";
    return;
  }

  // 304 → browser cache hit, dobara full request karo without cache
  if (res.status === 304) {
    return request(method, path, { body, params: { ...params, _t: Date.now() }, form });
  }

  // Parse JSON safely
  let data;
  try {
    data = await res.json();
  } catch {
    // Empty body (e.g. 204 No Content)
    if (res.ok) return {};
    throw new Error(`Server error: ${res.status}`);
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get:      (path, opts)       => request("GET",    path, opts || {}),
  post:     (path, body, opts) => request("POST",   path, { body, ...(opts || {}) }),
  patch:    (path, body)       => request("PATCH",  path, { body }),
  delete:   (path)             => request("DELETE", path),
  postForm: (path, form)       => request("POST",   path, { form }),
};

export default api;
