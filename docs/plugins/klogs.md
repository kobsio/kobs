# klogs

The klogs plugin can be used together with the [kobsio/klogs](https://github.com/kobsio/klogs) output plugin for [Fluent Bit](https://fluentbit.io). You can then use the specified [Query Syntax](#query-syntax) to get the logs from ClickHouse.

![Logs](assets/klogs-logs.png)

## Configuration

The klogs plugin can be used within the `hub` or `cluster`. To use the klogs plugin the following configuration is needed:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the klogs plugin instance. | Yes |
| type | `klogs` | The type for the klogs plugin. | Yes |
| options.address | string | Address of the ClickHouse instance. | Yes |
| options.database | string | The name of the database. | Yes |
| options.username | string | Username to access a ClickHouse instance. | No |
| options.password | string | Password to access a ClickHouse instance. | No |
| options.dialTimeout | string | ClickHouse dial timeout. The default value is `10s`. | No |
| options.connMaxLifetime | string | ClickHouse maximum connection lifetime. The default value is `1h`. | No |
| options.maxIdleConns | number | ClickHouse maximum number of idle connections. The default value is `5`. | No |
| options.maxOpenConns | number | ClickHouse maximum number of open connections. The default value is `10`. | No |
| options.settings | map<string, any> | Additional settings which should be applyed to the ClickHouse connection. | No |
| options.materializedColumns | []string | A list of materialized columns. See [kobsio/klogs](https://github.com/kobsio/klogs#configuration) for more information. | No |

```yaml
plugins:
  - name: klogs
    type: klogs
    options:
      address:
      database:
      username:
      password:
      dialTimeout:
      connMaxLifetime:
      maxIdleConns:
      maxOpenConns:
      settings:
        # e.g.
        # receive_timeout: 600
      materializedColumns:
```

## Insight Options

!!! note
    The klogs plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The klogs plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the klogs plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Set the type which should be used to visualize your logs. This can be `logs` or `aggregation`. | Yes |
| showChart | boolean | If this is `true` the chart with the distribution of the log lines in the selected time range will be shown. | No |
| queries | [[]Query](#query) | A list of queries, which can be selected by the user. This is only required for type `logs`. | Yes |
| aggregation | [Aggregation](#aggregation) | Options for the aggregation. This is only required for type `aggregation`. | Yes |

### Query

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | A name for the klogs query, which is displayed in the select box. | Yes |
| query | string | The query which should be run against ClickHouse. See [Query Syntax](#query-syntax) for more information on the syntax. | Yes |
| fields | []string | A list of fields to display in the results table. If this field is omitted, the whole document is displayed in the results table. | No |
| order | string | Order for the returned logs. Must be `ascending` or `descending`. The default value for this field is `descending`. | No |
| orderBy | string | The name of the field, by which the results should be orderd. The default value for this field is `timestamp`. | No |

### Aggregation

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| query | string | The query, which should be used for the aggregation. | Yes |
| chart | string | The visualization type for the aggregation. This can be `pie`, `bar`, `line` or `area`. | Yes |
| sliceBy | string | Field which should be used for slicing in a `pie` chart. | No |
| sizeByOperation | string | Operation to size the slices. This can be `count`, `min`, `max`, `sum` or `avg`. | No |
| sizeByField | string | When the sizeByOperation is `min`, `max`, `sum` or `avg`, this must be the name of a field for the sizing of the slices. | No |
| horizontalAxisOperation | string | The operation for the chart. This must be `time` or `top`. | No |
| horizontalAxisField | string | The name of the field for the horizontal axis. | No |
| horizontalAxisOrder | string | The order of the top values. Must be `ascending` or `descending`. | No |
| horizontalAxisLimit | number | The maximum number of top values, which should be shown. | No |
| verticalAxisOperation | string | The operation for the vertical axis. This can be `count`, `min`, `max`, `sum` or `avg`. | No |
| verticalAxisField | string | When the verticalAxisOperation is `min`, `max`, `sum` or `avg`, this must be the name of a field for the vertical axis. | No |
| breakDownByFields | []string | A list of field names, which should be used to break down the data. | No |
| breakDownByFilters | []string | A list of filters, which should be used to break down the data. | No |

## Usage

### Query Syntax

#### Operators

kobs supports multiple operators which can be used in a query to retrieve logs from ClickHouse:

| Operator | Description | Example |
| -------- | ----------- | ------- |
| `(` and `)` | Multiple terms or clauses can be grouped together with parentheses, to form sub-queries. | `cluster='kobs-demo' _and_ (namespace='bookinfo' _or_ namespace='istio-system')` |
| `_not_` | Exclude the term from the query. | `cluster='kobs-demo' _and_ _not_ namespace='bookinfo'` |
| `_and_` | Both terms must be included in the results. | `namespace='bookinfo' _and_ app='bookinfo'` |
| `_or_` | The result can contain one of the given terms. | `namespace='bookinfo' _or_ namespace='istio-system'` |
| `_exists_` | The field can not be `null` | `container_name='istio-proxy' _and_ _exists_ content_request_id` |
| `=` | The field must have this value. | `namespace='bookinfo'` |
| `!=` | The field should not have this value. | `namespace!='bookinfo'` |
| `>` | The value of the field must be greater than the specified value. | `content_response_code>499` |
| `>=` | The value of the field must be greater than or equal to the specified value. | `content_response_code>=500` |
| `<` | The value of the field must be lower than the specified value. | `content_response_code<500` |
| `<=` | The value of the field must be lower than or equal to the specified value. | `content_response_code<=499` |
| `=~` | The value of the field is compared using `ILIKE`. | `content_upstream_cluster=~'inbound%'` |
| `!~` | The value of the field is compared using `NOT ILIKE`. | `content_upstream_cluster!~'inbound%'` |
| `~` | The value of the field must match the regular expression. The syntax of the `re2` regular expressions can be found [here](https://github.com/google/re2/wiki/Syntax). | `content_upstream_cluster~'inbound.*'` |

#### Default Fields

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

??? note "Logs"

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
        - title: Logs
          inline:
            rows:
              - autoHeight: true
                panels:
                  - title: Istio Logs
                    plugin:
                      name: klogs
                      type: klogs
                      options:
                        type: logs
                        showChart: true
                        queries:
                          - name: Istio Logs
                            query: >-
                              namespace='kobs' _and_ app='hub' _and_
                              container_name='istio-proxy' _and_
                              content_upstream_cluster~'inbound.*'
                            fields:
                              - pod_name
                              - content_authority
                              - content_route_name
                              - content_protocol
                              - content_method
                              - content_path
                              - content_response_code
                              - content_upstream_service_time
                              - content_bytes_received
                              - content_bytes_sent
                    h: 6
                    w: 12
                    x: 0
                    'y': 0
    ```

![Logs](assets/klogs-example-1.png)

??? note "Aggregations"

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
        - title: Logs
          inline:
            rows:
              - panels:
                  - title: Number of Logs per App
                    plugin:
                      name: klogs
                      type: klogs
                      options:
                        type: aggregation
                        aggregation:
                          query: cluster='dev-de1'
                          chart: bar
                          horizontalAxisOperation: top
                          horizontalAxisField: app
                          horizontalAxisOrder: descending
                          horizontalAxisLimit: 10
                          verticalAxisOperation: count
                    h: 7
                    w: 6
                    x: 0
                    'y': 0
                  - title: Log Levels for MyApplication
                    plugin:
                      name: klogs
                      type: klogs
                      options:
                        type: aggregation
                        aggregation:
                          query: >-
                            cluster='dev-de1' _and_ app='myapplication' _and_
                            container_name='myapplication'
                          chart: pie
                          sliceBy: content_level
                          sizeByOperation: count
                    h: 7
                    w: 6
                    x: 6
                    'y': 0
                  - title: Request Duration for MyApplication by Response Code
                    plugin:
                      name: klogs
                      type: klogs
                      options:
                        type: aggregation
                        aggregation:
                          query: >-
                            cluster='dev-de1' _and_ app='myapplication' _and_
                            container_name='istio-proxy' _and_ content_response_code>0
                          chart: line
                          horizontalAxisOperation: time
                          verticalAxisOperation: avg
                          verticalAxisField: content_duration
                          breakDownByFields:
                            - content_response_code
                    h: 7
                    w: 12
                    x: 0
                    'y': 7
    ```

![Aggregations](assets/klogs-example-2.png)
