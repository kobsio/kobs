import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import DetailsNodePoolsItem from './DetailsNodePoolsItem';
import { INodePool } from './interfaces';

interface IDetailsNodePoolsProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsNodePools: React.FunctionComponent<IDetailsNodePoolsProps> = ({
  name,
  resourceGroup,
  managedCluster,
}: IDetailsNodePoolsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<INodePool[], Error>(
    ['azure/kubernetesservice/managedcluster/nodepools', name, resourceGroup, managedCluster],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/kubernetesservices/managedcluster/nodepools?resourceGroup=${resourceGroup}&managedCluster=${managedCluster}`,
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
    <div style={{ maxWidth: '100%', overflow: 'scroll' }}>
      <TableComposable aria-label="Init Containers" variant={TableVariant.compact} borders={false}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Provisioning State</Th>
            <Th>Power State</Th>
            <Th>Node Count</Th>
            <Th>Mode</Th>
            <Th>Kubernetes Version</Th>
            <Th>Node Size</Th>
            <Th>Operating System</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((nodePool) => (
            <DetailsNodePoolsItem
              key={nodePool.id || ''}
              name={name}
              resourceGroup={resourceGroup}
              managedCluster={managedCluster}
              nodePool={nodePool}
            />
          ))}
        </Tbody>
      </TableComposable>
    </div>
  );
};

export default DetailsNodePools;
