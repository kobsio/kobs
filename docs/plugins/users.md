# Users

The users plugin can be used to show a list of users which are members of the specified team on a dashboard.

## Configuration

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| home | boolean | When this is `true` the plugin will be added to the home page. | No |

## Options

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| cluster | string | The cluster name of the team. | Yes |
| namespace | string | The namespace of the team | Yes |
| name | string | The name of the team. | Yes |

## Example

```yaml
---
apiVersion: kobs.io/v1
kind: Team
metadata:
  name: team-diablo
  namespace: kobs
spec:
  dashboards:
    - title: Users
      inline:
        rows:
          - size: -1
            panels:
              - title: Users
                plugin:
                  name: users
                  options:
                    cluster: "{% .__cluster %}"
                    namespace: kobs
                    name: team-diablo
```
