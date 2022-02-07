import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
  Title,
} from '@patternfly/react-core';
import {
  CoreV1EventList,
  V1ClusterRoleBindingList,
  V1ClusterRoleList,
  V1ConfigMapList,
  V1DaemonSetList,
  V1DeploymentList,
  V1EndpointsList,
  V1IngressList,
  V1JobList,
  V1NamespaceList,
  V1NetworkPolicyList,
  V1NodeList,
  V1PersistentVolumeClaimList,
  V1PersistentVolumeList,
  V1PodList,
  V1ReplicaSetList,
  V1RoleBindingList,
  V1RoleList,
  V1SecretList,
  V1ServiceAccountList,
  V1ServiceList,
  V1StatefulSetList,
  V1StorageClassList,
  V1beta1CronJobList,
  V1beta1PodDisruptionBudgetList,
  V1beta1PodSecurityPolicyList,
  V2beta1HorizontalPodAutoscalerList,
} from '@kubernetes/client-node';
import { SearchIcon, SquareIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';
import { JSONPath } from 'jsonpath-plus';
import React from 'react';

import { formatTime, timeDifference } from './time';
import { getLabelSelector } from './manifests';

const COLOR_OK = 'var(--pf-global--success-color--100)';
const COLOR_WARNING = 'var(--pf-global--warning-color--100)';
const COLOR_DANGER = 'var(--pf-global--danger-color--100)';

// IResourceItems is a list of resources for the cluster and namespace. The resources field contains a list of json
// manifests, which are representing the resources. This interface is used as input for the rows function of the
// resources object.
interface IResourceItems {
  cluster: string;
  namespace: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resources: any;
}

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
  rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined) => IResourceRow[];
  scope: TScope;
  title: string;
}

export interface IResourceColumn {
  title?: string;
  resource?: string;
  jsonPath?: string;
  type?: string;
}

// ICRD is the interface for all CRDs returned by our API. The CRD contains the path, resources and title to retrieve
// the corresponding CRs.
export interface ICRD {
  path: string;
  resource: string;
  title: string;
  description: string;
  scope: TScope;
  columns?: ICRDColumn[];
}

// ICRDColumn is the interface for the CRD columns. It contains all fields to render the columns in the table view.
export interface ICRDColumn {
  description: string;
  jsonPath: string;
  name: string;
  type: string;
}

export interface IResourceRow {
  cells: React.ReactNode[];
  cluster: string;
  name: string;
  namespace: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
}

