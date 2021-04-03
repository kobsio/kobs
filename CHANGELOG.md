# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

NOTE: As semantic versioning states all 0.y.z releases can contain breaking changes in API (flags, grpc API, any backward compatibility). We use :warning: *Breaking change:* :warning: to mark changes that are not backward compatible (relates only to v0.y.z releases).

## Unreleased

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
