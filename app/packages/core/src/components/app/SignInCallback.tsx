import { Alert, Box, CircularProgress, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { APIContext } from '../api/context';

const SigninOIDCCallbackInternal: React.FunctionComponent = () => {
  const { api } = useContext(APIContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isError, error } = useQuery<boolean, Error>(['app/signin/oidc/callback'], async () => {
    const { url } = await api.get<{ url: string }>(
      `/api/auth/oidc/callback?state=${params.get('state')}&code=${params.get('code')}`,
    );
    navigate(url || '/');
    return true;
  });

  if (isError) {
    return <Alert severity="warning">{error.message}</Alert>;
  }

  return <CircularProgress />;
};

const SigninOIDCCallback: FunctionComponent = () => {
  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Paper sx={{ display: 'inline-flex', mx: 'auto', p: 10 }}>
        <SigninOIDCCallbackInternal />
      </Paper>
    </Box>
  );
};

export default SigninOIDCCallback;
