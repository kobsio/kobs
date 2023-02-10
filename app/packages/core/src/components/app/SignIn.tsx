import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { FormEvent, FunctionComponent, useContext, useState } from 'react';

import { APIContext } from '../api/context';

const Signin: FunctionComponent = () => {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const { api } = useContext(APIContext);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    await api.post('/api/auth/signin', {
      body: { email, password },
    });
  };

  return (
    <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
      <Paper component="form" sx={{ display: 'inline-flex', mx: 'auto', p: 10 }} onSubmit={handleSubmit}>
        <Stack display="inline-flex" flexDirection="column" spacing={4}>
          <Typography variant="h6">Sign into your account</Typography>
          <Typography>Enter your username and password or use the OIDC provider.</Typography>
          <TextField
            required={true}
            id="email"
            name="email"
            label="E-Mail"
            onChange={(e): void => setEmail(e.target.value)}
          />
          <TextField
            required={true}
            id="password"
            name="password"
            type="password"
            label="Password"
            onChange={(e): void => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Sign In
          </Button>
          <Divider />
          <Button variant="outlined">Sign in via OIDC</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Signin;
