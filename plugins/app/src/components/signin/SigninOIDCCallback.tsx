import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

const SigninOIDCCallback: React.FunctionComponent = () => {
  const { isError, isLoading, error, refetch } = useQuery<boolean, Error>(['app/signin/oidc/callback'], async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const response = await fetch(
      `/api/auth/oidc/callback?state=${searchParams.get('state')}&code=${searchParams.get('code')}`,
      { method: 'get' },
    );
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      window.location.replace(json.url ? json.url : '/');
      return true;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Authorization failed"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<boolean, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  return null;
};

export default SigninOIDCCallback;
