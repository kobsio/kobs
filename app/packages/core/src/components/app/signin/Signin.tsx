import { Stack, Alert, Box, TextField, Typography, Button, Card } from '@mui/material';
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

/**
 * The `Signin` component displays the sing in form, which lets the user sing in via his username and password. It also
 * shows the `SigninOIDC` component so that a user can sign in via a configured OIDC provider.
 */
const Signin: FunctionComponent = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const apiContext = useContext<IAPIContext>(APIContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [state, setState] = useState<SigninState>(SigninState.OK);

  /**
   * `handleSubmit` handle the submission of the sing in form. If the sign in succeeds the user is redirect to the home
   * page or the page he visits last (this is saved in the `redirect` parameter). If the sign in fails an error message
   * is displayed or the missing form value is marked as missing.
   */
  const handleSubmit = async (e: FormEvent) => {
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
      setIsLoading(true);
      await apiContext.client.signin(username, password);
      setIsLoading(false);
      setState(SigninState.OK);
      navigate(params.get('redirect') || '/');
    } catch (_) {
      setIsLoading(false);
      setState(state | SigninState.INVALID_CREDENTIALS);
    }
  };

  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
        <Card sx={{ p: 10 }} component="form" onSubmit={handleSubmit}>
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
              onChange={(e) => {
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
              onChange={(e) => {
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

            <Button type="submit" variant="contained" disabled={isLoading}>
              Sign In
            </Button>

            {(state & SigninState.INVALID_CREDENTIALS) === SigninState.INVALID_CREDENTIALS && (
              <Alert severity="error">Invalid username or password</Alert>
            )}

            <SigninOIDC />
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default Signin;
