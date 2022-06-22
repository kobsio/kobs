# Kiali

The Kiali plugin can be used to visualize your Istio service mesh within kobs. You can select a list of namespaces for which the topology graph from [Kiali](https://kiali.io) should be retrieved. When you select a node or edge in the topology graph you can view the detailed metrics for the selected edge or node.

![Kiali Example 1](assets/kiali-example-1.png)

![Kiali Example 2](assets/kiali-example-2.png)

![Kiali Example 3](assets/kiali-example-3.png)

## Configuration

To use the Kiali plugin the following configuration is needed in the satellites configuration file:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Kiali plugin instance. | Yes |
| type | `kiali` | The type for the Kiali plugin. | Yes |
| options.address | string | Address of the Kiali instance. | Yes |
| options.username | string | Username to access a Kiali instance via basic authentication. | No |
| options.password | string | Password to access a Kiali instance via basic authentication. | No |
| options.token | string | Token to access a Kiali instance via token based authentication. | No |
| options.traffic.failure | number | Threshold to mark edges with failures. This must be a number between `0` and `100`. The default value is `5`. | No |
| options.traffic.degraded | number | Threshold to mark edges with degraded performance. This must be a number between `0` and `100`. The default value is `1`. | No |

```yaml
plugins:
  - name: kiali
    type: kiali
    options:
      address:
      username:
      password:
      token:
      traffic:
        degraded: 1
        failure: 5
```

## Insight Options

!!! note
    The Kiali plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Kiali plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Kiali plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| namespaces | []string | A list of namespaces for which the topology graph should be shown. | Yes |

## Usage

The following example renders the Kiali topology graph for the `bookinfo` namespace on a Kiali dashboard in the example application.

!!! note
    When you are using the kiali plugin within a panel, an unlimited row size (`size: -1`) is not working.

```yaml
apiVersion: kobs.io/v1
kind: Application
metadata:
  name: example-application
  namespace: kobs
spec:
  dashboards:
    - title: Kiali
      inline:
        rows:
          - size: 2
            panels:
              - title: Topology Graph
                plugin:
                  name: kiali
                  type: kiali
                  options:
                    namespaces:
                      - bookinfo
```

![Kiali Dashboard](assets/kiali-dashboard.png)
