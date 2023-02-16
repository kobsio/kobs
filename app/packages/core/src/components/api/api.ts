type RequestOptions = Omit<RequestInit, 'method' | 'body'> & { body?: unknown; disableAutorefresh?: boolean };

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
  me: () => Promise<IUser>;
}

export interface IAccessToken {
  data: {
    email: string;
    teams: string[];
  };
  exp: number;
  iss: string;
}

export interface IUser {
  email: string;
  teams?: string[];
  permissions?: IPermissions;
}

export interface IPermissions {
  applications?: IApplicationPermission[];
  teams?: string[];
  plugins?: IPluginPermission[];
  resources?: IResourcesPermission[];
}

export interface IApplicationPermission {
  type: string;
  satellites?: string[];
  clusters?: string[];
  namespaces?: string[];
}

export interface IPluginPermission {
  satellite: string;
  name: string;
  type: string;
  // permissions: any; TODO: types
}

export interface IResourcesPermission {
  clusters: string[];
  namespaces: string[];
  resources: string[];
}

export default class Client implements IAPI {
  private user?: IUser;
  private accessToken?: IAccessToken;

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

  getUser(): IUser {
    if (!this.user) {
      throw Error('user not set on API class');
    }
    return this.user;
  }

  private async do(path: string, method: 'get' | 'post' | 'put' | 'patch', opts?: RequestOptions): Promise<unknown> {
    if (!opts?.disableAutorefresh) {
      await this.refreshSession();
    }
    const res = await fetch(path, { ...opts, body: JSON.stringify(opts?.body), method: method });
    if (res.status === 204) {
      return null;
    }

    try {
      const json = await res.json();
      if (res.status >= 200 && res.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new APIError(json.error, res.status);
        } else {
          throw new APIError(json.error);
        }
      }
    } catch (error: unknown) {
      throw new APIError(`unexpected error ${error}`, res.status);
    }
  }

  private async refreshSession(): Promise<void> {
    if (!this.user) {
      await this.me();
      return;
    }

    if (!this.accessToken) {
      throw new Error('accesstoken is unexpectedly undefined');
    }

    // user is defined, but need to check if accesstoken expired
    const diff = this.accessToken.exp * 1e3 - Date.now();
    if (diff <= 1000 * 390) {
      await this.me(true);
      return;
    }

    // all good (accesstoken not expired and user is set)
    return;
  }

  async me(shouldRefresh = false): Promise<IUser> {
    if (this.user && !shouldRefresh) {
      return Promise.resolve(this.user);
    }
    const result = (await this.get(`/api/auth/me?refresh=${shouldRefresh}`, { disableAutorefresh: true }).catch(
      (err: APIError) => {
        if (err.statusCode === 401) {
          window.location.replace(
            `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
        }
      },
    )) as {
      user: IUser;
      accessToken: string;
    };

    this.accessToken = this.parseToken(result.accessToken);
    this.user = result.user;

    return result.user;
  }

  private parseToken(token: string): IAccessToken {
    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error(`token has fewer parts than expected, got: ${parts}`);
    }

    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  }
}