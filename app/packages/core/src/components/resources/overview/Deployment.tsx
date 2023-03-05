import { V1Deployment } from '@kubernetes/client-node';
import { Chip } from '@mui/material';
import { FunctionComponent } from 'react';

import Conditions from './Conditions';
import Selector from './Selector';

import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

interface IDeploymentProps {
  cluster: string;
  deployment: V1Deployment;
  namespace: string;
}

const Deployment: FunctionComponent<IDeploymentProps> = ({ cluster, namespace, deployment }: IDeploymentProps) => {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Replicas</DescriptionListTerm>
        <DescriptionListDescription>
          <Chip size="small" label={`${deployment.status?.replicas ? deployment.status?.replicas : 0} desired`} />
          <Chip
            size="small"
            label={`${deployment.status?.updatedReplicas ? deployment.status?.updatedReplicas : 0} updated`}
          />
          <Chip
            size="small"
            label={`${deployment.status?.readyReplicas ? deployment.status?.readyReplicas : 0} ready`}
          />
          <Chip
            size="small"
            label={`${deployment.status?.availableReplicas ? deployment.status?.availableReplicas : 0} available`}
          />
          <Chip
            size="small"
            label={`${deployment.status?.unavailableReplicas ? deployment.status?.unavailableReplicas : 0} unavailable`}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {deployment.spec?.strategy?.type && (
        <DescriptionListGroup>
          <DescriptionListTerm>Strategy</DescriptionListTerm>
          <DescriptionListDescription>{deployment.spec.strategy.type}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {deployment.spec?.selector && (
        <Selector cluster={cluster} namespace={namespace} selector={deployment.spec.selector} />
      )}
      {deployment.status?.conditions && <Conditions conditions={deployment.status.conditions} />}
    </>
  );
};

export default Deployment;
