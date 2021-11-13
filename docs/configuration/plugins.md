# Plugins

Plugins can be used to extend the functions of kobs. They can be configured using the configuration file. The useage instruction for each plugin can be found in the [plugins](../plugins/getting-started.md) section of the documentation.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| applications | [Applications](#applications) | Configure the caching behaviour for the applications plugin. | No |
| clickhouse | [[]ClickHouse](#clickhouse) | Configure multiple ClickHouse instances, which can be used within kobs. | No |
| elasticsearch | [[]Elasticsearch](#elasticsearch) | Configure multiple Elasticsearch instances, which can be used within kobs. | No |
| grafana | [[]Grafana](#grafana) | Configure multiple Grafana instances, which can be used within kobs. | No |
| istio | [[]Istio](#istio) | Configure multiple Istio instances, which can be used within kobs. | No |
| jaeger | [[]Jaeger](#jaeger) | Configure multiple Jaeger instances, which can be used within kobs. | No |
| kiali | [[]Kiali](#kiali) | Configure multiple Kiali instances, which can be used within kobs. | No |
| opsgenie | [[]Opsgenie](#opsgenie) | Configure the Opsgenie API, which can be used within kobs. | No |
| prometheus | [[]Prometheus](#prometheus) | Configure multiple Prometheus instances, which can be used within kobs. | No |
| resources | [Resources](#resources) | Configuration for the resources plugin. | No |
| sonarqube | [[]SonarQube](#sonarqube) | Configure multiple SonarQube instances, which can be used within kobs. | No |
| sql | [SQL](#sql) | Configure multiple SQL databases, which can be used within kobs. | No |

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

## ClickHouse

The ClickHouse plugin provides a user interface for the [kobsio/fluent-bit-clickhouse](https://github.com/kobsio/fluent-bit-clickhouse) Fluent Bit plugin.

The following config can be used to grant kobs access to a ClickHouse instance running at `clickhouse-clickhouse.logging.svc.cluster.local:9000`, where the logs are save in a database named `logs`. To access ClickHouse the user `admin` with the password `admin` is used.

```yaml
plugins:
  clickhouse:
    - name: ClickHouse
      description: ClickHouse is a fast open-source OLAP database management system.
      address: clickhouse-clickhouse.logging.svc.cluster.local:9000
      database: logs
      username: admin
      password: admin
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the ClickHouse instance. | Yes |
| displayName | string | Name of the ClickHouse as it is shown in the UI. | Yes |
| descriptions | string | Description of the ClickHouse instance. | No |
| address | string | Address of the ClickHouse instance. | Yes |
| username | string | Username to access a ClickHouse instance. | No |
| password | string | Password to access a ClickHouse instance. | No |
| materializedColumns | []string | A list of materialized columns. See [kobsio/fluent-bit-clickhouse](https://github.com/kobsio/fluent-bit-clickhouse#configuration) for more information. | No |

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

## Grafana

The following config can be used to grant kobs access to a Grafana instance running on `grafana.kobs.io`.

```yaml
plugins:
  grafana:
    - name: Grafana
      description: Query, visualize, alert on, and understand your data no matter where it’s stored. With Grafana you can create, explore and share all of your data through beautiful, flexible dashboards.
      internalAddress: http://grafana.monitoring.svc.cluster.local:3000
      publicAddress: https://grafana.kobs.io
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Grafana instance. | Yes |
| displayName | string | Name of the Grafana as it is shown in the UI. | Yes |
| descriptions | string | Description of the Grafana instance. | No |
| internalAddress | string | The cluster internal address of the Grafana instance. | Yes |
| publicAddress | string | The public address of the Grafana instance. | Yes |
| username | string | Username to access an Grafana instance via basic authentication. | No |
| password | string | Password to access an Grafana instance via basic authentication. | No |
| token | string | Token to access an Grafana instance via token based authentication. | No |

## Istio

The following configuration can be used to access a Istio instances using a Prometheus plugin named `prometheus` and an Clickhouse plugin named `clickhouse`.

```yaml
plugins:
  istio:
    - name: istio
      displayName: Istio
      description: Simplify observability, traffic management, security, and policy with the leading service mesh.
      prometheus:
        enabled: true
        name: prometheus
      clickhouse:
        enabled: true
        name: clickhouse
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Istio instance. | Yes |
| displayName | string | Name of the Istio as it is shown in the UI. | Yes |
| descriptions | string | Description of the Istio instance. | No |
| prometheus.enabled | boolean | Enabled the Prometheus integration for Istio. | No |
| prometheus.name | string | The name of the Prometheus instance which should be used for the Istio instance. | No |
| clickhouse.enabled | boolean | Enabled the Clickhouse integration for Istio. | No |
| clickhouse.name | string | The name of the Clickhouse instance which should be used for the Istio instance. | No |

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
| displayName | string | Name of the Jaeger as it is shown in the UI. | Yes |
| descriptions | string | Description of the Jaeger instance. | No |
| address | string | Address of the Jaeger instance. | Yes |
| username | string | Username to access a Jaeger instance via basic authentication. | No |
| password | string | Password to access a Jaeger instance via basic authentication. | No |
| token | string | Token to access a Jaeger instance via token based authentication. | No |

## Kiali

The following configuration can be used to access a Kiali instances running on `kiali.kobs.io`. We also enable the visualization of the traffic and set the threshold to mark edges with degraded performance or failures.

```yaml
plugins:
  kiali:
    - name: Kiali
      description: Service mesh management for Istio.
      address: https://kiali.kobs.io
      traffic:
        degraded: 1
        failure: 5
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Kiali instance. | Yes |
| displayName | string | Name of the Kiali instance as it is shown in the UI. | Yes |
| descriptions | string | Description of the Kiali instance. | No |
| address | string | Address of the Kiali instance. | Yes |
| username | string | Username to access a Kiali instance via basic authentication. | No |
| password | string | Password to access a Kiali instance via basic authentication. | No |
| token | string | Token to access a Kiali instance via token based authentication. | No |
| traffic.failure | number | Threshold to mark edges with failures. This must be a number between `0` and `100`. The default value is `5`. | No |
| traffic.degraded | number | Threshold to mark edges with degraded performance. This must be a number between `0` and `100`. The default value is `1`. | No |

## Opsgenie

The following configuration can be used to access the Opsgenie API.

```yaml
plugins:
  opsgenie:
    - name: opsgenie
      displayName: Opsgenie
      description: On-call and alert management to keep services always on.
      apiUrl: api.eu.opsgenie.com
      apiKey: ${OPSGENIE_API_KEY}
      url: https://<your-organisation>.app.eu.opsgenie.com
      actions:
        acknowledge: true
        snooze: true
        close: true
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the Opsgenie instance. | Yes |
| displayName | string | Name of the Opsgenie instance as it is shown in the UI. | Yes |
| descriptions | string | Description of the Opsgenie instance. | No |
| apiKey | string | API Key for the Opsgenie API. More information can be found at [API key management](https://support.atlassian.com/opsgenie/docs/api-key-management/). | Yes |
| apiUrl | string | API URL for the Opsgenie API. Must be `api.opsgenie.com` or `api.eu.opsgenie.com`. | Yes |
| url | string | The address for the Opsgenie account of your organisation. | No |
| actions.acknowledge | boolean | Allow users to acknowledge Opsgenie alerts via kobs. | No |
| actions.snooze | boolean | Allow users to snooze Opsgenie alerts via kobs. | No |
| actions.close | boolean | Allow users to close Opsgenie alerts via kobs. | No |

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
| displayName | string | Name of the Prometheus as it is shown in the UI. | Yes |
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
    webSocket:
      address: ws://localhost:15220
      allowAllOrigins: true
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| forbidden | []string | A list of resources, which can not be retrieved via the kobs API. | No |
| webSocket.address | string | The address, which should be used for the WebSocket connection. By default this will be the current host, but it can be overwritten for development purposes. | No |
| webSocket.allowAllOrigins | boolean | When this is `true`, WebSocket connections are allowed for all origins. This should only be used for development. | No |
| ephemeralContainers | [[]EphemeralContainer](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#ephemeralcontainer-v1-core) | A list of templates for Ephemeral Containers, which can be used to [debug running pods](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-running-pod/#ephemeral-container). | No |

## SonarQube

The following configuration can be used to access a SonarQube instance, which is running at `https://sonarqube.kobs.io` and a token from the `SONARQUBE_TOKEN` environment variable.

```yaml
plugins:
  sonarqube:
    - name: SonarQube
      description: SonarQube empowers all developers to write cleaner and safer code.
      address: https://sonarqube.kobs.io
      username: ${SONARQUBE_TOKEN}
      password:
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the SonarQube instance. | Yes |
| displayName | string | Name of the SonarQube as it is shown in the UI. | Yes |
| descriptions | string | Description of the SonarQube instance. | No |
| address | string | Address of the SonarQube instance. | Yes |
| username | string | Username to access a SonarQube instance via basic authentication. | No |
| password | string | Password to access a SonarQube instance via basic authentication. | No |
| metricKeys | []string | An optional list of metric keys which should be displayed for all projects. If this value is not provided the following list will be used: `alert_status`, `bugs`, `reliability_rating`, `vulnerabilities`, `security_rating`, `security_hotspots_reviewed`, `security_review_rating`, `code_smells`, `sqale_rating`, `coverage`, `duplicated_lines_density`. | No |

## SQL

The following config can be used to grant kobs access to a ClickHouse database running at `clickhouse-clickhouse.logging.svc.cluster.local:9000`. To access ClickHouse the user `admin` with the password provided via the `CLICKHOUSE_PASSWORD` environment variable is used.

```yaml
plugins:
  sql:
    - name: sql
      displayName: SQL
      connection: tcp://clickhouse-clickhouse.logging.svc.cluster.local:9000?username=admin&password=${CLICKHOUSE_PASSWORD}&database=logs
      driver: clickhouse
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the ClickHouse instance. | Yes |
| displayName | string | Name of the ClickHouse as it is shown in the UI. | Yes |
| descriptions | string | Description of the ClickHouse instance. | No |
| connection | string | The connection string, to connect to a SQL database. | Yes |
| driver | string | The driver which should be used for the database instance. This must be `clickhouse`, `postgres` or `mysql`. | Yes |
