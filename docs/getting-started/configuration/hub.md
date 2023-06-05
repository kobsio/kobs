# hub

The hub can be configured using a configuration file in yaml format, command-line arguments and environment variables.

## Command-line Arguments and Environment Variables

The following command-line arguments and environment variables are available.

| Command-line Argument | Environment Variable | Description | Default |
| --------------------- | -------------------- | ----------- | ------- |
| `--config` | `KOBS_CONFIG` | The path to the configuration file for the hub | `config.yaml` |
| `--hub.log.format` | `KOBS_HUB_LOG_FORMAT` | Set the output format of the logs. Must be `console` or `json`. | `console` |
| `--hub.log.level` | `KOBS_HUB_LOG_LEVEL` | Set the log level. Must be `debug`, `info`, `warn`, `error`, `fatal` or `panic`. | `info` |
| `--hub.tracer.enabled` | `KOBS_HUB_TRACER_ENABLED` | Enable tracing. | `false` |
| `--hub.tracer.service` | `KOBS_HUB_TRACER_SERVICE` | The name of the service which should be used for tracing. | `kobs` |
| `--hub.tracer.provider` | `KOBS_HUB_TRACER_PROVIDER` | The tracing provider which should be used. Must be `jaeger` or `zipkin`. | `jaeger` |
| `--hub.tracer.address` | `KOBS_HUB_TRACER_ADDRESS` | The address of the tracing provider instance. | `http://localhost:14268/api/traces` |
| `--hub.metrics.address` | `KOBS_HUB_METRICS_ADDRESS` | Set the address where the metrics server is listen on. | `:15222` |
| `--hub.database.uri` | `KOBS_HUB_DATABASE_URI` | The connection uri for MongoDB | `mongodb://localhost:27017` |
| `--hub.api.address` | `KOBS_HUB_API_ADDRESS` | The address where the hub API should listen on. | `:15220` |
| `--hub.auth.oidc.enabled` | `KOBS_HUB_AUTH_OIDC_ENABLED` | Enables the OIDC provider, so that uses can sign in via OIDC. | `false` |
| `--hub.auth.oidc.issuer` | `KOBS_HUB_AUTH_OIDC_ISSUER` | The issuer url for the OIDC provider. | |
| `--hub.auth.oidc.client-id` | `KOBS_HUB_AUTH_OIDC_CLIENT_ID` | The client id for the OIDC provider. | |
| `--hub.auth.oidc.client-secret` | `KOBS_HUB_AUTH_OIDC_CLIENT_SECRET` | The client secret for the OIDC provider. | |
| `--hub.auth.oidc.redirect-url` | `KOBS_HUB_AUTH_OIDC_REDIRECT_URL` | The redirect url for the OIDC provider. | |
| `--hub.auth.oidc.state` | `KOBS_HUB_AUTH_OIDC_STATE` | The state parameter for the OIDC provider. | |
| `--hub.auth.oidc.scopes` | `KOBS_HUB_AUTH_OIDC_SCOPES` | The scopes which should be returned by the OIDC provider. | `openid,profile,email,groups` |
| `--hub.auth.session.token` | `KOBS_HUB_AUTH_SESSION_TOKEN` | The signing token for the session. | |
| `--hub.auth.session.duration` | `KOBS_HUB_AUTH_SESSION_DURATION` | The duration for how long a user session is valid. | `168h` |
| `--hub.app.address` | `KOBS_HUB_APP_ADDRESS` | The address where the app server should listen on. | `:15219` |
| `--hub.app.assets-dir` | `KOBS_HUB_APP_ASSETS_DIR` | The directory for the frontend assets, which should be served via the app server. | `app` |

## Configuration File

The hub can also be configured via configuration file. By default kobs will look for a `config.yaml` file in the directory of the kobs binary. To set a custom location of the configuration file your can use the `--config` command-line flag or the `KOBS_CONFIG` environment variable.

