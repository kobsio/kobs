# Users

Users are defined via the [User Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_users.yaml). Users can be used to define the permissions for authenticated users and to customize the profile page.

![Profile](assets/users.png)

## Specification

In the following you can found the specification for the User CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| email | string | The email address of the authenticated user. This is used to connect the authenticated user with this CR. | Yes |
| permissions | [Permissions](#permissions) | Permissions for the user when the authentication / authorization middleware is enabled. | No |
| dashboards | [[]Dashboard](./applications.md#dashboard) | A list of dashboards which will be shown on the users profile page. | No |
| notifications | [Notifications](#notifications) | Overwrite the global notification settings for this user. | No |

### Permissions

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| applications | [[]Application](#application) | Define a list of application permissions, to specify which applications can be accessed by a user | Yes |
| teams | []string | Define a list of teams (must match the corresponding `group` field of a team) which can be viewed by a user. The specifal character `*` can be used to allow a user to view all teams | Yes |
| plugins | [[]Plugin](#plugin) | A list of plugins, which can be accessed by a user. | Yes |
| resources | [[]Resources](#resources) | A list of resources, which can be accessed by the user. | Yes |

#### Application

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type which should be used for the application permissions. This must be `all` to allow access to all applications, `own` to only allow access to applications owned by a team where the user is part of or `custom` to set the permissions based on satellites, clusters and namespaces. | Yes |
| satellites | []string | A list of satellites from which applications can be accessed by the user, when the permission type is `custom`. The special character `*` can be used to include all satellites. | No |
| clusters | []string | A list of clusters from which applications can be accessed by the user, when the permission type is `custom`. The special character `*` can be used to include all clusters. | No |
| namespaces | []string | A list of namespaces from which applications can be accessed by the user, when the permission type is `custom`. The special character `*` can be used to include all namespaces. | No |

#### Plugin

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| nsatellite | string | The satellite of the plugin instance, where it is configured. The special character `*` can be used to include all satellites. | Yes |
| name | string | The name of the plugin instance as it is defined in the configuration. The special character `*` can be used to include all names. | Yes |
| type | string | The type of the plugin instance as it is defined in the configuration. The special character `*` can be used to include all types. | Yes |
| permissions | any | The permissions, which should be grant to a user. The format of this property is different for each plugin. You can find an example for each plugin on the corresponding plugin page in the documentation. | No |

#### Resources

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| satellites | []string | A list of satellites to allow access to. The special list entry `*` allows access to all satellites. | Yes |
| clusters | []string | A list of clusters to allow access to. The special list entry `*` allows access to all clusters. | Yes |
| namespaces | []string | A list of namespaces to allow access to. The special list entry `*` allows access to all namespaces. | Yes |
| resources | []string | A list of resources to allow access to. The special list entry `*` allows access to all resources. | Yes |
| verbs | []string | A list of verbs to allow access to. The following verbs are possible: `get`, `patch`, `post`, `delete` and `*`. The special list entry `*` allows access for all verbs. | Yes |

!!! note
    The following strings can be used in the resources list: `cronjobs`, `daemonsets`, `deployments`, `jobs`, `pods`, `replicasets`, `statefulsets`, `endpoints`, `horizontalpodautoscalers`, `ingresses`, `networkpolicies`, `services`, `configmaps`, `persistentvolumeclaims`, `persistentvolumes`, `poddisruptionbudgets`, `secrets`, `serviceaccounts`, `storageclasses`, `clusterrolebindings`, `clusterroles`, `rolebindings`, `roles`, `events`, `nodes`, `podsecuritypolicies`.

    The special terms `pods/log` and `pods/exec` can be used to allow users to get the logs or a terminal for a Pod. To download / upload a file from / to a Pod a user also needs the `pods/exec` resource. The `pods/log` and `pods/exec` permission can only be set together with the `*` value for the `verbs` parameter.

    A Custom Resource can be specified in the following form `<name>.<group>/<version>` (e.g. `vaultsecrets.ricoberger.de/v1alpha1`).

### Notifications

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| groups | [[]Group](#groups) | A list of notification groups, which should be used for this user. | No |

#### Groups

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | The title for the notification group. | Yes |
| plugin | [Plugin](../plugins/index.md#specification) | The plugin configuration for the notification group. | Yes |

## Example

In the CR defines that the user with the email `rico@kobs.io` can view all applications and teams. He can also view the Helm charts in the `bookinfo` and `kobs` namespace and can use the Opsgenie plugin. Besides that he can also list, edit and delete all resources in the `bookinfo` and `kobs` namespace.

```yaml
---
apiVersion: kobs.io/v1
kind: User
metadata:
  name: ricoberger
  namespace: kobs
spec:
  email: rico@kobs.io
  permissions:
    applications:
      - type: all
    teams:
      - "*"
    plugins:
      - satellite: "*"
        name: helm
        type: helm
        permissions:
          - clusters:
              - "*"
            namespaces:
              - "bookinfo"
              - "kobs"
            names:
              - "*"
      - satellite: "*"
        name: opsgenie
        type: opsgenie
        permissions:
          - acknowledgeAlert
          - snoozeAlert
          - closeAlert
    resources:
      - satellites:
          - "*"
        clusters:
          - "*"
        namespaces:
          - "bookinfo"
          - "kobs"
        resources:
          - "*"
        verbs:
          - "*"
```
