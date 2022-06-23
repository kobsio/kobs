# satellite

The satellite can be configured using a configuration file in yaml format, command-line arguments and environment variables. The configuration file is mainly used to provide the cluster and plugin configuration. The command-line arguments and environment variables are used to customize the log behavior, tracing, etc.

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
| `--satellite.address` | `KOBS_SATELLITE_ADDRESS` | The address, where the satellite is listen on. | `:15221` |
| `--satellite.config` | `KOBS_SATELLITE_CONFIG` | Path to the configuration file for the hub. | `config.yaml` |
| `--satellite.plugins` | `KOBS_SATELLITE_PLUGINS` |The directory which contains the plugin files. | `plugins` |
| `--satellite.token` | `KOBS_SATELLITE_TOKEN` | A token to protect the kobs satellite. | |
| `--metrics.address` | `KOBS_METRICS_ADDRESS` | The address, where the Prometheus metrics are served. | `:15221` |

## Configuration File

The satellite requires a configuration file in yaml format for the cluster and plugin configuration. By default kobs will look for a `config.yaml` file in the directory of the kobs binary. To set a custom location of the configuration file your can use the `--satellite.config` command-line flag or the `KOBS_SATELLITE_CONFIG` environment variable.

```yaml
# The clusters configuration, to provide a satellite the required information on how to access the Kubernetes API.
clusters:
  providers:
    # The incluster provider can be used, when the satellite runs inside a Kubernetes cluster to access the API. The permissions can then be configured via a ServiceAccount.
    - provider: incluster
      incluster:
        name: kobs-demo
    # The kubeconfig provider can be used, when the satellite should be used to access multiple clusters, which are configured via a Kubeconfig file.
    - provider: kubeconfig
      kubeconfig:
        path: ${HOME}/.kube/config

# The plugins section is used to configure all plugins which can be accessed by the satellite. For each plugin a "name" and "type" must be provided.
plugins:
  - name: prometheus
    type: prometheus
    # The "description" field is optional and can be used to overwrite the default description which is displayed in the frontend.
    # description:
    options:
      address: http://prometheus.istio-system.svc.cluster.local:9090
  - name: opsgenie
    type: opsgenie
    # The "options" field can be used to provide additional configuration options for each plugin. The format of this section can be found in the corresponding plugin documentation.
    options:
      apiKey:
      apiURL:
      permissionsEnabled: false
    # The "frontendOptions" field can be used to provide additional configuration options for each plugin, which are used in the UI. The format of this section can be found in the corresponding plugin documentation.
    frontendOptions:
      url:

# The api configuration is optional.
api:
  # The resources configuration can be used to forbid the access to Kubernetes resources via the the satellite. For example when the satellite is installed via the Helm chart with the default RBAC configuration, it would be possible to access all resources:
  #
  # - apiGroups:
  #     - '*'
  #   resources:
  #     - '*'
  #   verbs:
  #     - 'get'
  #     - 'watch'
  #     - 'list'
  # - nonResourceURLs:
  #     - '*'
  #   verbs:
  #     - 'get'
  #     - 'watch'
  #     - 'list'
  #
  # If we now want to restrict the access to secrets the resources.forbidden filed can be used.
  resources:
    forbidden:
      # Each resource is identified by a list of "clusters", "namespaces", "resources" and "verbs" (similar to the permissions which can be set for a user).
      #
      # In the following we forbid to list or edit secrets for all clusters and namespaces, which can be accessed via the satellite.
      - clusters:
          - "*"
        namespaces:
          - "*"
        resources:
          - "secrets"
        verbs:
          - "*"
      # In the following we forbid users to exec into a Pod in the kobs namespace.
      - clusters:
          - "*"
        namespaces:
          - "kobs"
        resources:
          - "pods/exec"
        verbs:
          - "*"
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
