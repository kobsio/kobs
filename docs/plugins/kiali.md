# Kiali

The Kiali plugin can be used to visualize your Istio service mesh within kobs.

!!! note
    The Kiali plugin is currently under development, so that it only supports displaying the topology graph from Kiali. In the future we also want to display the charts for the traffic metrics.

## Options

The following options can be used for a panel with the Kiali plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| namespaces | string | A list of namespaces for which the topology graph should be shown. | Yes |
| duration | number | The duration for the metrics in the topology chart in seconds (e.g. `900`). If no duration is provided the duration will be calculated be the selected time range in the dashboard. | No |
