# SonarQube

The SonarQube plugin can be used to view all projects with the measures from a SonarQube instance or [SonarCloud](https://sonarcloud.io).

## Configuration

To use the SonarQube plugin the following configuration is needed in the satellites configuration file:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the SonarQube plugin instance. | Yes |
| type | `sonarqube` | The type for the SonarQube plugin. | Yes |
| options.address | string | Address of the SonarQube instance. | Yes |
| options.username | string | Username to access a SonarQube instance via basic authentication. | No |
| options.password | string | Password to access a SonarQube instance via basic authentication. | No |
| options.organization | string | The name of the organization for which the projects should be shown. | No |
| options.metricKeys | []string | An optional list of metric keys which should be displayed for all projects. If this value is not provided the following list will be used: `alert_status`, `bugs`, `reliability_rating`, `vulnerabilities`, `security_rating`, `security_hotspots_reviewed`, `security_review_rating`, `code_smells`, `sqale_rating`, `coverage`, `duplicated_lines_density`. | No |
| frontendOptions.address | string | The address of the SonarQube instance, which can be accessed by the user. | No |

```yaml
plugins:
  - name: sonarqube
    type: sonarqube
    options:
      address:
      username:
      password:
      organization:
      metricKeys:
    frontendOptions:
      address:
```

## Insight Options

!!! note
    The SonarQube plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The SonarQube plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the SonarQube plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| project | string | The key of the SonarQube project. | Yes |
| metricKeys | []string | An optional list of metric keys, which should be displayed for the project. If this value is not provided the globally configured default value will be used. A list of all available metrics can be retrieved from the `/api/metrics/search` API endpoint of a SonarQube instance. | No |

## Notification Options

!!! note
    The SonarQube plugin can not be used to get a list of notifications.

## Usage

```yaml
---
apiVersion: kobs.io/v1
kind: Application
metadata:
  name: example-application
  namespace: kobs
spec:
  dashboards:
    - title: SonarQube
      inline:
        rows:
          - size: -1
            panels:
              - title: details
                plugin:
                  name: sonarqube
                  type: sonarqube
                  options:
                    project: details
          - size: -1
            panels:
              - title: reviews
                colSpan: 6
                plugin:
                  name: sonarqube
                  type: sonarqube
                  options:
                    project: reviews
              - title: ratings
                colSpan: 6
                plugin:
                  name: sonarqube
                  type: sonarqube
                  options:
                    project: ratings
```

![SonarQube](assets/sonarqube.png)
