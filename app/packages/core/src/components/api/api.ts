type RequestOptions = Omit<RequestInit, 'method' | 'body'> & { body: unknown };

export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
  }
}

export interface IAPI {
  get: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  post: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  patch: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  put: <T>(path: string, opts?: RequestOptions) => Promise<T>;
}

export default class Client implements IAPI {
  get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'get', opts) as Promise<T>;
  }
  post<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'post', opts) as Promise<T>;
  }
  put<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'put', opts) as Promise<T>;
  }

  patch<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'patch', opts) as Promise<T>;
  }

  private async do(path: string, method: 'get' | 'post' | 'put' | 'patch', opts?: RequestOptions): Promise<unknown> {
    const response = await fetch(path, { ...opts, body: JSON.stringify(opts?.body), method: method });
    if (response.status === 204) {
      return null;
    }

    try {
      const json = await response.json();
      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new APIError(json.error, response.status);
        } else {
          throw new APIError(json.error);
        }
      }
    } catch (error: unknown) {
      throw new APIError(`unexpected error ${error}`, response.status);
    }
  }
}
