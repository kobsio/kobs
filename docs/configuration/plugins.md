# Plugins

Plugins can be used to extend the functions of kobs. They can be configured using the configuration file. The useage instruction for each plugin can be found in the [plugins](../plugins/getting-started.md) section of the documentation.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| elasticsearch | [[]Elasticsearch](#elasticsearch) | Configure multiple Elasticsearch instances, which can be used within kobs. | No |
| jaeger | [[]Jaeger](#jaeger) | Configure multiple Jaeger instances, which can be used within kobs. | No |
| prometheus | [[]Prometheus](#prometheus) | Configure multiple Prometheus instances, which can be used within kobs. | No |

## Elasticsearch

The following config can be used to grant kobs access to a Elasticsearch instance running on `elasticsearch.kobs.io` and is protected with basic authentication. The credentials will be provided by the environment variables `ES_USERANME` and `ES_PASSWORD`.

```yaml
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
| descriptions | string | Description of the Elasticsearch instance. | No |
| address | string | Address of the Elasticsearch instance. | Yes |
| username | string | Username to access an Elasticsearch instance via basic authentication. | No |
| password | string | Password to access an Elasticsearch instance via basic authentication. | No |
| token | string | Token to access an Elasticsearch instance via token based authentication. | No |

## Jaeger

The following configuration can be used to access a Jaeger instances running on `jaeger.kobs.io` and is protected using token based authentication. The token is loaded from the `JAEGER_TOKEN` environment variable.

```yaml
jaeger:
  - name: Jaeger
    description: Jaeger can be used for the traces of your application.
    address: https://jaeger.kobs.io
    token: ${JAEGER_TOKEN}
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Jaeger instance. | Yes |
| descriptions | string | Description of the Jaeger instance. | No |
| address | string | Address of the Jaeger instance. | Yes |
| username | string | Username to access a Jaeger instance via basic authentication. | No |
| password | string | Password to access a Jaeger instance via basic authentication. | No |
| token | string | Token to access a Jaeger instance via token based authentication. | No |

## Opsgenie

The following configuration can be used to access the Opsgenie API.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Opsgenie instance. | Yes |
| descriptions | string | Description of the Opsgenie instance. | No |
| apiKey | string | API Key for the Opsgenie API. More information can be found at [API key management](https://support.atlassian.com/opsgenie/docs/api-key-management/). | Yes |
| apiUrl | string | API URL for the Opsgenie API. Must be `api.opsgenie.com` or `api.eu.opsgenie.com`. | Yes |

## Prometheus

The following configuration can be used to access a Prometheus instance, which is running in the same cluster as kobs.

```yaml
prometheus:
  - name: Prometheus
    description: Prometheus can be used for the metrics of your application.
    address: http://prometheus.observability.svc.cluster.local:9090
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Prometheus instance. | Yes |
| descriptions | string | Description of the Prometheus instance. | No |
| address | string | Address of the Prometheus instance. | Yes |
| username | string | Username to access a Prometheus instance via basic authentication. | No |
| password | string | Password to access a Prometheus instance via basic authentication. | No |
| token | string | Token to access a Prometheus instance via token based authentication. | No |
