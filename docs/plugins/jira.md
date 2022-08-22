# Jira

The Jira plugin can be used to issues from your Jira instance.

## Configuration

To use the Jira plugin the following configuration is needed in the satellites configuration file:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Jira plugin instance. | Yes |
| type | `jira` | The type for the Jira plugin. | Yes |
| options.url | string | The URL of your Jira instance. | Yes |

```yaml
plugins:
  - name: jira
    type: jira
    options:
      url:
```

## Insight Options

!!! note
    The Jira plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Jira plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Jira plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| jql | string | The JQL filter to get issues from your Jira instance. | Yes |

## Notification Options

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| jql | string | The JQL filter to get issues from your Jira instance. | Yes |
