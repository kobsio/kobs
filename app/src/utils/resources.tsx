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
import { JSONPath } from 'jsonpath-plus';
import React from 'react';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

import { CRD, Resources as ProtoResources } from 'proto/clusters_grpc_web_pb';
import { timeDifference } from 'utils/helpers';

// TScope is the scope of a resource, which can be namespaced or cluster.
export type TScope = 'Namespaced' | 'Cluster';

// The IResources is a list of resources, which is supported by kobs.
export interface IResources {
  [key: string]: IResource;
}

// IResource is the interface, which must be implemented by each supported resource. Each resource must provid a list of
// columns and rows, which are used to render a table for this resource. It also must contain a title and description,
// which is displayed in the corresponding UI. To get the resources from the Kubernetes API for a cluster the resource
// must contain a path and a resource property.
export interface IResource {
  columns: string[];
  description: string;
  isCRD: boolean;
  path: string;
  resource: string;
  rows: (results: ProtoResources[]) => IRow[];
  scope: TScope;
  title: string;
}

// resources is the list of Kubernetes standard resources. To generate the rows for a resource, we have to pass the
// result from the gRPC API call to the rows function. The returned rows are mostly the same as they are also retunred
// by kubectl.
const resources: IResources = {
  cronjobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Schedule', 'Suspend', 'Active', 'Last Schedule', 'Age'],
    description: 'A CronJob creates Jobs on a repeating schedule.',
    isCRD: false,
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
    scope: 'Namespaced',
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
    isCRD: false,
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
    scope: 'Namespaced',
    title: 'Daemon Sets',
  },
  deployments: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Available', 'Age'],
    description: 'A Deployment provides declarative updates for Pods and ReplicaSets.',
    isCRD: false,
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
    scope: 'Namespaced',
    title: 'Deployments',
  },
  jobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Completions', 'Duration', 'Age'],
    description:
      'A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate.',
    isCRD: false,
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
    scope: 'Namespaced',
    title: 'Jobs',
  },
  pods: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Status', 'Restarts', 'Age'],
    description: 'Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.',
    isCRD: false,
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
    scope: 'Namespaced',
    title: 'Pods',
  },
  replicasets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Desired', 'Current', 'Ready', 'Age'],
    description: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time.",
    isCRD: false,
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
    scope: 'Namespaced',
    title: 'Replica Sets',
  },
  statefulsets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Age'],
    description: 'StatefulSet is the workload API object used to manage stateful applications.',
    isCRD: false,
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
    scope: 'Namespaced',
    title: 'Stateful Sets',
  },
};

// customResourceDefinition merges the standard Kubernetes resources with a list of Custom Resource Definitions. The
// result is a list of all supported resources for kobs.
export const customResourceDefinition = (crds: CRD.AsObject[]): IResources => {
  for (const crd of crds) {
    // For namespaced CRDs the default rows are name, namespace and cluster, for cluster scoped CRDs the namespace field
    // is removed. When the CRD contains a list of columns, we also add the name of a column to the list of columns. If
    // the CRD doesn't have any columns we only add a column for the age of the resource.
    const defaultColumns = crd.scope === 'Namespaced' ? ['Name', 'Namespace', 'Cluster'] : ['Name', 'Cluster'];
    const crdColumns = crd.columnsList.length === 0 ? ['Age'] : crd.columnsList.map((column) => column.name);

    resources[`${crd.resource}.${crd.path}`] = {
      columns: [...defaultColumns, ...crdColumns],
      description: crd.description,
      isCRD: true,
      path: crd.path,
      resource: crd.resource,
      rows: (results: ProtoResources[]): IRow[] => {
        const rows: IRow[] = [];

        for (const result of results) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const crList: any = JSON.parse(result.getResourcelist());

          for (const cr of crList.items) {
            // The cells are defined out of the list of default cells and the CRD columns. The value for a cell is
            // retrieved via JSON paths.
            const defaultCells =
              crd.scope === 'Namespaced'
                ? [cr.metadata?.name, result.getNamespace(), result.getCluster()]
                : [cr.metadata?.name, result.getCluster()];
            const crdCells =
              crd.columnsList.length === 0
                ? [timeDifference(new Date().getTime(), new Date(cr.metadata?.creationTimestamp).getTime())]
                : crd.columnsList.map((column) => {
                    const value = JSONPath({ json: cr, path: `$.${column.jsonpath}` })[0];
                    if (column.type === 'date') return timeDifference(new Date().getTime(), new Date(value).getTime());
                    return value;
                  });

            rows.push({
              cells: [...defaultCells, ...crdCells],
              props: cr,
            });
          }
        }

        return rows;
      },
      scope: crd.scope === 'Namespaced' ? 'Namespaced' : 'Cluster',
      title: crd.title,
    };
  }

  return resources;
};

// emptyState is used to display an empty state in the table for a resource, when the gRPC API call returned an error or
// no results.
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
