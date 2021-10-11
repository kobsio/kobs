# kobs - Kubernetes Observability Platform

**kobs** is an extensible observability platform for Kubernetes, which brings your metrics, logs, traces and Kubernetes resources into one place.

![Screenshot](assets/images/screenshot.png)

kobs brings your metrics, logs, traces and Kubernetes into one place, to provide a better observability for your applications running in your clusters. kobs provides various Custom Resource Definition with which you can describe and group your applications across multiple clusters. You can extend kobs via plugin, to customize it for your needs or you can use one of the available plugins to improve your developer experience.

## Features

- **Multi-Cluster Support:** kobs has built-in multi cluster support. The clusters are configured via the available [providers](https://kobs.io/configuration/clusters/#provider).
- **Manage all your Kubernetes Resources:** All major resources like Deployments, StatefulSets, DaemonSets, Pods, etc. are supported.
- **Custom Resource Definitions:** View all Custom Resource Definitions and mange Custom Resources.
- **Modify Resources:** Edit and delete all available resources or scale your Deployments and StatefulSets.
- **Resource Usage, Logs and Terminal:** View the CPU and Memory usage and logs of your Pods or exec into them.
- **Topology:** Add your applications, teams and users to kobs via the available Custom Resource Definitions or create dashboards to see how your applications are connected.
- **Extendible:** Customize your kobs instance via plugins.
- **Prometheus:** Access your Prometheus directly in kobs next to your Kubernetes resources.
- **Elasticsearch and Jaeger:** View the logs from Elasticsearch and traces from Jaeger, where it matters.
- **Istio:** Get the topology graph from Kiali for your Istio service mesh directly in kobs.
- **Authentication and Authorization:** Manage the access to kobs via [OAuth2-Proxy](https://oauth2-proxy.github.io/oauth2-proxy/) and provide your developers the permissions they need via Teams and Users CRs.
