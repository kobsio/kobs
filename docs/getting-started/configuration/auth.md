# Authentication and Authorization

kobs supports the authentication and authorization of users. Users can be authenticated using a static list of configured email and password combinations or using OIDC. Authorization is handled via the permissions set in a [User CR](../../resources/users.md) or a [Team CR](../../resources/teams.md). An authenticated user is connected a corresponding User CR and Team CR via the email and groups claim from the OIDC flow.

```yaml
auth:
  # Enable authentication and authorization of of users.
  enabled: true
  # OIDC configuration for kobs. OIDC can be used next to the static user list to authenticate and authorize users. The OIDC provider must be enabled explizit. If the configuration is wrong kobs will crash during the startup process.
  oidc:
    enabled: true
    # The issuer (e.g. "https://accounts.google.com"), client id and client secret for your OIDC provider.
    issuer:
    clientID:
    clientSecret:
    # The url where the OIDC provider redirects a user after login. Must be the URL where your kobs instance is running at.
    redirectURL:
    # A random string to mitigate CSRF attacks.
    state:
    # The scopes for the OIDC provider. By default we need the "openid", "profile", "email", "groups" scope. If your OIDC provider (e.g. Google) does not support the "groups" scope you can also omit it.
    # The "groups" scope is needed to connect a user with a team, so that you can set the permissions of users in a team and not for each single user.
    # If you are using Google and want to use Google Groups to connect your users with teams, you can use a tool like Dex (https://dexidp.io) to get the groups of a user.
    scopes: ["openid", "profile", "email", "groups"]
  # Session configuration for kobs.
  session:
    # The token must be a random string which is used to sign the JWT token, which is generated when a user is authenticated.
    token:
    # The interval defines the lifetime of the generated token. When the token is expired the user must authenticate again.
    interval: 48m
  # A static list of users which can be access kobs. Each user must have a email address and password.
  # ATTENTION: Substitution of environment variables is not supported for the user configuration. Instead you can directly use the hashed password within the configuration.
  users:
    - email:
      # The hashed password of the user. The password can be generated using htpasswd (https://httpd.apache.org/docs/2.4/programs/htpasswd.html).
      #     htpasswd -nBC 10 "" | tr -d ':\n'
      # That command will prompt you for a password and output the hashed password, which will look something like:
      #     $2y$10$dqqr3NIClzy4.jDQ3bHpveqVVxSqmpeP8oRI.eTZd91KxL8EyZx0e
      password:
      # An optional list of groups to authorize a user to access resources based on the permissions of the corresponding Team CRs.
      #     groups: ["dia@kobs.io"]
      # See https://kobs.io/main/resources/teams/#example for an example Team CR.
      groups:
```
