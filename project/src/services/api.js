/**
 * Base API Client using native Fetch API
 * Strict requirement: NO Axios.
 */

// Target API base URL
let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** Lỗi do server trả về (có status) hoặc lỗi kết nối (status = 0). */
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Custom API request wrapper using Fetch API.
 * - Lỗi HTTP (4xx/5xx) được ném nguyên vẹn, KHÔNG retry (tránh gửi trùng POST đặt hàng).
 * - Chỉ khi lỗi mạng và URL là localhost mới thử lại với 127.0.0.1 (vấn đề IPv6 trên Windows).
 * @param {string} endpoint - API endpoint (e.g. '/products')
 * @param {object} options - Fetch options (method, headers, body, params)
 * @returns {Promise<any>} - Parsed JSON response
 */
export const request = async (endpoint, options = {}) => {
  const { params, headers = {}, body, ...customConfig } = options;

  const buildUrl = (baseUrl) => {
    let url = `${baseUrl}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return url;
  };

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers
    },
    ...customConfig
  };

  if (body !== undefined && body !== null) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const send = async (baseUrl) => {
    const response = await fetch(buildUrl(baseUrl), config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Lỗi HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    // DELETE / 204 có thể không có body
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  try {
    return await send(BASE_URL);
  } catch (error) {
    // Server đã trả lời -> đây là lỗi thật, không che giấu và không retry.
    if (error instanceof ApiError) throw error;

    if (BASE_URL.includes('localhost')) {
      try {
        const fallbackBase = BASE_URL.replace('localhost', '127.0.0.1');
        const result = await send(fallbackBase);
        BASE_URL = fallbackBase; // nhớ base URL đang hoạt động
        return result;
      } catch (fallbackErr) {
        if (fallbackErr instanceof ApiError) throw fallbackErr;
      }
    }

    console.error(`[API Error] ${config.method} ${buildUrl(BASE_URL)}:`, error.message);
    throw new ApiError(
      `Không thể kết nối đến JSON Server tại ${BASE_URL}. Vui lòng đảm bảo bạn đã chạy lệnh 'npm run server' (cổng 3001).`,
      0
    );
  }
};

// Convenience methods for RESTful actions
export const api = {
  get: (endpoint, params = {}, options = {}) =>
    request(endpoint, { ...options, method: 'GET', params }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' })
};

export default api;
