# Getting Started

Plugins can be used to extend the functionality of kobs. For example you can use Prometheus to display metrics, Elasticsearch to display logs or Jaeger to display traces for your application within kobs.

All the configured plugins can be found on the home page of kobs. From this page you can use the configured plugins directly.

![Home](assets/home.png)

## Specification

Plugins can also be used as preview for an application or within a dashboard panel:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the plugin as it is defined in the [configuration file](../configuration/plugins.md). Or one of the special values `applications`, `dashboards`, `resources` or `dashboards` for these core plugins. | Yes |
| options | any | Plugin specific options as they are defined at the plugins page (e.g. PromQL query). | Yes |

## Community Plugins
