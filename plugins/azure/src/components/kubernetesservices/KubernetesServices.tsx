import { Alert, AlertActionLink, AlertVariant, Menu, MenuContent, MenuList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IManagedCluster } from './interfaces';
import KubernetesServicesItem from './KubernetesServicesItem';

interface IKubernetesServicesProps {
  name: string;
  resourceGroups: string[];
  setDetails?: (details: React.ReactNode) => void;
}

const KubernetesServices: React.FunctionComponent<IKubernetesServicesProps> = ({
  name,
  resourceGroups,
  setDetails,
}: IKubernetesServicesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IManagedCluster[], Error>(
    ['azure/kubernetesservices/managedclusters', name, resourceGroups],
    async () => {
      try {
        const resourceGroupsParams = resourceGroups.map((resourceGroup) => `resourceGroup=${resourceGroup}`).join('&');

        const response = await fetch(
          `/api/plugins/azure/${name}/kubernetesservices/managedclusters?${resourceGroupsParams}`,
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
        title="Could not get managed clusters"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IManagedCluster[], Error>> => refetch()}>
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
    <Menu>
      <MenuContent>
        <MenuList>
          {data.map((managedCluster, index) => (
            <KubernetesServicesItem key={index} name={name} managedCluster={managedCluster} setDetails={setDetails} />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default KubernetesServices;
