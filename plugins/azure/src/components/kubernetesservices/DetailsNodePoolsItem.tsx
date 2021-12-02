import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';

import { INodePool } from './interfaces';

interface IDetailsNodePoolsItemProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
  nodePool: INodePool;
}

const DetailsNodePoolsItem: React.FunctionComponent<IDetailsNodePoolsItemProps> = ({
  name,
  resourceGroup,
  managedCluster,
  nodePool,
}: IDetailsNodePoolsItemProps) => {
  const [isExpanded, setIsExpaned] = useState<boolean>(false);

  return (
    <React.Fragment>
      <Tr onClick={(): void => setIsExpaned(!isExpanded)}>
        <Td dataLabel="Name">{nodePool.name || '-'}</Td>
        <Td dataLabel="Provisioning State">{nodePool.properties?.provisioningState || '-'}</Td>
        <Td dataLabel="Power State">{nodePool.properties?.powerState?.code || '-'}</Td>
        <Td dataLabel="Node Count">{nodePool.properties?.count || '-'}</Td>
        <Td dataLabel="Mode">{nodePool.properties?.mode || '-'}</Td>
        <Td dataLabel="Kubernetes Version">{nodePool.properties?.orchestratorVersion || '-'}</Td>
        <Td dataLabel="Node Size">{nodePool.properties?.vmSize || '-'}</Td>
        <Td dataLabel="Operating System">{nodePool.properties?.osType || '-'}</Td>
      </Tr>

      <Tr isExpanded={isExpanded}>
        <Td colSpan={8}>
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
    </React.Fragment>
  );
};

export default DetailsNodePoolsItem;
