import { Button, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { APIContext, IAPIContext, APIError } from '../../../context/APIContext';

const SigninOIDC: FunctionComponent = () => {
  const [params] = useSearchParams();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { data } = useQuery<string, APIError>(['core/signin/oidc/callback'], async () => {
    const redirect = params.get('redirect');
    const { url } = await apiContext.client.get<{ url: string }>(
      `/api/auth/oidc?redirect=${encodeURIComponent(redirect || '/')}`,
    );
    return url;
  });

  return (
    <>
      <Divider />
      <Button variant="contained" disabled={!data} component={Link} to={data || ''}>
        Sign in via OIDC
      </Button>
    </>
  );
};

export default SigninOIDC;
