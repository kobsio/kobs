import React from 'react';
import { useHistory } from 'react-router-dom';

// HeaderLogo provides the logo for the PageHeader, which is used within the App.tsx file for the header of kobs. When
// the logo is clicked the user can navigate to the overview page.
const HeaderLogo: React.FunctionComponent = () => {
  const history = useHistory();

  const handleClick = (): void => {
    history.push('/');
  };

  return <img src="/img/header-logo.png" onClick={handleClick} alt="kobs" />;
};

export default HeaderLogo;
