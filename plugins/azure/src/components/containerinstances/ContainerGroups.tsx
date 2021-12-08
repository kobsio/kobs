import { Alert, AlertActionLink, AlertVariant, Menu, MenuContent, MenuList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import ContainerGroupsItem from './ContainerGroupsItem';
import { IContainerGroup } from './interfaces';

interface IContainerGroupsProps {
  name: string;
  resourceGroups: string[];
  setDetails?: (details: React.ReactNode) => void;
}

const ContainerGroups: React.FunctionComponent<IContainerGroupsProps> = ({
  name,
  resourceGroups,
  setDetails,
}: IContainerGroupsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IContainerGroup[], Error>(
    ['azure/containergroups/containergroups', name, resourceGroups],
    async () => {
      try {
        const resourceGroupsParams = resourceGroups.map((resourceGroup) => `resourceGroup=${resourceGroup}`).join('&');

        const response = await fetch(
          `/api/plugins/azure/${name}/containerinstances/containergroups?${resourceGroupsParams}`,
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
    <Menu>
      <MenuContent>
        <MenuList>
          {data.map((containerGroup, index) => (
            <ContainerGroupsItem key={index} name={name} containerGroup={containerGroup} setDetails={setDetails} />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default ContainerGroups;
