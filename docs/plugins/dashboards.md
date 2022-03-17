# Dashboards

The dashboards plugin allows you to show a list of dashboards.

## Configuration

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| home | boolean | When this is `true` the plugin will be added to the home page. | No |

## Options

The options for the dashboards plugin is a list of objects with the following properties:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| cluster | string | Cluster of the dashboard | Yes |
| namespace | string | Namespace of the dashboard. | Yes |
| name | string | Name of the dashboard. | Yes |
| title | string | Title for the dashboard | Yes |
| description | string | The description can be used to explain the content of the dashboard. | No |
| placeholders | map<string, string> | A map of placeholders, whith the name as key and the value for the placeholder as value. More information for placeholders can be found in the documentation for [Dashboards](../resources/dashboards.md). | No |

## Example

```yaml
---
apiVersion: kobs.io/v1
kind: Dashboard
spec:
  rows:
    - panels:
        - title: Dashboards
          plugin:
            name: dashboards
            options:
              - cluster: "{% .__cluster %}"
                namespace: "{% .__namespace %}"
                name: resources
                namespace: kobs
                title: Resources in the bookinfo namespace
                placeholders:
                  namespace: bookinfo
              - cluster: "{% .__cluster %}"
                namespace: "{% .__namespace %}"
                name: resource-usage
                namespace: kobs
                title: Resource Usage
                placeholders:
                  namespace: bookinfo
                  pod: ".*"
```
