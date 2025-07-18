import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || '';

export class HttpService {
  static async get<T>(url: string): Promise<T> {
    const res = await fetch(API_BASE_URL + url);

    if (!res.ok) {
      console.error(`GET ${url} failed:`, res.status, await res.text());
      throw new Error(`GET ${url} failed: ${res.status}`);
    }
    
    return res.json();
  }

  static async post<T>(url: string, body: any): Promise<T> {
    const res = await fetch(API_BASE_URL + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`POST ${url} failed:`, res.status, await res.text());
      throw new Error(`POST ${url} failed: ${res.status}`);
    }

    return res.json();
  }

  static async delete<T>(url: string, body: any): Promise<T> {
    const res = await fetch(API_BASE_URL + url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`DELETE ${url} failed:`, res.status, await res.text());
      throw new Error(`DELETE ${url} failed: ${res.status}`);
    }

    return res.json();
  }
}
