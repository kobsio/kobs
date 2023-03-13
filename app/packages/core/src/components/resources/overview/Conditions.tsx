import {
  V1Condition,
  V1DeploymentCondition,
  V1JobCondition,
  V1NodeCondition,
  V1PersistentVolumeClaimCondition,
  V1PodCondition,
  V1ReplicaSetCondition,
  V1ReplicationControllerCondition,
  V1StatefulSetCondition,
} from '@kubernetes/client-node';
import { Chip, Tooltip } from '@mui/material';
import { FunctionComponent } from 'react';

import { formatTime } from '../../../utils/times';
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

export type TCondition =
  | V1Condition
  | V1DeploymentCondition
  | V1JobCondition
  | V1NodeCondition
  | V1PodCondition
  | V1PersistentVolumeClaimCondition
  | V1ReplicaSetCondition
  | V1ReplicationControllerCondition
  | V1StatefulSetCondition;

interface IConditionsProps {
  conditions: TCondition[];
}

const Conditions: FunctionComponent<IConditionsProps> = ({ conditions }) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Conditions</DescriptionListTerm>
      <DescriptionListDescription>
        {conditions.map((condition, index) => (
          <Tooltip
            key={index}
            title={
              <div>
                {condition.lastTransitionTime
                  ? formatTime(new Date(condition.lastTransitionTime))
                  : 'Last Transition Time not found'}
                {condition.reason ? ` - ${condition.reason}` : ''}
                {condition.message ? <div>{condition.message}</div> : ''}
              </div>
            }
          >
            <Chip size="small" label={condition.type} color={condition.status === 'True' ? 'primary' : undefined} />
          </Tooltip>
        ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Conditions;
