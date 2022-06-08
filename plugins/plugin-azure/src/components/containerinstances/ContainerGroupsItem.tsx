import { DataListCell, DataListItem, DataListItemCells, DataListItemRow, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { IContainerGroup } from './interfaces';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IContainerGroupsItemProps {
  containerGroup: IContainerGroup;
}

const ContainerGroupsItem: React.FunctionComponent<IContainerGroupsItemProps> = ({
  containerGroup,
}: IContainerGroupsItemProps) => {
  const resourceGroup = containerGroup.id ? getResourceGroupFromID(containerGroup.id) : '';

  return (
    <DataListItem id={containerGroup.id} aria-labelledby={containerGroup.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{containerGroup.name}</p>
                  <small>
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
                  </small>
                </FlexItem>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

export default ContainerGroupsItem;
