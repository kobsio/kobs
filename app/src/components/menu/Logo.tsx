import React from 'react';
import { useHistory } from 'react-router-dom';

const Logo: React.FunctionComponent = () => {
  const history = useHistory();

  const handleClick = (): void => {
    history.push('/');
  };

  return <img src="/img/header-logo.png" onClick={handleClick} alt="kobs" />;
};

export default Logo;
