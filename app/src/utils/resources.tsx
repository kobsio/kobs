import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
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
import { IRow } from '@patternfly/react-table';
import { JSONPath } from 'jsonpath-plus';
import React from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { CRD, Resources as ProtoResources } from 'proto/clusters_grpc_web_pb';
import { getLabelSelector, timeDifference } from 'utils/helpers';

// TScope is the scope of a resource, which can be namespaced or cluster.
export type TScope = 'Namespaced' | 'Cluster';

export interface IResourceGroups {
  [key: string]: IResourceGroup;
}

export interface IResourceGroup {
  name: string;
  resources: IResources;
}

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
export const resources: IResources = {
  // eslint-disable-next-line sort-keys
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
            props: { apiVersion: 'batch/v1beta1', kind: 'CronJob', ...cronJob },
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
            props: { apiVersion: 'apps/v1', kind: 'DaemonSet', ...daemonSet },
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
            props: { apiVersion: 'apps/v1', kind: 'Deployment', ...deployment },
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
            props: { apiVersion: 'batch/v1', kind: 'Job', ...job },
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
            props: { apiVersion: 'v1', kind: 'Pod', ...pod },
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
            props: { apiVersion: 'apps/v1', kind: 'StatefulSet', ...statefulSet },
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const enpointList: V1EndpointsList = JSON.parse(result.getResourcelist());
        for (const endpoint of enpointList.items) {
          const age =
            endpoint.metadata && endpoint.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(endpoint.metadata.creationTimestamp.toString()).getTime())
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
            cells: [endpoint.metadata?.name, result.getNamespace(), result.getCluster(), ep.join(', '), age],
            props: endpoint,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const hpaList: V2beta1HorizontalPodAutoscalerList = JSON.parse(result.getResourcelist());
        for (const hpa of hpaList.items) {
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
              result.getNamespace(),
              result.getCluster(),
              reference,
              minPods,
              maxPods,
              replicas,
              age,
            ],
            props: hpa,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const ingressList: V1IngressList = JSON.parse(result.getResourcelist());
        for (const ingress of ingressList.items) {
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
              ? timeDifference(new Date().getTime(), new Date(ingress.metadata.creationTimestamp.toString()).getTime())
              : '-';

          rows.push({
            cells: [
              ingress.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              hosts ? hosts.join(', ') : '',
              address,
              age,
            ],
            props: ingress,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const networkPolicyList: V1NetworkPolicyList = JSON.parse(result.getResourcelist());
        for (const networkPolicy of networkPolicyList.items) {
          const podSelector = getLabelSelector(networkPolicy.spec?.podSelector);
          const age =
            networkPolicy.metadata && networkPolicy.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(networkPolicy.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [networkPolicy.metadata?.name, result.getNamespace(), result.getCluster(), podSelector, age],
            props: networkPolicy,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const serviceList: V1ServiceList = JSON.parse(result.getResourcelist());
        for (const service of serviceList.items) {
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
              ? timeDifference(new Date().getTime(), new Date(service.metadata.creationTimestamp.toString()).getTime())
              : '-';

          rows.push({
            cells: [
              service.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              type,
              clusterIP,
              externalIPs,
              ports,
              age,
            ],
            props: service,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const configMapList: V1ConfigMapList = JSON.parse(result.getResourcelist());
        for (const configMap of configMapList.items) {
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
              result.getNamespace(),
              result.getCluster(),
              configMap.data ? Object.keys(configMap.data).length : 0,
              age,
            ],
            props: configMap,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const pvcList: V1PersistentVolumeClaimList = JSON.parse(result.getResourcelist());
        for (const pvc of pvcList.items) {
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
              result.getNamespace(),
              result.getCluster(),
              status,
              volume,
              capacity,
              accessMode,
              storageClass,
              age,
            ],
            props: pvc,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const persistentVolumeList: V1PersistentVolumeList = JSON.parse(result.getResourcelist());
        for (const persistentVolume of persistentVolumeList.items) {
          const capacity =
            persistentVolume.spec && persistentVolume.spec.capacity ? persistentVolume.spec.capacity : '';
          const accessMode =
            persistentVolume.spec && persistentVolume.spec.accessModes
              ? persistentVolume.spec.accessModes.join(', ')
              : '';
          const reclaimPolicy =
            persistentVolume.spec && persistentVolume.spec.persistentVolumeReclaimPolicy
              ? persistentVolume.spec.persistentVolumeReclaimPolicy
              : '';
          const status = persistentVolume.status && persistentVolume.status.phase ? persistentVolume.status.phase : '';
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
              result.getCluster(),
              capacity,
              accessMode,
              reclaimPolicy,
              status,
              claim,
              storageClass,
              reason,
              age,
            ],
            props: persistentVolume,
          });
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Persistent Volumes',
  },
  poddisruptionbudgets: {
    columns: ['Name', 'Namespace', 'Cluster', 'Min. Available', 'Max. Unavailable', 'Allowed Disruptions', 'Age'],
    description: '',
    isCRD: false,
    path: '/apis/policy/v1beta1',
    resource: 'poddisruptionbudgets',
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const pdbList: V1beta1PodDisruptionBudgetList = JSON.parse(result.getResourcelist());
        for (const pdb of pdbList.items) {
          const minAvailable = pdb.spec && pdb.spec.minAvailable ? pdb.spec.minAvailable : '';
          const maxUnavailable = pdb.spec && pdb.spec.maxUnavailable ? pdb.spec.maxUnavailable : '';
          const allowedDisruptions = pdb.status && pdb.status.disruptionsAllowed ? pdb.status.disruptionsAllowed : '';
          const age =
            pdb.metadata && pdb.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(pdb.metadata.creationTimestamp.toString()).getTime())
              : '-';

          rows.push({
            cells: [
              pdb.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              minAvailable,
              maxUnavailable,
              allowedDisruptions,
              age,
            ],
            props: pdb,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const secretList: V1SecretList = JSON.parse(result.getResourcelist());
        for (const secret of secretList.items) {
          const type = secret.type ? secret.type : '';
          const data = secret.data ? Object.keys(secret.data).length : '';
          const age =
            secret.metadata && secret.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(secret.metadata.creationTimestamp.toString()).getTime())
              : '-';

          rows.push({
            cells: [secret.metadata?.name, result.getNamespace(), result.getCluster(), type, data, age],
            props: secret,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const serviceAccountList: V1ServiceAccountList = JSON.parse(result.getResourcelist());
        for (const serviceAccount of serviceAccountList.items) {
          const secrets = serviceAccount.secrets ? serviceAccount.secrets.length : '';
          const age =
            serviceAccount.metadata && serviceAccount.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(serviceAccount.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [serviceAccount.metadata?.name, result.getNamespace(), result.getCluster(), secrets, age],
            props: serviceAccount,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const storageClassList: V1StorageClassList = JSON.parse(result.getResourcelist());
        for (const storageClass of storageClassList.items) {
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
              result.getCluster(),
              provisioner,
              reclaimPolicy,
              volumeBindingMode,
              allowVolumeExpansion,
              age,
            ],
            props: storageClass,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const clusterRoleBindingsList: V1ClusterRoleBindingList = JSON.parse(result.getResourcelist());
        for (const clusterRoleBindings of clusterRoleBindingsList.items) {
          const age =
            clusterRoleBindings.metadata && clusterRoleBindings.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(clusterRoleBindings.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [clusterRoleBindings.metadata?.name, result.getCluster(), age],
            props: clusterRoleBindings,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const clusterRoleList: V1ClusterRoleList = JSON.parse(result.getResourcelist());
        for (const clusterRole of clusterRoleList.items) {
          const age =
            clusterRole.metadata && clusterRole.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(clusterRole.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [clusterRole.metadata?.name, result.getCluster(), age],
            props: clusterRole,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const roleBindingList: V1RoleBindingList = JSON.parse(result.getResourcelist());
        for (const roleBinding of roleBindingList.items) {
          const age =
            roleBinding.metadata && roleBinding.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(roleBinding.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [roleBinding.metadata?.name, result.getNamespace(), result.getCluster(), age],
            props: roleBinding,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const roleList: V1RoleList = JSON.parse(result.getResourcelist());
        for (const role of roleList.items) {
          const age =
            role.metadata && role.metadata.creationTimestamp
              ? timeDifference(new Date().getTime(), new Date(role.metadata.creationTimestamp.toString()).getTime())
              : '-';

          rows.push({
            cells: [role.metadata?.name, result.getNamespace(), result.getCluster(), age],
            props: role,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const eventList: CoreV1EventList = JSON.parse(result.getResourcelist());
        for (const event of eventList.items) {
          rows.push({
            cells: [
              event.metadata?.name,
              result.getNamespace(),
              result.getCluster(),
              event.lastTimestamp
                ? timeDifference(new Date().getTime(), new Date(event.lastTimestamp.toString()).getTime())
                : '-',
              event.type,
              event.reason,
              `${event.involvedObject.kind}/${event.involvedObject.name}`,
              event.message,
            ],
            props: event,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const namespaceList: V1NamespaceList = JSON.parse(result.getResourcelist());
        for (const namespace of namespaceList.items) {
          const status = namespace.status && namespace.status.phase ? namespace.status.phase : '';
          const age =
            namespace.metadata && namespace.metadata.creationTimestamp
              ? timeDifference(
                  new Date().getTime(),
                  new Date(namespace.metadata.creationTimestamp.toString()).getTime(),
                )
              : '-';

          rows.push({
            cells: [namespace.metadata?.name, result.getCluster(), status, age],
            props: namespace,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const nodeList: V1NodeList = JSON.parse(result.getResourcelist());
        for (const node of nodeList.items) {
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
            cells: [node.metadata?.name, result.getCluster(), status.join(', '), version, age],
            props: node,
          });
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
    rows: (results: ProtoResources[]): IRow[] => {
      const rows: IRow[] = [];

      for (const result of results) {
        const pspList: V1beta1PodSecurityPolicyList = JSON.parse(result.getResourcelist());
        for (const psp of pspList.items) {
          const privileged = psp.spec && psp.spec.privileged ? 'true' : 'false';
          const capabilities = psp.spec && psp.spec.allowedCapabilities ? psp.spec.allowedCapabilities.join(', ') : '';
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
              result.getCluster(),
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
            props: psp,
          });
        }
      }

      return rows;
    },
    scope: 'Cluster',
    title: 'Pod Security Policies',
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
