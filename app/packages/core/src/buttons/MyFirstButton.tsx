import React, { useState } from 'react';

export const MyFirstButton: React.FunctionComponent = () => {
  const [count, setCount] = useState(0);

  return <button onClick={(): void => setCount((count) => count + 1)}>my first count is {count}</button>;
};
