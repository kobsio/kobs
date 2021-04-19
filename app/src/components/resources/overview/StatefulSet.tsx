import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import React from 'react';
import { V1StatefulSet } from '@kubernetes/client-node';

import Conditions from 'components/resources/overview/Conditions';
import Selector from 'components/resources/overview/Selector';

interface IStatefulSetProps {
  cluster: string;
  namespace: string;
  statefulSet: V1StatefulSet;
}

const StatefulSet: React.FunctionComponent<IStatefulSetProps> = ({
  cluster,
  namespace,
  statefulSet,
}: IStatefulSetProps) => {
  return (
    <React.Fragment>
      <DescriptionListGroup>
        <DescriptionListTerm>Replicas</DescriptionListTerm>
        <DescriptionListDescription>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {statefulSet.status?.replicas ? statefulSet.status?.replicas : 0} desired
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {statefulSet.status?.currentReplicas ? statefulSet.status?.currentReplicas : 0} current
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {statefulSet.status?.readyReplicas ? statefulSet.status?.readyReplicas : 0} ready
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {statefulSet.status?.updatedReplicas ? statefulSet.status?.updatedReplicas : 0} updated
            </span>
          </div>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {statefulSet.spec?.updateStrategy?.type && (
        <DescriptionListGroup>
          <DescriptionListTerm>Strategy</DescriptionListTerm>
          <DescriptionListDescription>{statefulSet.spec.updateStrategy.type}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {statefulSet.spec?.selector && (
        <Selector cluster={cluster} namespace={namespace} selector={statefulSet.spec.selector} />
      )}
      {statefulSet.status?.conditions && <Conditions conditions={statefulSet.status.conditions} />}
    </React.Fragment>
  );
};

export default StatefulSet;
