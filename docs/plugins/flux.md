# Flux

The Flux plugin can be used to retrieve, display and reconcile [Flux](https://fluxcd.io) resources.

![Flux](assets/flux.png)

## Options

The following options can be used for a panel with the Flux plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The Flux resource which should be displayed. This must be `gitrepositories.source.toolkit.fluxcd.io/v1beta1`, `helmrepositories.source.toolkit.fluxcd.io/v1beta1`, `buckets.source.toolkit.fluxcd.io/v1beta1`, `kustomizations.kustomize.toolkit.fluxcd.io/v1beta1` or `helmreleases.helm.toolkit.fluxcd.io/v2beta1`. | Yes |
| cluster | string | The cluster for which the resources should be displayed. If this is empty the cluster from the Application or Team, where the dashboard is used will be used. | No |
| namespace | string | The namespace for which the resources should be displayed. If this is empty the resources will from all namespaces will be displayed. | No |
| selector | string | An optional selector for the selection of Flux resources. | No |

For example the following dashboard shows all Kustomizations, Helm Releases, Git Repositories and Helm Repositories:

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  rows:
    - size: -1
      panels:
        - title: Kustomizations
          plugin:
            name: flux
            options:
              type: kustomizations.kustomize.toolkit.fluxcd.io/v1beta1
    - size: -1
      panels:
        - title: Helm Releases
          plugin:
            name: flux
            options:
              type: helmreleases.helm.toolkit.fluxcd.io/v2beta1
    - size: -1
      panels:
        - title: Git Repositories
          plugin:
            name: flux
            options:
              type: gitrepositories.source.toolkit.fluxcd.io/v1beta1
    - size: -1
      panels:
        - title: Helm Repositories
          plugin:
            name: flux
            options:
              type: helmrepositories.source.toolkit.fluxcd.io/v1beta1
```
