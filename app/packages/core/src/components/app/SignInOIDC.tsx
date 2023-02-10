import { Button, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';

import { APIContext } from '../api/context';
// import { useQuery } from '@tanstack/react-query';

interface ISigninOIDCProps {
  isLoading: boolean;
}

const SigninOIDC: React.FunctionComponent<ISigninOIDCProps> = ({ isLoading }: ISigninOIDCProps) => {
  const { api } = useContext(APIContext);
  const { data } = useQuery<string, Error>(['app/signin/oidc'], async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');

    return api.get<string>(
      `/api/auth/oidc?redirect=${encodeURIComponent(
        redirect && redirect.startsWith(window.location.origin) ? redirect.replace(window.location.origin, '') : '',
      )}`,
    );
  });

  if (!data) {
    return null;
  }

  return (
    <React.Fragment>
      <Divider />
      <Button variant="contained" component="a" href={data}>
        Sign in via OIDC provider
      </Button>
    </React.Fragment>
  );
};

export default SigninOIDC;
