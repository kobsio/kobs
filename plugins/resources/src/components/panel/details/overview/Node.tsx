import { V1Container, V1Node, V1Pod } from '@kubernetes/client-node';
import { BarDatum } from '@nivo/bar';
import React from 'react';
import { Title } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IMetric, IMetricUsage } from '../../../../utils/interfaces';
import Conditions from './Conditions';
import NodeChart from './NodeChart';
import { formatResourceValue } from '../../../../utils/helpers';

interface INodeMetrics {
  [key: string]: BarDatum[];
}

const podResources = (containers: V1Container[]): number[] => {
  let cpuRequests = 0;
  let cpuLimits = 0;
  let memoryRequests = 0;
  let memoryLimits = 0;

  for (const container of containers) {
    if (container.resources && container.resources.requests && container.resources.requests.hasOwnProperty('cpu')) {
      cpuRequests = cpuRequests + parseInt(formatResourceValue('cpu', container.resources.requests['cpu']));
    }

    if (container.resources && container.resources.limits && container.resources.limits.hasOwnProperty('cpu')) {
      cpuLimits = cpuLimits + parseInt(formatResourceValue('cpu', container.resources.limits['cpu']));
    }

    if (container.resources && container.resources.requests && container.resources.requests.hasOwnProperty('memory')) {
      memoryRequests = memoryRequests + parseInt(formatResourceValue('memory', container.resources.requests['memory']));
    }

    if (container.resources && container.resources.limits && container.resources.limits.hasOwnProperty('memory')) {
      memoryLimits = memoryLimits + parseInt(formatResourceValue('memory', container.resources.limits['memory']));
    }
  }

  return [cpuRequests, cpuLimits, memoryRequests, memoryLimits];
};

const nodeMetrics = (node: V1Node, nodeUsage: IMetricUsage, pods: V1Pod[]): INodeMetrics => {
  const cpuUsage = parseInt(formatResourceValue('cpu', nodeUsage.cpu ? nodeUsage.cpu : '0'));
  const cpuCapacity = parseInt(
    formatResourceValue(
      'cpu',
      node.status && node.status.capacity && node.status.capacity['cpu'] ? node.status.capacity['cpu'] : '0',
    ),
  );

  const memoryUsage = parseInt(formatResourceValue('memory', nodeUsage.memory ? nodeUsage.memory : '0'));
  const memoryCapacity = parseInt(
    formatResourceValue(
      'memory',
      node.status && node.status.capacity && node.status.capacity['memory'] ? node.status.capacity['memory'] : '0',
    ),
  );

  const podsUsage = pods.length;
  const podsCapacity = parseInt(
    formatResourceValue(
      'memory',
      node.status && node.status.capacity && node.status.capacity['pods'] ? node.status.capacity['pods'] : '0',
    ),
  );

  let cpuRequest = 0;
  let cpuLimit = 0;
  let memoryRequest = 0;
  let memoryLimit = 0;
  for (const pod of pods) {
    if (pod.spec) {
      const resources = podResources(pod.spec.containers);
      cpuRequest = cpuRequest + resources[0];
      cpuLimit = cpuLimit + resources[1];
      memoryRequest = memoryRequest + resources[2];
      memoryLimit = memoryLimit + resources[3];
    }
  }

  return {
    cpu: [
      { name: 'Capacity', value: cpuCapacity },
      { name: 'Usage', value: cpuUsage },
      { name: 'Request', value: cpuRequest },
      { name: 'Limit', value: cpuLimit },
    ],
    memory: [
      { name: 'Capacity', value: memoryCapacity },
      { name: 'Usage', value: memoryUsage },
      { name: 'Request', value: memoryRequest },
      { name: 'Limit', value: memoryLimit },
    ],
    pods: [
      { name: 'Capacity', value: podsCapacity },
      { name: 'Usage', value: podsUsage },
    ],
  };
};

interface INodeProps {
  cluster: string;
  namespace: string;
  name: string;
  node: V1Node;
}

const Node: React.FunctionComponent<INodeProps> = ({ cluster, namespace, name, node }: INodeProps) => {
  const { isError, data } = useQuery<INodeMetrics, Error>(
    ['resources/node/metrics', cluster, namespace, name],
    async () => {
      try {
        const responseNodeMetrics = await fetch(
          `/api/plugins/resources/resources?cluster=${cluster}&name=${name}&resource=nodes&path=/apis/metrics.k8s.io/v1beta1`,
          { method: 'get' },
        );
        const jsonNodeMetrics = await responseNodeMetrics.json();

        if (responseNodeMetrics.status >= 200 && responseNodeMetrics.status < 300) {
          const metric = jsonNodeMetrics as IMetric[];

          if (metric && metric.length === 1 && metric[0].resources && metric[0].resources.usage) {
            const responsePods = await fetch(
              `/api/plugins/resources/resources?cluster=${cluster}&resource=pods&path=/api/v1&paramName=fieldSelector&param=spec.nodeName=${name}`,
              { method: 'get' },
            );
            const jsonPods = await responsePods.json();

            if (responsePods.status >= 200 && responsePods.status < 300) {
              if (jsonPods && jsonPods.length === 1 && jsonPods[0].resources && jsonPods[0].resources.items) {
                return nodeMetrics(node, metric[0].resources.usage, jsonPods[0].resources.items);
              }

              throw new Error('Could not get Pods');
            }

            if (jsonPods.error) {
              throw new Error(jsonPods.error);
            } else {
              throw new Error('An unknown error occured');
            }
          }

          throw new Error('Could not get Node metrics');
        }

        if (jsonNodeMetrics.error) {
          throw new Error(jsonNodeMetrics.error);
        } else {
          throw new Error('An unknown error occured');
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isError || !data) {
    return null;
  }

  return (
    <React.Fragment>
      {node.status?.conditions && <Conditions conditions={node.status.conditions} />}
      <Title headingLevel="h4" size="lg">
        CPU
      </Title>
      <NodeChart data={data.cpu} legend="m" />

      <Title headingLevel="h4" size="lg">
        Memory
      </Title>
      <NodeChart data={data.memory} legend="Mi" />

      <Title headingLevel="h4" size="lg">
        Pods
      </Title>
      <NodeChart data={data.pods} legend="Pods" />
    </React.Fragment>
  );
};

export default Node;
