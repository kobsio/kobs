import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import Details from './Details';
import { IManagedCluster } from './interfaces';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IKubernetesServicesProps {
  name: string;
  managedCluster: IManagedCluster;
  setDetails?: (details: React.ReactNode) => void;
}

const KubernetesServices: React.FunctionComponent<IKubernetesServicesProps> = ({
  name,
  managedCluster,
  setDetails,
}: IKubernetesServicesProps) => {
  const resourceGroup = managedCluster.id ? getResourceGroupFromID(managedCluster.id) : '';

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
        </div>
      }
      onClick={
        setDetails
          ? (): void =>
              setDetails(
                <Details
                  name={name}
                  resourceGroup={resourceGroup}
                  managedCluster={managedCluster.name || ''}
                  close={(): void => setDetails(undefined)}
                />,
              )
          : undefined
      }
    >
      {managedCluster.name}
    </MenuItem>
  );
};

export default KubernetesServices;
