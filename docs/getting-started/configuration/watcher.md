# watcher

The watcher can be configured using a configuration file in yaml format, command-line arguments and environment variables.

## Command-line Arguments and Environment Variables

The following command-line arguments and environment variables are available.

| Command-line Argument | Environment Variable | Description | Default |
| --------------------- | -------------------- | ----------- | ------- |
| `--config` | `KOBS_CONFIG` | The path to the configuration file for the watcher | `config.yaml` |
| `--watcher.debug.enabled` | `KOBS_WATCHER_DEBUG_ENABLED` | Start the debug server. | `false` |
| `--watcher.debug.address` | `KOBS_WATCHER_DEBUG_ADDRESS` | The address where the debug server should listen on. | `:15225` |
| `--watcher.log.format` | `KOBS_WATCHER_LOG_FORMAT` | Set the output format of the logs. Must be `console` or `json`. | `console` |
| `--watcher.log.level` | `KOBS_WATCHER_LOG_LEVEL` | Set the log level. Must be `debug`, `info`, `warn`, `error`, `fatal` or `panic`. | `info` |
| `--watcher.tracer.enabled` | `KOBS_WATCHER_TRACER_ENABLED` | Enable tracing. | `false` |
| `--watcher.tracer.service` | `KOBS_WATCHER_TRACER_SERVICE` | The name of the service which should be used for tracing. | `kobs` |
| `--watcher.tracer.provider` | `KOBS_WATCHER_TRACER_PROVIDER` | The tracing provider which should be used. Must be `jaeger` or `zipkin`. | `jaeger` |
| `--watcher.tracer.address` | `KOBS_WATCHER_TRACER_ADDRESS` | The address of the tracing provider instance. | `http://localhost:14268/api/traces` |
| `--watcher.metrics.address` | `KOBS_WATCHER_METRICS_ADDRESS` | Set the address where the metrics server is listen on. | `:15222` |
| `--watcher.database.uri` | `KOBS_WATCHER_DATABASE_URI` | The connection uri for MongoDB | `mongodb://localhost:27017` |
| `--watcher.watcher.interval` | `KOBS_WATCHER_WATCHER_INTERVAL` | Set the interval to sync all resources from the clusters to the hub. | `300s` |
| `--watcher.watcher.workers` | `KOBS_WATCHER_WATCHER_WORKERS` | The number of workers (goroutines) to spawn for the sync process. | `10` |

## Configuration File

The watcher can also be configured via configuration file. By default kobs will look for a `config.yaml` file in the directory of the kobs binary. To set a custom location of the configuration file your can use the `--config` command-line flag or the `KOBS_CONFIG` environment variable.

```yaml
watcher:
  ## Set the log format and level for the watcher.
  ##
  log:
    format: json
    level: info

  ## Set the tracing configuration for the watcher.
  ##
  tracer:
    enabled: false
    service: watcher
    provider: jaeger
    address: http://localhost:14268/api/traces

  ## A list of clusters, which can be synced via the watcher. To sync a cluster the address of the cluster is required.
  ## The cluster API is protected by a token, which is also required.
  ##
  clusters:
    # - name: mycluster
    #   address: http://mycluster.kobs.io
    #   token: changeme
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
