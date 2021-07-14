# Teams

Teams are an extension of kobs via the [Team Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_teams.yaml). Teams can be used to define the ownership for resources and applications.

You can access all teams via the **Teams** item on the home page of kobs.

![Home](assets/home.png)

## Specification

In the following you can found the specification for the Team CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| description | string | A description for the team. | Yes |
| logo | string | The logo for the team. Must be a path to an image file. | Yes |
| links | [[]Link](#link) | A list of links (e.g. a link to the teams Slack channel, Confluence page, etc.) | No |
| dashboards | [[]Dashboard](#dashboard) | No |

### Link

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | Title for the link | Yes |
| link | string | The actuall link | Yes |

### Dashboard

Define the dashboards, which should be used for the team.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| cluster | string | Cluster of the dashboard. If this field is omitted kobs will look in the same cluster as the application was created in. | No |
| namespace | string | Namespace of the dashboard. If this field is omitted kobs will look in the same namespace as the application was created in. | No |
| name | string | Name of the dashboard. | Yes |
| title | string | Title for the dashboard | Yes |
| description | string | The description can be used to explain the content of the dashboard. | No |
| placeholders | map<string, string> | A map of placeholders, whith the name as key and the value for the placeholder as value. More information for placeholders can be found in the documentation for [Dashboards](./dashboards.md). | No |

## Example

The following Team CR will add a new team called `team-diablo`. The team page will display all the applications from the `bookinfo` namespace and the resource usage of the Pods in this namespace.

```yaml
---
apiVersion: kobs.io/v1beta1
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
