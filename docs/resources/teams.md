# Teams

Teams are an extension of kobs via the [Team Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_teams.yaml). Teams can be used to define the ownership for resources and applications.

You can access all teams via the **Teams** item on the home page of kobs.

![Home](assets/home.png)

## Specification

In the following you can found the specification for the Team CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| id | string | A unique id for the team. The id must be unique across all clusters and namespace. If authentication and authorization is enabled this should be the value passed in the configured teams header (`--api.auth.header.teams`). | Yes |
| description | string | A description for the team. | No |
| logo | string | The logo for the team. Must be a path to an image file. | No |
| links | [[]Link](#link) | A list of links (e.g. a link to the teams Slack channel, Confluence page, etc.) | No |
| permissions | [Permissions](users.md#permissions) | Permissions for the team when the authentication / authorization middleware is enabled. | Yes |
| dashboards | [[]Dashboard](#dashboard) | No |

### Link

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | Title for the link. | Yes |
| link | string | The actuall link. | Yes |

### Dashboard

Define the dashboards, which should be used for the team.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| cluster | string | Cluster of the dashboard. If this field is omitted kobs will look in the same cluster as the application was created in. | No |
| namespace | string | Namespace of the dashboard. If this field is omitted kobs will look in the same namespace as the application was created in. | No |
| name | string | Name of the dashboard. **Note:** You have not to provide a name, if you use the **inline** property. | Yes |
| title | string | Title for the dashboard | Yes |
| description | string | The description can be used to explain the content of the dashboard. | No |
| placeholders | map<string, string> | A map of placeholders, whith the name as key and the value for the placeholder as value. More information for placeholders can be found in the documentation for [Dashboards](./dashboards.md). | No |
| inline | [Inline](#inline) | Specify a complete dashboard within the reference. This can be used if you just use the dashboard within one team. | No |

### Inline

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| variables | [[]Variable](./dashboards.md#Variable) | A list of variables, where the values are loaded by the specified plugin. | No |
| rows | [[]Row](./dashboards.md#row) | A list of rows for the dashboard. | Yes |

## Example

The following Team CR will add a new team called `team-diablo`. The team page will display all the applications from the `bookinfo` namespace and the resource usage of the Pods in this namespace.

```yaml
---
apiVersion: kobs.io/v1
kind: Team
metadata:
  name: team-diablo
  namespace: kobs
spec:
  description: Productpage and Details
  logo: https://kobs.io/installation/assets/team-diablo.png
  links:
    - title: Website
      link: https://istio.io/latest/docs/examples/bookinfo/
    - title: GitHub
      link: https://github.com/istio/istio/tree/master/samples/bookinfo
  dashboards:
    - name: resources
      namespace: kobs
      title: Resources in the bookinfo namespace
      placeholders:
        namespace: bookinfo
    - name: resource-usage
      namespace: kobs
      title: Resource Usage
      placeholders:
        namespace: bookinfo
        pod: ".*"
```

The following Team CR allows all members of `team-diablo` access to all plugins and resources, when authentication and authorization is enabled.

```yaml
---
apiVersion: kobs.io/v1
kind: Team
metadata:
  name: team-diablo
  namespace: kobs
spec:
  permissions:
    plugins:
      - name: "*"
    resources:
      - clusters:
          - "*"
        namespaces:
          - "*"
        resources:
          - "*"
        verbs:
          - "*"
```
