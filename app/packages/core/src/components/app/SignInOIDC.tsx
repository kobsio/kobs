import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { FunctionComponent, FormEvent, useContext } from 'react';
import { Link } from 'react-router-dom';

import { APIContext } from '../api/context';

const SigninOIDC: FunctionComponent = () => {
  const { api } = useContext(APIContext);
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    api.post('/app/signin/oidc').catch((e) => {
      // TODO handle error
      console.error(e);
    });
  };

  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Paper component="form" sx={{ display: 'inline-flex', mx: 'auto', p: 10 }} onSubmit={handleSubmit}>
        <Stack display="inline-flex" flexDirection="column" spacing={2}>
          <Typography variant="h6" mb={2}>
            Sign in with OIDC
          </Typography>
          <Button type="submit" variant="contained">
            Sign In
          </Button>
          <Divider />
          <Button variant="outlined" component={Link} to="/auth">
            Sign in via Credentials
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SigninOIDC;
