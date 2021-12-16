import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { memo } from 'react';
import cytoscape from 'cytoscape';

import Graph from './Graph';
import { IGraph } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IGraphWrapperProps {
  name: string;
  namespaces: string[];
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

const GraphWrapper: React.FunctionComponent<IGraphWrapperProps> = ({
  name,
  namespaces,
  times,
  setDetails,
}: IGraphWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IGraph, Error>(
    ['kiali/graph', name, times, namespaces],
    async () => {
      try {
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');

        const response = await fetch(
          `/api/plugins/kiali/${name}/graph?duration=${
            times.timeEnd - times.timeStart
          }&graphType=versionedApp&injectServiceNodes=true&groupBy=app${[
            'deadNode',
            'sidecarsCheck',
            'serviceEntry',
            'istio',
          ].join('&appender=')}&${namespaceParams}`,
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
        title="Could not get topology graph"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IGraph, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.elements || !data.elements.edges || !data.elements.nodes) {
    return null;
  }

  return (
    <div style={{ height: '100%', minHeight: '100%' }}>
      <Graph
        name={name}
        times={times}
        edges={data.elements.edges as cytoscape.ElementDefinition[]}
        nodes={data.elements.nodes as cytoscape.ElementDefinition[]}
        setDetails={setDetails}
      />
    </div>
  );
};

export default memo(GraphWrapper, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces) &&
    JSON.stringify(prevProps.times) === JSON.stringify(nextProps.times)
  ) {
    return true;
  }

  return false;
});
