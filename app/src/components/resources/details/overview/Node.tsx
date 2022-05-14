import { V1Container, V1Node, V1Pod } from '@kubernetes/client-node';
import { BarDatum } from '@nivo/bar';
import React from 'react';
import { Title } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IMetric, IMetricUsage, IResourceResponse } from '../../utils/interfaces';
import Conditions from './Conditions';
import NodeChart from './NodeChart';
import { formatResourceValue } from '../../utils/helpers';

interface INodeMetrics {
  [key: string]: BarDatum[];
}

const podResources = (containers: V1Container[]): number[] => {
  let cpuRequests = 0;
  let cpuLimits = 0;
  let memoryRequests = 0;
  let memoryLimits = 0;

  for (const container of containers) {
    if (container.resources && container.resources.requests && 'cpu' in container.resources.requests) {
      cpuRequests = cpuRequests + parseInt(formatResourceValue('cpu', container.resources.requests['cpu']));
    }

    if (container.resources && container.resources.limits && 'cpu' in container.resources.limits) {
      cpuLimits = cpuLimits + parseInt(formatResourceValue('cpu', container.resources.limits['cpu']));
    }

    if (container.resources && container.resources.requests && 'memory' in container.resources.requests) {
      memoryRequests = memoryRequests + parseInt(formatResourceValue('memory', container.resources.requests['memory']));
    }

    if (container.resources && container.resources.limits && 'memory' in container.resources.limits) {
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
  satellite: string;
  cluster: string;
  namespace: string;
  name: string;
  node: V1Node;
}

const Node: React.FunctionComponent<INodeProps> = ({ satellite, cluster, namespace, name, node }: INodeProps) => {
  const { isError, data } = useQuery<INodeMetrics, Error>(
    ['app/resources/node/metrics', satellite, cluster, namespace, name],
    async () => {
      const clusterID = `/satellite/${satellite}/cluster/${cluster}`;

      const responseNodes = await fetch(
        `/api/resources?clusterID=${clusterID}&name=${name}&resourceID=nodes&path=/apis/metrics.k8s.io/v1beta1`,
        { method: 'get' },
      );

      const jsonNodes: IResourceResponse[] | { error: string } = await responseNodes.json();

      if (responseNodes.status >= 200 && responseNodes.status < 300) {
        if (jsonNodes && Array.isArray(jsonNodes) && jsonNodes.length === 1 && !jsonNodes[0].errors) {
          const metric = jsonNodes[0].resourceLists as IMetric[];

          if (metric && metric.length === 1 && metric[0].list && metric[0].list.usage) {
            const responsePods = await fetch(
              `/api/resources?clusterID=${clusterID}&resourceID=pods&path=/api/v1&paramName=fieldSelector&param=spec.nodeName=${name}`,
              { method: 'get' },
            );
            const jsonPods: IResourceResponse[] | { error: string } = await responsePods.json();

            if (responsePods.status >= 200 && responsePods.status < 300) {
              if (jsonPods && Array.isArray(jsonPods) && jsonPods.length === 1 && !jsonPods[0].errors) {
                if (
                  jsonPods[0].resourceLists &&
                  jsonPods[0].resourceLists.length === 1 &&
                  jsonPods[0].resourceLists[0].list &&
                  jsonPods[0].resourceLists[0].list.items
                ) {
                  return nodeMetrics(node, metric[0].list.usage, jsonPods[0].resourceLists[0].list.items);
                }
              }

              throw new Error('Could not get Pod metrics');
            }

            if (!Array.isArray(jsonPods) && jsonPods.error) {
              throw new Error(jsonPods.error);
            } else {
              throw new Error('An unknown error occured');
            }
          }
        }

        throw new Error('Could not get Node metrics');
      }

      if (!Array.isArray(jsonNodes) && jsonNodes.error) {
        throw new Error(jsonNodes.error);
      } else {
        throw new Error('An unknown error occured');
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
