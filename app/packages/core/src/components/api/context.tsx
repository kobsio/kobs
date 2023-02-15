import { createContext, FunctionComponent, ReactNode } from 'react';

import Client, { IAPI } from './api';

interface IAPIContext {
  api: IAPI;
}

export const APIContext = createContext<IAPIContext>({
  api: new Client(),
});

interface IProps {
  children: ReactNode;
}

const Provider: FunctionComponent<IProps> = ({ children }) => {
  return <APIContext.Provider value={{ api: new Client() }}>{children}</APIContext.Provider>;
};

const API = {
  APIContext,
  Wrapper: Provider,
};

export default API;
