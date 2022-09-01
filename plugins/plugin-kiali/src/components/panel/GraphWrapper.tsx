import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { memo } from 'react';
import cytoscape from 'cytoscape';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Graph from './Graph';
import { IGraph } from '../../utils/interfaces';

interface IGraphWrapperProps {
  instance: IPluginInstance;
  namespaces: string[];
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const GraphWrapper: React.FunctionComponent<IGraphWrapperProps> = ({
  instance,
  namespaces,
  times,
  setDetails,
}: IGraphWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IGraph, Error>(
    ['kiali/graph', instance, times, namespaces],
    async () => {
      try {
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');

        const response = await fetch(
          `/api/plugins/kiali/graph?duration=${
            times.timeEnd - times.timeStart
          }&graphType=versionedApp&injectServiceNodes=true&groupBy=app${[
            'deadNode',
            'sidecarsCheck',
            'serviceEntry',
            'istio',
          ].join('&appender=')}&${namespaceParams}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
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
        instance={instance}
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