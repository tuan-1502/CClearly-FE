import { toast } from 'react-toastify';
import { useSessionStore } from '@/stores/sessionStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class TokenRefreshInterceptor {
  constructor() {
    this.refreshPromise = null;
    this.isRefreshing = false;
  }

  getValidToken() {
    return useSessionStore.getState().accessToken || null;
  }

  async refreshToken() {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async performRefresh() {
    const refreshToken = useSessionStore.getState().refreshToken;
    if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error('REFRESH_FAILED');

    const data = await res.json();
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    useSessionStore
      .getState()
      .updateSession({ accessToken, refreshToken: newRefreshToken });
    return accessToken;
  }

  clearSessionAndRedirect() {
    useSessionStore.getState().clearSession();
    toast.error('Phiên đăng nhập đã hết hạn');
    window.location.href = '/login';
  }
}

const tokenInterceptor = new TokenRefreshInterceptor();

const http = {
  async get(url, options) {
    return request('GET', url, options);
  },

  async post(url, body, options) {
    return request('POST', url, { ...options, body });
  },

  async put(url, body, options) {
    return request('PUT', url, { ...options, body });
  },

  async delete(url, options) {
    return request('DELETE', url, options);
  },

  async patch(url, body, options) {
    return request('PATCH', url, { ...options, body });
  },
};

async function request(method, url, options, retryCount = 0) {
  const MAX_RETRIES = 1;

  const body = options?.body
    ? options.body instanceof FormData
      ? options.body
      : JSON.stringify(options.body)
    : undefined;

  const authToken = options?.skipAuth ? null : tokenInterceptor.getValidToken();

  // Add logging to verify token
  console.log('Access Token:', authToken);

  // Check if token is null and log an error
  if (!authToken && !options?.skipAuth) {
    console.error('No access token found. Ensure the user is logged in.');
  }

  const headers = {};
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const baseUrl = options?.baseURL || BASE_URL;
  const fullUrl = url.startsWith('/')
    ? `${baseUrl}${url}`
    : `${baseUrl}/${url}`;

  const urlWithParams = options?.query
    ? `${fullUrl}?${new URLSearchParams(
        Object.entries(options.query)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : fullUrl;

  const res = await fetch(urlWithParams, { ...options, headers, body, method });

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = { message: 'Response is not JSON' };
  }

  // Handle 401 - Token expired
  if (
    res.status === 401 &&
    payload?.message === 'Token đã hết hạn' &&
    !options?.skipAuth
  ) {
    if (retryCount < MAX_RETRIES) {
      try {
        await tokenInterceptor.refreshToken();
        return request(method, url, options, retryCount + 1);
      } catch (error) {
        tokenInterceptor.clearSessionAndRedirect();
        throw error;
      }
    }
  }

  if (!res.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}

export default http;
