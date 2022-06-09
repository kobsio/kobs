import { DataListCell, DataListItem, DataListItemCells, DataListItemRow, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { IVirtualMachineScaleSet } from './interfaces';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IContainerGroupsItemProps {
  virtualMachineScaleSet: IVirtualMachineScaleSet;
}

const ContainerGroupsItem: React.FunctionComponent<IContainerGroupsItemProps> = ({
  virtualMachineScaleSet,
}: IContainerGroupsItemProps) => {
  const resourceGroup = virtualMachineScaleSet.id ? getResourceGroupFromID(virtualMachineScaleSet.id) : '';

  return (
    <DataListItem id={virtualMachineScaleSet.id} aria-labelledby={virtualMachineScaleSet.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{virtualMachineScaleSet.name}</p>
                  <small>
                    <span>
                      <span className="pf-u-color-400">Resource Group: </span>
                      <b className="pf-u-pr-md">{resourceGroup || '-'}</b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Location: </span>
                      <b className="pf-u-pr-md">{virtualMachineScaleSet.location || '-'}</b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Provisioning State: </span>
                      <b className="pf-u-pr-md">{virtualMachineScaleSet.properties?.provisioningState || '-'}</b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Size: </span>
                      <b className="pf-u-pr-md">{virtualMachineScaleSet.sku?.name || '-'}</b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Instances: </span>
                      <b className="pf-u-pr-md">{virtualMachineScaleSet.sku?.capacity || '-'}</b>
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
