# Users

Users are an extension of kobs via the [User Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_users.yaml). Users can be used to define the members of a team.

You can access all users via the **Users** item on the home page of kobs.

## Specification

In the following you can found the specification for the User CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| id | string | A unique id for the user. The id must be unique across all clusters and namespace. If authentication and authorization is enabled this should be the value passed in the configured user details header (`--api.auth.header`). | Yes |
| fullName | string | The full name of the user. | Yes |
| email | string | The email address of the user. | Yes |
| position | string | The position of the user. | No |
| bio | string | The bio of the user. The bio field supports markdown syntax. | No |
| links | [[]Team](#team) | A list of links (e.g. a link to the teams Slack channel, Confluence page, etc.) | No |

### Team

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| cluster | string | The cluster name of the team, where the user is a member of. If this field isn't provided the cluster property of the user will be used. | No |
| namespace | string | The namespace of the team, where the user is a member of. If this field isn't provided the namespace property of the user will be used. | No |
| name | string | The name of the team. | Yes |

## Example

```yaml
---
apiVersion: kobs.io/v1beta1
kind: User
metadata:
  name: ricoberger
  namespace: kobs
spec:
  id: ricoberger
  fullName: Rico Berger
  email: admin@kobs.io
  position: Site Reliability Engineer
  bio: |
    Site Reliability Engineer at Staffbase. Hacker, Gopher, Cloud Native Enthusiast.

    - [GitHub](https://github.com/ricoberger)
    - [Twitter](https://twitter.com/rico_berger)
    - [LinkedIn](https://www.linkedin.com/in/ricoberger/)
    - [Xing](https://www.xing.com/profile/Rico_Berger5)
  teams:
    - name: team-diablo
```
