# Teams

Teams are defined via the [Team Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_teams.yaml). Teams can be used to define the ownership for applications and to grant users access to several resources.

You can access all teams / the teams you are allowed to see via the teams page.

![Teams](assets/teams.png)

## Specification

In the following you can found the specification for the Team CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| id | string | The id of the team. This value is also used for the refrence in Applications and User CRs. | Yes |
| description | string | A description for the team. | No |
| links | [[]Link](#link) | A list of links (e.g. a link to the teams Slack channel, Confluence page, etc.) | No |
| logo | string | The logo for the team. Must be a path to an image file. | No |
| permissions | [Permissions](./users.md#permissions) | Permissions for the team when the authentication / authorization middleware is enabled. | No |
| dashboards | [[]Dashboard](./applications.md#dashboard) | A list of dashboards which will be shown on the team page. | No |

### Link

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| title | string | Title for the link. | Yes |
| link | string | The actuall link. | Yes |

## Example

The following CR creates a team with the id `product-cloudpunk@kobs.io`. The details page for the team contains a dashboard, which shows the applications owned by the team, the teams open Opsgenie alerts and the team current sprint.

In the CR we also define that every member of the team can view all applications, teams and all resources from the `backend`, `notes`, `mediaserver` and `media-analytics` namespace.

??? note "Team"

    ```yaml
    ---
    apiVersion: kobs.io/v1
    kind: Team
    metadata:
      name: team-cloudpunk
      namespace: kobs
    spec:
      id: product-cloudpunk@kobs.io
      description: Team Cloudpunk - the media handlers.
      links:
        - title: Slack
          link: https://slack.com
        - title: GitHub
          link: https://github.com
        - title: Confluence
          link: https://atlassian.net

      dashboards:
        - namespace: kobs
          name: overview-team
          title: Overview
          placeholders:
            team: "<% $.id %>"
            jira: CLP
            opsgenie: Team Cloudpunk

      permissions:
        applications:
          - type: all
        teams:
          - "*"
        plugins:
          - cluster: "*"
            name: "*"
            type: "*"
        resources:
          - clusters:
              - "*"
            namespaces:
              - "backend"
              - "notes"
              - "mediaserver"
              - "media-analytics"
            resources:
              - "*"
            verbs:
              - "*"
    ```

??? note "Dashboard"

    ```yaml
    ---
    apiVersion: kobs.io/v1
    kind: Dashboard
    metadata:
      name: overview-team
      namespace: kobs
    spec:
      placeholders:
        - name: team
        - name: jira
        - name: opsgenie
      hideToolbar: true
      rows:
        - panels:
            - title: Applications
              plugin:
                type: core
                name: applications
                options:
                  team: "{% .team %}"
              h: 16
              w: 6
              x: 0
              'y': 0
            - title: Open Alerts
              plugin:
                type: opsgenie
                cluster: hub
                name: opsgenie
                options:
                  interval: 31536000
                  queries:
                    - 'status: open AND responders: "{% .opsgenie %}"'
                  type: alerts
              h: 8
              w: 6
              x: 6
              'y': 0
            - title: Current Sprint
              plugin:
                type: jira
                cluster: hub
                name: jira
                options:
                  jql: >-
                    project = {% .jira %} and sprint in openSprints() order by
                    updatedDate
              h: 8
              w: 6
              x: 6
              'y': 8
    ```

![Team Details](assets/teams-details.png)