```yaml
hub:
  ## Set the log format and level for the hub.
  ##
  log:
    format: json
    level: info

  ## Set the tracing configuration for the hub.
  ##
  tracer:
    enabled: false
    service: hub
    provider: jaeger
    address: http://localhost:14268/api/traces

  ## The connection string for the MongoDB, where all applications, users, teams and dashboards are stored.
  ##
  database:
    uri: mongodb://root:changeme@localhost:27017

  ## The "app" section in the configuration file is used to configure the frontend for kobs.
  ##
  app:
    settings:
      ## Enable / disable the save options, to controll if modifications to resources made via the frontend can be saved
      ## by a user or not.
      ##
      save:
        enabled: false
      ## Set the items which should be displayed in the navigation sidebar. These settings can be overwritten by a user
      ## via a User CR.
      ##
      defaultNavigation:
        - name: Home
          items:
            - name: Home
              icon: home
              link: "/"
            - name: Search
              icon: search
              link: "/search"
        - name: Resources
          items:
            - name: Applications
              icon: apps
              link: "/applications"
            - name: Topology
              icon: topology
              link: "/topology"
            - name: Teams
              icon: team
              link: "/teams"
            - name: Kubernetes Resources
              icon: kubernetes
              link: "/resources"
            - name: Plugins
              icon: plugin
              link: "/plugins"
      ## Set the dashboards which should be displayed on the home page. These settings can be overwritten by a user via
      ## a User CR.
      ##
      defaultDashboards: []

      integrations:
        ## The resources configuration section can be used to add integrations for Kubernetes Resources. Currently it is
        ## possible to add a list of default dashboards for each Kubernetes Resource via the integrations.
        ##
        resources:
          dashboards:
            # - resource: pods
            #   dashboard:
            #     name: resource-usage
            #     namespace: kobs
            #     title: Resource Usage
            #     placeholders:
            #       namespace: "<% $.metadata.namespace %>"
            #       pod: "<% $.metadata.name %>"

  auth:
    ## OIDC configuration for kobs. OIDC can be used next to the User CRs to authenticate and authorize users. The OIDC
    ## provider must be enabled explizit. If the configuration is wrong kobs will crash during the startup process.
    ##
    oidc:
      enabled: false
      ## The issuer (e.g. "https://accounts.google.com"), client id and client secret for your OIDC provider.
      ##
      issuer:
      clientID:
      clientSecret:
      ## The url where the OIDC provider redirects a user after login. Must be the URL where your kobs instance is
      ## running at.
      ##
      redirectURL: https://<changeme>/auth/callback
      ## A random string to mitigate CSRF attacks.
      ##
      state:
      ## The scopes for the OIDC provider. By default we need the "openid", "profile", "email", "groups" scope. If your
      ## OIDC provider (e.g. Google) does not support the "groups" scope you can also omit it.
      ##
      ## The "groups" scope is needed to connect a user with a team, so that you can set the permissions of users in a
      ## team and not for each single user.
      ##
      ## If you are using Google and want to use Google Groups to connect your users with teams, you can use a tool like
      ## Dex (https://dexidp.io) to get the groups of a user.
      ##
      scopes: ["openid", "profile", "email", "groups"]
    session:
      ## The token must be a random string which is used to sign the JWT token, which is generated when a user is
      ## authenticated.
      ##
      token: changeme
      ## The interval defines the lifetime of the generated token. When the token is expired the user must authenticate
      ## again.
      ##
      duration: 168h

  ## A list of plugins, which should be added to the hub. The hub plugins can be used to register plugins which are not
  ## bound to a specific cluster, e.g. the Helm or Flux plugin.
  ##
  plugins: []
    # - name: helm
    #   type: helm
    # - name: flux
    #   type: flux
    # - name: rss
    #   type: rss

  ## A list of clusters, which can be accessed via the hub. To access a cluster the address of the cluster is required.
  ## The cluster API is protected by a token, which is also required.
  ##
  clusters:
    # - name: mycluster
    #   address: http://mycluster.kobs.io
    #   token: changeme
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
