# Opsgenie

The Opsgenie plugin can be used to retrieve alerts and incidents from Opsgenie.

![Alerts](assets/opsgenie-alerts.png)

![Alert Details](assets/opsgenie-alerts-details.png)

## Configuration

The following configuration can be used to access the Opsgenie API.

```yaml
plugins:
  opsgenie:
    - name: opsgenie
      displayName: Opsgenie
      description: On-call and alert management to keep services always on.
      apiUrl: api.eu.opsgenie.com
      apiKey: ${OPSGENIE_API_KEY}
      url: https://<your-organisation>.app.eu.opsgenie.com
      actions:
        acknowledge: true
        snooze: true
        close: true
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Opsgenie instance. | Yes |
| displayName | string | Name of the Opsgenie instance as it is shown in the UI. | Yes |
| descriptions | string | Description of the Opsgenie instance. | No |
| apiKey | string | API Key for the Opsgenie API. More information can be found at [API key management](https://support.atlassian.com/opsgenie/docs/api-key-management/). | Yes |
| apiUrl | string | API URL for the Opsgenie API. Must be `api.opsgenie.com` or `api.eu.opsgenie.com`. | Yes |
| url | string | The address for the Opsgenie account of your organisation. | No |
| actions.acknowledge | boolean | Allow users to acknowledge Opsgenie alerts via kobs. | No |
| actions.snooze | boolean | Allow users to snooze Opsgenie alerts via kobs. | No |
| actions.close | boolean | Allow users to close Opsgenie alerts via kobs. | No |

## Options

The following options can be used for a panel with the Opsgenie plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Specify if you want to show `alerts` or `incidents`. The default value is `alerts`. | No |
| query | string | The Opsgenie query. The documentation for the query language can be found in the [Opsgenie Documentation](https://support.atlassian.com/opsgenie/docs/search-queries-for-alerts/). | No |

For example the following dashboard shows all open alerts and incidents.

```yaml
---
apiVersion: kobs.io/v1beta1
kind: Dashboard
spec:
  rows:
    - size: -1
      panels:
        - title: Alerts
          colSpan: 6
          plugin:
            name: opsgenie
            options:
              type: alerts
              query: "status: open"
        - title: Incidents
          colSpan: 6
          plugin:
            name: opsgenie
            options:
              type: incidents
              query: "status: open"
```

!!! note
    kobs automatically adds the `createdAt >= <selected-start-time> AND createdAt <= <selected-end-time>` to all Opsgenie queries, so that only results for the selected time range are shown.
