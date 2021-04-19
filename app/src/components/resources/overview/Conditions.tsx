import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Tooltip } from '@patternfly/react-core';
import {
  V1DeploymentCondition,
  V1JobCondition,
  V1NodeCondition,
  V1PersistentVolumeClaimCondition,
  V1PodCondition,
  V1ReplicaSetCondition,
  V1ReplicationControllerCondition,
  V1StatefulSetCondition,
} from '@kubernetes/client-node';
import React from 'react';

export type TCondition =
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

const Conditions: React.FunctionComponent<IConditionsProps> = ({ conditions }: IConditionsProps) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Conditions</DescriptionListTerm>
      <DescriptionListDescription>
        {conditions.map(
          (condition, index) =>
            condition.status === 'True' && (
              <Tooltip
                key={index}
                content={
                  <div>
                    {condition.lastTransitionTime}
                    {condition.reason ? ` - ${condition.reason}` : ''}
                    {condition.message ? <div>{condition.message}</div> : ''}
                  </div>
                }
              >
                <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                  <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                    {condition.type}
                  </span>
                </div>
              </Tooltip>
            ),
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Conditions;
