import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Tooltip } from '@patternfly/react-core';
import React from 'react';
import { V1Pod } from '@kubernetes/client-node';
import { useQuery } from 'react-query';
import yaml from 'js-yaml';

import { IMetric, IMetricContainer } from '../../../../utils/interfaces';
import Conditions from './Conditions';
import Containers from './Containers';

interface IPodProps {
  cluster: string;
  namespace: string;
  name: string;
  pod: V1Pod;
}

const Pod: React.FunctionComponent<IPodProps> = ({ cluster, namespace, name, pod }: IPodProps) => {
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

  const { isError, data } = useQuery<IMetricContainer[], Error>(
    ['resources/pod/metrics', cluster, namespace, name],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/resources/resources?cluster=${cluster}&namespace=${namespace}&name=${name}&resource=pods&path=/apis/metrics.k8s.io/v1beta1`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          const metric = json as IMetric[];

          if (metric && metric.length === 1 && metric[0].resources && metric[0].resources.containers) {
            return metric[0].resources.containers;
          }

          throw new Error('Could not get Pod metrics');
        }

        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      } catch (err) {
        throw err;
      }
    },
  );

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
      {pod.spec?.initContainers && (
        <Containers
          title="Init Containers"
          containers={pod.spec?.initContainers}
          containerStatuses={pod.status?.initContainerStatuses}
          containerMetrics={undefined}
        />
      )}
      {pod.spec?.containers && (
        <Containers
          title="Containers"
          containers={pod.spec?.containers}
          containerStatuses={pod.status?.containerStatuses}
          containerMetrics={isError ? undefined : data}
        />
      )}
    </React.Fragment>
  );
};

export default Pod;
