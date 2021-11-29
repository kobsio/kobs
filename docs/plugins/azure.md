# Azure

The Azure plugin can be used to view your Azure resources like Container Instances within kobs.

![Azure Overview](assets/azure-overview.png)

![Azure Container Instances](assets/azure-container-instances.png)

## Configuration

The following configuration can be used to access Azure.

```yaml
plugins:
  azure:
    - name: azure
      displayName: Azure
      description: The innovate-anywhere, create-anything cloud.
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Azure instance. | Yes |
| displayName | string | Name of the Azure instance as it is shown in the UI. | Yes |
| descriptions | string | Description of the Azure instance. | No |
| permissionsEnabled | boolean | Enable the permission handling. The permissions can be defined via the [PermissionsCustom](../resources/teams.md#permissionscustom) in a team. An example of the permission format can be found in the [usage](#usage) section of this page. | No |

To authenticate against the Azure API you have to set the following environment variables:

- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`

## Options

The following options can be used for a panel with the Azure plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The service type which should be used for the panel Currently only `containerinstances` is supported. | Yes |
| containerinstances | [Container Instances](#container-instances) | The configuration for the panel if the type is `containerinstances`. | No |

### Container Instances

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel for which the Container Instances data should be displayed. This can be `list`, `details`, `logs` or `metrics`. | Yes |
| resourceGroup | string | The name of the resource group for the Container Instance. This is not required if the type is `list`. | No |
| containerGroup | string | The name of the container group. This is not required if the type is `list`. | No |
| containers | string[] | A list of container names. This is only required if the type is `logs`. | No |
| metric | string | The name of the metric for which the data should be displayed. Supported values are `CPUUsage`, `MemoryUsage`, `NetworkBytesReceivedPerSecond` and `NetworkBytesTransmittedPerSecond`. This is only required if the type is `metrics`. | No |

## Usage

### Permissions

You can define fine grained permissions to access your Azure resources via kobs. The permissions are defined via the `permissions.cusomt` field of a [Team](../resources/teams.md). Each user which is member of this team, will then get the defined permissions.

In the following example each member of `team1` will get access to all Azure resource, while members of `team2` can only access container instances in the `development` resource group:

??? note "team1"

    ```yaml
    ---
    apiVersion: kobs.io/v1beta1
    kind: Team
    metadata:
      name: team1
    spec:
      permissions:
        plugins:
          - "*"
        resources:
          - clusters:
              - "*"
            namespaces:
              - "*"
            resources:
              - "*"
        custom:
          - name: azure
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
    apiVersion: kobs.io/v1beta1
    kind: Team
    metadata:
      name: team2
    spec:
      permissions:
        plugins:
          - "*"
        resources:
          - clusters:
              - "*"
            namespaces:
              - "*"
            resources:
              - "*"
        custom:
          - name: azure
            permissions:
              - resources:
                  - "containerinstances"
                resourceGroups:
                  - "development"
                verbs:
                  - "*"
    ```

The `*` value is a special value, which allows access to all resources, resource groups and action. The following values can also be used for resources and verbs:

- `resources`: `containerinstances`
- `verbs`: `get`, `put`, `post` and `delete`

!!! note
    You have to set the `permissionsEnabled` property in the configuration to `true` and you must enable [authentication](../configuration/authentication.md) for kobs to use this feature.

## Examples

### Container Instances Dashboard

The following dashboards displays a list of container instances and the details for one container instance, which can be selected via a variable.

```yaml
---
apiVersion: kobs.io/v1beta1
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
            options:
              type: containerinstances
              containerinstances:
                type: metrics
                resourceGroup: app-myciservice
                containerGroup: "{% .var_container_group %}"
                metric: CPUUsage
        - title: Memory Usage {% .var_container_group %}
          colSpan: 6
          rowSpan: 1
          plugin:
            name: azure
            options:
              type: containerinstances
              containerinstances:
                type: metrics
                resourceGroup: app-myciservice
                containerGroup: "{% .var_container_group %}"
                metric: MemoryUsage

    - size: 4
      panels:
        - title: Logs
          colSpan: 12
          plugin:
            name: azure
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
