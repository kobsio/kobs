import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import {
  V1DaemonSetList,
  V1DeploymentList,
  V1JobList,
  V1PodList,
  V1ReplicaSetList,
  V1StatefulSetList,
  V1beta1CronJobList,
} from '@kubernetes/client-node';
import { IRow } from '@patternfly/react-table';
import React from 'react';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

import { Resources as ProtoResources } from '../../generated/proto/clusters_pb';
import { timeDifference } from '../../utils/helpers';

interface Resources {
  [key: string]: Resource;
}

interface Resource {
  columns: string[];
  description: string;
  path: string;
  resource: string;
  rows: (results: ProtoResources[]) => IRow[];
  title: string;
}

export const resources: Resources = {
  cronjobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Schedule', 'Suspend', 'Active', 'Last Schedule', 'Age'],
    description: 'A CronJob creates Jobs on a repeating schedule.',
    path: '/apis/batch/v1beta1',
    resource: 'cronjobs',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const cronJobsList: V1beta1CronJobList = JSON.parse(result.getResourcelist());
        for (const cronJob of cronJobsList.items) {
          const age =
            cronJob.metadata && cronJob.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(cronJob.metadata.creationTimestamp.toString()).getTime())
              : '-';
          const schedule = cronJob.spec?.schedule;
          const suspend = cronJob.spec?.suspend ? 'True' : 'False';
          const active = cronJob.status?.active ? 'True' : 'False';
          const lastSchedule =
            cronJob.status && cronJob.status.lastScheduleTime
              ? timeDifference(new Date().getTime(), new Date(cronJob.status.lastScheduleTime.toString()).getTime())
              : '-';

          rows.push({
            cells: [
              cronJob.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              schedule,
              suspend,
              active,
              lastSchedule,
              age,
            ],
            props: cronJob,
          });
        }
      }

      return rows;
    },
    title: 'Cron Jobs',
  },
  daemonsets: {
    columns: [
      'Name',
      'Namespace',
      'Cluster',
      'Desired',
      'Current',
      'Ready',
      'Up to date',
      'Available',
      'Node Selector',
      'Age',
    ],
    description: 'A DaemonSet ensures that all (or some) Nodes run a copy of a Pod.',
    path: '/apis/apps/v1',
    resource: 'daemonsets',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const daemonSetList: V1DaemonSetList = JSON.parse(result.getResourcelist());
        for (const daemonSet of daemonSetList.items) {
          const age =
            daemonSet.metadata && daemonSet.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(daemonSet.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';
          const desired = daemonSet.status?.desiredNumberScheduled ? daemonSet.status?.desiredNumberScheduled : 0;
          const current = daemonSet.status?.currentNumberScheduled ? daemonSet.status?.currentNumberScheduled : 0;
          const ready = daemonSet.status?.numberReady ? daemonSet.status?.numberReady : 0;
          const upToDate = daemonSet.status?.updatedNumberScheduled ? daemonSet.status?.updatedNumberScheduled : 0;
          const available = daemonSet.status?.numberAvailable ? daemonSet.status?.numberAvailable : 0;
          const nodeSelector: string[] = [];

          for (const key in daemonSet.spec?.template.spec?.nodeSelector) {
            nodeSelector.push(`${key}=${daemonSet.spec?.template.spec?.nodeSelector[key]}`);
          }

          rows.push({
            cells: [
              daemonSet.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              desired,
              current,
              ready,
              upToDate,
              available,
              nodeSelector.join(', '),
              age,
            ],
            props: daemonSet,
          });
        }
      }

      return rows;
    },
    title: 'Daemon Sets',
  },
  deployments: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Available', 'Age'],
    description: 'A Deployment provides declarative updates for Pods and ReplicaSets.',
    path: '/apis/apps/v1',
    resource: 'deployments',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const deploymentList: V1DeploymentList = JSON.parse(result.getResourcelist());
        for (const deployment of deploymentList.items) {
          const age =
            deployment.metadata && deployment.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(deployment.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';
          const ready = deployment.status?.readyReplicas ? deployment.status?.readyReplicas : 0;
          const shouldReady = deployment.status?.replicas ? deployment.status?.replicas : 0;
          const upToDate = deployment.status?.updatedReplicas ? deployment.status?.updatedReplicas : 0;
          const available = deployment.status?.availableReplicas ? deployment.status?.availableReplicas : 0;

          rows.push({
            cells: [
              deployment.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              `${ready}/${shouldReady}`,
              upToDate,
              available,
              age,
            ],
            props: deployment,
          });
        }
      }

      return rows;
    },
    title: 'Deployments',
  },
  jobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Completions', 'Duration', 'Age'],
    description:
      'A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate.',
    path: '/apis/batch/v1',
    resource: 'jobs',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const jobList: V1JobList = JSON.parse(result.getResourcelist());
        for (const job of jobList.items) {
          const age =
            job.metadata && job.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(job.metadata.creationTimestamp.toString()).getTime())
              : '-';
          const completions = job.status?.succeeded ? job.status?.succeeded : 0;
          const completionsShould = job.spec?.completions ? job.spec?.completions : 0;
          const duration =
            job.status && job.status.completionTime && job.status.startTime
              ? timeDifference(
                  new Date(job.status.completionTime.toString()).getTime(),
                  new Date(job.status.startTime.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [
              job.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              `${completions}/${completionsShould}`,
              duration,
              age,
            ],
            props: job,
          });
        }
      }

      return rows;
    },
    title: 'Jobs',
  },
  pods: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Status', 'Restarts', 'Age'],
    description: 'Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.',
    path: '/api/v1',
    resource: 'pods',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const podList: V1PodList = JSON.parse(result.getResourcelist());
        for (const pod of podList.items) {
          const phase = pod.status && pod.status.phase ? pod.status.phase : 'Unknown';
          const age =
            pod.metadata && pod.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(pod.metadata.creationTimestamp.toString()).getTime())
              : '-';
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

          rows.push({
            cells: [
              pod.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              `${isReady}/${shouldReady}`,
              reason ? reason : phase,
              restarts,
              age,
            ],
            props: pod,
          });
        }
      }

      return rows;
    },
    title: 'Pods',
  },
  replicasets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Desired', 'Current', 'Ready', 'Age'],
    description: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time.",
    path: '/apis/apps/v1',
    resource: 'replicasets',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const replicaSetList: V1ReplicaSetList = JSON.parse(result.getResourcelist());
        for (const replicaSet of replicaSetList.items) {
          const age =
            replicaSet.metadata && replicaSet.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(replicaSet.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';
          const desired = replicaSet.status?.replicas ? replicaSet.status?.replicas : 0;
          const current = replicaSet.status?.availableReplicas ? replicaSet.status?.availableReplicas : 0;
          const ready = replicaSet.status?.readyReplicas ? replicaSet.status?.readyReplicas : 0;

          rows.push({
            cells: [
              replicaSet.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              desired,
              current,
              ready,
              age,
            ],
            props: replicaSet,
          });
        }
      }

      return rows;
    },
    title: 'Replica Sets',
  },
  statefulsets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Age'],
    description: 'StatefulSet is the workload API object used to manage stateful applications.',
    path: '/apis/apps/v1',
    resource: 'statefulsets',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const statefulSetList: V1StatefulSetList = JSON.parse(result.getResourcelist());
        for (const statefulSet of statefulSetList.items) {
          const age =
            statefulSet.metadata && statefulSet.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(statefulSet.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';
          const ready = statefulSet.status?.readyReplicas ? statefulSet.status?.readyReplicas : 0;
          const shouldReady = statefulSet.status?.replicas ? statefulSet.status?.replicas : 0;
          const upToDate = statefulSet.status?.updatedReplicas ? statefulSet.status?.updatedReplicas : 0;

          rows.push({
            cells: [
              statefulSet.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              `${ready}/${shouldReady}`,
              upToDate,
              age,
            ],
            props: statefulSet,
          });
        }
      }

      return rows;
    },
    title: 'Stateful Sets',
  },
};

export const emptyState = (cols: number, error: string): IRow[] => {
  return [
    {
      cells: [
        {
          props: { colSpan: cols },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateIcon icon={SearchIcon} />
                <Title headingLevel="h2" size="lg">
                  No results found
                </Title>
                <EmptyStateBody>
                  {error ? error : 'No results match the filter criteria. Select another cluster or namespace.'}
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          ),
        },
      ],
      heightAuto: true,
    },
  ];
};
