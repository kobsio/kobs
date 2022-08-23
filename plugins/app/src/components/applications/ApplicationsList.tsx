import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import ApplicationsListItem from './ApplicationsListItem';
import { IApplication } from '../../crds/application';
import { IOptions } from './utils/interfaces';

export interface IApplicationsListProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
  selectedApplication?: IApplication;
  setSelectedApplication: (application: IApplication) => void;
}

const ApplicationsList: React.FunctionComponent<IApplicationsListProps> = ({
  options,
  setOptions,
  selectedApplication,
  setSelectedApplication,
}: IApplicationsListProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['app/applications/applications', options],
    async () => {
      const c = options.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
      const n = options.clusterIDs
        .map((clusterID) =>
          options.namespaces.map(
            (namespace) => `&namespaceID=${encodeURIComponent(`${clusterID}/namespace/${namespace}`)}`,
          ),
        )
        .flat();
      const t = options.tags.map((tag) => `&tag=${encodeURIComponent(tag)}`);

      const response = await fetch(
        `/api/applications?all=${options.all}&external=${options.external}&searchTerm=${options.searchTerm}&limit=${
          options.perPage
        }&offset=${(options.page - 1) * options.perPage}${c.length > 0 ? c.join('') : ''}${
          n.length > 0 ? n.join('') : ''
        }${t.length > 0 ? t.join('') : ''}`,
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
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
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
    );
  }

  if (!data || data.length === 0) {
    if (!options.all) {
      return (
        <Alert
          variant={AlertVariant.info}
          title="No applications were found"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): void => setOptions({ ...options, all: true })}>
                Search all applications
              </AlertActionLink>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>We could not found any applications you own for the selected filters.</p>
        </Alert>
      );
    }

    return null;
  }

  return (
    <DataList
      aria-label="applications list"
      selectedDataListItemId={selectedApplication ? selectedApplication.id : undefined}
    >
      {data.map((application) => (
        <ApplicationsListItem
          key={application.id}
          application={application}
          selectApplication={setSelectedApplication}
        />
      ))}
    </DataList>
  );
};

export default ApplicationsList;
