import React, { useState } from 'react';
import { Button } from '@mui/material';

export const MySecondButton: React.FunctionComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={(): void => setCount((count) => count + 1)}>
      my second count is {count} and now it is changed
    </Button>
  );
};
