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
import { JSONPath } from 'jsonpath-plus';
import React from 'react';
import SquareIcon from '@patternfly/react-icons/dist/esm/icons/square-icon';

import { IColumn, IResourceList, IResourceResponse } from './interfaces';
import { formatTime, timeDifference } from '@kobsio/shared';
import { IResource } from '../../../resources/clusters';
import { getLabelSelector } from './helpers';

const COLOR_OK = 'var(--pf-global--success-color--100)';
const COLOR_WARNING = 'var(--pf-global--warning-color--100)';
const COLOR_DANGER = 'var(--pf-global--danger-color--100)';

// IResourceItems is a list of resources for the cluster and namespace. The resources field contains a list of json
// manifests, which are representing the resources. This interface is used as input for the rows function of the
// resources object.

// The IResources is a list of resources, which is supported by kobs.
export interface ITableData {
  [key: string]: ITableDatum;
}

export interface ITableDatum {
  columns: string[];
  rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined) => IResourceRow[];
}

export interface IResourceRow {
  cells: React.ReactNode[];
  cluster: string;
  name: string;
  namespace: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
  satellite: string;
}

// resources is the list of Kubernetes standard resources. To generate the rows for a resource, we have to pass the
// item from the API call to the rows function. The returned rows are mostly the same as they are also retunred by
// kubectl.
export const resourcesTableData: ITableData = {
  // eslint-disable-next-line sort-keys
  cronjobs: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Schedule', 'Suspend', 'Active', 'Last Schedule', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const cronJobsList: V1beta1CronJobList = resourceList.list;
        for (const cronJob of cronJobsList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, cronJob, columns);
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
                cronJob.metadata?.namespace || '',
                renderCluster(resourceList),
                schedule,
                suspend,
                active,
                lastSchedule,
                age,
              ],
              cluster: resourceList.cluster,
              name: cronJob.metadata?.name || '',
              namespace: cronJob.metadata?.namespace || '',
              props: cronJob,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  daemonsets: {
    columns: [
      'Name',
      'Namespace',
      'Cluster (Satellite)',
      'Desired',
      'Current',
      'Ready',
      'Up to date',
      'Available',
      'Node Selector',
      'Age',
      '',
    ],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const daemonSetList: V1DaemonSetList = resourceList.list;
        for (const daemonSet of daemonSetList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, daemonSet, columns);
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
                daemonSet.metadata?.namespace || '',
                renderCluster(resourceList),
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
              cluster: resourceList.cluster,
              name: daemonSet.metadata?.name || '',
              namespace: daemonSet.metadata?.namespace || '',
              props: daemonSet,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  deployments: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Ready', 'Up to date', 'Available', 'Age', ''],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const deploymentList: V1DeploymentList = resourceList.list;
        for (const deployment of deploymentList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, deployment, columns);
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
                deployment.metadata?.namespace || '',
                renderCluster(resourceList),
                `${ready}/${shouldReady}`,
                upToDate,
                available,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: resourceList.cluster,
              name: deployment.metadata?.name || '',
              namespace: deployment.metadata?.namespace || '',
              props: deployment,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  jobs: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Completions', 'Duration', 'Age', ''],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const jobList: V1JobList = resourceList.list;
        for (const job of jobList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, job, columns);
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
                job.metadata?.namespace || '',
                renderCluster(resourceList),
                `${completions}/${completionsShould}`,
                duration,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: resourceList.cluster,
              name: job.metadata?.name || '',
              namespace: job.metadata?.namespace || '',
              props: job,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  pods: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Ready', 'Status', 'Restarts', 'Age', ''],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const podList: V1PodList = resourceList.list;
        for (const pod of podList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, pod, columns);
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
                pod.metadata?.namespace || '',
                renderCluster(resourceList),
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
              cluster: resourceList.cluster,
              name: pod.metadata?.name || '',
              namespace: pod.metadata?.namespace || '',
              props: pod,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  replicasets: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Desired', 'Current', 'Ready', 'Age', ''],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const replicaSetList: V1ReplicaSetList = resourceList.list;
        for (const replicaSet of replicaSetList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, replicaSet, columns);
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
                replicaSet.metadata?.namespace || '',
                renderCluster(resourceList),
                desired,
                current,
                ready,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: resourceList.cluster,
              name: replicaSet.metadata?.name || '',
              namespace: replicaSet.metadata?.namespace || '',
              props: replicaSet,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  statefulsets: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Ready', 'Up to date', 'Age', ''],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const statefulSetList: V1StatefulSetList = resourceList.list;
        for (const statefulSet of statefulSetList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, statefulSet, columns);
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
                statefulSet.metadata?.namespace || '',
                renderCluster(resourceList),
                `${ready}/${shouldReady}`,
                upToDate,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: resourceList.cluster,
              name: statefulSet.metadata?.name || '',
              namespace: statefulSet.metadata?.namespace || '',
              props: statefulSet,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  endpoints: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Endpoints', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const enpointList: V1EndpointsList = resourceList.list;
        for (const endpoint of enpointList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, endpoint, columns);
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
                endpoint.metadata?.namespace || '',
                resourceList.cluster,
                ep.join(', '),
                age,
              ],
              cluster: resourceList.cluster,
              name: endpoint.metadata?.name || '',
              namespace: endpoint.metadata?.namespace || '',
              props: endpoint,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  horizontalpodautoscalers: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Reference', 'Min. Pods', 'Max. Pods', 'Replicas', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const hpaList: V2beta1HorizontalPodAutoscalerList = resourceList.list;
        for (const hpa of hpaList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, hpa, columns);
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
                hpa.metadata?.namespace || '',
                renderCluster(resourceList),
                reference,
                minPods,
                maxPods,
                replicas,
                age,
              ],
              cluster: resourceList.cluster,
              name: hpa.metadata?.name || '',
              namespace: hpa.metadata?.namespace || '',
              props: hpa,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  ingresses: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Hosts', 'Adress', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const ingressList: V1IngressList = resourceList.list;
        for (const ingress of ingressList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, ingress, columns);
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
                ingress.metadata?.namespace || '',
                renderCluster(resourceList),
                hosts ? hosts.join(', ') : '',
                address,
                age,
              ],
              cluster: resourceList.cluster,
              name: ingress.metadata?.name || '',
              namespace: ingress.metadata?.namespace || '',
              props: ingress,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  networkpolicies: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Pod Selector', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const networkPolicyList: V1NetworkPolicyList = resourceList.list;
        for (const networkPolicy of networkPolicyList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, networkPolicy, columns);
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
                networkPolicy.metadata?.namespace || '',
                renderCluster(resourceList),
                podSelector,
                age,
              ],
              cluster: resourceList.cluster,
              name: networkPolicy.metadata?.name || '',
              namespace: networkPolicy.metadata?.namespace || '',
              props: networkPolicy,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  services: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Type', 'Cluster IP', 'External IP', 'Port(s)', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const serviceList: V1ServiceList = resourceList.list;
        for (const service of serviceList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, service, columns);
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
                service.metadata?.namespace || '',
                renderCluster(resourceList),
                type,
                clusterIP,
                externalIPs,
                ports,
                age,
              ],
              cluster: resourceList.cluster,
              name: service.metadata?.name || '',
              namespace: service.metadata?.namespace || '',
              props: service,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  configmaps: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Data', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const configMapList: V1ConfigMapList = resourceList.list;
        for (const configMap of configMapList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, configMap, columns);
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
                configMap.metadata?.namespace || '',
                renderCluster(resourceList),
                configMap.data ? Object.keys(configMap.data).length : 0,
                age,
              ],
              cluster: resourceList.cluster,
              name: configMap.metadata?.name || '',
              namespace: configMap.metadata?.namespace || '',
              props: configMap,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  persistentvolumeclaims: {
    columns: [
      'Name',
      'Namespace',
      'Cluster (Satellite)',
      'Status',
      'Volume',
      'Capacity',
      'Access Modes',
      'Storage Class',
      'Age',
    ],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const pvcList: V1PersistentVolumeClaimList = resourceList.list;
        for (const pvc of pvcList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, pvc, columns);
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
                pvc.metadata?.namespace || '',
                renderCluster(resourceList),
                status,
                volume,
                capacity,
                accessMode,
                storageClass,
                age,
              ],
              cluster: resourceList.cluster,
              name: pvc.metadata?.name || '',
              namespace: pvc.metadata?.namespace || '',
              props: pvc,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  persistentvolumes: {
    columns: [
      'Name',
      'Cluster (Satellite)',
      'Capacity',
      'Access Modes',
      'Reclaim Policy',
      'Status',
      'Claim',
      'Storage Class',
      'Reason',
      'Age',
    ],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const persistentVolumeList: V1PersistentVolumeList = resourceList.list;
        for (const persistentVolume of persistentVolumeList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, persistentVolume, columns);
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
                renderCluster(resourceList),
                capacity,
                accessMode,
                reclaimPolicy,
                status,
                claim,
                storageClass,
                reason,
                age,
              ],
              cluster: resourceList.cluster,
              name: persistentVolume.metadata?.name || '',
              namespace: '',
              props: persistentVolume,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  poddisruptionbudgets: {
    columns: [
      'Name',
      'Namespace',
      'Cluster (Satellite)',
      'Min. Available',
      'Max. Unavailable',
      'Allowed Disruptions',
      'Age',
      '',
    ],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const pdbList: V1beta1PodDisruptionBudgetList = resourceList.list;
        for (const pdb of pdbList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, pdb, columns);
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
                pdb.metadata?.namespace,
                renderCluster(resourceList),
                minAvailable,
                maxUnavailable,
                allowedDisruptions,
                age,
                <span key="status">
                  <SquareIcon color={status} />
                </span>,
              ],
              cluster: resourceList.cluster,
              name: pdb.metadata?.name || '',
              namespace: pdb.metadata?.namespace || '',
              props: pdb,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  secrets: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Type', 'Data', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const secretList: V1SecretList = resourceList.list;
        for (const secret of secretList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, secret, columns);
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
                secret.metadata?.namespace || '',
                renderCluster(resourceList),
                type,
                data,
                age,
              ],
              cluster: resourceList.cluster,
              name: secret.metadata?.name || '',
              namespace: secret.metadata?.namespace || '',
              props: secret,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  serviceaccounts: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Secrets', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const serviceAccountList: V1ServiceAccountList = resourceList.list;
        for (const serviceAccount of serviceAccountList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, serviceAccount, columns);
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
                serviceAccount.metadata?.namespace || '',
                renderCluster(resourceList),
                secrets,
                age,
              ],
              cluster: resourceList.cluster,
              name: serviceAccount.metadata?.name || '',
              namespace: serviceAccount.metadata?.namespace || '',
              props: serviceAccount,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  storageclasses: {
    columns: [
      'Name',
      'Cluster (Satellite)',
      'Provisioner',
      'Reclaim Policy',
      'Volume Binding Mode',
      'Allow Volume Expansion',
      'Age',
    ],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const storageClassList: V1StorageClassList = resourceList.list;
        for (const storageClass of storageClassList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, storageClass, columns);
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
                renderCluster(resourceList),
                provisioner,
                reclaimPolicy,
                volumeBindingMode,
                allowVolumeExpansion,
                age,
              ],
              cluster: resourceList.cluster,
              name: storageClass.metadata?.name || '',
              namespace: '',
              props: storageClass,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  clusterrolebindings: {
    columns: ['Name', 'Cluster (Satellite)', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const clusterRoleBindingsList: V1ClusterRoleBindingList = resourceList.list;
        for (const clusterRoleBinding of clusterRoleBindingsList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, clusterRoleBinding, columns);
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
              cells: [clusterRoleBinding.metadata?.name, renderCluster(resourceList), age],
              cluster: resourceList.cluster,
              name: clusterRoleBinding.metadata?.name || '',
              namespace: '',
              props: clusterRoleBinding,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  clusterroles: {
    columns: ['Name', 'Cluster (Satellite)', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const clusterRoleList: V1ClusterRoleList = resourceList.list;
        for (const clusterRole of clusterRoleList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, clusterRole, columns);
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
              cells: [clusterRole.metadata?.name, renderCluster(resourceList), age],
              cluster: resourceList.cluster,
              name: clusterRole.metadata?.name || '',
              namespace: '',
              props: clusterRole,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  rolebindings: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const roleBindingList: V1RoleBindingList = resourceList.list;
        for (const roleBinding of roleBindingList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, roleBinding, columns);
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
                roleBinding.metadata?.namespace || '',
                renderCluster(resourceList),
                age,
              ],
              cluster: resourceList.cluster,
              name: roleBinding.metadata?.name || '',
              namespace: roleBinding.metadata?.namespace || '',
              props: roleBinding,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  roles: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const roleList: V1RoleList = resourceList.list;
        for (const role of roleList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, role, columns);
            rows.push(row);
          } else {
            const age =
              role.metadata && role.metadata.creationTimestamp
                ? timeDifference(new Date().getTime(), new Date(role.metadata.creationTimestamp.toString()).getTime())
                : '-';

            rows.push({
              cells: [role.metadata?.name, role.metadata?.namespace || '', renderCluster(resourceList), age],
              cluster: resourceList.cluster,
              name: role.metadata?.name || '',
              namespace: role.metadata?.namespace || '',
              props: role,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  events: {
    columns: ['Name', 'Namespace', 'Cluster (Satellite)', 'Last Seen', 'Type', 'Reason', 'Object', 'Message'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const eventList: CoreV1EventList = resourceList.list;
        for (const event of eventList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, event, columns);
            rows.push(row);
          } else {
            rows.push({
              cells: [
                event.metadata?.name,
                event.metadata.namespace || '',
                renderCluster(resourceList),
                event.lastTimestamp
                  ? timeDifference(new Date().getTime(), new Date(event.lastTimestamp.toString()).getTime())
                  : '-',
                event.type,
                event.reason,
                `${event.involvedObject.kind}/${event.involvedObject.name}`,
                event.message,
              ],
              cluster: resourceList.cluster,
              name: event.metadata?.name || '',
              namespace: event.metadata?.namespace || '',
              props: event,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  namespaces: {
    columns: ['Name', 'Cluster (Satellite)', 'Status', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const namespaceList: V1NamespaceList = resourceList.list;
        for (const namespace of namespaceList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, namespace, columns);
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
              cells: [namespace.metadata?.name, renderCluster(resourceList), status, age],
              cluster: resourceList.cluster,
              name: namespace.metadata?.name || '',
              namespace: '',
              props: namespace,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  nodes: {
    columns: ['Name', 'Cluster (Satellite)', 'Status', 'Version', 'Age'],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const nodeList: V1NodeList = resourceList.list;
        for (const node of nodeList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, node, columns);
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
              cells: [node.metadata?.name, renderCluster(resourceList), status.join(', '), version, age],
              cluster: resourceList.cluster,
              name: node.metadata?.name || '',
              namespace: '',
              props: node,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
  podsecuritypolicies: {
    columns: [
      'Name',
      'Cluster (Satellite)',
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
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        const pspList: V1beta1PodSecurityPolicyList = resourceList.list;
        for (const psp of pspList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, psp, columns);
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
                psp.metadata?.namespace,
                renderCluster(resourceList),
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
              cluster: resourceList.cluster,
              name: psp.metadata?.name || '',
              namespace: '',
              props: psp,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  },
};

// customResourceDefinition merges the standard Kubernetes resources with a list of Custom Resource Definitions. The
// item is a list of all supported resources for kobs.
export const customResourceDefinitionTableData = (crd: IResource): ITableDatum => {
  const defaultColumns =
    crd.scope === 'Namespaced' ? ['Name', 'Namespace', 'Cluster (Satellite)'] : ['Name', 'Cluster (Satellite)'];
  const crdColumns = crd.columns && crd.columns.length > 0 ? crd.columns.map((column) => column.name) : ['Age'];

  return {
    columns: [...defaultColumns, ...crdColumns],
    rows: (resourceResponse: IResourceResponse, columns: IColumn[] | undefined): IResourceRow[] => {
      const rows: IResourceRow[] = [];

      for (const resourceList of resourceResponse.resourceLists) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const crList: any = resourceList.list;

        for (const cr of crList.items) {
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const row = rowWithCustomColumns(resourceList, cr, columns);
            rows.push(row);
          } else {
            // The cells are defined out of the list of default cells and the CRD columns. The value for a cell is
            // retrieved via JSON paths.
            const defaultCells =
              crd.scope === 'Namespaced'
                ? [cr.metadata?.name, cr.metadata?.namespace, renderCluster(resourceList)]
                : [cr.metadata?.name, renderCluster(resourceList)];
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
              cluster: resourceList.cluster,
              name: cr.metadata?.name,
              namespace: cr.metadata?.namespace || '',
              props: cr,
              satellite: resourceList.satellite,
            });
          }
        }
      }

      return rows;
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowWithCustomColumns = (resourceList: IResourceList, manifest: any, columns: IColumn[]): IResourceRow => {
  const cells: React.ReactNode[] = [
    manifest.metadata?.name || '',
    manifest.metadata?.namespace || '',
    renderCluster(resourceList),
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
    cluster: resourceList.cluster,
    name: manifest.metadata?.name || '',
    namespace: manifest.metadata?.namespace || '',
    props: manifest,
    satellite: resourceList.satellite,
  };
};

const renderCluster = (resourceList: IResourceList): React.ReactNode => {
  return (
    <span key="cluster">
      {resourceList.cluster}
      <span className="pf-u-pl-sm pf-u-color-400">({resourceList.satellite})</span>
    </span>
  );
};
