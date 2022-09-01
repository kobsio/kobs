# GitHub

The GitHub plugin can be used to access the Pull Requests and Issues for your repositories or your organization.

![GitHub Overview](assets/github-overview.png)

## Configuration

To use the GitHub plugin the following configuration is needed in the satellites configuration file:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the GitHub plugin instance. | Yes |
| type | `github` | The type for the GitHub plugin. | Yes |
| options.organization | string | The name of your organization on GitHub. | Yes |
| options.oauth.clientID | string | The Client ID of your OAuth App. | Yes |
| options.oauth.clientSecret | string | The Client Secret of your OAuth App. | Yes |
| options.oauth.state | string | A random string used to verify the OAuth Redirects. | Yes |
| options.session.token | string | The token must be a random string which is used to sign the JWT token, which is generated when a user is authenticated. | No |
| options.session.interval | string | The interval defines the lifetime of the generated token. When the token is expired the user must authenticate again. The default value is `48h` | No |


```yaml
plugins:
  - name: github
    type: github
    options:
      organization:
      oauth:
        clientID:
        clientSecret:
        state:
```

## Insight Options

!!! note
    The GitHub plugin can not be used within the insights section of an application.

## Variable Options

!!! note
    The GitHub plugin can not be used to get a list of variable values.

## Panel Options

The following options can be used for a panel with the GitHub plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel which should be shown. This could be `orgmemebers`, `orgpullrequests`, `orgrepositories`, `orgteams`, `team`, `teammembers`, `teamrepositories`, `repository`, `repositoryissues`, `repositorypullrequests`, `repositoryworkflowruns`, `userpullrequests` or `usernotifications`. | Yes |
| team | string | The name of the GitHub team from your organization. This is required if the type is `team`, `teammembers` or `teamrepositories`. | No |
| repository | string | The name of the GitHub repository from your organization. This is required if the type is `repository`, `repositoryissues`, `repositorypullrequests` or `repositoryworkflowruns`. | No |

## Notification Options

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The type of the panel which should be shown. This could be `userpullrequests` or `usernotifications`. | Yes |
| userpullrequests | [User Pull Requests](#user-pull-requests) | Options for the `userpullrequests` type. | No |
| usernotifications | [User Notifications](#user-notifications) | Options for the `usernotifications` type. | No |

### User Pull Requests

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| query | string | The query which should be used to get the users pull requests. Must be `created`, `assigned`, `mentioned` or `reviewRequests`. | Yes |

### User Notifications

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| all | boolean | If `true`, show notifications marked as read. | No |
| participating | boolean | If `true`, only shows notifications in which the user is directly participating or mentioned. | No |

## Usage

### Setup an OAuth App

To setup an OAuth App on GitHub for kobs go to the settings page of your organization and select **OAuth Apps** in the **Developer settings** section. Then click on **Register an application**. Provide the following information:

- **Application name:** Provide a name for the application, e.g. `kobs`
- **Homepage URL:** Provide the homepage url for your kobs instance, e.g. `kobs.myorganization.com`
- **Authorization callback URL:** Provide the redirect url for the GitHub plugin instance, e.g. `https://kobs.myorganization.com/plugins/global/github/github/oauth/callback`

On the next page you can find the **Client ID** and you can generate a **Client Secret** for the GitHub plugin. You can also select an icon (e.g. the [kobs logo](../assets/images/logo-blue.png)) and a badge background color (e.g. `#0066CC`).

### Examples

#### Team Dashboard

??? note "Team"

    ```yaml
    ---
    apiVersion: kobs.io/v1
    kind: Team
    metadata:
      name: team-maintainers
      namespace: kobs
    spec:
      group: team-maintainers@kobs.io
      description: Kubernetes Observability Platform
      dashboards:
        - title: GitHub
          inline:
            rows:
              - size: -1
                panels:
                  - title: Team Details
                    colSpan: 4
                    plugin:
                      name: github
                      type: github
                      options:
                        type: team
                        team: maintainers
                  - title: Team Repositories
                    colSpan: 8
                    rowSpan: 5
                    plugin:
                      name: github
                      type: github
                      options:
                        type: teamrepositories
                        team: maintainers
                  - title: Team Members
                    colSpan: 4
                    plugin:
                      name: github
                      type: github
                      options:
                        type: teammembers
                        team: maintainers
    ```

![GitHub Team Dashboard](assets/github-team-dashboard.png)

#### Application Dashboard

??? note "Application"

    ```yaml
    ---
    apiVersion: kobs.io/v1
    kind: Application
    metadata:
      name: kobs
      namespace: kobs
    spec:
      description: Kubernetes Observability Platform
      dashboards:
        - title: GitHub
          inline:
            rows:
              - size: -1
                panels:
                  - title: Repository Details
                    colSpan: 4
                    plugin:
                      name: github
                      type: github
                      options:
                        type: repository
                        repository: kobs
                  - title: Workflow Runs
                    colSpan: 8
                    rowSpan: 5
                    plugin:
                      name: github
                      type: github
                      options:
                        type: repositoryworkflowruns
                        repository: kobs
                  - title: Pull Requests
                    colSpan: 4
                    plugin:
                      name: github
                      type: github
                      options:
                        type: repositorypullrequests
                        repository: kobs
    ```

![GitHub Application Dashboard](assets/github-application-dashboard.png)