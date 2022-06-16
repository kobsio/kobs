import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import ApplicationsListItem from './ApplicationsListItem';
import { IApplication } from '../../crds/application';
import { IOptions } from './utils/interfaces';

export interface IApplicationsListProps {
  options: IOptions;
  selectedApplication?: IApplication;
  setSelectedApplication: (application: IApplication) => void;
}

const ApplicationsList: React.FunctionComponent<IApplicationsListProps> = ({
  options,
  selectedApplication,
  setSelectedApplication,
}: IApplicationsListProps) => {
  const selectApplicationID = (id: string): void => {
    const selectedApplications = data?.filter((application) => application.id === id);
    if (selectedApplications?.length === 1) {
      setSelectedApplication(selectedApplications[0]);
    }
  };

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
    return null;
  }

  return (
    <DataList
      aria-label="applications list"
      selectedDataListItemId={selectedApplication ? selectedApplication.id : undefined}
      onSelectDataListItem={selectApplicationID}
    >
      {data.map((application) => (
        <ApplicationsListItem key={application.id} application={application} />
      ))}
    </DataList>
  );
};

export default ApplicationsList;
