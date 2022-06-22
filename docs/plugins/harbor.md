# Harbor

The Harbor plugin can be used to access all your projects, repositories and artifacts from a Harbor instance. You can also show your projects, repositories and artifacts on kobs dashboards.

![Artifacts](assets/harbor-artifacts.png)

![Artifacts Details](assets/harbor-artifacts-details.png)

## Configuration

To use the Harbor plugin the following configuration is needed in the satellites configuration file:

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
kind: Dashboard
metadata:
  name: harbor
  namespace: kobs
spec:
  title: Harbor
  rows:
    - panels:
        - title: Projects
          plugin:
            name: harbor
            type: harbor
            options:
              type: projects
        - title: Repositories
          plugin:
            name: harbor
            type: harbor
            options:
              type: repositories
              panel:
                projectName: public
        - title: Artifacts
          plugin:
            name: harbor
            type: harbor
            options:
              type: artifacts
              panel:
                projectName: public
                repositoryName: kobs
                query: dev
```
