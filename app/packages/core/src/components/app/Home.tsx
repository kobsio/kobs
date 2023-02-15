import { Box, Button, Typography } from '@mui/material';
import { useContext, useState } from 'react';

import { IUser } from '../api/api';
import { APIContext } from '../api/context';

const Home: React.FunctionComponent = () => {
  const [user, setUser] = useState<IUser>();
  const [isLoading, setIsLoading] = useState(false);
  const { api } = useContext(APIContext);

  const handleButtonPress = async (): Promise<void> => {
    setIsLoading(true);
    api
      .get<IUser>('/api/auth/me')
      .then((u) => {
        setUser(u);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">Home</Typography>
      {JSON.stringify(user, null, 2)}
      <Button onClick={handleButtonPress} disabled={isLoading}>
        Reload User
      </Button>
    </Box>
  );
};

export default Home;
