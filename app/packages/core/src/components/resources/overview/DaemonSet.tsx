import { V1DaemonSet } from '@kubernetes/client-node';
import { Chip } from '@mui/material';
import { FunctionComponent } from 'react';

import Conditions from './Conditions';
import Selector from './Selector';

import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

interface IDaemonSetProps {
  cluster: string;
  daemonSet: V1DaemonSet;
  namespace: string;
}

const DaemonSet: FunctionComponent<IDaemonSetProps> = ({ cluster, namespace, daemonSet }: IDaemonSetProps) => {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Replicas</DescriptionListTerm>
        <DescriptionListDescription>
          <Chip
            size="small"
            label={`${daemonSet.status?.desiredNumberScheduled ? daemonSet.status?.desiredNumberScheduled : 0} desired`}
          />
          <Chip
            size="small"
            label={`${daemonSet.status?.currentNumberScheduled ? daemonSet.status?.currentNumberScheduled : 0} current`}
          />
          <Chip
            size="small"
            label={`${daemonSet.status?.numberMisscheduled ? daemonSet.status?.numberMisscheduled : 0} misscheduled`}
          />
          <Chip size="small" label={`${daemonSet.status?.numberReady ? daemonSet.status?.numberReady : 0} ready`} />
          <Chip
            size="small"
            label={`${daemonSet.status?.updatedNumberScheduled ? daemonSet.status?.updatedNumberScheduled : 0} updated`}
          />
          <Chip
            size="small"
            label={`${daemonSet.status?.numberAvailable ? daemonSet.status?.numberAvailable : 0} available`}
          />
          <Chip
            size="small"
            label={`${daemonSet.status?.numberUnavailable ? daemonSet.status?.numberUnavailable : 0} unavailable`}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {daemonSet.spec?.updateStrategy?.type && (
        <DescriptionListGroup>
          <DescriptionListTerm>Strategy</DescriptionListTerm>
          <DescriptionListDescription>{daemonSet.spec.updateStrategy.type}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {daemonSet.spec?.selector && (
        <Selector cluster={cluster} namespace={namespace} selector={daemonSet.spec.selector} />
      )}
      {daemonSet.status?.conditions && <Conditions conditions={daemonSet.status.conditions} />}
    </>
  );
};

export default DaemonSet;
