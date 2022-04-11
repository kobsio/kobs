<!--
 Template: https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-madr/index.md
-->
# ADR001: Facilitate Centralized Instance

* Status: proposed  <!-- [proposed | rejected | accepted | deprecated | … | superseded by [ADR-0005](0005-example.md)] -->
* Date: 2022-04-11 <!-- [YYYY-MM-DD when the decision was last updated] -->

## Context and Problem Statement

Today, kobs has a built-in multi cluster support, but this requires to expose data sources like Prometheus or Elasticsearch to the internet if the _central_ kobs instance is running in another network.

This comes with a lot of necessary configuration and security concerns.

## Decision Drivers <!-- optional -->

If there is a multi-cluster setup (e.g. to implement multi-tenancy) and e.g. for security reasons it is not possible to expose the data sources one have to run a kobs instance for every Kubernetes cluster.
As a result, there is no one place to centrally access observability data.

## Considered Options

* Central instance access data from other Kubernetes clusters via KubeAPI
* Rework architecture and introduce an in-cluster component

## Decision Outcome

Chosen option: "Rework Architecture", because expose KubeAPI and provide a `.kubeconfig` comes with security concerns.

This ADR describes the architectural changes necessary to enable a centralized kobs instance that can access data from multiple environments without having to expose the various data sources.

## Decision Details

Rework the architecture and introduce new components:

- kobs Hub
- kobs Satellite

The communication between Hub and Satellite is HTTP based.

``` mermaid
graph LR
    usr((User)) --> hub(Hub)
    hub --> sat1(Satellite)
    hub --> sat2(Satellite)
    hub --> sat3(...)
    sat1 --> p11(Plugin)
    sat1 --> p12(Plugin)
    sat2 --> p21(Plugin)
    sat2 --> p22(...)
```

### kobs Satellite

- A Satellite is running in every Kubernetes cluster and knows how to communicate with the data sources for the particular plugins.
- The Satellite gets called by Hub
- A Satellite can be utilized by multiple Hubs

### kobs Hub

- The Hub knows about Satellites
- kobs Hub is the central component which aggregates the data from Satellites and make it accessible via a UI.
- For performance and resilience reasons a cache is added to the Hub

### Configuration

Let's briefly describe the options which can be used for configuring the hub to satellite communication.

#### Option 1: Satellite Self-Registration

- A Satellite got a configuration where the Hub is running
- Satellite performs a register call on start-up
- Satellite send heart-beat to Hub

Pros:
- Less configuration on Hub
- Suitable for many Satellites

Cons:
- Unclear how to implement un-register when a Satellite is no-longer running (e.g. a cluster was deleted)

#### Option 2: Static Hub Configuration

- List of known Satellites is a static Hub configuration

Pros:
- No un-/register logic needs to be implemented
- No configuration on Satellite

Cons:
- Configuration list of Satellites might become large in setups with a lot of clusters
- Adding Satellites remains a manual task

#### Decision

Option 2 ("static Hub configuration") is chosen, because of less complexity and currently no setups with large number of clusters is known.


### Positive Consequences <!-- optional -->

* It will facilitate the development of new plugins for integration with other services.

### Negative Consequences <!-- optional -->

* This will require subsequent rework for kobs [Application](https://kobs.io/main/resources/applications/)
