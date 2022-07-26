import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { IContainer, IContainerGroup } from './interfaces';
import ContainerGroupsItem from './ContainerGroupsItem';
import Details from './Details';
import { IPluginInstance } from '@kobsio/shared';
import { getResourceGroupFromID } from '../../utils/helpers';

const getContainers = (containers?: IContainer[]): string[] => {
  const names: string[] = [];

  if (containers) {
    for (const container of containers) {
      if (container.name) {
        names.push(container.name);
      }
    }
  }

  return names;
};

interface IContainerGroupsProps {
  instance: IPluginInstance;
  resourceGroups: string[];
  setDetails?: (details: React.ReactNode) => void;
}

const ContainerGroups: React.FunctionComponent<IContainerGroupsProps> = ({
  instance,
  resourceGroups,
  setDetails,
}: IContainerGroupsProps) => {
  const [selectedContainerGroup, setSelectedContainerGroup] = useState<string>();

  const selectContainerGroup = (id: string): void => {
    const selectedContainerGroups = data?.filter((countainerGroup) => countainerGroup.id === id);
    if (setDetails && selectedContainerGroups?.length === 1) {
      const resourceGroup = selectedContainerGroups[0].id ? getResourceGroupFromID(selectedContainerGroups[0].id) : '';

      setSelectedContainerGroup(selectedContainerGroups[0].id);
      setDetails(
        <Details
          instance={instance}
          resourceGroup={resourceGroup}
          containerGroup={selectedContainerGroups[0].name || ''}
          containers={getContainers(selectedContainerGroups[0].properties?.containers)}
          close={(): void => {
            setSelectedContainerGroup(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  const { isError, isLoading, error, data, refetch } = useQuery<IContainerGroup[], Error>(
    ['azure/containergroups/containergroups', instance, resourceGroups],
    async () => {
      try {
        const resourceGroupsParams = resourceGroups.map((resourceGroup) => `resourceGroup=${resourceGroup}`).join('&');

        const response = await fetch(`/api/plugins/azure/containerinstances/containergroups?${resourceGroupsParams}`, {
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
            throw new Error('An unknown error occurred');
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
        title="Could not get container groups"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IContainerGroup[], Error>> => refetch()}>
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
      selectedDataListItemId={selectedContainerGroup}
      onSelectDataListItem={selectContainerGroup}
    >
      {data.map((containerGroup) => (
        <ContainerGroupsItem key={containerGroup.id} containerGroup={containerGroup} />
      ))}
    </DataList>
  );
};

export default ContainerGroups;
