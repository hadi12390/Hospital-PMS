// api/apiFetch.js

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

const hostname = window.location.hostname;
const API_BASE = `http://${hostname}:8000`;

async function refreshToken() {
  const res = await fetch(`${API_BASE}/dj-rest-auth/token/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Refresh failed");
  return res;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const doFetch = () =>
    fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

  let response = await doFetch();

  if (response.status === 401) {
    if (isRefreshing) {
      // wait for the in-flight refresh, then retry
      await new Promise((resolve) => subscribeTokenRefresh(resolve));
      return doFetch();
    }

    isRefreshing = true;
    try {
      await refreshToken();
      isRefreshing = false;
      onRefreshed();
      response = await doFetch(); // retry original request
    } catch (err) {
      isRefreshing = false;
      refreshSubscribers = [];
      window.location.href = "/login"; // refresh token dead too — real logout
      throw err;
    }
  }

  return response;
}