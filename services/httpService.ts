export class HttpService {
  static async get<T>(url: string): Promise<T> {
    const res = await fetch("http://192.168.0.167:8080/api/" + url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  }

  static async post<T>(url: string, body: any): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
    return res.json();
  }

  static async delete<T>(url: string, body?: any): Promise<T> {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
    return res.text() as any;
  }

  static async put<T>(url: string, body: any): Promise<T> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
    return res.json();
  }
}
