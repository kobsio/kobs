import { FunctionComponent, createContext, ReactNode } from 'react';

import { IReference } from '../crds/dashboard';
import { IPermissions, INavigation } from '../crds/user';

/**
 * `RequestOptions` defines the type for the options which can be passed to an API call. These can be an object for
 * which is send in the `body` of a request, a set of `headers` and much more.
 */
type RequestOptions = Omit<RequestInit, 'method' | 'body'> & { body?: unknown };

/**
 * `APIError` is the error which is returned by our `APIClient` when a http request fails. It contains a `error` message
 * with all the errors returned by the API call and the `statusCode` of the response.
 */
export class APIError extends Error {
  constructor(
    errors: string[],
    public statusCode?: number,
  ) {
    super(errors.join('\n'));
  }
}

/**
 * `IAPIUser` defines the interface of the user, which is returned by the `signin`, `signinOIDC` and `auth` methods. A
 * user always has an `id` (we recommend to use an email address as id), a name which can beshown in the UI, a list of
 * teams, permissions, dashboards and navigation items.
 */
export interface IAPIUser {
  dashboards: IReference[];
  id: string;
  name: string;
  navigation: INavigation[];
  permissions: IPermissions;
  teams: string[];
}

/**
 * `IAPIClient` defines the interface which must be implemented by our `APIClient`.
 */
interface IAPIClient {
  auth: () => Promise<IAPIUser>;
  delete: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  get: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  getUser: () => IAPIUser | undefined;
  post: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  put: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  signin: (username: string, password: string) => Promise<IAPIUser>;
  signinOIDC: (state: string, code: string) => Promise<{ url: string; user: IAPIUser }>;
  signout: () => Promise<void>;
}

/**
 * `APIClient` implements the `IAPIClient` interface and should be used for all http requests within the app.
 */
export class APIClient implements IAPIClient {
  private user?: IAPIUser;

  /**
   * `do` executes the actual request provided via the `get`, `post`, `put` or `delete` method. If the request fails, we
   * try to get a list of errors from the json response and create a corresponding `APIError`. If this is not possible
   * we return a generic `APIError`. If the request succeeds we return the returned json document or undefined if the
   * response code is 204 (no content).
   */
  private async do(path: string, method: 'get' | 'post' | 'put' | 'delete', opts?: RequestOptions): Promise<unknown> {
    try {
      const res = await fetch(path, { ...opts, body: JSON.stringify(opts?.body), method: method });

      if (res.status === 204) {
        return undefined;
      }

      const json = await res.json();

      if (res.status >= 200 && res.status < 300) {
        return json;
      } else {
        if (json.errors) {
          throw new APIError(json.errors, res.status);
        } else {
          throw new APIError([`An unknown error occured: ${json}`], res.status);
        }
      }
    } catch (err: unknown) {
      if (err instanceof APIError) {
        throw err;
      }

      throw new APIError([`An unknown error occured: ${err}`], 0);
    }
  }

  /**
   * `get` can be used to execute a get request against our APi.
   */
  get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'get', opts) as Promise<T>;
  }

  /**
   * `post` can be used to execute a post request against our APi.
   */
  post<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'post', opts) as Promise<T>;
  }

  /**
   * `put` can be used to execute a put request against our APi.
   */
  put<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'put', opts) as Promise<T>;
  }

  /**
   * `delete` can be used to execute a delete request against our APi.
   */
  delete<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.do(path, 'delete', opts) as Promise<T>;
  }

  /**
   * `getUser` returns the user saved within the `APIClient`. If no user is defined it returns `undefined`.
   */
  getUser = (): IAPIUser | undefined => this.user;

  /**
   * `signin` handles the sign in of the user via a `username` and `password`. Before it returnes the `IAPIUser` for the
   * signed in user it saves the user within the APIClient.
   */
  async signin(username: string, password: string): Promise<IAPIUser> {
    const user = await this.post<IAPIUser>('/api/auth/signin', {
      body: {
        password: password,
        username: username,
      },
    });
    this.user = user;
    return user;
  }

  /**
   * `signinOIDC` handles the sign in of the user via a `state` and `code` returned by a OIDC provider. Before it
   * returnes the `IAPIUser` for the signed in user it saves the user within the APIClient.
   */
  async signinOIDC(state: string, code: string): Promise<{ url: string; user: IAPIUser }> {
    const json = await this.get<{ url: string; user: IAPIUser }>(`/api/auth/oidc/callback?state=${state}&code=${code}`);
    this.user = json.user;
    return json;
  }

  /**
   * `signout` handles the sign out of the user. When the user was successfully signed out (the session and token are
   * deleted) it redericts the user to the sign in page and adds the last known page as redirect url.
   */
  async signout(): Promise<void> {
    await this.get('/api/auth/signout');
    this.user = undefined;
  }

  /**
   * `auth` returns the user which is saved within the `APIClient` or if we do not have a user it calls the auth API
   * endpoint to verify that the user session is still valid and to get an `IAPIUser`. If the API call failes because
   * the user is not authenticated anymore, the user is redirected to the sign in page with the current location as
   * redirect parameter.
   */
  async auth(): Promise<IAPIUser> {
    if (this.user) {
      return this.user;
    }
    const user = await this.get<IAPIUser>('/api/auth');
    this.user = user;
    return user;
  }
}

/**
 * `IAPIContext` defines the interface for the API context. The API context must contain a `APIClient` and a function to
 * get the authenticated user.
 */
export interface IAPIContext {
  client: APIClient;
  getUser: () => IAPIUser | undefined;
}

/**
 * `APIContext` is the context to manage all API related settings. The API context can be used make API requests against
 * our API and to get the currently signed in user.
 */
export const APIContext = createContext<IAPIContext>({
  client: new APIClient(),
  getUser: () => undefined,
});

/**
 * `APIContextConsumer` is a React component that subscribes to all changes in the API context. This let us subscribe to
 * the context within a function component.
 */
export const APIContextConsumer = APIContext.Consumer;

/**
 * `IAPIContextProviderProps` is the interface for the `APIContextProvider` component. All the provided `children` can
 * then subscribe to the context.
 */
interface IAPIContextProviderProps {
  children: ReactNode;
}

/**
 * `APIContextProvider` is a provider component that allows us comsuming components to subscribe to the context changes.
 */
export const APIContextProvider: FunctionComponent<IAPIContextProviderProps> = ({ children }) => {
  const client = new APIClient();

  return (
    <APIContext.Provider
      value={{
        client: client,
        getUser: client.getUser,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};
