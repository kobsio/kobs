# Helm

The Helm plugin can be used to manage Helm releases within kobs.

![Dashboard](assets/helm-dashboard.png)

![Details](assets/helm-details.png)

## Configuration

The configuration for the Helm plugin can be used to set the driver for Helm.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| driver | string | Set the Helm driver. | No |

## Options

The following options can be used for a panel with the Helm plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The panel type. This could be `releases` or `releasehistory`. | Yes |
| clusters | []string | A list of cluster for which the Helm releases should be shown. If this is empty the cluster from the team / application is used. | No |
| namespaces |[]string | A list of namespaces for which the Helm releases should be shown. If this is empty the namespace from the team / application is used. | No |
| name | string | The name of the Helm release for whih the history should be shown, when the type is `releasehistory`. | No |

## Example

The following dashboards shows all Helm releases from the `kobs` and `monitoring` namespace and the history of the `kobs` and `prometheus-operator` releases.

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  rows:
    - panels:
        - title: Helm Releases
          plugin:
            name: helm
            options:
              type: releases
              namespaces:
                - kobs
                - cert-manager
                - monitoring
    - size: 3
      panels:
        - title: History of kobs
          colSpan: 4
          plugin:
            name: helm
            options:
              type: releasehistory
              namespaces:
                - kobs
              name: kobs
        - title: History of cert-manager
          colSpan: 4
          plugin:
            name: helm
            options:
              type: releasehistory
              namespaces:
                - cert-manager
              name: cert-manager
        - title: History of prometheus-operator
          colSpan: 4
          plugin:
            name: helm
            options:
              type: releasehistory
              namespaces:
                - monitoring
              name: prometheus-operator
```
