# Teams

The teams plugin can be used to show a list of all teams on a dashboard. This plugin doesn't have any options.

## Configuration

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| home | boolean | When this is `true` the plugin will be added to the home page. | No |

## Example

```yaml
---
apiVersion: kobs.io/v1
kind: Dashboard
spec:
  rows:
    - size: -1
      panels:
        - title: Teams
          plugin:
            name: teams
```
