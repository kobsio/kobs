import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import DetailsNodePoolsItem from './DetailsNodePoolsItem';
import { INodePool } from './interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IDetailsNodePoolsProps {
  instance: IPluginInstance;
  resourceGroup: string;
  managedCluster: string;
  nodeResourceGroup?: string;
}

const DetailsNodePools: React.FunctionComponent<IDetailsNodePoolsProps> = ({
  instance,
  resourceGroup,
  managedCluster,
  nodeResourceGroup,
}: IDetailsNodePoolsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<INodePool[], Error>(
    ['azure/kubernetesservice/managedcluster/nodepools', instance, resourceGroup, managedCluster],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/kubernetesservices/managedcluster/nodepools?resourceGroup=${resourceGroup}&managedCluster=${managedCluster}`,
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
        isInline={true}
        title="Could not get managed node pools"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<INodePool[], Error>> => refetch()}>
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
    <div className="kobsio-hide-scrollbar" style={{ maxWidth: '100%', overflow: 'auto' }}>
      <TableComposable aria-label="Node Pools" variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th />
            <Th>Name</Th>
            <Th>Provisioning State</Th>
            <Th>Power State</Th>
            <Th>Node Count</Th>
            <Th>Mode</Th>
            <Th>Kubernetes Version</Th>
            <Th>Node Size</Th>
            <Th>Operating System</Th>
            <Th />
          </Tr>
        </Thead>
        {data.map((nodePool) => (
          <DetailsNodePoolsItem
            key={nodePool.id || ''}
            instance={instance}
            resourceGroup={resourceGroup}
            managedCluster={managedCluster}
            nodeResourceGroup={nodeResourceGroup}
            nodePool={nodePool}
          />
        ))}
      </TableComposable>
    </div>
  );
};

export default DetailsNodePools;
