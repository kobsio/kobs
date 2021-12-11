import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { INodePool } from './interfaces';

interface IDetailsNodePoolsItemProps {
  rowIndex: number;
  name: string;
  resourceGroup: string;
  managedCluster: string;
  nodeResourceGroup?: string;
  nodePool: INodePool;
}

const DetailsNodePoolsItem: React.FunctionComponent<IDetailsNodePoolsItemProps> = ({
  rowIndex,
  name,
  resourceGroup,
  managedCluster,
  nodeResourceGroup,
  nodePool,
}: IDetailsNodePoolsItemProps) => {
  const [isExpanded, setIsExpaned] = useState<boolean>(false);

  return (
    <Tbody key={rowIndex} isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{
            isExpanded: isExpanded,
            onToggle: (): void => setIsExpaned(!isExpanded),
            rowIndex: rowIndex,
          }}
        />
        <Td dataLabel="Name">{nodePool.name || '-'}</Td>
        <Td dataLabel="Provisioning State">{nodePool.properties?.provisioningState || '-'}</Td>
        <Td dataLabel="Power State">{nodePool.properties?.powerState?.code || '-'}</Td>
        <Td dataLabel="Node Count">{nodePool.properties?.count || '-'}</Td>
        <Td dataLabel="Mode">{nodePool.properties?.mode || '-'}</Td>
        <Td dataLabel="Kubernetes Version">{nodePool.properties?.orchestratorVersion || '-'}</Td>
        <Td dataLabel="Node Size">{nodePool.properties?.vmSize || '-'}</Td>
        <Td dataLabel="Operating System">{nodePool.properties?.osType || '-'}</Td>
        <Td dataLabel="Details">
          {nodeResourceGroup && nodePool.properties?.type === 'VirtualMachineScaleSets' ? (
            <Button
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isSmall={true}
              component={(props): React.ReactElement => (
                <Link {...props} to={`/${name}/virtualmachinescalesets?resourceGroup=${nodeResourceGroup}`} />
              )}
            >
              VMSS
            </Button>
          ) : (
            '-'
          )}
        </Td>
      </Tr>

      <Tr isExpanded={isExpanded}>
        <Td colSpan={10}>
          <ExpandableRowContent>
            <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
              <DescriptionListGroup>
                <DescriptionListTerm>Availability Zones</DescriptionListTerm>
                <DescriptionListDescription>
                  {nodePool.properties?.availabilityZones
                    ? nodePool.properties?.availabilityZones.map((zone) => `Zone ${zone}`).join(', ')
                    : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>Max Pods per Node</DescriptionListTerm>
                <DescriptionListDescription>{nodePool.properties?.maxPods || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Public IPs per Node</DescriptionListTerm>
                <DescriptionListDescription>
                  {nodePool.properties?.enableNodePublicIP ? 'Enabled' : 'Disabled'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Autoscaling</DescriptionListTerm>
                <DescriptionListDescription>
                  {nodePool.properties?.enableAutoScaling ? 'Enabled' : 'Disabled'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Scale Eviction Policy</DescriptionListTerm>
                <DescriptionListDescription>
                  {nodePool.properties?.scaleSetEvictionPolicy || '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Node Image Version</DescriptionListTerm>
                <DescriptionListDescription>{nodePool.properties?.nodeImageVersion || '-'}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>Maximum Surge</DescriptionListTerm>
                <DescriptionListDescription>
                  {nodePool.properties?.upgradeSettings?.maxSurge || '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>OS Disk Size</DescriptionListTerm>
                <DescriptionListDescription>
                  {nodePool.properties?.osDiskSizeGB ? `${nodePool.properties?.osDiskSizeGB} GB` : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>OS Disk Type</DescriptionListTerm>
                <DescriptionListDescription>{nodePool.properties?.osDiskType || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default DetailsNodePoolsItem;
