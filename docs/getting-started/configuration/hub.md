# hub

The hub can be configured using a configuration file in yaml format, command-line arguments and environment variables. The configuration file is mainly used to provide the information about all satellites. The command-line arguments and environment variables are used to customize the log behavior, tracing, authentication, etc.

## Command-line Arguments and Environment Variables

The following command-line arguments and environment variables are available.

| Command-line Argument | Environment Variable | Description | Default |
| --------------------- | -------------------- | ----------- | ------- |
| `--debug.username` | `KOBS_DEBUG_USERNAME` | The username for the debug endpoints. The endpoints are only available when a username is provided. | |
| `--debug.password` | `KOBS_DEBUG_PASSWORD` | The password for the debug endpoints. The endpoints are only available when a password is provided. | |
| `--log.format` | `KOBS_LOG_FORMAT` | Set the output format of the logs. Must be `console` or `json`.  | `console` |
| `--log.level` | `KOBS_LOG_LEVEL` | Set the log level. Must be `debug`, `info`, `warn`, `error`, `fatal` or `panic`.  | `info` |
| `--trace.enabled` | | Enable / disable tracing.  | `false` |
| `--trace.service-name` | `KOBS_TRACE_SERVICE_NAME` | The service name which should be used for tracing.  | `kobs` |
| `--trace.provider` | `KOBS_TRACE_PROVIDER` | et the trace exporter which should be used. Must be `jaeger` or `zipkin`.  | `jaeger` |
| `--trace.address` | `KOBS_TRACE_ADDRESS` | The service name which should be used for tracing.  | `http://localhost:14268/api/traces` |
| `--app.address` | `KOBS_APP_ADDRESS` | The address, where the Application server is listen on. | `:15219` |
| `--app.assets` | `KOBS_APP_ASSETS` | The location of the assets directory. | `app` |
| `--hub.address` | `KOBS_HUB_ADDRESS` | The address, where the hub is listen on. | `:15220` |
| `--hub.config` | `KOBS_HUB_CONFIG` | Path to the configuration file for the hub. | `config.yaml` |
| `--hub.mode` | `KOBS_HUB_MODE` | The mode in which the hub should be started. Must be `default`, `server` or `watcher`. | `default` |
| `--hub.store.driver` | `KOBS_HUB_STORE_DRIVER` | The database driver, which should be used for the store. Must be `bolt` or `mongodb`. | `bolt` |
| `--hub.store.uri` | `KOBS_HUB_STORE_URI` | The URI for the store. | `/tmp/kobs.db` |
| `--hub.watcher.interval` | `KOBS_HUB_WATCHER_INTERVAL` | The interval for the watcher to sync the satellite configuration. | `300s` |
| `--hub.watcher.worker` | `KOBS_HUB_WATCHER_WORKER` | The number of parallel sync processes for the watcher. | `10` |
| `--auth.enabled` | | Enable the authentication and authorization middleware. | `false` |
| `--auth.header.user` | `KOBS_AUTH_HEADER_USER` | The header, which contains the users email address. | `X-Auth-Request-Email` |
| `--auth.header.teams` | `KOBS_AUTH_HEADER_TEAMS` | The header, which contains the team groups. | `X-Auth-Request-Groups` |
| `--auth.logout.redirect` | `KOBS_AUTH_LOGOUT_REDIRECT` | The redirect url which should be used, when the user clicks on the logout button. | `X-Auth-Request-Groups` |
| `--auth.session.token` | `KOBS_AUTH_SESSION_TOKEN` | The token to encrypt the session cookie. | |
| `--auth.session.interval` | `KOBS_AUTH_SESSION_INTERVAL` | The interval for how long a session is valid. | `48h0m0s` |
| `--metrics.address` | `KOBS_METRICS_ADDRESS` | The address, where the Prometheus metrics are served. | `:15221` |

## Configuration File

The hub requires a configuration file in yaml format for the satellite configuration. By default kobs will look for a `config.yaml` file in the directory of the kobs binary. To set a custom location of the configuration file your can use the `--hub.config` command-line flag or the `KOBS_HUB_CONFIG` environment variable.

```yaml
# A list of satellites, which can be accessed via the hub. To access a satellite the address of the satellite is required. The satellite API is protected by a token.
satellites:
  - name: dev-de1
    address: https://kobssatellite-dev-de1.kobs.io
    token: unsecuretoken
  - name: stage-de1
    address: https://kobssatellite-stage-de1.kobs.io
    token: unsecuretoken
  - name: prod-de1
    address: https://kobssatellite-prod-de1.kobs.io
    token: unsecuretoken

# The api configuration is optional.
api:
  # It is possible to customize the navigation sidebar of kobs. More details can be found on the "Navigation" page in the configuration section of the docs (https://kobs.io/main/getting-started/configuration/navigation/).
  navigation:

  # It is possible to show notifications within kobs from a configured plugin. More details can be found on the "Notifications" page in the configuration section of the docs (https://kobs.io/main/getting-started/configuration/notifications/).
  notifications:

  # The resources configuration section can be used to add integrations for Kubernetes Resources. Currently it is possible to add a set of default dashboards for each Kubernetes Resource via the integrations.
  resources:
    integrations:
      dashboards:
        # In the following example we are adding a dashboard "resource-usage" from the "kobs" namespace to each Pod.
        # The configuration uses the same syntax as it is used in the "kobs.io/dashboards" annotation for resources. See https://kobs.io/main/resources/kubernetes-resources/#dashboards for more information.
        # - resource: pods
        #   dashboard:
        #     name: resource-usage
        #     namespace: kobs
        #     title: Resource Usage
        #     placeholders:
        #       namespace: "<% $.metadata.namespace %>"
        #       pod: "<% $.metadata.name %>"

  # The users configuration section can be used to show a list of default dashboards on the users profile page, when the user has not configured his profile page.
  users:
    defaultDashboards:
      # When no default dashboards are provided and authentication is enabled, the following dashboards will be shown on the users profile page:
      # - title: Teams
      #   inline:
      #     hideToolbar: true
      #     rows:
      #       - size: -1
      #         panels:
      #           - title: Teams
      #             description: The teams you are part of
      #             plugin:
      #               type: app
      #               name: userteams
      # - title: Applications
      #   inline:
      #     hideToolbar: true
      #     rows:
      #       - size: -1
      #         panels:
      #           - title: Applications
      #             description: The applications which are owned by your teams
      #             plugin:
      #               type: app
      #               name: userapplications
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
