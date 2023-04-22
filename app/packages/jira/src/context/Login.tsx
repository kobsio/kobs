import { APIContext, APIError, IAPIContext, IPluginInstance } from '@kobsio/core';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, useContext, useState } from 'react';

export const Login: FunctionComponent<{ instance: IPluginInstance; refetchAuth: () => void }> = ({
  instance,
  refetchAuth,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [open, setOpen] = useState<boolean>(false);
  const [state, setState] = useState<{ email: string; error: string; isLoading: boolean; token: string }>({
    email: '',
    error: '',
    isLoading: false,
    token: '',
  });

  const handleLogin = async () => {
    setState({ ...state, error: '', isLoading: true });

    try {
      await apiContext.client.post('/api/plugins/jira/auth/login', {
        body: {
          email: state.email,
          token: state.token,
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      refetchAuth();
      setState({ ...state, error: '', isLoading: false });
      setOpen(false);
    } catch (err) {
      if (err instanceof APIError) {
        setState({ ...state, error: err.message, isLoading: false });
      } else {
        setState({ ...state, error: 'An unexpected error occured', isLoading: false });
      }
    }
  };

  return (
    <>
      <Button color="inherit" size="small" onClick={() => setOpen(true)}>
        LOGIN
      </Button>

      {open && (
        <Dialog open={open} onClose={() => setOpen(false)} fullScreen={fullScreen} maxWidth="md">
          <DialogTitle>Login</DialogTitle>
          <DialogContent sx={{ width: '50vw' }}>
            <Stack py={2} spacing={4} direction="column">
              <TextField
                size="small"
                label="Email"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
              />
              <TextField
                type="password"
                size="small"
                label="Token"
                value={state.token}
                onChange={(e) => setState({ ...state, token: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={!state.email || !state.token}
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button variant="outlined" size="small" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
