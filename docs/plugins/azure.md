# Azure

The Azure plugin can be used to view your Azure resources like Container Instances within kobs.

![Azure Overview](assets/azure-overview.png)

![Azure Container Instances](assets/azure-container-instances.png)

## Configuration

To use the Azure plugin the following configuration is needed in the satellites configuration file:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Azure plugin instance. | Yes |
| type | `azure` | The type for the Azure plugin. | Yes |
| options.credentials.subscriptionID | string | The id of your Azure subscription. | Yes |
| options.credentials.tenantID | string | The tenant id. | Yes |
| options.credentials.clientID | string | The client id. | Yes |
| options.credentials.clientSecret | string | The client secret. | Yes |
| options.permissionsEnabled | boolean | Enable the permission handling. An example of the permission format can be found in the [usage](#usage) section of this page. | No |

```yaml
plugins:
  - name: azure
    type: azure
    options:
      credentials:
        subscriptionID:
        tenantID:
        clientID:
        clientSecret:
```

## Insight Options

!!! note
    The Azure plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Azure plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Azure plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The service type which should be used for the panel Currently `containerinstances`, `costmanagement`, `kubernetesservices` and `virtualmachinescalesets` are supported values. | Yes |
| containerinstances | [Container Instances](#container-instances) | The configuration for the panel if the type is `containerinstances`. | No |
| costmanagement | [Cost Management](#cost-management) | The configuration for the panel if the type is `costmanagement`. | No |
| kubernetesservices | [Kubernetes Services](#kubernetes-services) | The configuration for the panel if the type is `kubernetesservices`. | No |
| virtualmachinescalesets | [Virtual Machine Scale Sets](#virtual-machine-scale-sets) | The configuration for the panel if the type is `virtualmachinescalesets`. | No |

### Container Instances

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel for which the Container Instances data should be displayed. This can be `list`, `details`, `logs` or `metrics`. | Yes |
| resourceGroups | string[] | A list of resource groups for which the Container Instances should be displayed. This is only required, when the type is `list`. | No |
| resourceGroup | string | The name of the resource group for the Container Instance. This is not required if the type is `list`. | No |
| containerGroup | string | The name of the container group. This is not required if the type is `list`. | No |
| containers | string[] | A list of container names. This is only required if the type is `logs`. | No |
| metricNames | string | The name of the metric for which the data should be displayed. Supported values are `CPUUsage`, `MemoryUsage`, `NetworkBytesReceivedPerSecond` and `NetworkBytesTransmittedPerSecond`. This is only required if the type is `metrics`. | No |
| aggregationType | string | The aggregation type for the metric. Supported values are `Average`, `Minimum`, `Maximum`, `Total` and `Count`. This is only required if the type is `metrics`. | No |
| tail | number | The number of log lines which should be shown. This is only required if the type is `logs`. The default value is `10000`. | No |
| timestamps | boolean | Show timestamps infront of the log lines. This is only required if the type is `logs`. The default value is `false`. | No |

### Cost Management

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel for which the Cost Management data should be displayed. Currently only `actualcosts` is supported. | Yes |
| scope | string | The scope for the costs data. This could be the name of a resource group or `All`. The default value is `All`. | No |

### Kubernetes Services

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel for which the Kubernetes Services data should be displayed. This can be `list`, `details`, `nodePools` or `metrics`. | Yes |
| resourceGroups | string[] | A list of resource groups for which the Kubernetes Services should be displayed. This is only required, when the type is `list`. | No |
| resourceGroup | string | The name of the resource group for the Kubernetes Services. This is not required if the type is `list`. | No |
| managedCluster | string | The name of the managed cluster. This is not required if the type is `list`. | No |
| metricNames | string | The name of the metric for which the data should be displayed. Supported values are `apiserver_current_inflight_requests`, `kube_node_status_allocatable_cpu_cores`, `kube_node_status_allocatable_memory_bytes`, `kube_node_status_condition`, `node_cpu_usage_percentage`, `node_memory_rss_percentage`, `node_memory_working_set_percentage`, `node_disk_usage_percentage`, `node_network_in_bytes`, `node_network_out_bytes` and `kube_pod_status_ready`. This is only required if the type is `metrics`. | No |
| aggregationType | string | The aggregation type for the metric. Supported values are `Average`, `Minimum`, `Maximum`, `Total` and `Count`. This is only required if the type is `metrics`. | No |

### Virtual Machine Scale Sets

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel for which the Virtual Machine Scale Set data should be displayed. This can be `list`, `details`, `virtualMachines` or `metrics`. | Yes |
| resourceGroups | string[] | A list of resource groups for which the Virtual Machine Scale Sets should be displayed. This is only required, when the type is `list`. | No |
| resourceGroup | string | The name of the resource group for the Virtual Machine Scale Set. This is not required if the type is `list`. | No |
| virtualMachineScaleSet | string | The name of the Virtual Machine Scale Set. This is not required if the type is `list`. | No |
| virtualMachine | string | The name of a virtual machine in a Virtual Machine Scale Set. If this value is provided the metrics for the virtual machine instead of the Virtual Machine Scale Set will be displayed, when the type is `metrics`. | No |
| metricNames | string | The name of the metric for which the data should be displayed. Supported values are `Percentage CPU`, `Available Memory Bytes`, `Network In Total`, `Network Out Total`, `Disk Read Bytes`, `Disk Write Bytes`, `Disk Read Operations/Sec` and `Disk Write Operations/Sec`. This is only required if the type is `metrics`. | No |
| aggregationType | string | The aggregation type for the metric. Supported values are `Average`, `Minimum`, `Maximum`, `Total` and `Count`. This is only required if the type is `metrics`. | No |

## Usage

### Permissions

You can define fine grained permissions to access your Azure resources via kobs. The permissions are defined via the `permissions.plugins[].permissions` field of a [User](../resources/users.md) or [Team](../resources/teams.md). The team membership of an user is defined via the values of the `X-Auth-Request-Groups` header.

In the following example each member of `team1@kobs.io` will get access to all Azure resource, while members of `team2@kobs.io` can only access container instances in the `development` resource group:

??? note "team1"

    ```yaml
    ---
    apiVersion: kobs.io/v1
    kind: Team
    metadata:
      name: team1
    spec:
      group: team1@kobs.io
      permissions:
        plugins:
          - satellite: "*"
            name: "*"
            type: "*"
          - satellite: "*"
            name: "azure"
            type: "azure"
            permissions:
              - resources:
                  - "*"
                resourceGroups:
                  - "*"
                verbs:
                  - "*"
    ```

??? note "team2"

    ```yaml
    ---
    apiVersion: kobs.io/v1
    kind: Team
    metadata:
      name: team2
    spec:
      group: team1@kobs.io
      permissions:
        plugins:
          - satellite: "*"
            name: "*"
            type: "*"
          - satellite: "*"
            name: "azure"
            type: "azure"
            permissions:
              - resources:
                  - "containerinstances"
                resourceGroups:
                  - "development"
                verbs:
                  - "*"
    ```

The `*` value is a special value, which allows access to all resources, resource groups and action. The following values can also be used for resources and verbs:

- `resources`: `containerinstances`, `kubernetesservices` and `monitor`
- `verbs`: `delete`, `get`, `post` and `put`

!!! note
    You have to set the `permissionsEnabled` property in the configuration to `true` and you must enable [authentication](../getting-started/configuration/authentication.md) for kobs to use this feature.

### Metrics

kobs supports all Azure metrics for the supported services. To get a list of all metric names and there aggregation types one of the following commands can be used:

- Container Instances: `az monitor metrics list-definitions --resource /subscriptions/<SUBSCRIPTION>/resourceGroups/<RESOURCE-GROUP>/providers/Microsoft.ContainerInstance/containerGroups/<CONTAINER-GROUP>`
- Kubernetes Services: `az monitor metrics list-definitions --resource /subscriptions/<SUBSCRIPTION>/resourceGroups/<RESOURCE-GROUP>/providers/Microsoft.ContainerService/managedClusters/<MANAGED-CLUSTER>`
- Virtual Machine Scale Sets: `az monitor metrics list-definitions --resource /subscriptions/<SUBSCRIPTION>/resourceGroups/<RESOURCE-GROUP>/providers/Microsoft.Compute/virtualMachineScaleSets/<VIRTUAL-MACHINE-SCALE-SET>`
- Virtual Machine Scale Sets (Virtual Machine): `az monitor metrics list-definitions --resource /subscriptions/<SUBSCRIPTION>/resourceGroups/<RESOURCE-GROUP>/providers/Microsoft.Compute/virtualMachineScaleSets/<VIRTUAL-MACHINE-SCALE-SET>/virtualMachines/<VIRTUAL-MACHINE>`

In the returned JSON array you can check the `name.value` fields for the metric names and the `supportedAggregationTypes` for all the supported aggregation types of a metric.

### Examples

#### Container Instances Dashboard

The following dashboards displays a list of container instances and the details for one container instance, which can be selected via a variable.

```yaml
---
apiVersion: kobs.io/v1
kind: Dashboard
metadata:
  name: azure-container-instance
  namespace: kobs
spec:
  description: Easily run containers on Azure without managing servers
  variables:
    - name: var_container_group
      label: Container Group
      plugin:
        name: core
        options:
          type: static
          items:
            - dev-myciservice
            - stage-myciservice
            - prod-myciservice
  rows:
    - size: 2
      panels:
        - title: Container Instances
          colSpan: 12
          plugin:
            name: azure
            type: azure
            options:
              type: containerinstances
              containerinstances:
                type: list

    - size: 2
      panels:
        - title: Details {% .var_container_group %}
          colSpan: 6
          rowSpan: 2
          plugin:
            name: azure
            type: azure
            options:
              type: containerinstances
              containerinstances:
                type: details
                resourceGroup: app-myciservice
                containerGroup: "{% .var_container_group %}"
        - title: CPU Usage {% .var_container_group %}
          colSpan: 6
          rowSpan: 1
          plugin:
            name: azure
            type: azure
            options:
              type: containerinstances
              containerinstances:
                type: metrics
                resourceGroup: app-myciservice
                containerGroup: "{% .var_container_group %}"
                metricNames: CPUUsage
                aggregationType: Average
        - title: Memory Usage {% .var_container_group %}
          colSpan: 6
          rowSpan: 1
          plugin:
            name: azure
            type: azure
            options:
              type: containerinstances
              containerinstances:
                type: metrics
                resourceGroup: app-myciservice
                containerGroup: "{% .var_container_group %}"
                metricNames: MemoryUsage
                aggregationType: Average

    - size: 4
      panels:
        - title: Logs
          colSpan: 12
          plugin:
            name: azure
            type: azure
            options:
              type: containerinstances
              containerinstances:
                type: logs
                resourceGroup: app-myciservice
                containerGroup: "{% .var_container_group %}"
                containers:
                  - mycicontainer1
                  - mycicontainer2
```

![Azure Container Instances Dashboard](assets/azure-container-instances-dashboard.png)
