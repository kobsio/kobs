import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import ApplicationsTopologyGraph from './ApplicationsTopologyGraph';
import { ITopology } from './utils/interfaces';

export interface IApplicationTopologyProps {
  satellite: string;
  cluster: string;
  namespace: string;
  name: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationTopology: React.FunctionComponent<IApplicationTopologyProps> = ({
  satellite,
  cluster,
  namespace,
  name,
  setDetails,
}: IApplicationTopologyProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, Error>(
    ['app/applications/applications/topology/application', satellite, cluster, namespace, name],
    async () => {
      const response = await fetch(
        `/api/applications/topology/application?id=${encodeURIComponent(
          `/satellite/${satellite}/cluster/${cluster}/namespace/${namespace}/name/${name}`,
        )}`,
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
        title="An error occured while topology were fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITopology, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.edges || !data.nodes || data.edges.length === 0 || data.nodes.length === 0) {
    return null;
  }

  return <ApplicationsTopologyGraph edges={data.edges} nodes={data.nodes} setDetails={setDetails} />;
};

export default ApplicationTopology;
