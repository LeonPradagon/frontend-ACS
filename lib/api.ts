// lib/api.ts
class ApiClient {
    private baseUrl: string;
  
    constructor() {
      // Gunakan NEXT_PUBLIC_API_URL dari environment
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    }
  
    private getApiUrl(endpoint: string): string {
      return `${this.baseUrl}/api${endpoint}`;
    }
  
    private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
      const token = localStorage.getItem('accessToken');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };
  
      const url = this.getApiUrl(endpoint);
      const response = await fetch(url, {
        ...options,
        headers,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      return response.json();
    }
  
    // Auth endpoints
    async login(credentials: { username: string; password: string }) {
      return this.fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    }
  
    async refreshToken(refreshToken: string) {
      return this.fetchWithAuth('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
  
    async quickRefresh(refreshToken: string) {
      return this.fetchWithAuth('/auth/quick-refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
  
    async verifyToken() {
      return this.fetchWithAuth('/auth/verify', {
        method: 'GET',
      });
    }
  
    // Log endpoint URL untuk debugging
    logBaseUrl() {
      console.log('🔧 API Base URL:', this.baseUrl);
      console.log('🔧 App Name:', process.env.NEXT_PUBLIC_APP_NAME);
    }
  }
  
  export const apiClient = new ApiClient();