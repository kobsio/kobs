import {Box, CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {FunctionComponent, ReactNode, useContext} from 'react';
import {BrowserRouter, Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {APIContext, APIError, IAPIContext, IAPIUser} from '../../context/APIContext';
import {IAppIcons} from '../../context/AppContext';
import {IPlugin} from '../../context/PluginContext';
import {QueryClientProvider} from '../../context/QueryClientProvider';
import PluginPage from '../plugins/PluginPage';

/**
 * `IAuthWrapper` is the interface which defines the properties for the `AuthWrapper` component. We only have to provide
 * a `children` which should be protected by the `AuthWrapper` component.
 */
interface IAuthWrapper {
  children: ReactNode;
}

/**
 * The `AuthWrapper` component is used to protect the provided `children`. This means that the provided `children` can
 * only be accessed when the user is authenticated. For this we are calling the `auth` method of our API client which
 * returns the authenticated user. If we can not get a user within the `auth` method and our API returns a unauthorized
 * error we automatically redirecting the user to the sign in page.
 */
const AuthWrapper: FunctionComponent<IAuthWrapper> = ({children}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiContext = useContext<IAPIContext>(APIContext);

  const {isLoading, isError, error} = useQuery<IAPIUser, APIError>(['core/authwrapper'], async () => {
    return apiContext.client.auth();
  });

  if (isLoading) {
    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{display: 'inline-flex', mx: 'auto'}}>
          <CircularProgress/>
        </Box>
      </Box>
    );
  }

  if (isError) {
    if (error.statusCode === 401) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`);

      return (
        <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
          <Box sx={{display: 'inline-flex', mx: 'auto'}}>
            <CircularProgress/>
          </Box>
        </Box>
      );
    }

    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{display: 'inline-flex', mx: 'auto'}}>
          <CircularProgress/>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

/**
 * `IAppProps` are the properties for our `App` component. Currently we only require a list of `plugins`, so that
 * plugins can be registered without touching the core of our app.
 */
interface IAppProps {
  icons?: IAppIcons;
  plugins: IPlugin[];
}

/**
 * The `App` component defines, defines all the contexts and routes we are using in our app. The `App` component is also
 * responsible for defining our layout and registering the theme.
 */
export const App: FunctionComponent<IAppProps> = ({icons, plugins}) => {
  return (
    <QueryClientProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<PluginPage/>}>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
