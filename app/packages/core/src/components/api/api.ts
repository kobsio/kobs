type RequestOptions = Omit<RequestInit, 'method'>;

export interface IAPI {
  get: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  post: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  patch: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  put: <T>(path: string, opts?: RequestOptions) => Promise<T>;
}

export default class Client implements IAPI {
  constructor(private bearerToken?: string) {}

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
    if (!this.bearerToken) {
      throw new Error('no token found, not signed in?');
    }

    const headers = { ...((opts && opts.headers) || {}), Authorization: `Bearer ${this.bearerToken}` };
    const response = await fetch(path, { ...opts, headers, method: method });
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  }
}
