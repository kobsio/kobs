import { Alert, Box, Button, CircularProgress, Divider, Paper, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, FunctionComponent, useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { APIContext } from '../api/context';

enum SigninState {
  OK = 0,
  NO_EMAIL = 1 << 0,
  NO_PASSWORD = 1 << 1,
  INVALID_CREDENTIALS = 1 << 2,
}

const Signin: FunctionComponent = () => {
  const { api } = useContext(APIContext);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [state, setState] = useState<SigninState>(SigninState.OK);

  const { data, isLoading, isError, error } = useQuery<{ url: string }, Error>(['app/signin/oidc'], () => {
    const redirect = params.get('redirect');
    const path = `/api/auth/oidc?redirect=${encodeURIComponent(redirect || '/')}`;

    return api.get<{ url: string }>(path, { disableAutorefresh: true });
  });

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!email) {
      setState(state | SigninState.NO_EMAIL);
      return;
    }

    if (!password) {
      setState(state | SigninState.NO_PASSWORD);
      return;
    }

    api
      .post('/api/auth/signin', {
        body: { email, password },
        disableAutorefresh: true,
      })
      .then(() => {
        setState(SigninState.OK);
        navigate(params.get('redirect') || '/');
      })
      .catch(() => {
        setState(state | SigninState.INVALID_CREDENTIALS);
      });
  };

  if (isError) {
    return <>{error.message}</>;
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Paper component="form" sx={{ display: 'inline-flex', mx: 'auto', p: 10 }} onSubmit={handleSubmit}>
        <Stack display="inline-flex" flexDirection="column" spacing={2}>
          <Typography variant="h6">Sign into your account</Typography>
          <Typography>Enter your username and password or use the OIDC provider.</Typography>
          <TextField
            error={(state & SigninState.NO_EMAIL) === SigninState.NO_EMAIL}
            id="email"
            name="email"
            label="E-Mail"
            onChange={(e): void => {
              const newEmail = e.target.value;
              if (newEmail) {
                setEmail(newEmail);
                setState(state & ~SigninState.NO_EMAIL);
              } else {
                setState(state | SigninState.NO_EMAIL);
              }
            }}
            helperText={(state & SigninState.NO_EMAIL && 'please fill in your e-mail') || ' '}
          />
          <TextField
            error={(state & SigninState.NO_PASSWORD) === SigninState.NO_PASSWORD}
            id="password"
            name="password"
            type="password"
            label="Password"
            onChange={(e): void => {
              const newPassword = e.target.value;
              if (newPassword) {
                setPassword(newPassword);
                setState(state & ~SigninState.NO_PASSWORD);
              } else {
                setState(state | SigninState.NO_PASSWORD);
              }
            }}
            helperText={(state & SigninState.NO_PASSWORD && 'please fill in your password') || ' '}
          />
          <Button type="submit" variant="contained">
            Sign In
          </Button>
          {(state & SigninState.INVALID_CREDENTIALS) === SigninState.INVALID_CREDENTIALS && (
            <Alert severity="error" variant="outlined">
              The credentials are not correct.
            </Alert>
          )}
          {data && (
            <>
              <Divider />
              <Button type="submit" variant="outlined" component={Link} to={data.url}>
                Sign in via OIDC
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Signin;
