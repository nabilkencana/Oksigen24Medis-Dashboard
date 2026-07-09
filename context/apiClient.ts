const BASE_URL = 'http://localhost:3000';

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('oksigen24_access_token') : null;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Attempt token refresh
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('oksigen24_refresh_token') : null;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        if (refreshRes.ok) {
          const resBody = await refreshRes.json();
          const data = resBody.data;
          if (typeof window !== 'undefined') {
            localStorage.setItem('oksigen24_access_token', data.accessToken);
            localStorage.setItem('oksigen24_refresh_token', data.refreshToken);
          }
          // Retry original request with new token
          headers.set('Authorization', `Bearer ${data.accessToken}`);
          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          if (!retryResponse.ok) {
            const errBody = await retryResponse.json().catch(() => ({}));
            throw new Error(errBody.message || 'Request failed after token refresh');
          }
          const text = await retryResponse.text();
          if (!text) return null;
          const retryBody = JSON.parse(text);
          if (retryBody && typeof retryBody === 'object' && retryBody.success === true && 'data' in retryBody) {
            return retryBody.data;
          }
          return retryBody;
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oksigen24_access_token');
          localStorage.removeItem('oksigen24_refresh_token');
          localStorage.removeItem('oksigen24_user');
          window.dispatchEvent(new Event('auth-logout')); // notify app to log out
        }
        throw err;
      }
    }
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;
  const body = JSON.parse(text);
  if (body && typeof body === 'object' && body.success === true && 'data' in body) {
    return body.data;
  }
  return body;
}
