import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { APIContext, APIError, IAPIContext, IAPIUser } from '../../../context/APIContext';

const SigninOIDCCallback: FunctionComponent = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, error, refetch } = useQuery<IAPIUser, APIError>(['core/signin/oidc/callback'], async () => {
    const { user, url } = await apiContext.client.signinOIDC(params.get('state') || '', params.get('code') || '');
    navigate(url || '/');
    return user;
  });

  if (isError) {
    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                RETRY
              </Button>
            }
          >
            <AlertTitle>Sign in failed</AlertTitle>
            {error.message}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default SigninOIDCCallback;
