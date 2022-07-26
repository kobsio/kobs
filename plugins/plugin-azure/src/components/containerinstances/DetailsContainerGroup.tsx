import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import DetailsContainerGroupContainer from './DetailsContainerGroupContainer';
import DetailsContainerGroupEvent from './DetailsContainerGroupEvent';
import DetailsContainerGroupInitContainer from './DetailsContainerGroupInitContainer';
import { IContainerGroup } from './interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IDetailsContainerGroupProps {
  instance: IPluginInstance;
  resourceGroup: string;
  containerGroup: string;
}

const DetailsContainerGroup: React.FunctionComponent<IDetailsContainerGroupProps> = ({
  instance,
  resourceGroup,
  containerGroup,
}: IDetailsContainerGroupProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IContainerGroup, Error>(
    ['azure/containergroups/containergroup/details', instance, resourceGroup, containerGroup],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/containerinstances/containergroup/details?resourceGroup=${resourceGroup}&containerGroup=${containerGroup}`,
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
        title="Could not get container group details"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IContainerGroup, Error>> => refetch()}>
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
      <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
        <DescriptionListGroup>
          <DescriptionListTerm>OS Type</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.osType || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Restart Policy</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.restartPolicy || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>FQDN</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.ipAddress?.fqdn || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>
            IP Address {data.properties?.ipAddress?.type ? `(${data.properties?.ipAddress?.type})` : ''}
          </DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.ipAddress?.ip || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Ports</DescriptionListTerm>
          <DescriptionListDescription>
            {data.properties?.ipAddress?.ports.map((port) => `${port.port} (${port.protocol || '-'})`).join(', ') ||
              '-'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Volumes</DescriptionListTerm>
          <DescriptionListDescription>
            {data.properties?.volumes?.map((volume) => volume.name).join(', ') || '-'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Provisioning State</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.provisioningState || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>State</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.instanceView?.state || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>State</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.instanceView?.state || '-'}</DescriptionListDescription>
        </DescriptionListGroup>

        {data.properties?.instanceView?.events && data.properties?.instanceView?.events.length > 0 && (
          <React.Fragment>
            <Title headingLevel="h4" size="lg">
              Events
            </Title>
            <TableComposable aria-label="Events" variant={TableVariant.compact} borders={true}>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Count</Th>
                  <Th>First Seen</Th>
                  <Th>Last Seen</Th>
                  <Th>Message</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.properties?.instanceView?.events?.map((event, index) => (
                  <DetailsContainerGroupEvent key={index} event={event} />
                ))}
              </Tbody>
            </TableComposable>
          </React.Fragment>
        )}

        {data.properties?.initContainers && data.properties?.initContainers.length > 0 && (
          <React.Fragment>
            <Title headingLevel="h4" size="lg">
              Init Containers
            </Title>
            <TableComposable aria-label="Init Containers" variant={TableVariant.compact} borders={true}>
              <Thead>
                <Tr>
                  <Th />
                  <Th>Name</Th>
                  <Th>Restarts</Th>
                  <Th>Current State</Th>
                  <Th>Previous State</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.properties?.initContainers?.map((initContainer) => (
                  <DetailsContainerGroupInitContainer key={initContainer.name} initContainer={initContainer} />
                ))}
              </Tbody>
            </TableComposable>
          </React.Fragment>
        )}

        {data.properties?.containers && data.properties?.containers.length > 0 && (
          <React.Fragment>
            <Title headingLevel="h4" size="lg">
              Containers
            </Title>
            <TableComposable aria-label="Containers" variant={TableVariant.compact} borders={true}>
              <Thead>
                <Tr>
                  <Th />
                  <Th>Name</Th>
                  <Th>Restarts</Th>
                  <Th>Current State</Th>
                  <Th>Previous State</Th>
                </Tr>
              </Thead>
              {data.properties?.containers?.map((container) => (
                <DetailsContainerGroupContainer key={container.name} container={container} />
              ))}
            </TableComposable>
          </React.Fragment>
        )}
      </DescriptionList>
    </div>
  );
};

export default DetailsContainerGroup;
