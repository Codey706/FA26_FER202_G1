/**
 * Base API Client using native Fetch API
 * Strict requirement: NO Axios.
 */

// Target API base URL
let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Custom API request wrapper using Fetch API
 * Auto-falls back between localhost and 127.0.0.1 to avoid Windows IPv6 DNS issues.
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

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers
  };

  const config = {
    method: options.method || 'GET',
    headers: defaultHeaders,
    ...customConfig
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Attempt initial fetch
  let targetUrl = buildUrl(BASE_URL);
  try {
    const response = await fetch(targetUrl, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // If localhost failed due to Windows IPv6 vs IPv4 resolution, fallback to 127.0.0.1
    if (BASE_URL.includes('localhost')) {
      try {
        const fallbackBase = BASE_URL.replace('localhost', '127.0.0.1');
        const fallbackUrl = buildUrl(fallbackBase);
        const fallbackResp = await fetch(fallbackUrl, config);
        if (fallbackResp.ok) {
          BASE_URL = fallbackBase; // Update working baseUrl
          return await fallbackResp.json();
        }
      } catch (fallbackErr) {
        // Fallback also failed, proceed to throw clear error
      }
    }

    console.error(`[API Error] ${config.method} ${targetUrl}:`, error.message);
    throw new Error(
      `Không thể kết nối đến JSON Server tại ${BASE_URL}. Vui lòng đảm bảo bạn đã chạy lệnh 'npm run server' (cổng 3001).`
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
