import { Button, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { APIContext, IAPIContext, APIError } from '../../../context/APIContext';

/**
 * The `SigninOIDC` component displays a button, which lets the user sign in via a configured OIDC provider. If no OIDC
 * provider is configured the returned url will be empty and the button is disabled.
 */
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
