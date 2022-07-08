# Helm

[Helm](https://helm.sh/) is the package manager for Kubernetes, and you can read detailed background information in the [CNCF Helm Project Journey report](https://www.cncf.io/cncf-helm-project-journey/).

## Install the Helm Charts

To install kobs using Helm you have to add our Helm repository:

```sh
helm repo add kobs https://helm.kobs.io
helm repo list
```

When you have added the Helm repository, you can install the kobs hub and satellite via the following commands:

```sh
helm install hub kobs/hub
helm install satellite kobs/satellite
```

## Update the Helm Charts

To update the Helm repository and to show all available versions of the Helm chart, you can run the following commands:

```sh
helm repo update
helm search repo -l kobs/
```

To update your deployed Helm chart run:

```sh
helm upgrade --install hub kobs/hub
helm upgrade --install satellite kobs/satellite
```

## Values - hub

| Value | Description | Default |
| ----- | ----------- | ------- |
| `nameOverride` | Expand the name of the chart. | `""` |
| `fullnameOverride` | Override the name of the app. | `""` |
| `replicas` | Number of replicas for the kobs Deployment. | `1` |
| `imagePullSecrets` | Specify a list of image pull secrets, to avoid the DockerHub rate limit or to pull the kobs/enovy image from a private registry. | `[]` |
| `image.repository` | The repository for the Docker image. | `kobsio/kobs` |
| `image.tag` | The tag of the Docker image which should be used. | `v0.9.1` |
| `image.pullPolicy` | The image pull policy for the Docker image. | `IfNotPresent` |
| `podSecurityContext` | Specify security settings for the created Pods. To set the security settings for the kobs or envoy Container use the corresponding `securityContext` field. | `{}` |
| `securityContext` | Specify security settings for the kobs Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `resources` | Set cpu and memory requests and limits for the kobs container. | `{}` |
| `nodeSelector` | Specify a map of key-value pairs, to assign the Pods to a specific set of nodes. | `{}` |
| `tolerations` | Specify the tolerations for the kobs Pods. | `[]` |
| `affinity` | Specify a node affinity or inter-pod affinity / anti-affinity for an advanced scheduling of the kobs Pods. | `{}` |
| `volumes` | Specify additional volumes for the kobs deployment. | `[]` |
| `volumeMounts` | Specify additional volumeMounts for the kobs container. | `[]` |
| `env` | Set additional environment variables for the kobs container. | `[]` |
| `podAnnotations` | Specify additional annotations for the created Pods. | `{}` |
| `podLabels` | Specify additional labels for the created Pods. | `{}` |
| `hub.settings.logFormat` | Set the output format of the logs. Must be `console` or `json`. | `console` |
| `hub.settings.logLevel` | Set the log level. Must be `debug`, `info`, `warn`, `error`, `fatal` or `panic`. | `info` |
| `hub.settings.traceEnabled` | Enable the trace exporter for the hub. | `false` |
| `hub.settings.traceServiceName` | The service name which should be used for the traces. | `hub` |
| `hub.settings.traceProvider` | The exporter which should be used for the traces. This could be `jaeger` or `zipkin`. | `jaeger` |
| `hub.settings.traceAddress` | The address of the Jaeger or Zipkin instance, where the traces are sent to. | `http://localhost:14268/api/traces` |
| `hub.settings.mode` | The mode which should be used to start the hub. This could be `default`, `server` or `watcher`. | `default` |
| `hub.settings.store.driver` | The driver which should be used for the store. | `bolt` |
| `hub.settings.store.uri` | The uri to connect to the store. | `/tmp/kobs.db` |
| `hub.settings.watcher.interval` | The interval which should be used to sync the resources with the satellites. | `300s` |
| `hub.settings.watcher.worker` | The number of worker, which should be used to sync the resources. | `10` |
| `hub.settings.auth.enabled` | Enable the authentication and authorization middleware. | `false` |
| `hub.settings.auth.headerTeams` | The header, which contains the team ids. | `X-Auth-Request-Email` |
| `hub.settings.auth.headerUser` | The header, which contains the user id. | `X-Auth-Request-Groups` |
| `hub.settings.auth.logoutRedirect` | The url where kobs redirects a user after he logout. | `/oauth2/sign_out` |
| `hub.settings.auth.sessiontInterval` | The interval for how long a session is valid. | `48h0m0s` |
| `hub.config` | Content of the `config.yaml` file, which is loaded during the start of kobs and contains the configuration. | |
| `istio.virtualService.enabled` | Specifies whether a VirtualService should be created. | `false` |
| `istio.virtualService.gateways` | A list of gateways for the VirtualService. | `[]` |
| `istio.virtualService.hosts` | A list of hosts for the VirtualService. | `[]` |
| `istio.virtualService.timeout` | Timeout for API requests. | `300s` |
| `istio.virtualService.additionalRoutes` | A list of additional routes for the VirtualService. | `[]` |
| `service.type` | Set the type for the created Service: `ClusterIP`, `NodePort`, `LoadBalancer`. | `ClusterIP` |
| `service.annotations` | Specify additional annotations for the created Service. | `{}` |
| `service.labels` | Specify additional labels for the created Service. | `{}` |
| `networkPolicy.enabled` | Enable the creation of a NetworkPolicy for kobs. | `false` |
| `networkPolicy.ingressRules` | Ingress rules to allow / deny traffic from. | `[{}]` |
| `networkPolicy.egressRules` | Egress rules to allow / deny traffic to. | `[{}]` |
| `ingress.enabled` | Create an Ingress to expose kobs. | `false` |
| `ingress.annotations` | Annotations to add to the ingress. | `{}` |
| `ingress.hosts` | Hosts to use for the ingress. | `[]` |
| `ingress.tls` | TLS configuration for the ingress. | `[]` |
| `serviceMonitor.enabled` | Create a Service Monitor for kobs. | `false` |
| `serviceMonitor.interval` | Interval at which metrics should be scraped. Fallback to the Prometheus default unless specified. | |
| `serviceMonitor.scrapeTimeout` | Timeout after which the scrape is ended. Fallback to the Prometheus default unless specified. | |
| `serviceMonitor.labels` | Additional labels for the the Service Monitor. | `{}` |
| `serviceMonitor.honorLabels` | Chooses the metric's labels on collisions with target labels. | `false` |
| `serviceMonitor.metricRelabelings` | Metric relabel config. | `[]` |
| `serviceMonitor.relabelings` | Relabel config. | `[]` |

## Values - satellite

| Value | Description | Default |
| ----- | ----------- | ------- |
| `nameOverride` | Expand the name of the chart. | `""` |
| `fullnameOverride` | Override the name of the app. | `""` |
| `replicas` | Number of replicas for the kobs Deployment. | `1` |
| `imagePullSecrets` | Specify a list of image pull secrets, to avoid the DockerHub rate limit or to pull the kobs/enovy image from a private registry. | `[]` |
| `image.repository` | The repository for the Docker image. | `kobsio/kobs` |
| `image.tag` | The tag of the Docker image which should be used. | `v0.9.1` |
| `image.pullPolicy` | The image pull policy for the Docker image. | `IfNotPresent` |
| `podSecurityContext` | Specify security settings for the created Pods. To set the security settings for the kobs or envoy Container use the corresponding `securityContext` field. | `{}` |
| `securityContext` | Specify security settings for the kobs Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `resources` | Set cpu and memory requests and limits for the kobs container. | `{}` |
| `nodeSelector` | Specify a map of key-value pairs, to assign the Pods to a specific set of nodes. | `{}` |
| `tolerations` | Specify the tolerations for the kobs Pods. | `[]` |
| `affinity` | Specify a node affinity or inter-pod affinity / anti-affinity for an advanced scheduling of the kobs Pods. | `{}` |
| `volumes` | Specify additional volumes for the kobs deployment. | `[]` |
| `volumeMounts` | Specify additional volumeMounts for the kobs container. | `[]` |
| `env` | Set additional environment variables for the kobs container. | `[]` |
| `podAnnotations` | Specify additional annotations for the created Pods. | `{}` |
| `podLabels` | Specify additional labels for the created Pods. | `{}` |
| `satellite.settings.logFormat` | Set the output format of the logs. Must be `console` or `json`. | `console` |
| `satellite.settings.logLevel` | Set the log level. Must be `debug`, `info`, `warn`, `error`, `fatal` or `panic`. | `info` |
| `satellite.settings.traceEnabled` | Enable the trace exporter for the satellite. | `false` |
| `satellite.settings.traceServiceName` | The service name which should be used for the traces. | `satellite` |
| `satellite.settings.traceProvider` | The exporter which should be used for the traces. This could be `jaeger` or `zipkin`. | `jaeger` |
| `satellite.settings.traceAddress` | The address of the Jaeger or Zipkin instance, where the traces are sent to. | `http://localhost:14268/api/traces` |
| `satellite.config` | Content of the `config.yaml` file, which is loaded during the start of kobs and contains the configuration. | |
| `istio.virtualService.enabled` | Specifies whether a VirtualService should be created. | `false` |
| `istio.virtualService.gateways` | A list of gateways for the VirtualService. | `[]` |
| `istio.virtualService.hosts` | A list of hosts for the VirtualService. | `[]` |
| `istio.virtualService.timeout` | Timeout for API requests. | `300s` |
| `istio.virtualService.additionalRoutes` | A list of additional routes for the VirtualService. | `[]` |
| `service.type` | Set the type for the created Service: `ClusterIP`, `NodePort`, `LoadBalancer`. | `ClusterIP` |
| `service.annotations` | Specify additional annotations for the created Service. | `{}` |
| `service.labels` | Specify additional labels for the created Service. | `{}` |
| `serviceAccount.enabled` | Specifies whether a service account should be created. | `true` |
| `serviceAccount.annotations` | Annotations to add to the service account. | `{}` |
| `serviceAccount.name` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template | `""` |
| `rbac.enabled` | Specifies whether a cluster role and cluster role binding should be created. | `true` |
| `rbac.name` | The name of the cluster role and cluster role binding to use. If not set and create is true, a name is generated using the fullname template. | `""` |
| `networkPolicy.enabled` | Enable the creation of a NetworkPolicy for kobs. | `false` |
| `networkPolicy.ingressRules` | Ingress rules to allow / deny traffic from. | `[{}]` |
| `networkPolicy.egressRules` | Egress rules to allow / deny traffic to. | `[{}]` |
| `ingress.enabled` | Create an Ingress to expose kobs. | `false` |
| `ingress.annotations` | Annotations to add to the ingress. | `{}` |
| `ingress.hosts` | Hosts to use for the ingress. | `[]` |
| `ingress.tls` | TLS configuration for the ingress. | `[]` |
| `serviceMonitor.enabled` | Create a Service Monitor for kobs. | `false` |
| `serviceMonitor.interval` | Interval at which metrics should be scraped. Fallback to the Prometheus default unless specified. | |
| `serviceMonitor.scrapeTimeout` | Timeout after which the scrape is ended. Fallback to the Prometheus default unless specified. | |
| `serviceMonitor.labels` | Additional labels for the the Service Monitor. | `{}` |
| `serviceMonitor.honorLabels` | Chooses the metric's labels on collisions with target labels. | `false` |
| `serviceMonitor.metricRelabelings` | Metric relabel config. | `[]` |
| `serviceMonitor.relabelings` | Relabel config. | `[]` |
