import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { createContext, FunctionComponent, ReactNode, useContext } from 'react';

import { IUser } from '../api/api';
import { APIContext } from '../api/context';

interface IUserContext {
  user?: IUser;
}

export const UserContext = createContext<IUserContext>({});

interface IProps {
  children: ReactNode;
}

const Provider: FunctionComponent<IProps> = ({ children }) => {
  const { api } = useContext(APIContext);
  const { isLoading, data: user } = useQuery(['app/api/auth/me'], () => {
    return api.me();
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

const User = {
  APIContext: UserContext,
  Provider: Provider,
};

export default User;
