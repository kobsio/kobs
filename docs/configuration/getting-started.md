# Getting Started

kobs can be configured using a configuration file in yaml format, command-line arguments and environment variables. The configuration file is used to provide the cluster and plugin configuration. The command-line arguments and environment variables are used to customize the log behavior, ports or cache duration.

## Command-line Arguments and Environment Variables

The following command-line arguments and environment variables are available.

| Command-line Argument | Environment Variable | Description | Default |
| --------------------- | -------------------- | ----------- | ------- |
| `--api.address` | `KOBS_API_ADDRESS` | The address, where the API server is listen on. | `:15220` |
| `--api.auth.default-team` | `KOBS_API_AUTH_DEFAULT_TEAM` | The name of the team, which should be used for a users permissions when a user hasn't any teams. The team is specified in the following format: `cluster,namespace,name` | |
| `--api.auth.enabled` | | Enable the authentication and authorization middleware. | `false` |
| `--api.auth.header` | `KOBS_API_AUTH_HEADER` | The header, which contains the details about the authenticated user. More information can be found in the [Authentication](authentication.md) section. | `X-Auth-Request-Email` |
| `--api.auth.interval` | `KOBS_API_AUTH_INTERVAL` | The interval to refresh the internal users list and there permissions. | `1h0m0s` |
| `--app.address` | `KOBS_APP_ADDRESS` | The address, where the Application server is listen on. | `:15219` |
| `--app.assets` | `KOBS_APP_ASSETS` | The location of the assets directory. | `app/build` |
| `--clusters.cache-duration.namespaces` | `KOBS_CLUSTERS_CACHE_DURATION_NAMESPACES` | The duration, for how long requests to get the list of namespaces should be cached. | `5m` |
| `--config` | `KOBS_CONFIG` | Name of the configuration file.  | `config.yaml` |
| `--log.format` | `KOBS_LOG_FORMAT` | Set the output format of the logs. Must be `plain` or `json`.  | `plain` |
| `--log.level` | `KOBS_LOG_LEVEL` | Set the log level. Must be `trace`, `debug`, `info`, `warn`, `error`, `fatal` or `panic`.  | `info` |
| `--metrics.address` | `KOBS_METRICS_ADDRESS` | The address, where the Prometheus metrics are served. | `:15221` |
| `--version` | | Print version information.  | `false` |

## Configuration File

kobs requires a configuration file in yaml format for the cluster and plugin configuration. By default kobs will look for a `config.yaml` file in the directory of the kobs binary. To set a custom location of the configuration file your can use the `--config` command-line flag or the `KOBS_CONFIG` environment variable.

The config file consists of two section. The first one is the [clusters configuration](clusters.md), which is used to configure the access to a Kubernetes cluster for kobs. The second section is used to configure all [plugins](plugins.md) for kobs.

```yaml
clusters:
  providers:
    - provider: incluster
      incluster:
        name: kobs-demo

plugins:
  prometheus:
    - name: prometheus
      displayName: Prometheus
      description: "From metrics to insight: Power your metrics and alerting with a leading open-source monitoring solution."
      address: http://prometheus.istio-system.svc.cluster.local:9090

  elasticsearch:
    - name: elasticsearch
      displayName: Elasticsearch
      description: "A distributed, RESTful search and analytics engine capable of addressing a growing number of use cases."
      address: http://elasticsearch-es-http.elastic-system.svc.cluster.local:9200

  jaeger:
    - name: jaeger
      displayName: Jaeger
      description: "Open-source, end-to-end distributed tracing: Monitor and troubleshoot transactions in complex distributed systems"
      address: http://tracing.istio-system.svc.cluster.local:80/jaeger
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
