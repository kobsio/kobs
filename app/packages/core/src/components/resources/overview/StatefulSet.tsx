import { V1StatefulSet } from '@kubernetes/client-node';
import { Chip } from '@mui/material';
import { FunctionComponent } from 'react';

import Conditions from './Conditions';
import Selector from './Selector';

import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

interface IStatefulSetProps {
  cluster: string;
  namespace: string;
  statefulSet: V1StatefulSet;
}

const StatefulSet: FunctionComponent<IStatefulSetProps> = ({ cluster, namespace, statefulSet }) => {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Replicas</DescriptionListTerm>
        <DescriptionListDescription>
          <Chip size="small" label={`${statefulSet.status?.replicas ? statefulSet.status?.replicas : 0} desired`} />
          <Chip
            size="small"
            label={`${statefulSet.status?.currentReplicas ? statefulSet.status?.currentReplicas : 0} current`}
          />
          <Chip
            size="small"
            label={`${statefulSet.status?.readyReplicas ? statefulSet.status?.readyReplicas : 0} ready`}
          />
          <Chip
            size="small"
            label={`${statefulSet.status?.updatedReplicas ? statefulSet.status?.updatedReplicas : 0} updated`}
          />
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
    </>
  );
};

export default StatefulSet;
