# Kiali

The Kiali plugin can be used to visualize your Istio service mesh within kobs. You can select a list of namespaces for which the topology graph from [Kiali](https://kiali.io) should be retrieved. When you select a node or edge in the topology graph you can view the detailed metrics for the selected edge or node.

![Kiali](assets/kiali.png)

## Options

The following options can be used for a panel with the Kiali plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| namespaces | []string | A list of namespaces for which the topology graph should be shown. | Yes |
