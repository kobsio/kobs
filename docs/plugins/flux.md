# Flux

The Flux plugin can be used to retrieve, display and reconcile [Flux](https://fluxcd.io) resources.

![Flux](assets/flux.png)

## Configuration

To use the Flux plugin the following configuration is needed in the satellites configuration file:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Flux plugin instance. | Yes |
| type | `flux` | The type for the Flux plugin. | Yes |

```yaml
plugins:
  - name: flux
    type: flux
```

## Insight Options

!!! note
    The Flux plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Flux plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Flux plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The Flux resource which should be displayed. This must be `gitrepositories`, `helmrepositories`, `buckets`, `kustomizations` or `helmreleases`. | Yes |
| cluster | string | The cluster for which the resources should be displayed. | Yes |
| namespace | string | The namespace for which the resources should be displayed. | Yes |
| selector | string | An optional selector for the selection of Flux resources. | No |
| name | string | The name of the Flux resource. This field can be used to show a single resource instead of a list of resources. | No |

## Usage

For example the following dashboard shows all Kustomizations, Helm Releases, Git Repositories and Helm Repositories from the cluster and namespace, where the application is used:

```yaml
---
apiVersion: kobs.io/v1
kind: Application
spec:
  dashboards:
    inline:
      rows:
        - size: -1
          panels:
            - title: Kustomizations
              plugin:
                name: flux
                type: flux
                options:
                  type: kustomizations
                  cluster: "{% $.cluster %}"
                  namespace: "{% $.namespace %}"
        - size: -1
          panels:
            - title: Helm Releases
              plugin:
                name: flux
                type: flux
                options:
                  type: helmreleases.helm.toolkit.fluxcd.io/v2beta1
                  cluster: "{% $.cluster %}"
                  namespace: "{% $.namespace %}"
        - size: -1
          panels:
            - title: Git Repositories
              plugin:
                name: flux
                type: flux
                options:
                  type: gitrepositories
                  cluster: "{% $.cluster %}"
                  namespace: "{% $.namespace %}"
        - size: -1
          panels:
            - title: Helm Repositories
              plugin:
                name: flux
                type: flux
                options:
                  type: helmrepositories
                  cluster: "{% $.cluster %}"
                  namespace: "{% $.namespace %}"
```
