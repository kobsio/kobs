# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

NOTE: As semantic versioning states all 0.y.z releases can contain breaking changes in API (flags, grpc API, any backward compatibility). We use :warning: *Breaking change:* :warning: to mark changes that are not backward compatible (relates only to v0.y.z releases).

## Unreleased

### Added

- [#45](https://github.com/kobsio/kobs/pull/45): Add value mappings for `sparkline` charts in the Prometheus plugin.
- [#49](https://github.com/kobsio/kobs/pull/49): Add new chart type `table` for Prometheus plugin, which allows a user to render the results of multiple Prometheus queries in ab table.
- [#51](https://github.com/kobsio/kobs/pull/51): Add new command-line flag to forbid access for resources.
- [#52](https://github.com/kobsio/kobs/pull/52): Add option to enter a single trace id in the Jaeger plugin.
- [#56](https://github.com/kobsio/kobs/pull/56): Add actions for Elasticsearch plugin to include/exclude and toggle values in the logs view.
- [#58](https://github.com/kobsio/kobs/pull/58): Add plugin support for Teams. It is now possible to define plugins within a Team CR, which are then added to the teams page in the React UI.
- [#59](https://github.com/kobsio/kobs/pull/59): Add support for Templates via the new Templates CRD. Templates allows a user to reuse plugin definitions accross Applications, Teams and Kubernetes resources.
- [#60](https://github.com/kobsio/kobs/pull/60): Add support for additional Pod annotations and labels in the Helm chart via the new `podAnnotations` and `podLabels` values.
- [#63](https://github.com/kobsio/kobs/pull/63): Add Kiali plugin (in the current version the Kiali plugin only supports the graph feature from Kiali).
- [#66](https://github.com/kobsio/kobs/pull/66): Add edge metrics for Kiali plugin.

### Fixed

- [#43](https://github.com/kobsio/kobs/pull/43): Fix `hosts` and `gateways` list for VirtualService in the Helm chart.
- [#44](https://github.com/kobsio/kobs/pull/44): Add default logo for teams, which is shown when a team doesn't provide a logo and improve metrics lookup for Prometheus plugin.
- [#50](https://github.com/kobsio/kobs/pull/50): Fix determination of the root span in the Jaeger plugin.
- [#54](https://github.com/kobsio/kobs/pull/54): Fix fields handling in Elasticsearch plugin.

### Changed

- [#46](https://github.com/kobsio/kobs/pull/46): Support multiple types for the legend in a Prometheus chart and use a custom component to render the legend.
- [#47](https://github.com/kobsio/kobs/pull/47): Display the legend at the Prometheus page as table and use color of selected metric in chart.
- [#53](https://github.com/kobsio/kobs/pull/53): Improve Jaeger plugin, by allow filtering of services and operations and adding several actions for traces.
- [#55](https://github.com/kobsio/kobs/pull/55): Allow a user to add a tag from a span as filter in the Jaeger plugin.
- [#57](https://github.com/kobsio/kobs/pull/57): Visualize the offset of spans in the Jaeger plugin.
- [#61](https://github.com/kobsio/kobs/pull/61): Improve caching logic, by generating the teams and topology graph only when it is requested and not via an additional goroutine.
- [#62](https://github.com/kobsio/kobs/pull/62): Show the name of a variable within the select box in the Prometheus dashboards.
- [#64](https://github.com/kobsio/kobs/pull/64): Recreate Pods when ConfigMap in Helm chart is changed.
- [#67](https://github.com/kobsio/kobs/pull/67): :warning: *Breaking change:* :warning: Adjust Pod and Service labels, which can now be set via the `pod.labels`, `pod.annotations`, `service.labels` and `service.annotations` values.

## [v0.2.0](https://github.com/kobsio/kobs/releases/tag/v0.2.0) (2021-04-23)

### Added

- [#29](https://github.com/kobsio/kobs/pull/29): Add a new dependencies section to the Application CR. These dependencies are used to show a topology graph for all Applications.
- [#31](https://github.com/kobsio/kobs/pull/31): Add plugin support for Kubernetes resources.
- [#32](https://github.com/kobsio/kobs/pull/32): Add support for container logs via the Kubernetes API.
- [#34](https://github.com/kobsio/kobs/pull/34): Add a new Custom Resource Definition for Teams. Teams can be used to define the ownership for Applications and other Kubernetes resources. :warning: *Breaking change:* :warning: We are now using the `apiextensions.k8s.io/v1` API for the Custom Resource Definitions of kobs.
- [#39](https://github.com/kobsio/kobs/pull/39): Add Opsgenie plugin to view alerts within an Application.
- [#40](https://github.com/kobsio/kobs/pull/40): Add metric name suggestions for Prometheus plugin.
- [#41](https://github.com/kobsio/kobs/pull/41): Add overview and Pods tab for resource details.
- [#42](https://github.com/kobsio/kobs/pull/42): Add VirtualService specification for Istio to the Helm chart.

### Fixed

- [#33](https://github.com/kobsio/kobs/pull/33): Fix the topology graph, which crashes, when an Application has a dependency to an Application, which doesn't exists.

### Changed

- [#30](https://github.com/kobsio/kobs/pull/30): Support multiple versions of a CRD and allow the specification of namespaces in the Applications resources list.
- [#35](https://github.com/kobsio/kobs/pull/35): Add new field `displayName` for plugins, to overwrite the name which is displayed for a plugin tab in the frontend.

## [v0.1.0](https://github.com/kobsio/kobs/releases/tag/v0.1.0) (2021-04-04)

### Added

- [#4](https://github.com/kobsio/kobs/pull/4): Add Custom Resource Definition for Applications.
- [#6](https://github.com/kobsio/kobs/pull/6): Add Prometheus as datasource for Application metrics.
- [#8](https://github.com/kobsio/kobs/pull/8): Add new page to directly query a configured Prometheus datasource.
- [#10](https://github.com/kobsio/kobs/pull/10): Add Elasticsearch as datasource for Application logs.
- [#12](https://github.com/kobsio/kobs/pull/12): :warning: *Breaking change:* :warning: Add plugin system and readd Prometheus and Elasticsearch as plugins.
- [#13](https://github.com/kobsio/kobs/pull/13): Add Jaeger plugin to show traces for an Application and to compare traces.
- [#16](https://github.com/kobsio/kobs/pull/16): Add support for multiple queries in the Prometheus plugin page.
- [#18](https://github.com/kobsio/kobs/pull/18): Add metrics and logs for the gRPC server.
- [#19](https://github.com/kobsio/kobs/pull/19): Use multiple colors in the Jaeger plugin. Each service in a trace has a unique color now, which is used for the charts.
- [#21](https://github.com/kobsio/kobs/pull/21): Add preview for Applications via plugins.
- [#22](https://github.com/kobsio/kobs/pull/22): Add Helm chart.
- [#23](https://github.com/kobsio/kobs/pull/23): Add Kustomize files and demo.
- [#24](https://github.com/kobsio/kobs/pull/24): Add documentation.
- [#26](https://github.com/kobsio/kobs/pull/26): Add support for all Kubernetes resources.

### Fixed

- [#1](https://github.com/kobsio/kobs/pull/1): Fix mobile layout for the cluster and namespace filter by using a Toolbar instead of FlexItems.
- [#9](https://github.com/kobsio/kobs/pull/9): Fix time parsing for the datasource options.
- [#14](https://github.com/kobsio/kobs/pull/14): Fix loading of Jaeger services, when a user opend the Jaeger plugin, where the `service` query parameter was already present.
- [#15](https://github.com/kobsio/kobs/pull/15): Fix resources tab of an Application, where resources were loaded multiple times.

### Changed

- [#7](https://github.com/kobsio/kobs/pull/7): Share datasource options between components and allow sharing of URLs.
- [#11](https://github.com/kobsio/kobs/pull/11): :warning: *Breaking change:* :warning: Refactor cluster and application handling.
- [#17](https://github.com/kobsio/kobs/pull/17): Use location to load applications, which allows user to share their applications view.
- [#20](https://github.com/kobsio/kobs/pull/20): Rework usage of icons, links handling and drawer layout.
- [#25](https://github.com/kobsio/kobs/pull/25): Change the URL for the Helm repository to [helm.kobs.io](https://helm.kobs.io).
