import { Button, ButtonVariant } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { IPluginInstance } from '@kobsio/shared';

interface ILoginLinkProps {
  instance: IPluginInstance;
}

const LoginLink: React.FunctionComponent<ILoginLinkProps> = ({ instance }: ILoginLinkProps) => {
  const { isError, isLoading, data } = useQuery<string, Error>(['github/oauth/login', instance], async () => {
    try {
      const response = await fetch(`/api/plugins/github/oauth/login`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': instance.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': instance.satellite,
        },
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json.url;
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occurred');
        }
      }
    } catch (err) {
      throw err;
    }
  });

  if (isLoading) {
    return (
      <Button variant={ButtonVariant.link} isInline={true} isLoading={true} isDisabled={true}>
        Login
      </Button>
    );
  }

  if (isError) {
    return (
      <Button variant={ButtonVariant.link} isInline={true} isDisabled={true}>
        Login
      </Button>
    );
  }

  return (
    <Button
      variant={ButtonVariant.link}
      isInline={true}
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      component={(props): React.ReactElement => (
        <a {...props} href={data} target="_blank" rel="noreferrer">
          Login
        </a>
      )}
    >
      Login
    </Button>
  );
};

export default LoginLink;
