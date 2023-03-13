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
  V1CronJobList,
  V1PodDisruptionBudgetList,
  V2HorizontalPodAutoscalerList,
} from '@kubernetes/client-node';
import { Square } from '@mui/icons-material';
import { JSONPath } from 'jsonpath-plus';
import { ReactNode } from 'react';

import { IOptionsColumn, IResourceResponse, getLabelSelector, IResource } from './utils';

import { formatTime, timeDifference } from '../../utils/times';

/**
 * `ITemplate` is the interface which must be implemented by a template for a resource. We have to different ways to
 * create a templates: They can be defined via the `templates` variable or the can be generated from a CRD via the
 * `customResourceDefinitionTemplate` function.
 */
export interface ITemplate {
  columns: string[];
  rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined) => IRow[];
}

/**
 * `IRow` is interface which must be implemented by a single row in the `ITemplate` interface. A row represents a single
 * resource returned by our API.
 */
export interface IRow {
  cells: ReactNode[];
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
}

/**
 * `TStatus` is the type which indicates the status of a resource. The status is used to set the color for the status
 * icon in a table. Therefor the values must be a valid color for MUI.
 */
type TStatus = 'warning' | 'error' | 'success';

/**
 * `templates` defines all templates for the default Kubernetes resources we are supporting. It is a map with the
 * resource as key and a template as value.
 */
