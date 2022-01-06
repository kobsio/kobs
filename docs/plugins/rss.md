# RSS

The RSS plugin can be used to show the latest status updates of third party services.

## Options

The following options can be used for a panel with the RSS plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| urls | []string | A list of RSS feed URLs. | Yes |
| sortBy | string | Set the field by which the retrieved feed items should be sorted. This can be `feed`, `title`, `updated` or `published`. The default value is `published`. | No |

```yaml
---
apiVersion: kobs.io/v1
kind: Dashboard
spec:
  rows:
    - size: -1
      panels:
        - title: GitHub Status
          plugin:
            name: rss
            options:
              urls:
                - https://www.githubstatus.com/history.rss
              sortBy: updated
```
