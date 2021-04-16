# Opsgenie

The Opsgenie plugin can be used to retrieve alerts from Opsgenie. You can specify a query, which is then used to retrieve all matching alerts.

## Specification

The following specification can be used, within an application.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| queries | [[]Query](#query) | A list of queries, to retrieve alerts for. | Yes |

### Query

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | A name for the query. | Yes |
| query | string | The Opsgenie query. | Yes |

For example the following query specification will display all logs `open` alerts for the `bookinfo` namespace.

```yaml
spec:
  plugins:
    - name: Opsgenie
      opsgenie:
        queries:
          - name: All open bookinfo alerts
            query: "status: open AND namespace: bookinfo"
```
