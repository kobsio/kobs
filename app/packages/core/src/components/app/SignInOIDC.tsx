import { Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { APIContext } from '../api/context';

const SigninOIDCInternal: FunctionComponent = () => {
  const { api } = useContext(APIContext);
  const [params] = useSearchParams();
  const { search } = useLocation();
  const { data, isLoading, isError, error } = useQuery<{ url: string }, Error>(['app/signin/oidc'], () => {
    const redirect = params.get('redirect');
    const path = `/api/auth/oidc?redirect=${encodeURIComponent(
      redirect && redirect.startsWith(window.location.origin) ? redirect.replace(window.location.origin, '') : '',
    )}`;

    return api.get<{ url: string }>(path);
  });

  if (isError) {
    return <>{error.message}</>;
  }

  if (isLoading || !data) {
    return <CircularProgress />;
  }

  return (
    <Stack display="inline-flex" flexDirection="column" spacing={2}>
      <Typography variant="h6" mb={2}>
        Sign in with OIDC
      </Typography>
      <Button type="submit" variant="contained" component={Link} to={data.url}>
        Sign In
      </Button>
      <Divider />
      <Button variant="outlined" component={Link} to={`/auth${search}`}>
        Sign in via Credentials
      </Button>
    </Stack>
  );
};

const SigninOIDC: FunctionComponent = () => {
  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Paper sx={{ display: 'inline-flex', mx: 'auto', p: 10 }}>
        <SigninOIDCInternal />
      </Paper>
    </Box>
  );
};

export default SigninOIDC;
