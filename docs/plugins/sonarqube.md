# SonarQube

The SonarQube plugin can be used to view all projects with the measures from a SonarQube instance.

![SonarQube](assets/sonarqube.png)

## Options

The following options can be used for a panel with the SonarQube plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| project | string | The key of the SonarQube project. | Yes |
| metricKeys | []string | An optional list of metric keys, which should be displayed for the project. If this value is not provided the globally configured default value will be used. A list of all available metrics can be retrieved from the `/api/metrics/search` API endpoint of a SonarQube instance. | No |

## Example

The following dashboard shows a single panel with the measures for the SonarQube project with the key `details`.

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
metadata:
  name: sonarqube
  namespace: kobs
spec:
  title: SonarQube
  rows:
    - size: 3
      panels:
        - title: Details
          plugin:
            name: sonarqube
            options:
              project: details
```
