import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { IVirtualMachine } from './interfaces';

interface IDetailsVirtualMachinesItemProps {
  instance: IPluginInstance;
  resourceGroup: string;
  virtualMachineScaleSet: string;
  virtualMachine: IVirtualMachine;
}

const DetailsVirtualMachinesItem: React.FunctionComponent<IDetailsVirtualMachinesItemProps> = ({
  instance,
  resourceGroup,
  virtualMachineScaleSet,
  virtualMachine,
}: IDetailsVirtualMachinesItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td dataLabel="Name">{virtualMachine.name || '-'}</Td>
        <Td dataLabel="Computer Name">{virtualMachine.properties?.osProfile?.computerName || '-'}</Td>
        <Td dataLabel="Provisioning State">{virtualMachine.properties?.provisioningState || '-'}</Td>
        <Td dataLabel="Latest Model">{virtualMachine.properties?.latestModelApplied ? 'Yes' : 'No'}</Td>
      </Tr>

      <Tr isExpanded={isExpanded}>
        <Td colSpan={5}>
          <ExpandableRowContent>
            <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
              <DescriptionListGroup>
                <DescriptionListTerm>Location</DescriptionListTerm>
                <DescriptionListDescription>
                  {virtualMachine.location}
                  {virtualMachine.zones ? ` (${virtualMachine.zones.map((zone) => `Zone ${zone}`).join(', ')})` : ''}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>Operating System</DescriptionListTerm>
                <DescriptionListDescription>
                  {virtualMachine.properties?.storageProfile?.osDisk?.osType || '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>OS Disk</DescriptionListTerm>
                <DescriptionListDescription>
                  {virtualMachine.properties?.storageProfile?.osDisk?.managedDisk?.storageAccountType || '-'}
                  {virtualMachine.properties?.storageProfile?.osDisk?.diskSizeGB
                    ? ` (${virtualMachine.properties?.storageProfile?.osDisk.diskSizeGB} GB)`
                    : ''}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>Data Disks</DescriptionListTerm>
                <DescriptionListDescription>
                  <TableComposable aria-label="Data Disks" variant={TableVariant.compact} borders={true}>
                    <Thead>
                      <Tr>
                        <Th>LUN</Th>
                        <Th>Disk Name</Th>
                        <Th>Storage Type</Th>
                        <Th>Size</Th>
                        <Th>Host Caching</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {virtualMachine.properties?.storageProfile?.dataDisks?.map((dataDisk) => (
                        <Tr key={dataDisk.name}>
                          <Td dataLabel="LUN">{dataDisk.lun}</Td>
                          <Td dataLabel="Name">{dataDisk.name}</Td>
                          <Td dataLabel="Storage Type">{dataDisk.managedDisk?.storageAccountType || '-'}</Td>
                          <Td dataLabel="Size">{dataDisk.diskSizeGB ? `${dataDisk.diskSizeGB} GB` : '-'}</Td>
                          <Td dataLabel="Host Caching">{dataDisk.caching || '-'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </TableComposable>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default DetailsVirtualMachinesItem;
