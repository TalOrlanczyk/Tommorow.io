
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = endpoint;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  get(endpoint: string, params: Record<string, string>, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    return this.request(url.toString(), { ...options, method: 'GET' });
  }

  post(endpoint: string, data: any, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    return this.request(url.toString(), {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

}

export default ApiClient;