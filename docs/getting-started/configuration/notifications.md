# Notifications

It is possible to show notifications within kobs. Notifications are configured in the [`hub configuration file`](./hub.md). They can be retrieved via supported [plugins](#plugins). When notifications are configured a new **notification bell** icon will be displayed in the header. When a user clicks on this icon a drawer with the configured notifications will be shown.

The following example uses the Opsgenie plugin to show all open alerts and incidents.

```yaml
api:
  notifications:
    groups:
      - title: Incidents
        plugin:
          satellite: global
          name: opsgenie
          type: opsgenie
          options:
            type: incidents
            query: "status: open"
      - title: Alerts
        plugin:
          satellite: global
          name: opsgenie
          type: opsgenie
          options:
            type: alerts
            query: "status: open"
```

![Opsgenie](./assets/notifications-opsgenie.png)

## Plugins

Notifications are configured via plugins. To identify a plugin you have to specify the `satellite`, plugin `name` and plugin `type`. The each plugin can be customized using `options`. These options can be found in the following.

### Opsgenie

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Specify if you want to show `alerts` or `incidents`. | Yes |
| query | string | The Opsgenie query. The documentation for the query language can be found in the [Opsgenie Documentation](https://support.atlassian.com/opsgenie/docs/search-queries-for-alerts/). | Yes |
| interval | number | An optional interval in seconds, which should be used instead of the default interval of 90 days to get the alerts / incidents for. | No |
