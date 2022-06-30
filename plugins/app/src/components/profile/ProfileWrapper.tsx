import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardsWrapper } from '../dashboards/DashboardsWrapper';
import { IUser } from '../../crds/user';

interface IProfileWrapperProps {
  email: string;
}

const ProfileWrapper: React.FunctionComponent<IProfileWrapperProps> = ({ email }: IProfileWrapperProps) => {
  const navigate = useNavigate();

  const { isError, isLoading, error, data, refetch } = useQuery<IUser, Error>(['app/users/user', email], async () => {
    const response = await fetch(`/api/users/user?email=${email}`, {
      method: 'get',
    });
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json;
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
        title="Could not get profile"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IUser, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.dashboards || data.dashboards.length === 0) {
    return null;
  }

  return <DashboardsWrapper manifest={data} references={data.dashboards} useDrawer={true} />;
};

export default ProfileWrapper;
