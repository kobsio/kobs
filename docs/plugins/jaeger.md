# Jaeger

The Jaeger plugin can be used to retrieve traces from a configured Jaeger instance. You can specify the service, operation and tags for which you want to retrieve traces. You can also view the details of a trace and compare it with another trace.

![Traces Overview](assets/jaeger-traces-overview.png)

![Traces Preview](assets/jaeger-traces-preview.png)

![Traces Details](assets/jaeger-traces-details.png)

![Traces Compare](assets/jaeger-traces-compare.png)

![Service Performance Monitoring](assets/jaeger-spm.png)

## Configuration

The Jaeger plugin can be used within the `hub` or `cluster`. To use the Jaeger plugin the following configuration is needed:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Jaeger plugin instance. | Yes |
| type | `jaeger` | The type for the Jaeger plugin. | Yes |
| options.address | string | Address of the Jaeger instance. | Yes |
| options.username | string | Username to access a Jaeger instance via basic authentication. | No |
| options.password | string | Password to access a Jaeger instance via basic authentication. | No |
| options.token | string | Token to access a Jaeger instance via token based authentication. | No |
| frontendOptions.address | string | The address of the Jaeger instance, which can be accessed by the user. | No |

```yaml
plugins:
  - name: jaeger
    type: jaeger
    options:
      address:
      username:
      password:
      token:
    frontendOptions:
      address:
```

## Insight Options

!!! note
    The Jaeger plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Jaeger plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Jaeger plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| showChart | boolean | If this is `true` the chart with the traces will be shown. | No |
| queries | [[]Query](#query) | A list of Jaeger queries, which can be selected by the user. | No |
| metrics | [Metrics](#metrics) | The configuration to show the metrics for the Service Performance Monitoring. | No |

### Query

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | A name for the Jaeger query, which is displayed in the select box. | Yes |
| limit | string | The maximum number of traces which should be shown. The default value is `20`. | No |
| maxDuration | string | The maximum duration for the retrieved traces (e.g. `1s`). | No |
| minDuration | string | The minimum duration for the retrieved traces (e.g. `100ms`). | No |
| service | string | The service to retrieve traces for. | Yes |
| operation | string | An optional operation to retrieve traces for. | No |
| tags | string | Tags, which the traces must be contain. | No |

### Metrics

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The metrics type which should be displayed. Must be one of the following: `servicelatency`, `serviceerrors`, `servicecalls` or `operations`. | Yes |
| service | string | The service for which the selected metrics should be displayed. | Yes |
| spanKinds | string | A list of span kinds for which the selected metrics should be displayed. By default it includes all span kinds: `unspecified`, `internal`, `server`, `client`, `producer` and `consumer`. | No |

## Usage

```yaml
---
apiVersion: kobs.io/v1
kind: Application
metadata:
  name: default
  namespace: default
spec:
  description: The default application is an application to test all available kobs plugins.
  dashboards:
    - title: Helm
      inline:
        rows:
          - panels:
              - title: Latency (ms)
                plugin:
                  name: jaeger
                  type: jaeger
                  options:
                    metrics:
                      type: servicelatency
                      service: hub
                h: 6
                w: 4
                x: 0
                'y': 0
              - title: Errors (%)
                plugin:
                  name: jaeger
                  type: jaeger
                  options:
                    metrics:
                      type: serviceerrors
                      service: hub
                h: 6
                w: 4
                x: 4
                'y': 0
              - title: Request Rate (req/s)
                plugin:
                  name: jaeger
                  type: jaeger
                  options:
                    metrics:
                      type: servicecalls
                      service: hub
                h: 6
                w: 4
                x: 8
                'y': 0
          - autoHeight: true
            panels:
              - title: Traces
                plugin:
                  name: jaeger
                  type: jaeger
                  options:
                    showChart: true
                    queries:
                      - name: All Traces
                        service: hub
                      - name: Error Traces
                        service: hub
                        tags: error=true
                h: 6
                w: 12
                x: 0
                'y': 0
```

![Example 1](assets/jaeger-example-1.png)
