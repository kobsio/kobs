# SQL

The SQL plugin can be used to get run queries against a SQL database. Currently we are supporting ClickHouse, Postgres and MySQL databases.

## Options

The following options can be used for a panel with the SQL plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type which should be used to visualize the data. Currently we only support the `table` value. | Yes |
| queries | [[]Query](#query) | A list of queries, which can be selected by the user. | Yes |

### Query

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | A name for the SQL query, which is displayed in the select box. | Yes |
| query | string | The query which should be run against the configured SQL database. | Yes |

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  rows:
    - size: -1
      panels:
        - title: User Data
          colSpan: 12
          plugin:
            name: sql
            options:
              type: table
              queries:
                - name: User Data
                  query: "SELECT * FROM example.users"
```
