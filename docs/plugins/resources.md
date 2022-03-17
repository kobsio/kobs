# Resources

The resources plugin allows you to show a list of Kubernetes resources on a dashboard.

## Configuration

The following configuration can be used to forbid several resources. This means that the provided resources can not be retrieved via the kobs API.

```yaml
plugins:
  resources:
    forbidden:
      - clusters:
          - "*"
        namespaces:
          - "*"
        resources:
          - "secrets"
        verbs:
          - "*"
    webSocket:
      address: ws://localhost:15220
      allowAllOrigins: true
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| home | boolean | When this is `true` the plugin will be added to the home page. | No |
| forbidden | [[]Forbidden](#forbidden) | A list of resources, which can not be retrieved or modified via the kobs API. | No |
| webSocket.address | string | The address, which should be used for the WebSocket connection. By default this will be the current host, but it can be overwritten for development purposes. | No |
| webSocket.allowAllOrigins | boolean | When this is `true`, WebSocket connections are allowed for all origins. This should only be used for development. | No |
| ephemeralContainers | [[]EphemeralContainer](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#ephemeralcontainer-v1-core) | A list of templates for Ephemeral Containers, which can be used to [debug running pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/#ephemeral-container). | No |

### Forbidden

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| clusters | []string | A list of clusters. | Yes |
| namespaces | []string | A list of namespaces. | Yes |
| resources | []string | A list of resources. | Yes |
| verbs | []string | A list of verbs. | No |

## Options

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| clusters | []string | A list of clusters. | Yes |
| namespaces | []string | A list of namespaces. | Yes |
| resources | []string | A list of resources. | Yes |
| selector | string | An optional selector for the selection of resources. | No |
| columns | [[]Column](#column) | An optional list of columns to customize the shown fields for a resource. | No |

!!! note
    The following strings can be used in the resources list: `cronjobs`, `daemonsets`, `deployments`, `jobs`, `pods`, `replicasets`, `statefulsets`, `endpoints`, `horizontalpodautoscalers`, `ingresses`, `networkpolicies`, `services`, `configmaps`, `persistentvolumeclaims`, `persistentvolumes`, `poddisruptionbudgets`, `secrets`, `serviceaccounts`, `storageclasses`, `clusterrolebindings`, `clusterroles`, `rolebindings`, `roles`, `events`, `nodes`, `podsecuritypolicies`.

    A Custom Resource can be specified in the following form `<name>.<group>/<version>` (e.g. `vaultsecrets.ricoberger.de/v1alpha1`).

### Columns

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | A title for the column. | Yes |
| resource | string | The name of the resource for which the column should be used. | Yes |
| jsonPath | string | The [JSONPath](https://goessner.net/articles/JsonPath/) which should be used to select the value from the resource manifest file. | Yes |
| type | string | An optional type for formatting the column values. Currently only `date` is supported as special formatter. | No |

## Example

The following dashboard will display all Deployments and Pods from the `bookinfo` namespace, which are having the label `app=reviews`.

```yaml
---
apiVersion: kobs.io/v1
kind: Dashboard
spec:
  rows:
    - panels:
        - title: Resources in the bookinfo namespace
          plugin:
            name: resources
            options:
              - clusters:
                  - "{% .__cluster %}"
                namespaces:
                  - bookinfo
                resources:
                  - pods
                  - deployments
                selector: app=reviews
```

The following dashboard will display all Pods and Deployments from the `bookinfo` namespace. Besides that the dashboard also shows a list of all `VaultSecrets` in the namespace.

The example also uses the `columns` field so that for Pods it will show the image for the `reviews` container and the creation time. For the selected deployments it will show all used images. For the `VaultSecrets` it will show all status fields.

```yaml
---
apiVersion: kobs.io/v1
kind: Dashboard
spec:
  rows:
    - panels:
        - title: Resources in the bookinfo namespace
          plugin:
            name: resources
            options:
              - clusters:
                  - "{% .__cluster %}"
                namespaces:
                  - bookinfo
                resources:
                  - pods
                  - deployments
                selector: app=reviews
                columns:
                  - title: Image
                    resource: pods
                    jsonPath: "$.spec.containers[?(@.name==='bookinfo')].image"
                  - title: Creation Time
                    resource: pods
                    jsonPath: "$.metadata.creationTimestamp"
                    type: date
                  - title: Image
                    resource: deployments
                    jsonPath: "$.spec.template.spec.containers[*].image"
              - clusters:
                  - "{% .__cluster %}"
                namespaces:
                  - bookinfo
                resources:
                  - vaultsecrets.ricoberger.de/v1alpha1
                columns:
                  - title: Status
                    resource: vaultsecrets.ricoberger.de/v1alpha1
                    jsonPath: "$.status.conditions[*].status"
                  - title: Reason
                    resource: vaultsecrets.ricoberger.de/v1alpha1
                    jsonPath: "$.status.conditions[*].reason"
                  - title: Type
                    resource: vaultsecrets.ricoberger.de/v1alpha1
                    jsonPath: "$.status.conditions[*].type"
                  - title: Message
                    resource: vaultsecrets.ricoberger.de/v1alpha1
                    jsonPath: "$.status.conditions[*].message"
                  - title: Last Transition Time
                    resource: vaultsecrets.ricoberger.de/v1alpha1
                    jsonPath: "$.status.conditions[*].lastTransitionTime"
                    type: date
```
