import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';

import { IPluginInstance } from '@kobsio/shared';
import { IPluginTimes } from '@kobsio/plugin-core';
import { ITopology } from '../../utils/interfaces';
import React from 'react';
import TopologyGraph from './TopologyGraph';

export interface IAdditionalColumns {
  title: string;
  label: string;
}

export interface ITopologyProps {
  instance: IPluginInstance;
  namespace: string;
  application: string;
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Topology: React.FunctionComponent<ITopologyProps> = ({
  instance,
  namespace,
  application,
  times,
  setDetails,
}: ITopologyProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, Error>(
    ['istio/topology', instance, namespace, application, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/istio/topology?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}&application=${application}&namespace=${namespace}`,
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
        title="Could not get topology"
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

  if (!data) {
    return null;
  }

  return (
    <TopologyGraph
      instance={instance}
      edges={data.edges}
      nodes={data.nodes}
      namespace={namespace}
      application={application}
      times={times}
      setDetails={setDetails}
    />
  );
};

export default Topology;
