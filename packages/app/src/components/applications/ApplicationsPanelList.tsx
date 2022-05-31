import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import ApplicationDetails from './ApplicationDetails';
import ApplicationsListItem from './ApplicationsListItem';
import { IApplication } from '../../crds/application';

export interface IApplicationsPanelListProps {
  team: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationsPanelList: React.FunctionComponent<IApplicationsPanelListProps> = ({
  team,
  setDetails,
}: IApplicationsPanelListProps) => {
  const selectApplicationID = (id: string): void => {
    const selectedApplications = data?.filter((application) => application.id === id);
    if (selectedApplications?.length === 1 && setDetails) {
      setDetails(
        <ApplicationDetails application={selectedApplications[0]} close={(): void => setDetails(undefined)} />,
      );
    }
  };

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['app/applications/team', team],
    async () => {
      const response = await fetch(`/api/applications/team?team=${team}`, {
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
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <DataList
      aria-label={`applications list ${team}`}
      selectedDataListItemId={undefined}
      onSelectDataListItem={selectApplicationID}
    >
      {data.map((application) => (
        <ApplicationsListItem key={application.id} application={application} />
      ))}
    </DataList>
  );
};

export default ApplicationsPanelList;
