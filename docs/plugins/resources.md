# Resources

The resources plugin allows you to show a list of Kubernetes resources on a dashboard.

## Configuration

The following configuration can be used to  forbid several resources. This means that the provided resources can not be retrieved via the kobs API.

```yaml
plugins:
  resources:
    forbidden:
      - secrets
    webSocket:
      address: ws://localhost:15220
      allowAllOrigins: true
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| forbidden | []string | A list of resources, which can not be retrieved via the kobs API. | No |
| webSocket.address | string | The address, which should be used for the WebSocket connection. By default this will be the current host, but it can be overwritten for development purposes. | No |
| webSocket.allowAllOrigins | boolean | When this is `true`, WebSocket connections are allowed for all origins. This should only be used for development. | No |
| ephemeralContainers | [[]EphemeralContainer](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#ephemeralcontainer-v1-core) | A list of templates for Ephemeral Containers, which can be used to [debug running pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/#ephemeral-container). | No |

## Options

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| clusters | []string | A list of clusters. If this value isn't provided, it will be the cluster from the team or application where the dashboard is used. | No |
| namespaces | []string | A list of namespaces. If this value isn't provided, it will be the namespace from the team or application where the dashboard is used. | No |
| resources | []string | A list of resources. | Yes |
| selector | string | An optional selector for the selection of resources | No |

!!! note
    The following strings can be used as kinds: *cronjobs*, *daemonsets*, *deployments*, *jobs*, *pods*, *replicasets*, *statefulsets*, *endpoints*, *horizontalpodautoscalers*, *ingresses*, *networkpolicies*, *services*, *configmaps*, *persistentvolumeclaims*, *persistentvolumes*, *poddisruptionbudgets*, *secrets*, *serviceaccounts*, *storageclasses*, *clusterrolebindings*, *clusterroles*, *rolebindings*, *roles*, *events*, *nodes*, *podsecuritypolicies*.

    A Custom Resource can be specified in the following form `<name>.<group>/<version>` (e.g. `vaultsecrets.ricoberger.de/v1alpha1`).

## Example

The following dashboard will display all Deployments and Pods from the `bookinfo` namespace, which are having the label `app=reviews`.

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  rows:
    - panels:
        - title: Resources in the bookinfo namespace
          plugin:
            name: resources
            options:
              - namespaces:
                  - bookinfo
                resources:
                  - pods
                  - deployments
                selector: app=reviews
```
