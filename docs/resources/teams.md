# Teams

Teams are an extension of kobs via the [Team Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_teams.yaml). Teams can be used to define the ownership for resources and applications.

!!! note
    The list of teams is generated during the start of kobs and then after the specified cache duration (default `60m`). This means that it is possible that a team may not be available directly after creating the corresponding Team CR.

## Specification

In the following you can found the specification for the Team CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| description | string | A description for the team. | Yes |
| logo | string | The logo for the team. Must be a path to an image file. | Yes |
| links | [[]Link](#link) | A list of links (e.g. a link to the teams Slack channel, Confluence page, etc.) | No |
| plugins | [[]Plugin](../plugins/getting-started.md#specification) | No |

### Link

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | Title for the link | Yes |
| link | string | The actuall link | Yes |

## Example

The following Team CR will add a new team called `squad-diablo`. The team page will display all the associated Applications for the team. We also added the Opsgenie plugin to the team page, which displays all open alerts from Opsgenie for the team.

```yaml
---
apiVersion: kobs.io/v1alpha1
kind: Team
metadata:
  name: squad-diablo
  namespace: observability
spec:
  description: Productpage and Details
  logo: https://kobs.io/installation/assets/squad-diablo.png
  links:
    - title: Website
      link: https://istio.io/latest/docs/examples/bookinfo/
    - title: GitHub
      link: https://github.com/istio/istio/tree/master/samples/bookinfo
  plugins:
    - name: Opsgenie
      opsgenie:
        queries:
          - name: All open alerts for Squad Diablo
            query: 'status: open AND responders: "Squad Diablo"'
```