// resources is the list of Kubernetes standard resources. To generate the rows for a resource, we have to pass the
// item from the API call to the rows function. The returned rows are mostly the same as they are also retunred by
// kubectl.
export const resources: IResources = {
  // eslint-disable-next-line sort-keys
  cronjobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Schedule', 'Suspend', 'Active', 'Last Schedule', 'Age'],
    description: 'A CronJob creates Jobs on a repeating schedule.',
    isCRD: false,
    path: '/apis/batch/v1beta1',
    resource: 'cronjobs',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const cronJobsList: V1beta1CronJobList = item.resources;
        for (const cronJob of cronJobsList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, cronJob, columns);
            rows.push(row);
          } else {
            const age =
              cronJob.metadata && cronJob.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(cronJob.metadata.creationTimestamp.toString()).getTime(),
                  )
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
                item.namespace || cronJob.metadata?.namespace || '',
                item.cluster,
                schedule,
                suspend,
                active,
                lastSchedule,
                age,
              ],
              cluster: item.cluster,
              name: cronJob.metadata?.name || '',
              namespace: item.namespace || cronJob.metadata?.namespace || '',
              props: cronJob,
            });
          }
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
      '',
    ],
    description: 'A DaemonSet ensures that all (or some) Nodes run a copy of a Pod.',
    isCRD: false,
    path: '/apis/apps/v1',
    resource: 'daemonsets',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const daemonSetList: V1DaemonSetList = item.resources;
        for (const daemonSet of daemonSetList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, daemonSet, columns);
            rows.push(row);
          } else {
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

            let status = COLOR_WARNING;
            if (daemonSet.status && daemonSet.status.numberMisscheduled > 0) {
              status = COLOR_DANGER;
            } else if (desired === current && desired === ready && desired === upToDate && desired === available) {
              status = COLOR_OK;
            } else if (current === 0 || ready === 0 || upToDate === 0 || available) {
              status = COLOR_DANGER;
            }

            rows.push({
              cells: [
                daemonSet.metadata?.name,
                item.namespace || daemonSet.metadata?.namespace || '',
                item.cluster,
                desired,
                current,
                ready,
                upToDate,
                available,
                nodeSelector.join(', '),
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: item.cluster,
              name: daemonSet.metadata?.name || '',
              namespace: item.namespace || daemonSet.metadata?.namespace || '',
              props: daemonSet,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Daemon Sets',
  },
  deployments: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Available', 'Age', ''],
    description: 'A Deployment provides declarative updates for Pods and ReplicaSets.',
    isCRD: false,
    path: '/apis/apps/v1',
    resource: 'deployments',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const deploymentList: V1DeploymentList = item.resources;
        for (const deployment of deploymentList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, deployment, columns);
            rows.push(row);
          } else {
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

            let status = COLOR_WARNING;
            if (shouldReady === ready && shouldReady === upToDate && shouldReady === available) {
              status = COLOR_OK;
            } else if (ready === 0 || upToDate === 0 || available) {
              status = COLOR_DANGER;
            }

            rows.push({
              cells: [
                deployment.metadata?.name,
                item.namespace || deployment.metadata?.namespace || '',
                item.cluster,
                `${ready}/${shouldReady}`,
                upToDate,
                available,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: item.cluster,
              name: deployment.metadata?.name || '',
              namespace: item.namespace || deployment.metadata?.namespace || '',
              props: deployment,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Deployments',
  },
  jobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Completions', 'Duration', 'Age', ''],
    description:
      'A Job creates one or more Pods and will continue to retry execution of the Pods until a specified number of them successfully terminate.',
    isCRD: false,
    path: '/apis/batch/v1',
    resource: 'jobs',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const jobList: V1JobList = item.resources;
        for (const job of jobList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, job, columns);
            rows.push(row);
          } else {
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

            let status = COLOR_OK;
            if (completions !== completionsShould && completionsShould !== 0) {
              status = COLOR_DANGER;
            }

            rows.push({
              cells: [
                job.metadata?.name,
                item.namespace || job.metadata?.namespace || '',
                item.cluster,
                `${completions}/${completionsShould}`,
                duration,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: item.cluster,
              name: job.metadata?.name || '',
              namespace: item.namespace || job.metadata?.namespace || '',
              props: job,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Jobs',
  },
  pods: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Status', 'Restarts', 'Age', ''],
    description: 'Pods are the smallest deployable units of computing that you can create and manage in Kubernetes.',
    isCRD: false,
    path: '/api/v1',
    resource: 'pods',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const podList: V1PodList = item.resources;
        for (const pod of podList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, pod, columns);
            rows.push(row);
          } else {
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
                item.namespace || pod.metadata?.namespace || '',
                item.cluster,
                `${isReady}/${shouldReady}`,
                reason ? reason : phase,
                restarts,
                age,
                <span key="status">
                  <SquareIcon
                    color={
                      phase === 'Running' || phase === 'Succeeded'
                        ? COLOR_OK
                        : phase === 'Unknown'
                        ? COLOR_WARNING
                        : COLOR_DANGER
                    }
                  />
                </span>,
              ],
              cluster: item.cluster,
              name: pod.metadata?.name || '',
              namespace: item.namespace || pod.metadata?.namespace || '',
              props: pod,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Pods',
  },
  replicasets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Desired', 'Current', 'Ready', 'Age', ''],
    description: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time.",
    isCRD: false,
    path: '/apis/apps/v1',
    resource: 'replicasets',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const replicaSetList: V1ReplicaSetList = item.resources;
        for (const replicaSet of replicaSetList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, replicaSet, columns);
            rows.push(row);
          } else {
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

            let status = COLOR_OK;
            if (desired !== 0 && desired !== current && desired !== ready) {
              status = COLOR_DANGER;
            }

            rows.push({
              cells: [
                replicaSet.metadata?.name,
                item.namespace || replicaSet.metadata?.namespace || '',
                item.cluster,
                desired,
                current,
                ready,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: item.cluster,
              name: replicaSet.metadata?.name || '',
              namespace: item.namespace || replicaSet.metadata?.namespace || '',
              props: replicaSet,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Replica Sets',
  },
  statefulsets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Age', ''],
    description: 'StatefulSet is the workload API object used to manage stateful applications.',
    isCRD: false,
    path: '/apis/apps/v1',
    resource: 'statefulsets',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const statefulSetList: V1StatefulSetList = item.resources;
        for (const statefulSet of statefulSetList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, statefulSet, columns);
            rows.push(row);
          } else {
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

            let status = COLOR_WARNING;
            if (shouldReady === 0 || (shouldReady === ready && shouldReady === upToDate)) {
              status = COLOR_OK;
            } else if (ready === 0 || upToDate === 0) {
              status = COLOR_DANGER;
            }

            rows.push({
              cells: [
                statefulSet.metadata?.name,
                item.namespace || statefulSet.metadata?.namespace || '',
                item.cluster,
                `${ready}/${shouldReady}`,
                upToDate,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: item.cluster,
              name: statefulSet.metadata?.name || '',
              namespace: item.namespace || statefulSet.metadata?.namespace || '',
              props: statefulSet,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Stateful Sets',
  },
  // eslint-disable-next-line sort-keys
  endpoints: {
    columns: ['Name', 'Namespace', 'Cluster', 'Endpoints', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'endpoints',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const enpointList: V1EndpointsList = item.resources;
        for (const endpoint of enpointList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, endpoint, columns);
            rows.push(row);
          } else {
            const age =
              endpoint.metadata && endpoint.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(endpoint.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';
            const ep: string[] = [];
            if (endpoint.subsets) {
              for (const subset of endpoint.subsets) {
                const ips = subset.addresses?.map((address) => address.ip);
                if (ips) {
                  ep.push(...ips);
                }
              }
            }

            rows.push({
              cells: [
                endpoint.metadata?.name,
                item.namespace || endpoint.metadata?.namespace || '',
                item.cluster,
                ep.join(', '),
                age,
              ],
              cluster: item.cluster,
              name: endpoint.metadata?.name || '',
              namespace: item.namespace || endpoint.metadata?.namespace || '',
              props: endpoint,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Endpoints',
  },
  horizontalpodautoscalers: {
    columns: ['Name', 'Namespace', 'Cluster', 'Reference', 'Min. Pods', 'Max. Pods', 'Replicas', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/autoscaling/v2beta1',
    resource: 'horizontalpodautoscalers',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const hpaList: V2beta1HorizontalPodAutoscalerList = item.resources;
        for (const hpa of hpaList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, hpa, columns);
            rows.push(row);
          } else {
            const reference =
              hpa.spec && hpa.spec.scaleTargetRef
                ? `${hpa.spec.scaleTargetRef.kind}/${hpa.spec.scaleTargetRef.name}`
                : '';
            const minPods = hpa.spec && hpa.spec.minReplicas ? hpa.spec.minReplicas : '';
            const maxPods = hpa.spec && hpa.spec.maxReplicas ? hpa.spec.maxReplicas : '';
            const replicas =
              hpa.status && hpa.status.currentReplicas
                ? `${hpa.status.currentReplicas}${hpa.status.desiredReplicas ? `/${hpa.status.desiredReplicas}` : ''}`
                : '';
            const age =
              hpa.metadata && hpa.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(hpa.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [
                hpa.metadata?.name,
                item.namespace || hpa.metadata?.namespace || '',
                item.cluster,
                reference,
                minPods,
                maxPods,
                replicas,
                age,
              ],
              cluster: item.cluster,
              name: hpa.metadata?.name || '',
              namespace: item.namespace || hpa.metadata?.namespace || '',
              props: hpa,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Horizontal Pod Autoscalers',
  },
  ingresses: {
    columns: ['Name', 'Namespace', 'Cluster', 'Hosts', 'Adress', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/extensions/v1beta1',
    resource: 'ingresses',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const ingressList: V1IngressList = item.resources;
        for (const ingress of ingressList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, ingress, columns);
            rows.push(row);
          } else {
            const hosts = ingress.spec?.rules?.map((rule) => rule.host);
            const address =
              ingress.status &&
              ingress.status.loadBalancer &&
              ingress.status.loadBalancer.ingress &&
              ingress.status.loadBalancer.ingress.length > 0 &&
              ingress.status.loadBalancer.ingress[0].ip
                ? ingress.status.loadBalancer.ingress[0].ip
                : '';
            const age =
              ingress.metadata && ingress.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(ingress.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                ingress.metadata?.name,
                item.namespace || ingress.metadata?.namespace || '',
                item.cluster,
                hosts ? hosts.join(', ') : '',
                address,
                age,
              ],
              cluster: item.cluster,
              name: ingress.metadata?.name || '',
              namespace: item.namespace || ingress.metadata?.namespace || '',
              props: ingress,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Ingresses',
  },
  networkpolicies: {
    columns: ['Name', 'Namespace', 'Cluster', 'Pod Selector', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/networking.k8s.io/v1',
    resource: 'networkpolicies',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const networkPolicyList: V1NetworkPolicyList = item.resources;
        for (const networkPolicy of networkPolicyList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, networkPolicy, columns);
            rows.push(row);
          } else {
            const podSelector = getLabelSelector(networkPolicy.spec?.podSelector);
            const age =
              networkPolicy.metadata && networkPolicy.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(networkPolicy.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                networkPolicy.metadata?.name,
                item.namespace || networkPolicy.metadata?.namespace || '',
                item.cluster,
                podSelector,
                age,
              ],
              cluster: item.cluster,
              name: networkPolicy.metadata?.name || '',
              namespace: item.namespace || networkPolicy.metadata?.namespace || '',
              props: networkPolicy,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Network Policies',
  },
  services: {
    columns: ['Name', 'Namespace', 'Cluster', 'Type', 'Cluster IP', 'External IP', 'Port(s)', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'services',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const serviceList: V1ServiceList = item.resources;
        for (const service of serviceList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, service, columns);
            rows.push(row);
          } else {
            const type = service.spec ? service.spec.type : '';
            const clusterIP = service.spec && service.spec.clusterIP ? service.spec.clusterIP : '';
            const externalIPs =
              service.status && service.status.loadBalancer && service.status.loadBalancer.ingress
                ? service.status.loadBalancer.ingress.map((ingress) => (ingress.ip ? ingress.ip : '')).join(', ')
                : '';
            const ports =
              service.spec && service.spec.ports
                ? service.spec.ports
                    .map(
                      (port) =>
                        `${port.port}${port.protocol ? `/${port.protocol}` : ''} (${port.name}${
                          port.appProtocol ? `/${port.appProtocol}` : ''
                        })`,
                    )
                    .join(', ')
                : '';
            const age =
              service.metadata && service.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(service.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                service.metadata?.name,
                item.namespace || service.metadata?.namespace || '',
                item.cluster,
                type,
                clusterIP,
                externalIPs,
                ports,
                age,
              ],
              cluster: item.cluster,
              name: service.metadata?.name || '',
              namespace: item.namespace || service.metadata?.namespace || '',
              props: service,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Services',
  },
  // eslint-disable-next-line sort-keys
  configmaps: {
    columns: ['Name', 'Namespace', 'Cluster', 'Data', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'configmaps',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const configMapList: V1ConfigMapList = item.resources;
        for (const configMap of configMapList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, configMap, columns);
            rows.push(row);
          } else {
            const age =
              configMap.metadata && configMap.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(configMap.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                configMap.metadata?.name,
                item.namespace || configMap.metadata?.namespace || '',
                item.cluster,
                configMap.data ? Object.keys(configMap.data).length : 0,
                age,
              ],
              cluster: item.cluster,
              name: configMap.metadata?.name || '',
              namespace: item.namespace || configMap.metadata?.namespace || '',
              props: configMap,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Config Maps',
  },
  persistentvolumeclaims: {
    columns: ['Name', 'Namespace', 'Cluster', 'Status', 'Volume', 'Capacity', 'Access Modes', 'Storage Class', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'persistentvolumeclaims',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const pvcList: V1PersistentVolumeClaimList = item.resources;
        for (const pvc of pvcList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, pvc, columns);
            rows.push(row);
          } else {
            const status = pvc.status && pvc.status.phase ? pvc.status.phase : '';
            const volume = pvc.spec && pvc.spec.volumeName ? pvc.spec.volumeName : '';
            const capacity =
              pvc.status && pvc.status.capacity && pvc.status.capacity.storage ? pvc.status.capacity.storage : '';
            const accessMode = pvc.spec && pvc.spec.accessModes ? pvc.spec.accessModes.join(', ') : '';
            const storageClass = pvc.spec && pvc.spec.storageClassName ? pvc.spec.storageClassName : '';
            const age =
              pvc.metadata && pvc.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(pvc.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [
                pvc.metadata?.name,
                item.namespace || pvc.metadata?.namespace || '',
                item.cluster,
                status,
                volume,
                capacity,
                accessMode,
                storageClass,
                age,
              ],
              cluster: item.cluster,
              name: pvc.metadata?.name || '',
              namespace: item.namespace || pvc.metadata?.namespace || '',
              props: pvc,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Persistent Volume Claims',
  },
  persistentvolumes: {
    columns: [
      'Name',
      'Cluster',
      'Capacity',
      'Access Modes',
      'Reclaim Policy',
      'Status',
      'Claim',
      'Storage Class',
      'Reason',
      'Age',
    ],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'persistentvolumes',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const persistentVolumeList: V1PersistentVolumeList = item.resources;
        for (const persistentVolume of persistentVolumeList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, persistentVolume, columns);
            rows.push(row);
          } else {
            const capacity =
              persistentVolume.spec && persistentVolume.spec.capacity && persistentVolume.spec.capacity.storage
                ? persistentVolume.spec.capacity.storage
                : '';
            const accessMode =
              persistentVolume.spec && persistentVolume.spec.accessModes
                ? persistentVolume.spec.accessModes.join(', ')
                : '';
            const reclaimPolicy =
              persistentVolume.spec && persistentVolume.spec.persistentVolumeReclaimPolicy
                ? persistentVolume.spec.persistentVolumeReclaimPolicy
                : '';
            const status =
              persistentVolume.status && persistentVolume.status.phase ? persistentVolume.status.phase : '';
            const claim =
              persistentVolume.spec && persistentVolume.spec.claimRef
                ? `${persistentVolume.spec.claimRef.namespace}/${persistentVolume.spec.claimRef.name}`
                : '';
            const storageClass =
              persistentVolume.spec && persistentVolume.spec.storageClassName
                ? persistentVolume.spec.storageClassName
                : '';
            const reason =
              persistentVolume.status && persistentVolume.status.reason ? persistentVolume.status.reason : '';
            const age =
              persistentVolume.metadata && persistentVolume.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(persistentVolume.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                persistentVolume.metadata?.name,
                item.cluster,
                capacity,
                accessMode,
                reclaimPolicy,
                status,
                claim,
                storageClass,
                reason,
                age,
              ],
              cluster: item.cluster,
              name: persistentVolume.metadata?.name || '',
              namespace: '',
              props: persistentVolume,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Persistent Volumes',
  },
  poddisruptionbudgets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Min. Available', 'Max. Unavailable', 'Allowed Disruptions', 'Age', ''],
    description: '',
    isCRD: false,
    path: '/apis/policy/v1beta1',
    resource: 'poddisruptionbudgets',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const pdbList: V1beta1PodDisruptionBudgetList = item.resources;
        for (const pdb of pdbList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, pdb, columns);
            rows.push(row);
          } else {
            const minAvailable = pdb.spec && pdb.spec.minAvailable ? pdb.spec.minAvailable : '';
            const maxUnavailable = pdb.spec && pdb.spec.maxUnavailable ? pdb.spec.maxUnavailable : '';
            const allowedDisruptions = pdb.status && pdb.status.disruptionsAllowed ? pdb.status.disruptionsAllowed : '';
            const age =
              pdb.metadata && pdb.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(pdb.metadata.creationTimestamp.toString()).getTime())
                : '-';

            let status = COLOR_OK;
            if (
              !pdb.status ||
              !pdb.status.currentHealthy ||
              !pdb.status.desiredHealthy ||
              pdb.status.currentHealthy < pdb.status.desiredHealthy
            ) {
              status = COLOR_DANGER;
            }

            rows.push({
              cells: [
                pdb.metadata?.name,
                item.namespace || pdb.metadata?.namespace,
                item.cluster,
                minAvailable,
                maxUnavailable,
                allowedDisruptions,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: item.cluster,
              name: pdb.metadata?.name || '',
              namespace: item.namespace || pdb.metadata?.namespace || '',
              props: pdb,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Pod Disruption Budgets',
  },
  secrets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Type', 'Data', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'secrets',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const secretList: V1SecretList = item.resources;
        for (const secret of secretList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, secret, columns);
            rows.push(row);
          } else {
            const type = secret.type ? secret.type : '';
            const data = secret.data ? Object.keys(secret.data).length : '';
            const age =
              secret.metadata && secret.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(secret.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [
                secret.metadata?.name,
                item.namespace || secret.metadata?.namespace || '',
                item.cluster,
                type,
                data,
                age,
              ],
              cluster: item.cluster,
              name: secret.metadata?.name || '',
              namespace: item.namespace || secret.metadata?.namespace || '',
              props: secret,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Secrets',
  },
  serviceaccounts: {
    columns: ['Name', 'Namespace', 'Cluster', 'Secrets', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'serviceaccounts',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const serviceAccountList: V1ServiceAccountList = item.resources;
        for (const serviceAccount of serviceAccountList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, serviceAccount, columns);
            rows.push(row);
          } else {
            const secrets = serviceAccount.secrets ? serviceAccount.secrets.length : '';
            const age =
              serviceAccount.metadata && serviceAccount.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(serviceAccount.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                serviceAccount.metadata?.name,
                item.namespace || serviceAccount.metadata?.namespace || '',
                item.cluster,
                secrets,
                age,
              ],
              cluster: item.cluster,
              name: serviceAccount.metadata?.name || '',
              namespace: item.namespace || serviceAccount.metadata?.namespace || '',
              props: serviceAccount,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Service Accounts',
  },
  storageclasses: {
    columns: [
      'Name',
      'Cluster',
      'Provisioner',
      'Reclaim Policy',
      'Volume Binding Mode',
      'Allow Volume Expansion',
      'Age',
    ],
    description: '',
    isCRD: false,
    path: '/apis/storage.k8s.io/v1',
    resource: 'storageclasses',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const storageClassList: V1StorageClassList = item.resources;
        for (const storageClass of storageClassList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, storageClass, columns);
            rows.push(row);
          } else {
            const provisioner = storageClass.provisioner;
            const reclaimPolicy = storageClass.reclaimPolicy ? storageClass.reclaimPolicy : '';
            const volumeBindingMode = storageClass.volumeBindingMode ? storageClass.volumeBindingMode : '';
            const allowVolumeExpansion = storageClass.allowVolumeExpansion ? 'true' : 'false';
            const age =
              storageClass.metadata && storageClass.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(storageClass.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                storageClass.metadata?.name,
                item.cluster,
                provisioner,
                reclaimPolicy,
                volumeBindingMode,
                allowVolumeExpansion,
                age,
              ],
              cluster: item.cluster,
              name: storageClass.metadata?.name || '',
              namespace: '',
              props: storageClass,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Storage Classes',
  },
  // eslint-disable-next-line sort-keys
  clusterrolebindings: {
    columns: ['Name', 'Cluster', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/rbac.authorization.k8s.io/v1',
    resource: 'clusterrolebindings',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const clusterRoleBindingsList: V1ClusterRoleBindingList = item.resources;
        for (const clusterRoleBinding of clusterRoleBindingsList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, clusterRoleBinding, columns);
            rows.push(row);
          } else {
            const age =
              clusterRoleBinding.metadata && clusterRoleBinding.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(clusterRoleBinding.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [clusterRoleBinding.metadata?.name, item.cluster, age],
              cluster: item.cluster,
              name: clusterRoleBinding.metadata?.name || '',
              namespace: '',
              props: clusterRoleBinding,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Cluster Role Bindings',
  },
  clusterroles: {
    columns: ['Name', 'Cluster', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/rbac.authorization.k8s.io/v1',
    resource: 'clusterroles',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const clusterRoleList: V1ClusterRoleList = item.resources;
        for (const clusterRole of clusterRoleList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, clusterRole, columns);
            rows.push(row);
          } else {
            const age =
              clusterRole.metadata && clusterRole.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(clusterRole.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [clusterRole.metadata?.name, item.cluster, age],
              cluster: item.cluster,
              name: clusterRole.metadata?.name || '',
              namespace: '',
              props: clusterRole,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Cluster Roles',
  },
  rolebindings: {
    columns: ['Name', 'Namespace', 'Cluster', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/rbac.authorization.k8s.io/v1',
    resource: 'rolebindings',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const roleBindingList: V1RoleBindingList = item.resources;
        for (const roleBinding of roleBindingList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, roleBinding, columns);
            rows.push(row);
          } else {
            const age =
              roleBinding.metadata && roleBinding.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(roleBinding.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [
                roleBinding.metadata?.name,
                item.namespace || roleBinding.metadata?.namespace || '',
                item.cluster,
                age,
              ],
              cluster: item.cluster,
              name: roleBinding.metadata?.name || '',
              namespace: item.namespace || roleBinding.metadata?.namespace || '',
              props: roleBinding,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Role Bindings',
  },
  roles: {
    columns: ['Name', 'Namespace', 'Cluster', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/rbac.authorization.k8s.io/v1',
    resource: 'roles',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const roleList: V1RoleList = item.resources;
        for (const role of roleList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, role, columns);
            rows.push(row);
          } else {
            const age =
              role.metadata && role.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(role.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [role.metadata?.name, item.namespace || role.metadata?.namespace || '', item.cluster, age],
              cluster: item.cluster,
              name: role.metadata?.name || '',
              namespace: item.namespace || role.metadata?.namespace || '',
              props: role,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Roles',
  },
  // eslint-disable-next-line sort-keys
  events: {
    columns: ['Name', 'Namespace', 'Cluster', 'Last Seen', 'Type', 'Reason', 'Object', 'Message'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'events',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const eventList: CoreV1EventList = item.resources;
        for (const event of eventList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, event, columns);
            rows.push(row);
          } else {
            rows.push({
              cells: [
                event.metadata?.name,
                item.namespace || event.metadata.namespace || '',
                item.cluster,
                event.lastTimestamp
                  ? timeDifference(new Date().getTime(), new Date(event.lastTimestamp.toString()).getTime())
                  : '-',
                event.type,
                event.reason,
                `${event.involvedObject.kind}/${event.involvedObject.name}`,
                event.message,
              ],
              cluster: item.cluster,
              name: event.metadata?.name || '',
              namespace: item.namespace || event.metadata?.namespace || '',
              props: event,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Namespaced',
    title: 'Events',
  },
  namespaces: {
    columns: ['Name', 'Cluster', 'Status', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'namespaces',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const namespaceList: V1NamespaceList = item.resources;
        for (const namespace of namespaceList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, namespace, columns);
            rows.push(row);
          } else {
            const status = namespace.status && namespace.status.phase ? namespace.status.phase : '';
            const age =
              namespace.metadata && namespace.metadata.creationTimestamp
                ? timeDifference(
                    new Date().getTime(),
                    new Date(namespace.metadata.creationTimestamp.toString()).getTime(),
                  )
                : '-';

            rows.push({
              cells: [namespace.metadata?.name, item.cluster, status, age],
              cluster: item.cluster,
              name: namespace.metadata?.name || '',
              namespace: '',
              props: namespace,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Namespaces',
  },
  nodes: {
    columns: ['Name', 'Cluster', 'Status', 'Version', 'Age'],
    description: '',
    isCRD: false,
    path: '/api/v1',
    resource: 'nodes',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const nodeList: V1NodeList = item.resources;
        for (const node of nodeList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, node, columns);
            rows.push(row);
          } else {
            const status: string[] = [];
            if (node.status && node.status.conditions) {
              for (const condition of node.status.conditions) {
                if (condition.status === 'True') {
                  status.push(condition.type);
                }
              }
            }

            const version =
              node.status && node.status.nodeInfo && node.status.nodeInfo.kubeletVersion
                ? node.status.nodeInfo.kubeletVersion
                : '';
            const age =
              node.metadata && node.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(node.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [node.metadata?.name, item.cluster, status.join(', '), version, age],
              cluster: item.cluster,
              name: node.metadata?.name || '',
              namespace: '',
              props: node,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Nodes',
  },
  podsecuritypolicies: {
    columns: [
      'Name',
      'Cluster',
      'Privileged',
      'Capabilities',
      'SELinux',
      'Run As User',
      'FS Group',
      'Supplemental Groups',
      'Read Only Root FS',
      'Volumes',
      'Age',
    ],
    description: '',
    isCRD: false,
    path: '/apis/policy/v1beta1',
    resource: 'podsecuritypolicies',
    rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const item of items) {
        const pspList: V1beta1PodSecurityPolicyList = item.resources;
        for (const psp of pspList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(item, psp, columns);
            rows.push(row);
          } else {
            const privileged = psp.spec && psp.spec.privileged ? 'true' : 'false';
            const capabilities =
              psp.spec && psp.spec.allowedCapabilities ? psp.spec.allowedCapabilities.join(', ') : '';
            const seLinux = psp.spec && psp.spec.seLinux && psp.spec.seLinux.rule ? psp.spec.seLinux.rule : '';
            const runAsUser = psp.spec && psp.spec.runAsUser && psp.spec.runAsUser.rule ? psp.spec.runAsUser.rule : '';
            const fsGroup = psp.spec && psp.spec.fsGroup && psp.spec.fsGroup.rule ? psp.spec.fsGroup.rule : '';
            const supplementalGroups =
              psp.spec && psp.spec.supplementalGroups && psp.spec.supplementalGroups.rule
                ? psp.spec.supplementalGroups.rule
                : '';
            const readOnlyRootFS = psp.spec && psp.spec.readOnlyRootFilesystem ? 'true' : 'false';
            const volumes = psp.spec && psp.spec.volumes ? psp.spec.volumes.join(', ') : '';
            const age =
              psp.metadata && psp.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(psp.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [
                psp.metadata?.name,
                item.cluster || psp.metadata?.namespace,
                privileged,
                capabilities,
                seLinux,
                runAsUser,
                fsGroup,
                supplementalGroups,
                readOnlyRootFS,
                volumes,
                age,
              ],
              cluster: item.cluster,
              name: psp.metadata?.name || '',
              namespace: '',
              props: psp,
            });
          }
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Pod Security Policies',
  },
};

// customResourceDefinition merges the standard Kubernetes resources with a list of Custom Resource Definitions. The
// item is a list of all supported resources for kobs.
export const customResourceDefinition = (crds: ICRD[]): IResources => {
  for (const crd of crds) {
    // For namespaced CRDs the default rows are name, namespace and cluster, for cluster scoped CRDs the namespace field
    // is removed. When the CRD contains a list of columns, we also add the name of a column to the list of columns. If
    // the CRD doesn't have any columns we only add a column for the age of the resource.
    const defaultColumns = crd.scope === 'Namespaced' ? ['Name', 'Namespace', 'Cluster'] : ['Name', 'Cluster'];
    const crdColumns = crd.columns && crd.columns.length > 0 ? crd.columns.map((column) => column.name) : ['Age'];

    resources[`${crd.resource}.${crd.path}`] = {
      columns: [...defaultColumns, ...crdColumns],
      description: crd.description,
      isCRD: true,
      path: crd.path,
      resource: crd.resource,
      rows: (items: IResourceItems[], columns: IResourceColumn[] | undefined): IResourceRow[] => {
        const rows: IResourceRow[] = [];

        for (const item of items) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const crList: any = item.resources;

          for (const cr of crList.items) {
            if (columns && Array.isArray(columns) && columns.length > 0) {
              const row = rowWithCustomColumns(item, cr, columns);
              rows.push(row);
            } else {
              // The cells are defined out of the list of default cells and the CRD columns. The value for a cell is
              // retrieved via JSON paths.
              const defaultCells =
                crd.scope === 'Namespaced'
                  ? [cr.metadata?.name, item.namespace || cr.metadata?.namespace, item.cluster]
                  : [cr.metadata?.name, item.cluster];
              const crdCells =
                crd.columns && crd.columns.length > 0
                  ? crd.columns.map((column) => {
                      const value = JSONPath<string | string[]>({ json: cr, path: `$.${column.jsonPath}` })[0];
                      if (!value) {
                        return '';
                      } else if (column.type === 'date') {
                        return timeDifference(new Date().getTime(), new Date(value).getTime());
                      } else if (Array.isArray(value)) {
                        return value.join(', ');
                      } else {
                        return value;
                      }
                    })
                  : [timeDifference(new Date().getTime(), new Date(cr.metadata?.creationTimestamp).getTime())];

              rows.push({
                cells: [...defaultCells, ...crdCells],
                cluster: item.cluster,
                name: cr.metadata?.name,
                namespace: item.namespace || cr.metadata?.namespace || '',
                props: cr,
              });
            }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowWithCustomColumns = (item: IResourceItems, manifest: any, columns: IResourceColumn[]): IResourceRow => {
  const cells: React.ReactNode[] = [
    manifest.metadata?.name || '',
    item.namespace || manifest.metadata?.namespace || '',
    item.cluster || '',
  ];

  for (const column of columns) {
    if (column.jsonPath) {
      const values = JSONPath<string[]>({ json: manifest, path: column.jsonPath });

      if (column.type === 'date' && values.length === 1) {
        cells.push(formatTime(Math.floor(new Date(values[0]).getTime() / 1000)));
      } else if (values.length === 1) {
        cells.push(values[0]);
      } else {
        cells.push(values.map((value) => JSON.stringify(value)).join(', '));
      }
    } else {
      cells.push('');
    }
  }

  return {
    cells: cells,
    cluster: item.cluster,
    name: manifest.metadata?.name || '',
    namespace: item.namespace || manifest.metadata?.namespace || '',
    props: manifest,
  };
};

// emptyState is used to display an empty state in the table for a resource, when the API call returned an error or no
// items.
export const emptyState = (
  cols: number,
  isLoading: boolean,
  isError: boolean,
  error: Error | null,
): React.ReactElement => {
  return (
    <Tr>
      <Td colSpan={cols}>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.small}>
            {isLoading ? (
              <EmptyStateIcon variant="container" component={Spinner} />
            ) : (
              <React.Fragment>
                <EmptyStateIcon icon={SearchIcon} />
                <Title headingLevel="h2" size="lg">
                  {isError ? 'An error occured' : 'No items found'}
                </Title>
                <EmptyStateBody>
                  {isError
                    ? error?.message
                    : 'No items match the filter criteria. Select another cluster or namespace.'}
                </EmptyStateBody>
              </React.Fragment>
            )}
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
};
