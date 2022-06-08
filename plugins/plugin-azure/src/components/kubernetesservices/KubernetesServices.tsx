import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import Details from './Details';
import { IManagedCluster } from './interfaces';
import { IPluginInstance } from '@kobsio/shared';
import KubernetesServicesItem from './KubernetesServicesItem';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IKubernetesServicesProps {
  instance: IPluginInstance;
  resourceGroups: string[];
  setDetails?: (details: React.ReactNode) => void;
}

const KubernetesServices: React.FunctionComponent<IKubernetesServicesProps> = ({
  instance,
  resourceGroups,
  setDetails,
}: IKubernetesServicesProps) => {
  const [selectedManagedCluster, setSelectedManagedCluster] = useState<string>();

  const selectManagedCluster = (id: string): void => {
    const selectedManagedClusters = data?.filter((countainerGroup) => countainerGroup.id === id);
    if (setDetails && selectedManagedClusters?.length === 1) {
      const resourceGroup = selectedManagedClusters[0].id ? getResourceGroupFromID(selectedManagedClusters[0].id) : '';

      setSelectedManagedCluster(selectedManagedClusters[0].id);
      setDetails(
        <Details
          instance={instance}
          resourceGroup={resourceGroup}
          managedCluster={selectedManagedClusters[0].name || ''}
          close={(): void => {
            setSelectedManagedCluster(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  const { isError, isLoading, error, data, refetch } = useQuery<IManagedCluster[], Error>(
    ['azure/kubernetesservices/managedclusters', instance, resourceGroups],
    async () => {
      try {
        const resourceGroupsParams = resourceGroups.map((resourceGroup) => `resourceGroup=${resourceGroup}`).join('&');

        const response = await fetch(`/api/plugins/azure/kubernetesservices/managedclusters?${resourceGroupsParams}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
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
    <DataList
      aria-label="container groups list"
      selectedDataListItemId={selectedManagedCluster}
      onSelectDataListItem={selectManagedCluster}
    >
      {data.map((managedCluster) => (
        <KubernetesServicesItem key={managedCluster.id} managedCluster={managedCluster} />
      ))}
    </DataList>
  );
};

export default KubernetesServices;
