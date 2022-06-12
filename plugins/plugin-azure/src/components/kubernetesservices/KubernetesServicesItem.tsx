import { DataListCell, DataListItem, DataListItemCells, DataListItemRow, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { IManagedCluster } from './interfaces';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IKubernetesServicesProps {
  managedCluster: IManagedCluster;
}

const KubernetesServices: React.FunctionComponent<IKubernetesServicesProps> = ({
  managedCluster,
}: IKubernetesServicesProps) => {
  const resourceGroup = managedCluster.id ? getResourceGroupFromID(managedCluster.id) : '';

  return (
    <DataListItem id={managedCluster.id} aria-labelledby={managedCluster.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{managedCluster.name}</p>
                  <small>
                    <span>
                      <span className="pf-u-color-400">Resource Group: </span>
                      <b className="pf-u-pr-md">{resourceGroup || '-'}</b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Location: </span>
                      <b className="pf-u-pr-md">{managedCluster.location || '-'}</b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Status: </span>
                      <b className="pf-u-pr-md">
                        {managedCluster.properties?.provisioningState || '-'} (
                        {managedCluster.properties?.powerState?.code || '-'})
                      </b>
                    </span>
                    <span>
                      <span className="pf-u-color-400">Node Pools: </span>
                      <b className="pf-u-pr-md">
                        {managedCluster.properties?.agentPoolProfiles
                          ?.map((agentPoolProfile) => agentPoolProfile.name)
                          .join(', ')}
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

export default KubernetesServices;
