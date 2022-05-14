import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import React from 'react';
import { V1Deployment } from '@kubernetes/client-node';

import Conditions from './Conditions';
import Selector from './Selector';

interface IDeploymentProps {
  satellite: string;
  cluster: string;
  namespace: string;
  deployment: V1Deployment;
}

const Deployment: React.FunctionComponent<IDeploymentProps> = ({
  satellite,
  cluster,
  namespace,
  deployment,
}: IDeploymentProps) => {
  return (
    <React.Fragment>
      <DescriptionListGroup>
        <DescriptionListTerm>Replicas</DescriptionListTerm>
        <DescriptionListDescription>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {deployment.status?.replicas ? deployment.status?.replicas : 0} desired
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {deployment.status?.updatedReplicas ? deployment.status?.updatedReplicas : 0} updated
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {deployment.status?.readyReplicas ? deployment.status?.readyReplicas : 0} ready
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {deployment.status?.availableReplicas ? deployment.status?.availableReplicas : 0} available
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {deployment.status?.unavailableReplicas ? deployment.status?.unavailableReplicas : 0} unavailable
            </span>
          </div>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {deployment.spec?.strategy?.type && (
        <DescriptionListGroup>
          <DescriptionListTerm>Strategy</DescriptionListTerm>
          <DescriptionListDescription>{deployment.spec.strategy.type}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {deployment.spec?.selector && (
        <Selector satellite={satellite} cluster={cluster} namespace={namespace} selector={deployment.spec.selector} />
      )}
      {deployment.status?.conditions && <Conditions conditions={deployment.status.conditions} />}
    </React.Fragment>
  );
};

export default Deployment;
