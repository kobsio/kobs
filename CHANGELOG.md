# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

NOTE: As semantic versioning states all 0.y.z releases can contain breaking changes in API (flags, grpc API, any backward compatibility). We use :warning: *Breaking change:* :warning: to mark changes that are not backward compatible (relates only to v0.y.z releases).

## Unreleased

### Added

- [#103](https://github.com/kobsio/kobs/pull/103): Add option to get user information from a request.
- [#104](https://github.com/kobsio/kobs/pull/104): Add actions for Opsgenie plugin to acknowledge, snooze and close alerts.
- [#105](https://github.com/kobsio/kobs/pull/105): Add Prometheus metrics for API requests.
- [#112](https://github.com/kobsio/kobs/pull/112): Allow mapping values in Prometheus table panel.
- [#113](https://github.com/kobsio/kobs/pull/113): Allow and improve customization of axis scaling.

### Fixed

- [#102](https://github.com/kobsio/kobs/pull/102): Fix GitHub Action for creating a new Helm release.
- [#109](https://github.com/kobsio/kobs/pull/109): Fix tooltip position in Prometheus charts.
- [#110](https://github.com/kobsio/kobs/pull/110): Fix Dashboard tabs showing wrong variables.
- [#111](https://github.com/kobsio/kobs/pull/111): Fix usage of `memo` in Dashboards and fix resources table for CRDs when a value is undefined.

### Changed

- [#106](https://github.com/kobsio/kobs/pull/106): :warning: *Breaking change:* :warning: Change Prometheus sparkline chart to allow the usage of labels.
- [#107](https://github.com/kobsio/kobs/pull/107): Add new option for Prometheus chart legend and change formatting of values.
- [#108](https://github.com/kobsio/kobs/pull/108): Improve tooltip position in all nivo charts.

## [v0.5.0](https://github.com/kobsio/kobs/releases/tag/v0.5.0) (2021-08-03)

### Added

- [#81](https://github.com/kobsio/kobs/pull/81): Add markdown plugin, which can be used to render a markdown formatted text in a dashboard panel.
- [#83](https://github.com/kobsio/kobs/pull/83): Extend Kubernetes resource with Teams, Applications and Dashboards via annotations.
- [#84](https://github.com/kobsio/kobs/pull/84): Add actions for resource, so that they can be modified or deleted within kobs.
- [#87](https://github.com/kobsio/kobs/pull/87): Rework Kiali plugin to show the topology chart from Kiali for a list of namespaces.
- [#89](https://github.com/kobsio/kobs/pull/89): Rework Opsgenie plugin to show alerts and incidents from Opsgenie.
- [#91](https://github.com/kobsio/kobs/pull/91): Add force delete option for Kubernetes resources.
- [#92](https://github.com/kobsio/kobs/pull/92): Preparation to build a own version of kobs using the [kobsio/app](https://github.com/kobsio/app) template.
- [#93](https://github.com/kobsio/kobs/pull/93): Show status of Kubernetes resource in the table of the resources plugin.
- [#97](https://github.com/kobsio/kobs/pull/97): Add support for Kiali metrics.
- [#98](https://github.com/kobsio/kobs/pull/98): Add terminal support for Kubernetes Pods.
- [#100](https://github.com/kobsio/kobs/pull/100): Add support for Ephemeral Containers.

### Fixed

- [#94](https://github.com/kobsio/kobs/pull/94): Fix variable handling for dashboards.
- [#99](https://github.com/kobsio/kobs/pull/99): Fix WebSocket connections for the Kubernetes terminal in environments with an idle timeout for all connections.

### Changed

- [#82](https://github.com/kobsio/kobs/pull/82): Improve error handling for our API.
- [#85](https://github.com/kobsio/kobs/pull/85): Improve overview page for Pods, by displaying all Containers in an expandable table and by including the current resource usage of all Containers.
- [#86](https://github.com/kobsio/kobs/pull/86): Improve overview page for Nodes, by displaying the resource metrics for the CPU, Memory and Pods.
- [#88](https://github.com/kobsio/kobs/pull/88): Improve handling of actions for Kubernetes resources.
- [#95](https://github.com/kobsio/kobs/pull/95): It is now possible to get Kubernetes resources for all namespaces by not selecting a namespace from the select box on the resources page.
- [#96](https://github.com/kobsio/kobs/pull/96): Add RSS plugin to show the latest status updates of third party services.
- [#101](https://github.com/kobsio/kobs/pull/101): Show logs in the terminal.

## [v0.4.0](https://github.com/kobsio/kobs/releases/tag/v0.4.0) (2021-07-14)

### Added

- [#74](https://github.com/kobsio/kobs/pull/74): Add new Custom Resource Definition for Dashboards as a replacement for Templates.
- [#75](https://github.com/kobsio/kobs/pull/75): Add placeholder for Dashboards, which allows users to pass custom values to Dashboards.
- [#76](https://github.com/kobsio/kobs/pull/76): Add support for variables and time ranges in Dashboards.

### Changed

- [#71](https://github.com/kobsio/kobs/pull/71): :warning: *Breaking change:* :warning: Remove protobuf as requirement and rework project structure for better plugin support.
- [#73](https://github.com/kobsio/kobs/pull/73): :warning: *Breaking change:* :warning: Add a new version for the Applications and Teams Custom Resource Definitions (v1beta1).
- [#77](https://github.com/kobsio/kobs/pull/77): :warning: *Breaking change:* :warning: Rework Prometheus plugin.
- [#78](https://github.com/kobsio/kobs/pull/78): :warning: *Breaking change:* :warning: Rework Elasticsearch plugin.
- [#79](https://github.com/kobsio/kobs/pull/79): :warning: *Breaking change:* :warning: Rework Jaeger plugin.
- [#80](https://github.com/kobsio/kobs/pull/80): Adjust documentation, demo, Helm chart and Kustomize files for the new CRDs and plugins.

## [v0.3.0](https://github.com/kobsio/kobs/releases/tag/v0.3.0) (2021-06-03)

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
