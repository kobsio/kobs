import { Box, Button, Typography } from '@mui/material';
import { useContext, useState } from 'react';

import { APIContext } from '../api/context';

const Home: React.FunctionComponent = () => {
  const [ok, setOK] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { api } = useContext(APIContext);

  const handleButtonPress = async (): Promise<void> => {
    setIsLoading(true);
    api
      .get<void>('/api/health')
      .then((r) => {
        setOK(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">Home</Typography>
      <Typography component="span">
        <pre>{JSON.stringify(ok, null, 2)}</pre>
      </Typography>
      <Button onClick={handleButtonPress} disabled={isLoading}>
        Call /health
      </Button>
    </Box>
  );
};

export default Home;
