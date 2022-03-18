# Backstage

The Backstage plugin provide API endpoints which can be used with corresponding kobs plugin in Backstage.

To use this plugin the `application` and `prometheus` plugin is required.

!!! info

    The kobs plugin for Backstage is not yet open sourced.

## Configuration

```yaml
plugins:
  backstage:
    apiToken: <secure-api-token>
    prometheusName: prometheus
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| apiToken | string | Authentication token | Yes |
| prometheusName | string | Name of the Prometheus instance as it is shown in the UI. | Yes |

## Endpoints

### `/api/plugins/backstage/application`

Returns a kobs [application](../resources/applications.md).

### `/api/plugins/backstage/metrics`

Expose the prometheus metrics endpoint.
