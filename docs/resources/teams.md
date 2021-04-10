# Teams

Teams are an extension of kobs via the [Team Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_teams.yaml). Teams can be used to define the ownership for resources and applications.

!!! note
    The Team CRD is currently under development. Currently the team page just shows a list of applications, which can be associated with the team. For the future it is planned to allow teams to create dashboards within there team page, where they can add applications, resources and plugins.

!!! note
    The list of teams is generated during the start of kobs and then after the specified cache duration (default `60m`). This means that it is possible that a team may not be available directly after creating the corresponding Team CR.

## Specification

In the following you can found the specification for the Team CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| description | string | A description for the team. | Yes |
| logo | string | The logo for the team. Must be a path to an image file. | Yes |
| links | [[]Link](#link) | A list of links (e.g. a link to the teams Slack channel, Confluence page, etc.) | No |

### Link

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | Title for the link | Yes |
| link | string | The actuall link | Yes |
