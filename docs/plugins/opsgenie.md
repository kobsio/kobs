# Opsgenie

The Opsgenie plugin can be used to retrieve alerts and incidents from Opsgenie.

![Alerts](assets/opsgenie-alerts.png)

![Alert Details](assets/opsgenie-alerts-details.png)

## Configuration

The Opsgenie plugin can only be used within the `hub`. To use the Opsgenie plugin the following configuration is needed:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Opsgenie plugin instance. | Yes |
| type | `opsgenie` | The type for the Opsgenie plugin. | Yes |
| options.apiKey | string | API Key for the Opsgenie API. More information can be found at [API key management](https://support.atlassian.com/opsgenie/docs/api-key-management/). | Yes |
| options.apiUrl | string | API URL for the Opsgenie API. Must be `api.opsgenie.com` or `api.eu.opsgenie.com`. | Yes |
| options.permissionsEnabled | boolean | Enable / disable the permission handling for the Opsgenie plugin. More information regarding the permission handling can be found in the [permissions](#permissions) section of the documentation. | No |
| frontendOptions.url | string | The address for the Opsgenie account of your organisation. | No |

```yaml
plugins:
  - name: opsgenie
    type: opsgenie
    options:
      apiKey:
      apiUrl:
    frontendOptions:
      url:
```

## Insight Options

!!! note
    The Opsgenie plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Opsgenie plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Opsgenie plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Specify if you want to show `alerts` or `incidents`. | Yes |
| queries | []string | The Opsgenie queries. The documentation for the query language can be found in the [Opsgenie Documentation](https://support.atlassian.com/opsgenie/docs/search-queries-for-alerts/). | Yes |
| interval | number | An optional interval in seconds, which should be used instead of the selected time range in the Dashboard to get the alerts / incidents for. | No |

!!! note
    kobs automatically adds the `createdAt >= <selected-start-time> AND createdAt <= <selected-end-time>` to all Opsgenie queries, so that only results for the selected time range are shown.

    This behaviour can be overwritten with the `interval` property. If the `interval` property is provided, we add `createdAt >= <now - interval> AND createdAt <= <now>`.
