import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IPluginTimes } from '@kobsio/plugin-core';
import { IRowValues } from '@kobsio/plugin-prometheus';
import { ITopology } from '../../utils/interfaces';
import TopologyGraph from './TopologyGraph';

export interface IAdditionalColumns {
  title: string;
  label: string;
}

export interface ITopologyProps {
  name: string;
  namespace: string;
  application: string;
  times: IPluginTimes;
  showDetails?: (row: IRowValues) => void;
}

const Topology: React.FunctionComponent<ITopologyProps> = ({
  name,
  namespace,
  application,
  times,
  showDetails,
}: ITopologyProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, Error>(
    ['istio/topology', name, namespace, application, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/istio/topology/${name}?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}&application=${application}&namespace=${namespace}`,
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

  return <TopologyGraph edges={data.edges} nodes={data.nodes} showDetails={showDetails} />;
};

export default Topology;
