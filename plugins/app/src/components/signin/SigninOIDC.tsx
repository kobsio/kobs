import { Button, ButtonVariant, Divider } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface ISigninOIDCProps {
  isLoading: boolean;
}

const SigninOIDC: React.FunctionComponent<ISigninOIDCProps> = ({ isLoading }: ISigninOIDCProps) => {
  const { data } = useQuery<string, Error>(['app/signin/oidc'], async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');

    const response = await fetch(
      `/api/auth/oidc?redirect=${encodeURIComponent(
        redirect && redirect.startsWith(window.location.origin) ? redirect.replace(window.location.origin, '') : '',
      )}`,
      { method: 'get' },
    );
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json.url;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  if (!data) {
    return null;
  }

  return (
    <React.Fragment>
      <Divider className="pf-u-mb-xl" />
      <Button isBlock={true} isDisabled={isLoading} variant={ButtonVariant.primary} component="a" href={data}>
        Sign in via OIDC provider
      </Button>
    </React.Fragment>
  );
};

export default SigninOIDC;
