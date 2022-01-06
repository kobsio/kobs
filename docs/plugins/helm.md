# Helm

The Helm plugin can be used to manage Helm releases within kobs.

![Dashboard](assets/helm-dashboard.png)

![Details](assets/helm-details.png)

## Options

The following options can be used for a panel with the Helm plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The panel type. This could be `releases` or `releasehistory`. | Yes |
| clusters | []string | A list of cluster for which the Helm releases should be shown. | Yes |
| namespaces |[]string | A list of namespaces for which the Helm releases should be shown. | Yes |
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
              clusters:
                - "{% .__cluster %}"
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
              clusters:
                - "{% .__cluster %}"
              namespaces:
                - kobs
              name: kobs
        - title: History of cert-manager
          colSpan: 4
          plugin:
            name: helm
            options:
              type: releasehistory
              clusters:
                - "{% .__cluster %}"
              namespaces:
                - cert-manager
              name: cert-manager
        - title: History of prometheus-operator
          colSpan: 4
          plugin:
            name: helm
            options:
              type: releasehistory
              clusters:
                - "{% .__cluster %}"
              namespaces:
                - monitoring
              name: prometheus-operator
```
