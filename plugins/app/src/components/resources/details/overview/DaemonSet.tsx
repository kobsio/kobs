import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import React from 'react';
import { V1DaemonSet } from '@kubernetes/client-node';

import Conditions from './Conditions';
import Selector from './Selector';

interface IDaemonSetProps {
  satellite: string;
  cluster: string;
  namespace: string;
  daemonSet: V1DaemonSet;
}

const DaemonSet: React.FunctionComponent<IDaemonSetProps> = ({
  satellite,
  cluster,
  namespace,
  daemonSet,
}: IDaemonSetProps) => {
  return (
    <React.Fragment>
      <DescriptionListGroup>
        <DescriptionListTerm>Replicas</DescriptionListTerm>
        <DescriptionListDescription>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.desiredNumberScheduled ? daemonSet.status?.desiredNumberScheduled : 0} desired
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.currentNumberScheduled ? daemonSet.status?.currentNumberScheduled : 0} current
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.numberMisscheduled ? daemonSet.status?.numberMisscheduled : 0} misscheduled
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.numberReady ? daemonSet.status?.numberReady : 0} ready
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.updatedNumberScheduled ? daemonSet.status?.updatedNumberScheduled : 0} updated
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.numberAvailable ? daemonSet.status?.numberAvailable : 0} available
            </span>
          </div>
          <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
            <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
              {daemonSet.status?.numberUnavailable ? daemonSet.status?.numberUnavailable : 0} unavailable
            </span>
          </div>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {daemonSet.spec?.updateStrategy?.type && (
        <DescriptionListGroup>
          <DescriptionListTerm>Strategy</DescriptionListTerm>
          <DescriptionListDescription>{daemonSet.spec.updateStrategy.type}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {daemonSet.spec?.selector && (
        <Selector satellite={satellite} cluster={cluster} namespace={namespace} selector={daemonSet.spec.selector} />
      )}
      {daemonSet.status?.conditions && <Conditions conditions={daemonSet.status.conditions} />}
    </React.Fragment>
  );
};

export default DaemonSet;
