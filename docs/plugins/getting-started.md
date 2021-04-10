# Getting Started

Plugins can be used to extend the functionality of kobs. For example you can use Prometheus to display metrics, Elasticsearch to display logs or Jaeger to display traces for your application within kobs.

All the configured plugins can be found on the home page of kobs. From this page you can use the configured plugins directly.

![Home](assets/home.png)

## Specification

Plugins can also be used within an Application CR to enhance the information for an application.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the plugin as it is defined in the [configuration file](../configuration/plugins.md). | Yes |
| displayName | string | An optional name for the plugin tab, which should be displayed instead of the plugin name. | No |
| elasticsearch | [Elasticsearch](elasticsearch.md#specification) (oneof) | Elasticsearch configuration for the application. | Yes |
| jaeger | [Jaeger](jaeger.md#specification) (oneof) | Jaeger configuration for the application. | Yes |
| prometheus | [Prometheus](prometheus.md#specification) (oneof) | Prometheus configuration for the application. | Yes |
