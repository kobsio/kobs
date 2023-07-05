# cluster

The cluster can be configured using a configuration file in yaml format, command-line arguments and environment variables.

## Command-line Arguments and Environment Variables

The following command-line arguments and environment variables are available.

| Command-line Argument | Environment Variable | Description | Default |
| --------------------- | -------------------- | ----------- | ------- |
| `--config` | `KOBS_CONFIG` | The path to the configuration file for the cluster | `config.yaml` |
| `--cluster.debug.enabled` | `KOBS_CLUSTER_DEBUG_ENABLED` | Start the debug server. | `false` |
| `--cluster.debug.address` | `KOBS_CLUSTER_DEBUG_ADDRESS` | The address where the debug server should listen on. | `:15225` |
| `--cluster.log.format` | `KOBS_CLUSTER_LOG_FORMAT` | Set the output format of the logs. Must be `console` or `json`. | `console` |
| `--cluster.log.level` | `KOBS_CLUSTER_LOG_LEVEL` | Set the log level. Must be `debug`, `info`, `warn`, `error`, `fatal` or `panic`. | `info` |
| `--cluster.tracer.enabled` | `KOBS_CLUSTER_TRACER_ENABLED` | Enable tracing. | `false` |
| `--cluster.tracer.service` | `KOBS_CLUSTER_TRACER_SERVICE` | The name of the service which should be used for tracing. | `kobs` |
| `--cluster.tracer.provider` | `KOBS_CLUSTER_TRACER_PROVIDER` | The tracing provider which should be used. Must be `jaeger` or `zipkin`. | `jaeger` |
| `--cluster.tracer.address` | `KOBS_CLUSTER_TRACER_ADDRESS` | The address of the tracing provider instance. | `http://localhost:14268/api/traces` |
| `--cluster.metrics.address` | `KOBS_CLUSTER_METRICS_ADDRESS` | Set the address where the metrics server is listen on. | `:15222` |
| `--cluster.kubernetes.provider.type` | `KOBS_CLUSTER_KUBERNETES_PROVIDER_TYPE` | The provider which should be used for the Kubernetes cluster. Must be `incluster` or `kubeconfig`. | `incluster` |
| `--cluster.kubernetes.provider.kubeconfig.path` | `KOBS_CLUSTER_KUBERNETES_PROVIDER_KUBECONFIG_PATH` | The path to the Kubeconfig file, which should be used when the provider is `kubeconfig`. | |
| `--cluster.kubernetes.provider.kubeconfig.context` | `KOBS_CLUSTER_KUBERNETES_PROVIDER_KUBECONFIG_CONTEXT` | The context, which should be used from the Kubeconfig file, when the provider is `kubeconfig`. | |
| `--cluster.api.address` | `KOBS_CLUSTER_API_ADDRESS` | The address where the cluster API should listen on. | `:15221` |
| `--cluster.api.token` | `KOBS_CLUSTER_API_ADDRESS` | The token which is used to protect the cluster API. | |

## Configuration File

The cluster can also be configured via configuration file. By default kobs will look for a `config.yaml` file in the directory of the kobs binary. To set a custom location of the configuration file your can use the `--config` command-line flag or the `KOBS_CONFIG` environment variable.

```yaml
cluster:
  ## Set the log format and level for the cluster.
  ##
  log:
    format: json
    level: info

  ## Set the tracing configuration for the cluster.
  ##
  tracer:
    enabled: false
    service: cluster
    provider: jaeger
    address: http://localhost:14268/api/traces

  ## Set the Kubernetes provider. The provider defines how the Kubernetes API should be accessed. We recommend to use
  ## the "incluster" provider, when the cluster component is running inside a Kubernetes cluster. For development
  ## purposes we recommend the "kubeconfig" provider.
  ##
  kubernetes:
    provider:
      type: incluster
      # type: kubeconfig
      # kubeconfig:
      #   path: /Users/ricoberger/.kube/config
      #   context: kind-kind

  ## The token, which is used to protect the cluster API.
  ##
  api:
    token: changeme

  ## A list of plugins, which can be accessed via the cluster.
  plugins: []
    # - name: prometheus
    #   type: prometheus
    #   options:
    #     address: http://localhost:8481/select/0/prometheus
```

You can also use environment variables within the configuration file. To use an environment variable you can place the following placeholder in the config file: `${NAME_OF_THE_ENVIRONMENT_VARIABLE}`. When kobs reads the file the placeholder will be replaced, with the value of the environment variable. This allows you to provide confidential data via an environment variable, instead of putting them into the file.
