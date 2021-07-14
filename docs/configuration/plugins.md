# Plugins

Plugins can be used to extend the functions of kobs. They can be configured using the configuration file. The useage instruction for each plugin can be found in the [plugins](../plugins/getting-started.md) section of the documentation.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| applications | [Applications](#applications) | Configure the caching behaviour for the applications plugin. | No |
| elasticsearch | [[]Elasticsearch](#elasticsearch) | Configure multiple Elasticsearch instances, which can be used within kobs. | No |
| jaeger | [[]Jaeger](#jaeger) | Configure multiple Jaeger instances, which can be used within kobs. | No |
| prometheus | [[]Prometheus](#prometheus) | Configure multiple Prometheus instances, which can be used within kobs. | No |
| resources | [Resources](#resources) | Configuration for the resources plugin. | No |

## Applications

The following configuration can be used to configure the cache duration for applications.

```yaml
plugins:
  applications:
    topologyCacheDuration: 5m
    teamsCacheDuration: 5m
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| topologyCacheDuration | [duration](https://pkg.go.dev/time#ParseDuration) | The duration for how long the topology graph should be cached. The default value is `1h`. | No |
| teamsCacheDuration | [duration](https://pkg.go.dev/time#ParseDuration) | The duration for how long the teams for an application should be cached. The default value is `1h`. | No |


## Elasticsearch

The following config can be used to grant kobs access to a Elasticsearch instance running on `elasticsearch.kobs.io` and is protected with basic authentication. The credentials will be provided by the environment variables `ES_USERANME` and `ES_PASSWORD`.

```yaml
plugins:
  elasticsearch:
    - name: Elasticsearch
      description: Elasticsearch can be used for the logs of your application.
      address: https://elasticsearch.kobs.io
      username: ${ES_USERNAME}
      password: ${ES_PASSWORD}
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Elasticsearch instance. | Yes |
| displayName | string | Name of the Elasticsearch as it is shown in the UI. | Yes |
| descriptions | string | Description of the Elasticsearch instance. | No |
| address | string | Address of the Elasticsearch instance. | Yes |
| username | string | Username to access an Elasticsearch instance via basic authentication. | No |
| password | string | Password to access an Elasticsearch instance via basic authentication. | No |
| token | string | Token to access an Elasticsearch instance via token based authentication. | No |

## Jaeger

The following configuration can be used to access a Jaeger instances running on `jaeger.kobs.io` and is protected using token based authentication. The token is loaded from the `JAEGER_TOKEN` environment variable.

```yaml
plugins:
  jaeger:
    - name: Jaeger
      description: Jaeger can be used for the traces of your application.
      address: https://jaeger.kobs.io
      token: ${JAEGER_TOKEN}
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Jaeger instance. | Yes |
| displayName | string | Name of the Elasticsearch as it is shown in the UI. | Yes |
| descriptions | string | Description of the Jaeger instance. | No |
| address | string | Address of the Jaeger instance. | Yes |
| username | string | Username to access a Jaeger instance via basic authentication. | No |
| password | string | Password to access a Jaeger instance via basic authentication. | No |
| token | string | Token to access a Jaeger instance via token based authentication. | No |

## Prometheus

The following configuration can be used to access a Prometheus instance, which is running in the same cluster as kobs.

```yaml
plugins:
  prometheus:
    - name: Prometheus
      description: Prometheus can be used for the metrics of your application.
      address: http://prometheus.istio-system.svc.cluster.local:9090
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Prometheus instance. | Yes |
| displayName | string | Name of the Elasticsearch as it is shown in the UI. | Yes |
| descriptions | string | Description of the Prometheus instance. | No |
| address | string | Address of the Prometheus instance. | Yes |
| username | string | Username to access a Prometheus instance via basic authentication. | No |
| password | string | Password to access a Prometheus instance via basic authentication. | No |
| token | string | Token to access a Prometheus instance via token based authentication. | No |

## Resources

The following configuration can be used to  forbid several resources. This means that the provided resources can not be retrieved via the kobs API.

```yaml
plugins:
  resources:
    forbidden:
      - secrets
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| forbidden | []string | A list of resources, which can not be retrieved via the kobs API. | No |
