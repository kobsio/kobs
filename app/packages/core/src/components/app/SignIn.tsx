import { Box, TextField } from '@mui/material';
import { FunctionComponent } from 'react';

const Signin: FunctionComponent = () => {
  return (
    <Box>
      <TextField required={true} id="email" label="E-Mail" />
      <TextField required={true} id="password" label="Password" />
    </Box>
  );
};

export default Signin;
