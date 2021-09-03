# Jaeger

The Jaeger plugin can be used to retrieve traces from a configured Jaeger instance. You can specify the service, operation and tags for which you want to retrieve traces. You can also view the details of a trace and compare it with another trace.

![Traces](assets/jaeger-traces.png)

![Trace](assets/jaeger-trace.png)

![Compare Traces](assets/jaeger-compare-traces.png)

## Options

The following options can be used for a panel with the Jaeger plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| showChart | boolean | If this is `true` the chart with the traces will be shown. | No |
| queries | [[]Query](#query) | A list of Jaeger queries, which can be selected by the user. | Yes |

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

For example the following dashboard shows all requests and all slow requests from Jaeger for the specified service (e.g. `reviews.bookinfo`).

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  placeholders:
    - name: service
      description: The service name
  rows:
    - size: -1
      panels:
        - title: Traces
          colSpan: 12
          plugin:
            name: jaeger
            options:
              showChart: true
              queries:
                - name: "{{ .service }} requests"
                  service: "{{ .service }}"
                - name: "{{ .service }} slow requests"
                  service: "{{ .service }}"
                  minDuration: 1000ms
```
