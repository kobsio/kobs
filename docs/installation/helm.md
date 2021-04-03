# Helm

[Helm](https://helm.sh/) is the package manager for Kubernetes, and you can read detailed background information in the [CNCF Helm Project Journey report](https://www.cncf.io/cncf-helm-project-journey/).

## Install the Helm Chart

To install kobs using Helm you have to add our Helm repository:

```sh
helm repo add kobs https://helm.kobs.io
helm repo list
```

When you have added the Helm repository, you can install kobs:

```sh
helm install kobs kobs/kobs
```

When the installation was successful you shoud see a message like the following:

```txt
NAME: kobs
LAST DEPLOYED: Fri Apr  2 21:48:11 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=kobs,app.kubernetes.io/instance=kobs" -o jsonpath="{.items[0].metadata.name}")
  echo "Visit http://127.0.0.1:15222 to use your application"
  kubectl --namespace default port-forward $POD_NAME 15222
```

## Update the Helm Chart

To update the Helm repository and to show all available versions of the Helm chart, you can run the following commands:

```sh
helm repo update
helm search repo -l kobs/
```

To update your deployed Helm chart run:

```sh
helm upgrade kobs kobs/kobs
```

## Values

| Value | Description | Default |
| ----- | ----------- | ------- |
| `nameOverride` | Expand the name of the chart. | `""` |
| `fullnameOverride` | Override the name of the app. | `""` |
| `replicas` | Number of replicas for the kobs Deployment. | `1` |
| `imagePullSecrets` | Specify a list of image pull secrets, to avoid the DockerHub rate limit or to pull the kobs/enovy image from a private registry. | `[]` |
| `podSecurityContext` | Specify security settings for the created Pods. To set the security settings for the kobs or envoy Container use the corresponding `securityContext` field. | `{}` |
| `nodeSelector` | Specify a map of key-value pairs, to assign the Pods to a specific set of nodes. | `{}` |
| `tolerations` | Specify the tolerations for the kobs Pods. | `[]` |
| `affinity` | Specify a node affinity or inter-pod affinity / anti-affinity for an advanced scheduling of the kobs Pods. | `{}` |
| `kobs.image.repository` | The repository for the Docker image. | `kobsio/kobs` |
| `kobs.image.tag` | The tag of the Docker image which should be used. | `main` |
| `kobs.image.pullPolicy` | The image pull policy for the Docker image. | `IfNotPresent` |
| `kobs.securityContext` | Specify security settings for the kobs Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `kobs.resources` | Set cpu and memory requests and limits for the kobs container. | `{}` |
| `kobs.env` | Set additional environment variables for the kobs container. | `[]` |
| `kobs.settings.logLevel` | Set the log level. Must be `trace`, `debug`, `info`, `warn`, `error`, `fatal` or `panic`. | `info` |
| `kobs.settings.logFormat` | Set the output format of the logs. Must be `plain` or `json`. | `plain` |
| `kobs.config` | Content of the `config.yaml` file, which is loaded during the start of kobs and contains the configuration. | |
| `envoy.enabled` | Enable the Envoy sidecar. | `true` |
| `envoy.image.repository` | The repository for the Docker image. | `envoyproxy/envoy` |
| `envoy.image.tag` | The tag of the Docker image which should be used. | `v1.17.0` |
| `envoy.image.pullPolicy` | The image pull policy for the Docker image. | `IfNotPresent` |
| `envoy.securityContext` | Specify security settings for the envoy Container. They override settings made at the Pod level via the `podSecurityContext` when there is overlap. | `{}` |
| `envoy.resources` | Set cpu and memory requests and limits for the envoy container. | `{}` |
| `serviceAccount.create` | Specifies whether a service account should be created. | `true` |
| `serviceAccount.annotations` | Annotations to add to the service account. | `{}` |
| `serviceAccount.name` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template | `""` |
| `rbac.create` | Specifies whether a cluster role and cluster role binding should be created. | `true` |
| `rbac.name` | The name of the cluster role and cluster role binding to use. If not set and create is true, a name is generated using the fullname template. | `""` |
| `crd.create` | Specifies whether the custom resource definitions for kobs should be created. | `true` |
| `service.type` | Set the type for the created service: `ClusterIP`, `NodePort`, `LoadBalancer`. | `ClusterIP` |
| `ingress.enabled` | Create an Ingress to expose kobs. | `false` |
| `ingress.annotations` | Annotations to add to the ingress. | `{}` |
| `ingress.hosts` | Hosts to use for the ingress. | `[]` |
| `ingress.tls` | TLS configuration for the ingress. | `[]` |
