import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Tooltip } from '@patternfly/react-core';
import { V1ContainerStatus, V1Pod } from '@kubernetes/client-node';
import React from 'react';
import yaml from 'js-yaml';

import Conditions from './Conditions';
import Container from './Container';

const getContainerStatus = (name: string, status?: V1ContainerStatus[]): V1ContainerStatus | undefined => {
  if (!status) {
    return undefined;
  }

  for (const s of status) {
    if (s.name === name) {
      return s;
    }
  }

  return undefined;
};

interface IPodProps {
  pod: V1Pod;
}

const Pod: React.FunctionComponent<IPodProps> = ({ pod }: IPodProps) => {
  const phase = pod.status && pod.status.phase ? pod.status.phase : 'Unknown';
  let reason = pod.status && pod.status.reason ? pod.status.reason : '';
  let shouldReady = 0;
  let isReady = 0;
  let restarts = 0;

  if (pod.status && pod.status.containerStatuses) {
    for (const container of pod.status.containerStatuses) {
      shouldReady = shouldReady + 1;
      if (container.ready) {
        isReady = isReady + 1;
      }

      restarts = restarts + container.restartCount;

      if (container.state && container.state.waiting) {
        reason = container.state.waiting.reason ? container.state.waiting.reason : '';
        break;
      }

      if (container.state && container.state.terminated) {
        reason = container.state.terminated.reason ? container.state.terminated.reason : '';
        break;
      }
    }
  }

  return (
    <React.Fragment>
      <DescriptionListGroup>
        <DescriptionListTerm>Ready</DescriptionListTerm>
        <DescriptionListDescription>
          {isReady}/{shouldReady}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Restarts</DescriptionListTerm>
        <DescriptionListDescription>{restarts}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDescription>{reason ? reason : phase}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Priority Class</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.spec && pod.spec.priorityClassName ? pod.spec.priorityClassName : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>QoS Class</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.status && pod.status.qosClass ? pod.status.qosClass : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Node</DescriptionListTerm>
        <DescriptionListDescription>{pod.spec?.nodeName ? pod.spec.nodeName : '-'}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Tolerations</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.spec && pod.spec.tolerations ? (
            <Tooltip
              content={
                <div>
                  {pod.spec.tolerations.map((toleration, index) => (
                    <div key={index}>{yaml.dump(toleration)}</div>
                  ))}
                </div>
              }
            >
              <span>{pod.spec.tolerations.length}</span>
            </Tooltip>
          ) : (
            0
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Affinities</DescriptionListTerm>
        <DescriptionListDescription>
          {pod.spec && pod.spec.affinity ? (
            <Tooltip
              content={
                <div>
                  <div>{yaml.dump(pod.spec.affinity)}</div>
                </div>
              }
            >
              <span>Yes</span>
            </Tooltip>
          ) : (
            'No'
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {pod.status?.conditions && <Conditions conditions={pod.status.conditions} />}
      {pod.spec?.initContainers?.map((container, index) => (
        <Container
          key={index}
          container={container}
          containerStatus={getContainerStatus(container.name, pod.status?.initContainerStatuses)}
        />
      ))}
      {pod.spec?.containers?.map((container, index) => (
        <Container
          key={index}
          container={container}
          containerStatus={getContainerStatus(container.name, pod.status?.containerStatuses)}
        />
      ))}
    </React.Fragment>
  );
};

export default Pod;
