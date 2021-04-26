# Getting Started

kobs can be configured using a configuration file in yaml format, command-line arguments and environment variables. The configuration file is used to provide the cluster and plugin configuration. The command-line arguments and environment variables are used to customize the log behavior, ports or cache duration.

## Command-line Arguments and Environment Variables

The following command-line arguments and environment variables are available.

| Command-line Argument | Environment Variable | Description | Default |
| --------------------- | -------------------- | ----------- | ------- |
| `--api.address` | `KOBS_API_ADDRESS` | The address, where the API server is listen on. | `:15220` |
| `--app.address` | `KOBS_APP_ADDRESS` | The address, where the Application server is listen on. | `:15219` |
| `--app.assets` | `KOBS_APP_ASSETS` | The location of the assets directory. | `app/build` |
| `--clusters.cache-duration.namespaces` | `KOBS_CLUSTERS_CACHE_DURATION_NAMESPACES` | The duration, for how long requests to get the list of namespaces should be cached. | `5m` |
| `--clusters.cache-duration.teams` | `KOBS_CLUSTERS_CACHE_DURATION_TEAMS` | The duration, for how long the teams data should be cached. | `60m` |
| `--clusters.cache-duration.topology` | `KOBS_CLUSTERS_CACHE_DURATION_TOPOLOGY` | The duration, for how long the topology data should be cached. | `60m` |
| `--clusters.forbidden-resources` | `KOBS_CLUSTERS_FORBIDDEN_RESOURCES` | A list of resources, which can not be accessed via kobs. | |
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

prometheus:
  - name: Prometheus
    description: Prometheus can be used for the metrics of your application.
    address: http://prometheus:9090

elasticsearch:
  - name: Elasticsearch
    description: Elasticsearch can be used for the logs of your application.
    address: http://elasticsearch-es-http:9200

jaeger:
  - name: Jaeger
    description: Jaeger can be used for the traces of your application.
    address: http://tracing:80/jaeger
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