export const templates: Record<string, ITemplate> = {
  // eslint-disable-next-line sort-keys
  cronjobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Schedule', 'Suspend', 'Active', 'Last Schedule', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const cronJobsList: V1CronJobList = namespace.manifest;
                for (const cronJob of cronJobsList.items) {
                  if (!filterByJSONPath(cronJob, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, cronJob, columns);
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
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(cronJob.status.lastScheduleTime.toString()).getTime(),
                          )
                        : '-';

                    rows.push({
                      cells: [
                        cronJob.metadata?.name,
                        cronJob.metadata?.namespace || '',
                        cluster.cluster,
                        schedule,
                        suspend,
                        active,
                        lastSchedule,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: cronJob,
                      name: cronJob.metadata?.name || '',
                      namespace: cronJob.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
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
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const daemonSetList: V1DaemonSetList = namespace.manifest;
                for (const daemonSet of daemonSetList.items) {
                  if (!filterByJSONPath(daemonSet, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, daemonSet, columns);
                    rows.push(row);
                  } else {
                    const age =
                      daemonSet.metadata && daemonSet.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(daemonSet.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';
                    const desired = daemonSet.status?.desiredNumberScheduled
                      ? daemonSet.status?.desiredNumberScheduled
                      : 0;
                    const current = daemonSet.status?.currentNumberScheduled
                      ? daemonSet.status?.currentNumberScheduled
                      : 0;
                    const ready = daemonSet.status?.numberReady ? daemonSet.status?.numberReady : 0;
                    const upToDate = daemonSet.status?.updatedNumberScheduled
                      ? daemonSet.status?.updatedNumberScheduled
                      : 0;
                    const available = daemonSet.status?.numberAvailable ? daemonSet.status?.numberAvailable : 0;
                    const nodeSelector: string[] = [];

                    for (const key in daemonSet.spec?.template.spec?.nodeSelector) {
                      nodeSelector.push(`${key}=${daemonSet.spec?.template.spec?.nodeSelector[key]}`);
                    }

                    let status: TStatus = 'warning';
                    if (daemonSet.status && daemonSet.status.numberMisscheduled > 0) {
                      status = 'error';
                    } else if (
                      desired === current &&
                      desired === ready &&
                      desired === upToDate &&
                      desired === available
                    ) {
                      status = 'success';
                    } else if (current === 0 || ready === 0 || upToDate === 0 || available) {
                      status = 'error';
                    }

                    rows.push({
                      cells: [
                        daemonSet.metadata?.name,
                        daemonSet.metadata?.namespace || '',
                        cluster.cluster,
                        desired,
                        current,
                        ready,
                        upToDate,
                        available,
                        nodeSelector.join(', '),
                        age,
                        <span key="status">
                          <Square color={status} />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: daemonSet,
                      name: daemonSet.metadata?.name || '',
                      namespace: daemonSet.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  deployments: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Available', 'Age', ''],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const deploymentList: V1DeploymentList = namespace.manifest;
                for (const deployment of deploymentList.items) {
                  if (!filterByJSONPath(deployment, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, deployment, columns);
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

                    let status: TStatus = 'warning';
                    if (shouldReady === ready && shouldReady === upToDate && shouldReady === available) {
                      status = 'success';
                    } else if (ready === 0 || upToDate === 0 || available) {
                      status = 'error';
                    }

                    rows.push({
                      cells: [
                        deployment.metadata?.name,
                        deployment.metadata?.namespace || '',
                        cluster.cluster,
                        `${ready}/${shouldReady}`,
                        upToDate,
                        available,
                        age,
                        <span key="status">
                          <Square color={status} />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: deployment,
                      name: deployment.metadata?.name || '',
                      namespace: deployment.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  jobs: {
    columns: ['Name', 'Namespace', 'Cluster', 'Completions', 'Duration', 'Age', ''],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const jobList: V1JobList = namespace.manifest;
                for (const job of jobList.items) {
                  if (!filterByJSONPath(job, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, job, columns);
                    rows.push(row);
                  } else {
                    const age =
                      job.metadata && job.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(job.metadata.creationTimestamp.toString()).getTime(),
                          )
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

                    let status: TStatus = 'success';
                    if (completions !== completionsShould && completionsShould !== 0) {
                      status = 'error';
                    }

                    rows.push({
                      cells: [
                        job.metadata?.name,
                        job.metadata?.namespace || '',
                        cluster.cluster,
                        `${completions}/${completionsShould}`,
                        duration,
                        age,
                        <span key="status">
                          <Square color={status} />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: job,
                      name: job.metadata?.name || '',
                      namespace: job.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  pods: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Status', 'Restarts', 'Age', ''],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const podList: V1PodList = namespace.manifest;
                for (const pod of podList.items) {
                  if (!filterByJSONPath(pod, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, pod, columns);
                    rows.push(row);
                  } else {
                    const phase = pod.status && pod.status.phase ? pod.status.phase : 'Unknown';
                    const age =
                      pod.metadata && pod.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(pod.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';
                    let initReason = '';
                    let reason = pod.status && pod.status.reason ? pod.status.reason : '';
                    let shouldReady = 0;
                    let isReady = 0;
                    let restarts = 0;

                    if (pod.status && pod.status.initContainerStatuses) {
                      for (const container of pod.status.initContainerStatuses) {
                        if (container.ready === false && container.state && container.state.waiting) {
                          initReason = container.state.waiting.reason ? container.state.waiting.reason : '';
                          break;
                        }

                        if (container.ready === false && container.state && container.state.terminated) {
                          initReason = container.state.terminated.reason ? container.state.terminated.reason : '';
                          break;
                        }
                      }
                    }

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
                        cluster.cluster,
                        `${isReady}/${shouldReady}`,
                        initReason ? initReason : reason ? reason : phase,
                        restarts,
                        age,
                        <span key="status">
                          <Square
                            color={
                              phase === 'Running' || phase === 'Succeeded'
                                ? 'success'
                                : phase === 'Unknown'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: pod,
                      name: pod.metadata?.name || '',
                      namespace: pod.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  replicasets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Desired', 'Current', 'Ready', 'Age', ''],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const replicaSetList: V1ReplicaSetList = namespace.manifest;
                for (const replicaSet of replicaSetList.items) {
                  if (!filterByJSONPath(replicaSet, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, replicaSet, columns);
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

                    let status: TStatus = 'success';
                    if (desired !== 0 && desired !== current && desired !== ready) {
                      status = 'error';
                    }

                    rows.push({
                      cells: [
                        replicaSet.metadata?.name,
                        replicaSet.metadata?.namespace || '',
                        cluster.cluster,
                        desired,
                        current,
                        ready,
                        age,
                        <span key="status">
                          <Square color={status} />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: replicaSet,
                      name: replicaSet.metadata?.name || '',
                      namespace: replicaSet.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  statefulsets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Ready', 'Up to date', 'Age', ''],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const statefulSetList: V1StatefulSetList = namespace.manifest;
                for (const statefulSet of statefulSetList.items) {
                  if (!filterByJSONPath(statefulSet, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, statefulSet, columns);
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

                    let status: TStatus = 'warning';
                    if (shouldReady === 0 || (shouldReady === ready && shouldReady === upToDate)) {
                      status = 'success';
                    } else if (ready === 0 || upToDate === 0) {
                      status = 'error';
                    }

                    rows.push({
                      cells: [
                        statefulSet.metadata?.name,
                        statefulSet.metadata?.namespace || '',
                        cluster.cluster,
                        `${ready}/${shouldReady}`,
                        upToDate,
                        age,
                        <span key="status">
                          <Square color={status} />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: statefulSet,
                      name: statefulSet.metadata?.name || '',
                      namespace: statefulSet.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  endpoints: {
    columns: ['Name', 'Namespace', 'Cluster', 'Endpoints', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const enpointList: V1EndpointsList = namespace.manifest;
                for (const endpoint of enpointList.items) {
                  if (!filterByJSONPath(endpoint, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, endpoint, columns);
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
                        cluster.cluster,
                        ep.join(', '),
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: endpoint,
                      name: endpoint.metadata?.name || '',
                      namespace: endpoint.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  horizontalpodautoscalers: {
    columns: ['Name', 'Namespace', 'Cluster', 'Reference', 'Min. Pods', 'Max. Pods', 'Replicas', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const hpaList: V2HorizontalPodAutoscalerList = namespace.manifest;
                for (const hpa of hpaList.items) {
                  if (!filterByJSONPath(hpa, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, hpa, columns);
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
                        ? `${hpa.status.currentReplicas}${
                            hpa.status.desiredReplicas ? `/${hpa.status.desiredReplicas}` : ''
                          }`
                        : '';
                    const age =
                      hpa.metadata && hpa.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(hpa.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';

                    rows.push({
                      cells: [
                        hpa.metadata?.name,
                        hpa.metadata?.namespace || '',
                        cluster.cluster,
                        reference,
                        minPods,
                        maxPods,
                        replicas,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: hpa,
                      name: hpa.metadata?.name || '',
                      namespace: hpa.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  ingresses: {
    columns: ['Name', 'Namespace', 'Cluster', 'Hosts', 'Adress', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const ingressList: V1IngressList = namespace.manifest;
                for (const ingress of ingressList.items) {
                  if (!filterByJSONPath(ingress, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, ingress, columns);
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
                        cluster.cluster,
                        hosts ? hosts.join(', ') : '',
                        address,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: ingress,
                      name: ingress.metadata?.name || '',
                      namespace: ingress.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  networkpolicies: {
    columns: ['Name', 'Namespace', 'Cluster', 'Pod Selector', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const networkPolicyList: V1NetworkPolicyList = namespace.manifest;
                for (const networkPolicy of networkPolicyList.items) {
                  if (!filterByJSONPath(networkPolicy, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, networkPolicy, columns);
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
                        cluster.cluster,
                        podSelector,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: networkPolicy,
                      name: networkPolicy.metadata?.name || '',
                      namespace: networkPolicy.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  services: {
    columns: ['Name', 'Namespace', 'Cluster', 'Type', 'Cluster IP', 'External IP', 'Port(s)', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const serviceList: V1ServiceList = namespace.manifest;
                for (const service of serviceList.items) {
                  if (!filterByJSONPath(service, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, service, columns);
                    rows.push(row);
                  } else {
                    const type = service.spec ? service.spec.type : '';
                    const clusterIP = service.spec && service.spec.clusterIP ? service.spec.clusterIP : '';
                    const externalIPs =
                      service.status && service.status.loadBalancer && service.status.loadBalancer.ingress
                        ? service.status.loadBalancer.ingress
                            .map((ingress) => (ingress.ip ? ingress.ip : ''))
                            .join(', ')
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
                        cluster.cluster,
                        type,
                        clusterIP,
                        externalIPs,
                        ports,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: service,
                      name: service.metadata?.name || '',
                      namespace: service.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  configmaps: {
    columns: ['Name', 'Namespace', 'Cluster', 'Data', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const configMapList: V1ConfigMapList = namespace.manifest;
                for (const configMap of configMapList.items) {
                  if (!filterByJSONPath(configMap, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, configMap, columns);
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
                        cluster.cluster,
                        configMap.data ? Object.keys(configMap.data).length : 0,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: configMap,
                      name: configMap.metadata?.name || '',
                      namespace: configMap.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  persistentvolumeclaims: {
    columns: ['Name', 'Namespace', 'Cluster', 'Status', 'Volume', 'Capacity', 'Access Modes', 'Storage Class', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const pvcList: V1PersistentVolumeClaimList = namespace.manifest;
                for (const pvc of pvcList.items) {
                  if (!filterByJSONPath(pvc, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, pvc, columns);
                    rows.push(row);
                  } else {
                    const status = pvc.status && pvc.status.phase ? pvc.status.phase : '';
                    const volume = pvc.spec && pvc.spec.volumeName ? pvc.spec.volumeName : '';
                    const capacity =
                      pvc.status && pvc.status.capacity && pvc.status.capacity.storage
                        ? pvc.status.capacity.storage
                        : '';
                    const accessMode = pvc.spec && pvc.spec.accessModes ? pvc.spec.accessModes.join(', ') : '';
                    const storageClass = pvc.spec && pvc.spec.storageClassName ? pvc.spec.storageClassName : '';
                    const age =
                      pvc.metadata && pvc.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(pvc.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';

                    rows.push({
                      cells: [
                        pvc.metadata?.name,
                        pvc.metadata?.namespace || '',
                        cluster.cluster,
                        status,
                        volume,
                        capacity,
                        accessMode,
                        storageClass,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: pvc,
                      name: pvc.metadata?.name || '',
                      namespace: pvc.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
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
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const persistentVolumeList: V1PersistentVolumeList = namespace.manifest;
                for (const persistentVolume of persistentVolumeList.items) {
                  if (!filterByJSONPath(persistentVolume, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, persistentVolume, columns);
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
                        cluster.cluster,
                        capacity,
                        accessMode,
                        reclaimPolicy,
                        status,
                        claim,
                        storageClass,
                        reason,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: persistentVolume,
                      name: persistentVolume.metadata?.name || '',
                      namespace: '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  poddisruptionbudgets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Min. Available', 'Max. Unavailable', 'Allowed Disruptions', 'Age', ''],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const pdbList: V1PodDisruptionBudgetList = namespace.manifest;
                for (const pdb of pdbList.items) {
                  if (!filterByJSONPath(pdb, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, pdb, columns);
                    rows.push(row);
                  } else {
                    const minAvailable = pdb.spec && pdb.spec.minAvailable ? pdb.spec.minAvailable : '';
                    const maxUnavailable = pdb.spec && pdb.spec.maxUnavailable ? pdb.spec.maxUnavailable : '';
                    const allowedDisruptions =
                      pdb.status && pdb.status.disruptionsAllowed ? pdb.status.disruptionsAllowed : '';
                    const age =
                      pdb.metadata && pdb.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(pdb.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';

                    let status: TStatus = 'success';
                    if (
                      !pdb.status ||
                      !pdb.status.currentHealthy ||
                      !pdb.status.desiredHealthy ||
                      pdb.status.currentHealthy < pdb.status.desiredHealthy
                    ) {
                      status = 'error';
                    }

                    rows.push({
                      cells: [
                        pdb.metadata?.name,
                        pdb.metadata?.namespace,
                        cluster.cluster,
                        minAvailable,
                        maxUnavailable,
                        allowedDisruptions,
                        age,
                        <span key="status">
                          <Square color={status} />
                        </span>,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: pdb,
                      name: pdb.metadata?.name || '',
                      namespace: pdb.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  secrets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Type', 'Data', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const secretList: V1SecretList = namespace.manifest;
                for (const secret of secretList.items) {
                  if (!filterByJSONPath(secret, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, secret, columns);
                    rows.push(row);
                  } else {
                    const type = secret.type ? secret.type : '';
                    const data = secret.data ? Object.keys(secret.data).length : '';
                    const age =
                      secret.metadata && secret.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(secret.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';

                    rows.push({
                      cells: [
                        secret.metadata?.name,
                        secret.metadata?.namespace || '',
                        cluster.cluster,
                        type,
                        data,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: secret,
                      name: secret.metadata?.name || '',
                      namespace: secret.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  serviceaccounts: {
    columns: ['Name', 'Namespace', 'Cluster', 'Secrets', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const serviceAccountList: V1ServiceAccountList = namespace.manifest;
                for (const serviceAccount of serviceAccountList.items) {
                  if (!filterByJSONPath(serviceAccount, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, serviceAccount, columns);
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
                        cluster.cluster,
                        secrets,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: serviceAccount,
                      name: serviceAccount.metadata?.name || '',
                      namespace: serviceAccount.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
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
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const storageClassList: V1StorageClassList = namespace.manifest;
                for (const storageClass of storageClassList.items) {
                  if (!filterByJSONPath(storageClass, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, storageClass, columns);
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
                        cluster.cluster,
                        provisioner,
                        reclaimPolicy,
                        volumeBindingMode,
                        allowVolumeExpansion,
                        age,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: storageClass,
                      name: storageClass.metadata?.name || '',
                      namespace: '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  clusterrolebindings: {
    columns: ['Name', 'Cluster', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const clusterRoleBindingsList: V1ClusterRoleBindingList = namespace.manifest;
                for (const clusterRoleBinding of clusterRoleBindingsList.items) {
                  if (!filterByJSONPath(clusterRoleBinding, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, clusterRoleBinding, columns);
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
                      cells: [clusterRoleBinding.metadata?.name, cluster.cluster, age],
                      cluster: cluster.cluster || '',
                      manifest: clusterRoleBinding,
                      name: clusterRoleBinding.metadata?.name || '',
                      namespace: '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  clusterroles: {
    columns: ['Name', 'Cluster', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const clusterRoleList: V1ClusterRoleList = namespace.manifest;
                for (const clusterRole of clusterRoleList.items) {
                  if (!filterByJSONPath(clusterRole, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, clusterRole, columns);
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
                      cells: [clusterRole.metadata?.name, cluster.cluster, age],
                      cluster: cluster.cluster || '',
                      manifest: clusterRole,
                      name: clusterRole.metadata?.name || '',
                      namespace: '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  rolebindings: {
    columns: ['Name', 'Namespace', 'Cluster', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const roleBindingList: V1RoleBindingList = namespace.manifest;
                for (const roleBinding of roleBindingList.items) {
                  if (!filterByJSONPath(roleBinding, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, roleBinding, columns);
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
                      cells: [roleBinding.metadata?.name, roleBinding.metadata?.namespace || '', cluster.cluster, age],
                      cluster: cluster.cluster || '',
                      manifest: roleBinding,
                      name: roleBinding.metadata?.name || '',
                      namespace: roleBinding.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  roles: {
    columns: ['Name', 'Namespace', 'Cluster', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const roleList: V1RoleList = namespace.manifest;
                for (const role of roleList.items) {
                  if (!filterByJSONPath(role, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, role, columns);
                    rows.push(row);
                  } else {
                    const age =
                      role.metadata && role.metadata.creationTimestamp
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(role.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';

                    rows.push({
                      cells: [role.metadata?.name, role.metadata?.namespace || '', cluster.cluster, age],
                      cluster: cluster.cluster || '',
                      manifest: role,
                      name: role.metadata?.name || '',
                      namespace: role.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  // eslint-disable-next-line sort-keys
  events: {
    columns: ['Name', 'Namespace', 'Cluster', 'Last Seen', 'Type', 'Reason', 'Object', 'Message'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const eventList: CoreV1EventList = namespace.manifest;
                for (const event of eventList.items) {
                  if (!filterByJSONPath(event, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, event, columns);
                    rows.push(row);
                  } else {
                    rows.push({
                      cells: [
                        event.metadata?.name,
                        event.metadata.namespace || '',
                        cluster.cluster,
                        event.lastTimestamp
                          ? timeDifference(new Date().getTime(), new Date(event.lastTimestamp.toString()).getTime())
                          : '-',
                        event.type,
                        event.reason,
                        `${event.involvedObject.kind}/${event.involvedObject.name}`,
                        event.message,
                      ],
                      cluster: cluster.cluster || '',
                      manifest: event,
                      name: event.metadata?.name || '',
                      namespace: event.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  namespaces: {
    columns: ['Name', 'Cluster', 'Status', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const namespaceList: V1NamespaceList = namespace.manifest;
                for (const namespace of namespaceList.items) {
                  if (!filterByJSONPath(namespace, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, namespace, columns);
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
                      cells: [namespace.metadata?.name, cluster.cluster, status, age],
                      cluster: cluster.cluster || '',
                      manifest: namespace,
                      name: namespace.metadata?.name || '',
                      namespace: '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
  nodes: {
    columns: ['Name', 'Cluster', 'Status', 'Version', 'Age'],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                const nodeList: V1NodeList = namespace.manifest;
                for (const node of nodeList.items) {
                  if (!filterByJSONPath(node, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, node, columns);
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
                        ? timeDifference(
                            new Date().getTime(),
                            new Date(node.metadata.creationTimestamp.toString()).getTime(),
                          )
                        : '-';

                    rows.push({
                      cells: [node.metadata?.name, cluster.cluster, status.join(', '), version, age],
                      cluster: cluster.cluster || '',
                      manifest: node,
                      name: node.metadata?.name || '',
                      namespace: '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  },
};

/**
 * `customResourceDefinitionTemplate` generates a `ITemplate` for a Custom Resource Definition.
 */
export const customResourceDefinitionTemplate = (crd: IResource): ITemplate => {
  const defaultColumns = crd.scope === 'Namespaced' ? ['Name', 'Namespace', 'Cluster'] : ['Name', 'Cluster'];
  const crdColumns = crd.columns && crd.columns.length > 0 ? crd.columns.map((column) => column.name) : ['Age'];

  return {
    columns: [...defaultColumns, ...crdColumns],
    rows: (resource: IResourceResponse, columns: IOptionsColumn[] | undefined, filter: string | undefined): IRow[] => {
      const rows: IRow[] = [];

      if (resource.clusters) {
        for (const cluster of resource.clusters) {
          if (cluster.namespaces) {
            for (const namespace of cluster.namespaces) {
              if (namespace.manifest) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const crList: any = namespace.manifest;

                for (const cr of crList.items) {
                  if (!filterByJSONPath(cr, filter)) {
                    continue;
                  }

                  if (columns && Array.isArray(columns) && columns.length > 0) {
                    const row = rowWithCustomColumns(cluster.cluster, cr, columns);
                    rows.push(row);
                  } else {
                    // The cells are defined out of the list of default cells and the CRD columns. The value for a cell is
                    // retrieved via JSON paths.
                    const defaultCells =
                      crd.scope === 'Namespaced'
                        ? [cr.metadata?.name, cr.metadata?.namespace, cluster.cluster]
                        : [cr.metadata?.name, cluster.cluster];
                    const crdCells =
                      crd.columns && crd.columns.length > 0
                        ? crd.columns.map((column) => {
                            const value = JSONPath<string | string[]>({ json: cr, path: `$.${column.jsonPath}` })[0];
                            if (column.type === 'integer' && !value) {
                              return 0;
                            } else if (!value) {
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
                      cluster: cluster.cluster || '',
                      manifest: cr,
                      name: cr.metadata?.name,
                      namespace: cr.metadata?.namespace || '',
                    });
                  }
                }
              }
            }
          }
        }
      }

      return rows;
    },
  };
};

/**
 * `rowWithCustomColumns` generates a row, with a custom set of columns. The columns can be provided by a user via the
 * options, when the resources panel is used within a dashboard panel.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowWithCustomColumns = (cluster: string | undefined, manifest: any, columns: IOptionsColumn[]): IRow => {
  const cells: ReactNode[] = [manifest.metadata?.name || '', manifest.metadata?.namespace || '', cluster];

  for (const column of columns) {
    if (column.jsonPath) {
      const values = JSONPath<string[]>({ json: manifest, path: column.jsonPath });

      if (column.type === 'date' && values.length === 1) {
        cells.push(formatTime(new Date(values[0])));
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
    cluster: cluster || '',
    manifest: manifest,
    name: manifest.metadata?.name || '',
    namespace: manifest.metadata?.namespace || '',
  };
};

/**
 * `filterByJSONPath` can be used to filter a provided resource via the provided JSON path. If the JSON path condition
 * returns `true`, the resource will be displayed in the table of the resources. If the condition is `false` the
 * resource will not be displayed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterByJSONPath = (manifest: any, jsonPath: string | undefined): boolean => {
  if (!jsonPath) {
    return true;
  }

  const values = JSONPath<string[]>({ json: manifest, path: jsonPath });
  if (values.length > 0) {
    return true;
  }

  return false;
};
