# Users

The users plugin can be used to show a list of users which are members of the specified team on a dashboard.

## Options

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| clusters | string | The cluster name of the team. | No |
| namespaces | string | The namespace of the team | No |
| name | string | The name of the team. | Yes |

## Example

```yaml
---
apiVersion: kobs.io/v1beta1
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
                    name: team-diablo
```
