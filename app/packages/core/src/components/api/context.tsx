import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createContext, FunctionComponent, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Client, { APIError, IAPI } from './api';

interface IAPIContext {
  api: IAPI;
  user?: IUser;
}

export const APIContext = createContext<IAPIContext>({
  api: new Client(),
});

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

interface IProps {
  children: ReactNode;
}

const Provider: FunctionComponent<IProps> = ({ children }) => {
  const client = new Client();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: user,
    isError,
    error,
  } = useQuery<IUser | undefined, Error>(['/app/api/me'], () => {
    try {
      return client.get<IUser>('/api/me');
    } catch (error) {
      if (error instanceof APIError && error.statusCode === 404) {
        navigate(`/auth/oidc?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      throw error;
    }
  });

  if (isError && error) {
    return <Box>{error.message}</Box>;
  }

  return <APIContext.Provider value={{ api: new Client(), user }}>{children}</APIContext.Provider>;
};

const API = {
  APIContext,
  Wrapper: Provider,
};

export default API;
