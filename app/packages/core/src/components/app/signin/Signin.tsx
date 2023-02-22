import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { FormEvent, FunctionComponent, useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import SigninOIDC from './SigninOIDC';

import logo from '../../../assets/logo.svg';
import { APIContext, IAPIContext } from '../../../context/APIContext';

enum SigninState {
  OK = 0,
  NO_USERANME = 1 << 0,
  NO_PASSWORD = 1 << 1,
  INVALID_CREDENTIALS = 1 << 2,
}

const Signin: FunctionComponent = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const apiContext = useContext<IAPIContext>(APIContext);

  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [state, setState] = useState<SigninState>(SigninState.OK);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!username) {
      setState(state | SigninState.NO_USERANME);
      return;
    }

    if (!password) {
      setState(state | SigninState.NO_PASSWORD);
      return;
    }

    try {
      await apiContext.client.signin(username, password);
      setState(SigninState.OK);
      navigate(params.get('redirect') || '/');
    } catch (_) {
      setState(state | SigninState.INVALID_CREDENTIALS);
    }
  };

  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
        <Paper sx={{ p: 10 }} component="form" onSubmit={handleSubmit}>
          <Stack display="inline-flex" flexDirection="column" spacing={2}>
            <Box
              sx={{
                img: {
                  height: '92px',
                  width: '92px',
                },
                m: '0 auto',
                pb: 2,
                textAlign: 'center',
              }}
            >
              <img src={logo} alt="" />
            </Box>
            <Typography component="h1" variant="h4" align="center" gutterBottom={true}>
              Welcome to kobs
            </Typography>
            <Typography component="h2" variant="body1" align="center">
              Enter your username and password or use the OIDC provider to sing in
            </Typography>

            <TextField
              error={(state & SigninState.NO_USERANME) === SigninState.NO_USERANME}
              id="username"
              name="username"
              label="Username"
              onChange={(e): void => {
                const newUsername = e.target.value;
                if (newUsername) {
                  setUsername(newUsername);
                  setState(state & ~SigninState.NO_USERANME);
                } else {
                  setState(state | SigninState.NO_USERANME);
                }
              }}
              helperText={(state & SigninState.NO_USERANME && 'Username is required') || ' '}
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
              helperText={(state & SigninState.NO_PASSWORD && 'Password is required') || ' '}
            />

            <Button type="submit" variant="contained">
              Sign In
            </Button>

            {(state & SigninState.INVALID_CREDENTIALS) === SigninState.INVALID_CREDENTIALS && (
              <Alert severity="error">Invalid username or password</Alert>
            )}

            <SigninOIDC />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Signin;
