# Harbor

The Harbor plugin can be used to access all your projects, repositories and artifacts from a Harbor instance. You can also show your projects, repositories and artifacts on kobs dashboards.

![Artifacts](assets/harbor-artifacts.png)

![Artifacts Details](assets/harbor-artifacts-details.png)

## Options

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

## Example

The following dashboards shows all projects, all repositories from the `public` project and all artifacts from the `kobs` repository in the `public` project, where the tag contains `dev`.

```yaml
---
apiVersion: kobs.io/v1beta1
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
            options:
              type: projects
        - title: Repositories
          plugin:
            name: harbor
            options:
              type: repositories
              panel:
                projectName: public
        - title: Artifacts
          plugin:
            name: harbor
            options:
              type: artifacts
              panel:
                projectName: public
                repositoryName: kobs
                query: dev
```
