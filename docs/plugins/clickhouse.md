# ClickHouse

!!! warning
    The ClickHouse plugin is in a very early stage and might be changed heavily in the future.

The [ClickHouse](https://clickhouse.tech) plugin can be used to get the data from a configured ClickHouse instance.

The ClickHouse plugin can be used together with the [kobsio/fluent-bit-clickhouse](https://github.com/kobsio/fluent-bit-clickhouse) output plugin for [Fluent Bit](https://fluentbit.io). For this the `type` in the plugin options must be set to `logs`. You can then use the specified [Query Syntax](#query-syntax) to get the logs from ClickHouse.

![Logs](assets/clickhouse-logs.png)

## Options

The following options can be used for a panel with the ClickHouse plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Set the type for which you want to use the ClickHouse instance. This must be `sql` or `logs` | Yes |
| showChart | boolean | If this is `true` the chart with the distribution of the Documents over the selected time range will be shown. This option is only available when type is `logs`. | No |
| queries | [[]Query](#query) | A list of queries, which can be selected by the user. | Yes |

### Query

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | A name for the ClickHouse query, which is displayed in the select box. | Yes |
| query | string | The query which should be run against ClickHouse. See [Query Syntax](#query-syntax) for more information on the syntax, when ClickHouse is used in the `logs` mode. | Yes |
| fields | []string | A list of fields to display in the results table. If this field is omitted, the whole document is displayed in the results table. This field is only available for the `logs`. | No |

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  placeholders:
    - name: namespace
      description: The workload namespace
    - name: app
      description: The workloads app label
  rows:
    - size: -1
      panels:
        - title: Istio Logs
          colSpan: 12
          plugin:
            name: clickhouse
            options:
              showChart: true
              queries:
                - name: Istio Logs
                  query: "namespace='bookinfo' _and_ app='bookinfo' _and_ container_name='istio-proxy' _and_ content.upstream_cluster~'inbound.*'"
                  fields:
                    - "pod_name"
                    - "content.authority"
                    - "content.route_name"
                    - "content.protocol"
                    - "content.method"
                    - "content.path"
                    - "content.response_code"
                    - "content.upstream_service_time"
                    - "content.bytes_received"
                    - "content.bytes_sent"
```

## Query Syntax

### Operators

kobs supports multiple operators which can be used in a query to retrieve logs from ClickHouse:

| Operator | Description | Example |
| -------- | ----------- | ------- |
| `(` and `)` | Multiple terms or clauses can be grouped together with parentheses, to form sub-queries. | `cluster='kobs-demo' _and_ (namespace='bookinfo' _or_ namespace='istio-system')` |
| `_not_` | Exclude the term from the query. | `cluster='kobs-demo' _and_ _not_ namespace='bookinfo'` |
| `_and_` | Both terms must be included in the results. | `namespace='bookinfo' _and_ app='bookinfo'` |
| `_or_` | The result can contain one of the given terms. | `namespace='bookinfo' _or_ namespace='istio-system'` |
| `=` | The field must have this value. | `namespace='bookinfo'` |
| `!=` | The field should not have this value. | `namespace!='bookinfo'` |
| `>` | The value of the field must be greater than the specified value. | `content.response_code>499` |
| `>=` | The value of the field must be greater than or equal to the specified value. | `content.response_code>=500` |
| `<` | The value of the field must be lower than the specified value. | `content.response_code<500` |
| `<=` | The value of the field must be lower than or equal to the specified value. | `content.response_code<=499` |
| `=~` | The value of the field is compared using `ILIKE`. | `content.upstream_cluster=~'inbound%'` |
| `~` | The value of the field must match the regular expression. The syntax of the `re2` regular expressions can be found [here](https://github.com/google/re2/wiki/Syntax). | `content.upstream_cluster~'inbound.*'` |

### Default Fields

In the following you can find a list of fields which are available for each log line. Consider to filter you logs by these fields, to keep your queries fast:

- `timestamp`: The timestamp for when the log line was written.
- `cluster`: The name of the cluster as it is set by Fluent Bit.
- `namespace`: The namespace of the Pod.
- `app`: The value of the `app` or `k8s-app` label of the Pod.
- `pod_name`: The name of the Pod.
- `container_name`: The name of the container from the Pod.
- `host`: The name of the host where the Pod is running on.
- `log`: The complete log line as it was written by the container.

### Examples

- `namespace='bookinfo' _and_ app='bookinfo' _and_ container_name='istio-proxy' _and_ content.upstream_cluster~'inbound.*'`: Select all inbound Istio logs from the bookinfo app in the bookinfo namespace.
