# Helm

[Helm](https://helm.sh/) is the package manager for Kubernetes, and you can read detailed background information in the [CNCF Helm Project Journey report](https://www.cncf.io/cncf-helm-project-journey/).

## Install the Helm Charts

To install kobs using Helm you have to add our Helm repository:

```sh
helm repo add kobs https://helm.kobs.io
helm repo list
```

When you have added the Helm repository, you can install the kobs cluster, hub and watcher via the following commands:

```sh
helm install kobs kobs/kobs
```

## Update the Helm Charts

To update the Helm repository and to show all available versions of the Helm chart, you can run the following commands:

```sh
helm repo update
helm search repo -l kobs/
```

To update your deployed Helm chart run:

```sh
helm upgrade --install kobs kobs/kobs
```

## Values

| Value | Description | Default |
| ----- | ----------- | ------- |
| `nameOverride` | Expand the name of the chart. | `""` |
| `fullnameOverride` | Override the name of the app. | `""` |
| `global.imagePullSecrets` | Specify a list of image pull secrets, to avoid the DockerHub rate limit or to pull the kobs/enovy image from a private registry. | `[]` |
| `global.image.repository` | The repository for the Docker image. | `kobsio/kobs` |
| `global.image.tag` | The tag of the Docker image which should be used. | `""` |
| `global.image.pullPolicy` | The image pull policy for the Docker image. | `IfNotPresent` |
| `config.hub` | The configuration file for the [hub](../configuration/hub.md) | |
| `config.watcher` | The configuration file for the [watcher](../configuration/watcher.md) | |
| `config.cluster` | The configuration file for the [cluster](../configuration/cluster.md) | |
| `hub.enabled` | Enable the hub deployment. | `true` |
| `hub.replicas` | Number of replicas for the kobs Deployment. | `1` |
| `hub.podSecurityContext` | Specify security settings for the created Pods. To set the security settings for the kobs or envoy Container use the corresponding `securityContext` field. | `{}` |
| `hub.securityContext` | Specify security settings for the kobs Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `hub.resources` | Set cpu and memory requests and limits for the kobs container. | `{}` |
| `hub.nodeSelector` | Specify a map of key-value pairs, to assign the Pods to a specific set of nodes. | `{}` |
| `hub.tolerations` | Specify the tolerations for the kobs Pods. | `[]` |
| `hub.affinity` | Specify a node affinity or inter-pod affinity / anti-affinity for an advanced scheduling of the kobs Pods. | `{}` |
| `hub.topologySpreadConstraints` | Topology spread constraints rely on node labels to identify the topology domain(s) that each Node is in. | `[]` |
| `hub.volumes` | Specify additional volumes for the kobs deployment. | `[]` |
| `hub.volumeMounts` | Specify additional volumeMounts for the kobs container. | `[]` |
| `hub.env` | Set additional environment variables for the kobs container. | `[]` |
| `hub.envFrom` | Set additional environment variables for the kobs container from a Secret or ConfigMap. | `[]` |
| `hub.podAnnotations` | Specify additional annotations for the created Pods. | `{}` |
| `hub.podLabels` | Specify additional labels for the created Pods. | `{}` |
| `hub.service.type` | Set the type for the created Service: `ClusterIP`, `NodePort`, `LoadBalancer`. | `ClusterIP` |
| `hub.service.annotations` | Specify additional annotations for the created Service. | `{}` |
| `hub.service.labels` | Specify additional labels for the created Service. | `{}` |
| `hub.podDisruptionBudget` | Specifies if PodDisruptionBudget should be enabled. | `{}` |
| `hub.networkPolicy.enabled` | Enable the creation of a NetworkPolicy for kobs. | `false` |
| `hub.networkPolicy.ingressRules` | Ingress rules to allow / deny traffic from. | `[{}]` |
| `hub.networkPolicy.egressRules` | Egress rules to allow / deny traffic to. | `[{}]` |
| `hub.ingress.enabled` | Create an Ingress to expose kobs. | `false` |
| `hub.ingress.annotations` | Annotations to add to the ingress. | `{}` |
| `hub.ingress.hosts` | Hosts to use for the ingress. | `[]` |
| `hub.ingress.tls` | TLS configuration for the ingress. | `[]` |
| `hub.istio.virtualService.enabled` | Specifies whether a VirtualService should be created. | `false` |
| `hub.istio.virtualService.gateways` | A list of gateways for the VirtualService. | `[]` |
| `hub.istio.virtualService.hosts` | A list of hosts for the VirtualService. | `[]` |
| `hub.istio.virtualService.timeout` | Timeout for API requests. | `300s` |
| `hub.istio.virtualService.additionalRoutes` | A list of additional routes for the VirtualService. | `[]` |
| `hub.serviceMonitor.enabled` | Create a Service Monitor for kobs. | `false` |
| `hub.serviceMonitor.interval` | Interval at which metrics should be scraped. Fallback to the Prometheus default unless specified. | |
| `hub.serviceMonitor.scrapeTimeout` | Timeout after which the scrape is ended. Fallback to the Prometheus default unless specified. | |
| `hub.serviceMonitor.labels` | Additional labels for the the Service Monitor. | `{}` |
| `hub.serviceMonitor.honorLabels` | Chooses the metric's labels on collisions with target labels. | `false` |
| `hub.serviceMonitor.metricRelabelings` | Metric relabel config. | `[]` |
| `hub.serviceMonitor.relabelings` | Relabel config. | `[]` |
| `watcher.enabled` | Enable the watcher deployment. | `true` |
| `watcher.replicas` | Number of replicas for the kobs Deployment. | `1` |
| `watcher.podSecurityContext` | Specify security settings for the created Pods. To set the security settings for the kobs or envoy Container use the corresponding `securityContext` field. | `{}` |
| `watcher.securityContext` | Specify security settings for the kobs Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `watcher.resources` | Set cpu and memory requests and limits for the kobs container. | `{}` |
| `watcher.nodeSelector` | Specify a map of key-value pairs, to assign the Pods to a specific set of nodes. | `{}` |
| `watcher.tolerations` | Specify the tolerations for the kobs Pods. | `[]` |
| `watcher.affinity` | Specify a node affinity or inter-pod affinity / anti-affinity for an advanced scheduling of the kobs Pods. | `{}` |
| `watcher.topologySpreadConstraints` | Topology spread constraints rely on node labels to identify the topology domain(s) that each Node is in. | `[]` |
| `watcher.volumes` | Specify additional volumes for the kobs deployment. | `[]` |
| `watcher.volumeMounts` | Specify additional volumeMounts for the kobs container. | `[]` |
| `watcher.env` | Set additional environment variables for the kobs container. | `[]` |
| `watcher.envFrom` | Set additional environment variables for the kobs container from a Secret or ConfigMap. | `[]` |
| `watcher.podAnnotations` | Specify additional annotations for the created Pods. | `{}` |
| `watcher.podLabels` | Specify additional labels for the created Pods. | `{}` |
| `watcher.service.type` | Set the type for the created Service: `ClusterIP`, `NodePort`, `LoadBalancer`. | `ClusterIP` |
| `watcher.service.annotations` | Specify additional annotations for the created Service. | `{}` |
| `watcher.service.labels` | Specify additional labels for the created Service. | `{}` |
| `watcher.serviceMonitor.enabled` | Create a Service Monitor for kobs. | `false` |
| `watcher.serviceMonitor.interval` | Interval at which metrics should be scraped. Fallback to the Prometheus default unless specified. | |
| `watcher.serviceMonitor.scrapeTimeout` | Timeout after which the scrape is ended. Fallback to the Prometheus default unless specified. | |
| `watcher.serviceMonitor.labels` | Additional labels for the the Service Monitor. | `{}` |
| `watcher.serviceMonitor.honorLabels` | Chooses the metric's labels on collisions with target labels. | `false` |
| `watcher.serviceMonitor.metricRelabelings` | Metric relabel config. | `[]` |
| `watcher.serviceMonitor.relabelings` | Relabel config. | `[]` |
| `cluster.enabled` | Enable the cluster deployment. | `true` |
| `cluster.replicas` | Number of replicas for the kobs Deployment. | `1` |
| `cluster.podSecurityContext` | Specify security settings for the created Pods. To set the security settings for the kobs or envoy Container use the corresponding `securityContext` field. | `{}` |
| `cluster.securityContext` | Specify security settings for the kobs Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `cluster.resources` | Set cpu and memory requests and limits for the kobs container. | `{}` |
| `cluster.nodeSelector` | Specify a map of key-value pairs, to assign the Pods to a specific set of nodes. | `{}` |
| `cluster.tolerations` | Specify the tolerations for the kobs Pods. | `[]` |
| `cluster.affinity` | Specify a node affinity or inter-pod affinity / anti-affinity for an advanced scheduling of the kobs Pods. | `{}` |
| `cluster.topologySpreadConstraints` | Topology spread constraints rely on node labels to identify the topology domain(s) that each Node is in. | `[]` |
| `cluster.volumes` | Specify additional volumes for the kobs deployment. | `[]` |
| `cluster.volumeMounts` | Specify additional volumeMounts for the kobs container. | `[]` |
| `cluster.env` | Set additional environment variables for the kobs container. | `[]` |
| `cluster.envFrom` | Set additional environment variables for the kobs container from a Secret or ConfigMap. | `[]` |
| `cluster.podAnnotations` | Specify additional annotations for the created Pods. | `{}` |
| `cluster.podLabels` | Specify additional labels for the created Pods. | `{}` |
| `cluster.service.type` | Set the type for the created Service: `ClusterIP`, `NodePort`, `LoadBalancer`. | `ClusterIP` |
| `cluster.service.annotations` | Specify additional annotations for the created Service. | `{}` |
| `cluster.service.labels` | Specify additional labels for the created Service. | `{}` |
| `cluster.serviceAccount.enabled` | Specifies whether a service account should be created. | `true` |
| `cluster.serviceAccount.annotations` | Annotations to add to the service account. | `{}` |
| `cluster.serviceAccount.name` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template | `""` |
| `cluster.rbac.enabled` | Specifies whether a cluster role and cluster role binding should be created. | `true` |
| `cluster.rbac.name` | The name of the cluster role and cluster role binding to use. If not set and create is true, a name is generated using the fullname template. | `""` |
| `cluster.podDisruptionBudget` | Specifies if PodDisruptionBudget should be enabled. | `{}` |
| `cluster.networkPolicy.enabled` | Enable the creation of a NetworkPolicy for kobs. | `false` |
| `cluster.networkPolicy.ingressRules` | Ingress rules to allow / deny traffic from. | `[{}]` |
| `cluster.networkPolicy.egressRules` | Egress rules to allow / deny traffic to. | `[{}]` |
| `cluster.ingress.enabled` | Create an Ingress to expose kobs. | `false` |
| `cluster.ingress.annotations` | Annotations to add to the ingress. | `{}` |
| `cluster.ingress.hosts` | Hosts to use for the ingress. | `[]` |
| `cluster.ingress.tls` | TLS configuration for the ingress. | `[]` |
| `cluster.istio.virtualService.enabled` | Specifies whether a VirtualService should be created. | `false` |
| `cluster.istio.virtualService.gateways` | A list of gateways for the VirtualService. | `[]` |
| `cluster.istio.virtualService.hosts` | A list of hosts for the VirtualService. | `[]` |
| `cluster.istio.virtualService.timeout` | Timeout for API requests. | `300s` |
| `cluster.istio.virtualService.additionalRoutes` | A list of additional routes for the VirtualService. | `[]` |
| `cluster.serviceMonitor.enabled` | Create a Service Monitor for kobs. | `false` |
| `cluster.serviceMonitor.interval` | Interval at which metrics should be scraped. Fallback to the Prometheus default unless specified. | |
| `cluster.serviceMonitor.scrapeTimeout` | Timeout after which the scrape is ended. Fallback to the Prometheus default unless specified. | |
| `cluster.serviceMonitor.labels` | Additional labels for the the Service Monitor. | `{}` |
| `cluster.serviceMonitor.honorLabels` | Chooses the metric's labels on collisions with target labels. | `false` |
| `cluster.serviceMonitor.metricRelabelings` | Metric relabel config. | `[]` |
| `cluster.serviceMonitor.relabelings` | Relabel config. | `[]` |
