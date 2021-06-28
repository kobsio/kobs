import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { IEdge, INode } from '../../utils/utils';
import ApplicationsTopologyGraph from './ApplicationsTopologyGraph';

interface IDataState {
  edges: IEdge[];
  nodes: INode[];
}

interface IApplicationsTopologyProps {
  clusters: string[];
  namespaces: string[];
  showDetails?: (details: React.ReactNode) => void;
}

// ApplicationsTopology is the component to display all applications inside a gallery view.
const ApplicationsTopology: React.FunctionComponent<IApplicationsTopologyProps> = ({
  clusters,
  namespaces,
  showDetails,
}: IApplicationsTopologyProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<IDataState, Error>(
    ['applications/applications', 'topology', clusters, namespaces],
    async () => {
      try {
        const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');

        const response = await fetch(
          `/api/plugins/applications/applications?view=topology&${clusterParams}&${namespaceParams}`,
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
      } catch (err) {
        throw err;
      }
    },
  );

  console.log('TOPOLOGY', data, clusters, namespaces);

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
        title="Applications were not fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IDataState, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div style={{ height: '100%', minHeight: '100%' }}>
      <ApplicationsTopologyGraph edges={data.edges} nodes={data.nodes} showDetails={showDetails} />
    </div>
  );
};

export default memo(ApplicationsTopology, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.clusters) === JSON.stringify(nextProps.clusters) &&
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces)
  ) {
    return true;
  }

  return false;
});
