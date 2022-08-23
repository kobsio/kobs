import { Alert, AlertActionLink, AlertVariant, CardFooter, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import ApplicationDetails from '../applications/ApplicationDetails';
import ApplicationsListItem from '../applications/ApplicationsListItem';
import { IApplication } from '../../crds/application';
import { PluginPanel } from '@kobsio/shared';
import UserApplicationsPagination from './UserApplicationsPagination';

export interface IUserApplicationsProps {
  title: string;
  description?: string;
  setDetails?: (details: React.ReactNode) => void;
}

const UserApplications: React.FunctionComponent<IUserApplicationsProps> = ({
  title,
  description,
  setDetails,
}: IUserApplicationsProps) => {
  const [options, setOptions] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const selectApplication = (application: IApplication): void => {
    if (setDetails) {
      setDetails(<ApplicationDetails application={application} close={(): void => setDetails(undefined)} />);
    }
  };

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['app/applications/user', options.page, options.perPage],
    async () => {
      const response = await fetch(
        `/api/applications?limit=${options.perPage}&offset=${(options.page - 1) * options.perPage}`,
        {
          method: 'get',
        },
      );
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
    },
    { keepPreviousData: true },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      footer={
        <CardFooter>
          <UserApplicationsPagination options={options} setOptions={setOptions} />
        </CardFooter>
      }
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="An error occured while applications were fetched"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.length > 0 ? (
        <DataList aria-label="applications list" selectedDataListItemId={undefined}>
          {data.map((application) => (
            <ApplicationsListItem
              key={application.id}
              application={application}
              selectApplication={selectApplication}
            />
          ))}
        </DataList>
      ) : null}
    </PluginPanel>
  );
};

export default UserApplications;
