import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { IEdge, INode } from '../../utils/interfaces';
import ApplicationsTopologyGraph from './ApplicationsTopologyGraph';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IDataState {
  edges: IEdge[];
  nodes: INode[];
}

interface IApplicationsTopologyProps {
  clusters: string[];
  namespaces: string[];
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

// ApplicationsTopology is the component to display all applications inside a topology view. We need a list of clusters
// and namespaces to build the topology view in the API. The API then returnes all related edges and nodes, in a format
// which can be used by cytoscape, which is responsible for rendering the topology.
const ApplicationsTopology: React.FunctionComponent<IApplicationsTopologyProps> = ({
  clusters,
  namespaces,
  times,
  setDetails,
}: IApplicationsTopologyProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<IDataState, Error>(
    ['applications/applications', 'topology', clusters, namespaces, times],
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
      <ApplicationsTopologyGraph edges={data.edges} nodes={data.nodes} setDetails={setDetails} />
    </div>
  );
};

export default memo(ApplicationsTopology, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
