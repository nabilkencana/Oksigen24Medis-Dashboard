export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oksigen24medis.com';

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
            throw new Error(translateErrorMessage(errBody.message || 'Request failed after token refresh'));
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
    throw new Error(translateErrorMessage(errBody.message || 'Request failed'));
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

function translateErrorMessage(message: string): string {
  if (!message) return 'Permintaan gagal diproses';
  
  let msg = message;
  
  // 1. Cylinder not available error
  // Pattern: Cylinder CYL-MED-005 is not AVAILABLE (Current status: EMPTY)
  if (msg.includes('is not AVAILABLE')) {
    const matches = msg.match(/Cylinder (.*) is not AVAILABLE \(Current status: (.*)\)/i);
    if (matches && matches.length >= 3) {
      const serial = matches[1];
      const status = matches[2];
      let statusInd = status;
      if (status === 'EMPTY') statusInd = 'KOSONG';
      if (status === 'RENTED') statusInd = 'SEDANG DISEWA';
      if (status === 'AT_VENDOR') statusInd = 'DI VENDOR';
      if (status === 'MAINTENANCE') statusInd = 'PERAWATAN';
      return `Tabung ${serial} tidak tersedia untuk disewa (Status saat ini: ${statusInd})`;
    }
  }

  // 2. Cylinder not empty for refill
  // Pattern: Cylinder CYL-MED-005 is not EMPTY (Current status: AVAILABLE)
  if (msg.includes('is not EMPTY')) {
    const matches = msg.match(/Cylinder (.*) is not EMPTY \(Current status: (.*)\)/i);
    if (matches && matches.length >= 3) {
      const serial = matches[1];
      const status = matches[2];
      let statusInd = status;
      if (status === 'AVAILABLE') statusInd = 'TERSEDIA / BERISI';
      if (status === 'RENTED') statusInd = 'SEDANG DISEWA';
      if (status === 'AT_VENDOR') statusInd = 'DI VENDOR';
      if (status === 'MAINTENANCE') statusInd = 'PERAWATAN';
      return `Tabung ${serial} tidak bisa dikirim isi ulang karena statusnya bukan KOSONG (Status saat ini: ${statusInd})`;
    }
  }

  // 3. Cylinder not at vendor for receive
  // Pattern: Cylinder CYL-MED-005 is not at vendor (Current status: AVAILABLE)
  if (msg.includes('is not at vendor')) {
    const matches = msg.match(/Cylinder (.*) is not at vendor \(Current status: (.*)\)/i);
    if (matches && matches.length >= 3) {
      const serial = matches[1];
      const status = matches[2];
      let statusInd = status;
      if (status === 'AVAILABLE') statusInd = 'TERSEDIA';
      if (status === 'RENTED') statusInd = 'SEDANG DISEWA';
      if (status === 'EMPTY') statusInd = 'KOSONG';
      if (status === 'MAINTENANCE') statusInd = 'PERAWATAN';
      return `Tabung ${serial} tidak sedang berada di vendor refill (Status saat ini: ${statusInd})`;
    }
  }

  // 4. Insufficient stock
  // Pattern: Insufficient stock for product Regulator (Available: 5, Requested: 10)
  if (msg.includes('Insufficient stock for product')) {
    const matches = msg.match(/Insufficient stock for product (.*) \(Available: (.*), Requested: (.*)\)/i);
    if (matches && matches.length >= 4) {
      const name = matches[1];
      const avail = matches[2];
      const req = matches[3];
      return `Stok tidak mencukupi untuk produk ${name} (Tersedia: ${avail}, Diminta: ${req})`;
    }
  }

  // Simple exact match translations
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('customer not found')) return 'Pelanggan tidak ditemukan';
  if (lowerMsg.includes('rental not found')) return 'Transaksi sewa tidak ditemukan';
  if (lowerMsg.includes('vendor not found')) return 'Mitra vendor tidak ditemukan';
  if (lowerMsg.includes('product not found') || lowerMsg.includes('some products not found')) return 'Produk tidak ditemukan';
  if (lowerMsg.includes('cylinder not found') || lowerMsg.includes('some cylinders could not be found') || lowerMsg.includes('some cylinders not found')) return 'Tabung tidak ditemukan';
  if (lowerMsg.includes('email already registered') || lowerMsg.includes('email already in use')) return 'Email sudah terdaftar di sistem';
  if (lowerMsg.includes('incorrect old password')) return 'Kata sandi lama salah';
  if (lowerMsg.includes('invalid email or password') || lowerMsg.includes('incorrect credentials')) return 'Email atau kata sandi salah';
  if (lowerMsg.includes('access denied')) return 'Akses ditolak';
  if (lowerMsg.includes('user is inactive')) return 'Pengguna tidak aktif atau tidak ditemukan';

  return msg;
}
