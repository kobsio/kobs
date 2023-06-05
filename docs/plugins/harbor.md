# Harbor

The Harbor plugin can be used to access all your projects, repositories and artifacts from a Harbor instance. You can also show your projects, repositories and artifacts on kobs dashboards.

![Artifacts](assets/harbor-artifacts.png)

![Artifacts Details](assets/harbor-artifacts-details.png)

## Configuration

The Harbor plugin can only be used within the `hub`. To use the Harbor plugin the following configuration is needed:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the Harbor plugin instance. | Yes |
| type | `harbor` | The type for the Harbor plugin. | Yes |
| options.address | string | Address of the Harbor instance. | Yes |
| options.username | string | Username to access an Harbor instance via basic authentication. | No |
| options.password | string | Password to access an Harbor instance via basic authentication. | No |
| options.token | string | Token to access an Harbor instance via token based authentication. | No |
| frontendOptions.address | string | Address of the Harbor instance. | Yes |

```yaml
plugins:
  - name: harbor
    type: harbor
    options:
      address:
      username:
      password:
      token:
    frontendOptions:
      address:
```

## Insight Options

!!! note
    The Harbor plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The Harbor plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the Harbor plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The panel type. This could be `projects`, `repositories` or `artifacts`. | Yes |
| repositories | [Repositories](#repositories) | Details for the panel, when the type is `repositories`. | No |
| artifacts | [Artifacts](#artifacts) | Details for the panel, when the type is `artifacts`. | No |

### Repositories

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| projectName | string | The name of the project, for which the repositories should be displayed. | Yes |
| query | string | An optional query to filter the repositories by their name. | No |

### Artifacts

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| projectName | string | The name of the project, for which the repositories should be displayed. | Yes |
| repositoryName | string | The name of the repository in the project, for which the artifacts should be displayed. | Yes |
| query | string | An optional query to filter the artifacts by their tags. | No |

## Usage

The following dashboard shows all projects, all repositories from the `public` project and all artifacts from the `kobs` repository in the `public` project, where the tag contains `dev`.

```yaml
---
apiVersion: kobs.io/v1
kind: Application
metadata:
  name: default
  namespace: default
spec:
  description: The default application is an application to test all available kobs plugins.
  dashboards:
    - title: Harbor
      inline:
        rows:
          - autoHeight: true
            panels:
              - title: Projects
                plugin:
                  name: harbor
                  type: harbor
                  cluster: hub
                  options:
                    type: projects
                h: 6
                w: 12
                x: 0
                'y': 0
              - title: Repositories
                plugin:
                  name: harbor
                  type: harbor
                  cluster: hub
                  options:
                    type: repositories
                    repositories:
                      projectName: public
                h: 6
                w: 6
                x: 6
                'y': 6
              - title: HelmRepositories
                plugin:
                  name: harbor
                  type: harbor
                  cluster: hub
                  options:
                    type: artifacts
                    artifacts:
                      projectName: public
                      repositoryName: kobs
                      query: dev
                h: 6
                w: 6
                x: 0
                'y': 6
```
