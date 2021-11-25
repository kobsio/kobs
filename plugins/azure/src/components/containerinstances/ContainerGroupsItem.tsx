import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IContainer, IContainerGroup } from './interfaces';
import Details from './Details';
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

interface IAlertsItemProps {
  name: string;
  containerGroup: IContainerGroup;
  setDetails?: (details: React.ReactNode) => void;
}

const AlertsItem: React.FunctionComponent<IAlertsItemProps> = ({
  name,
  containerGroup,
  setDetails,
}: IAlertsItemProps) => {
  const resourceGroup = containerGroup.id ? getResourceGroupFromID(containerGroup.id) : '';

  return (
    <MenuItem
      description={
        <div>
          <span>
            <span className="pf-u-color-400">Resource Group: </span>
            <b className="pf-u-pr-md">{resourceGroup || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Location: </span>
            <b className="pf-u-pr-md">{containerGroup.location || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Provisioning State: </span>
            <b className="pf-u-pr-md">{containerGroup.properties?.provisioningState || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Containers: </span>
            <b className="pf-u-pr-md">
              {containerGroup.properties?.containers?.map((container) => container.name).join(', ')}
            </b>
          </span>
        </div>
      }
      onClick={
        setDetails
          ? (): void =>
              setDetails(
                <Details
                  name={name}
                  resourceGroup={resourceGroup}
                  containerGroup={containerGroup.name || ''}
                  containers={getContainers(containerGroup.properties?.containers)}
                  close={(): void => setDetails(undefined)}
                />,
              )
          : undefined
      }
    >
      {containerGroup.name}
    </MenuItem>
  );
};

export default AlertsItem;
