# Notifications

It is possible to show notifications within kobs. Notifications are configured in the [`hub configuration file`](./hub.md). They can be retrieved via supported [plugins](#plugins). When notifications are configured a new **notification bell** icon will be displayed in the header. When a user clicks on this icon a drawer with the configured notifications will be shown.

The following example uses the Opsgenie plugin to show all open alerts and incidents and the RSS plugin to show the status of GitHub.

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
      - title: GitHub Status
        plugin:
          satellite: global
          name: rss
          type: rss
          options:
            urls:
              - https://www.githubstatus.com/history.rss
      - title: Unhealthy Workloads
        plugin:
          name: resources
          type: app
          options:
            satellites:
              - dev-de1
            clusters:
              - dev-de1
            namespaces:
              - ""
            resources:
              - pods
            filter: $.status.containerStatuses[?(@.state.waiting || @.state.terminated && @.state.terminated.reason!='Completed')]
```

![Opsgenie](./assets/notifications-opsgenie.png)

## Plugins

Notifications are configured via plugins. To identify a plugin you have to specify the `satellite`, plugin `name` and plugin `type`. The each plugin can be customized using `options`. These options can be found in the following.

### Resources

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| satellites | []string | A list of satellites for which the resources should be shown. | Yes |
| clusters | []string | A list of clusters for which the resources should be shown. | Yes |
| namespaces | []string | A list of namespaces for which the resources should be shown. | Yes |
| resources | []string | A list of resources for which the resources should be shown. The following strings can be used as resource: `cronjobs`, `daemonsets`, `deployments`, `jobs`, `pods`, `replicasets`, `statefulsets`, `endpoints`, `horizontalpodautoscalers`, `ingresses`, `networkpolicies`, `services`, `configmaps`, `persistentvolumeclaims`, `persistentvolumes`, `poddisruptionbudgets`, `secrets`, `serviceaccounts`, `storageclasses`, `clusterrolebindings`, `clusterroles`, `rolebindings`, `roles`, `events`, `nodes`, `podsecuritypolicies`. A Custom Resource can be used as follows `<name>.<group>/<version>` (e.g. `vaultsecrets.ricoberger.de/v1alpha1`). | Yes |
| selector | string | A label selector for the resources. | No |
| columns | [[]Column](#column) | An optional list of columns to customize the shown fields for a resource. | No |
| filter | string | An optional filter using [JSONPath](https://goessner.net/articles/JsonPath/) to filter the list of resources. | No |


### Opsgenie

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Specify if you want to show `alerts` or `incidents`. | Yes |
| query | string | The Opsgenie query. The documentation for the query language can be found in the [Opsgenie Documentation](https://support.atlassian.com/opsgenie/docs/search-queries-for-alerts/). | Yes |
| interval | number | An optional interval in seconds, which should be used instead of the default interval of 90 days to get the alerts / incidents for. | No |

### RSS

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| urls | []string | A list of RSS feed URLs. | Yes |
| sortBy | string | Set the field by which the retrieved feed items should be sorted. This can be `feed`, `title`, `updated` or `published`. The default value is `published`. | No |
