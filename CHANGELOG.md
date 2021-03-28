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

### Fixed

- [#1](https://github.com/kobsio/kobs/pull/1): Fix mobile layout for the cluster and namespace filter by using a Toolbar instead of FlexItems.
- [#9](https://github.com/kobsio/kobs/pull/9): Fix time parsing for the datasource options.

### Changed

- [#7](https://github.com/kobsio/kobs/pull/7): Share datasource options between components and allow sharing of URLs.
- [#11](https://github.com/kobsio/kobs/pull/11): :warning: *Breaking change:* :warning: Refactor cluster and application handling.
