# Templates

Templates are an extension of kobs via the [Template Custom Resource Definition](https://github.com/kobsio/kobs/blob/main/deploy/kustomize/crds/kobs.io_templates.yaml). Templates can be used to resource plugin definitions accross Applications, Teams and Kubernetes resources.

!!! note
    The list of templates is cached for the specified cache duration (default `60m`). This means that it is possible that not all templates are directly available after they were created.

## Specification

In the following you can found the specification for the Template CRD.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| description | string | A description for the template. | Yes |
| variables | [[]Variable](#variable) | A list of the used variables in the template. | Yes |
| plugin | [Plugin](../plugins/getting-started.md#specification) | Yes |

### Variable

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | The name of the variable. | Yes |
| description | string | A description for the variable. | Yes |

## Examples

!!! note
    We collect several templates in the [`deploy/templates`](https://github.com/kobsio/kobs/blob/main/deploy/templates) folder. If you have a template, which can also be useful for others, feel free to add it to this folder.

### Applications

The following plugin template can be used to display the logs of an Application and the Istio Sidecar via Elasticsearch. When it is used within an Application the user must provide the name and namespace of the Application.

```yaml
---
apiVersion: kobs.io/v1alpha1
kind: Template
metadata:
  name: elasticsearch-application-logs
spec:
  description: Display the logs of your Application and the Istio Sidecar via Elasticsearch.
  variables:
    - name: name
      description: The name of your Application.
    - name: namespace
      description: The namespace of your Application.
  plugin:
    name: Elasticsearch
    elasticsearch:
      queries:
        - name: Application Logs
          query: "kubernetes.namespace: << namespace >> AND kubernetes.labels.app: << name >> AND NOT kubernetes.container.name: istio-proxy"
        - name: Istio Sidecar Logs
          query: "kubernetes.namespace: << namespace >> AND kubernetes.labels.app: << name >> AND kubernetes.container.name: istio-proxy"
          fields: ["kubernetes.pod.name", "content.protocol", "content.method", "content.path", "content.response_code", "content.upstream_service_time"]
```

The following Application uses the template from above to display the logs of the Application in a tab named **Application Logs**.

```yaml
---
apiVersion: kobs.io/v1alpha1
kind: Application
metadata:
  name: productpage
  namespace: bookinfo
spec:
  plugins:
    - name: Template
      displayName: Application Logs
      template:
        name: elasticsearch-application-logs
        variables:
          name: productpage
          namespace: bookinfo
```

### Resources

The following plugin template can be used within a Pod to display the CPU, Memory and Network usage of this Pod via Prometheus. The user must provide the name and namespace of the Pod.

```yaml
---
apiVersion: kobs.io/v1alpha1
kind: Template
metadata:
  name: prometheus-resource-usage
spec:
  description: Display the CPU, Memory and Network usage of your Pods via Prometheus.
  variables:
    - name: name
      description: The name of your Application.
    - name: namespace
      description: The namespace of your Application.
  plugin:
    name: Prometheus
    prometheus:
      variables:
      - name: Container
        label: container
        query: container_cpu_usage_seconds_total{namespace="<< namespace >>", image!="", pod="<< name >>", container!="POD", container!=""}
        allowAll: true
      charts:
      - title: CPU Usage
        type: area
        unit: Cores
        queries:
        - label: Current
          query: sum(max(rate(container_cpu_usage_seconds_total{namespace="<< namespace >>", image!="", pod="<< name >>", container=~"{{ .Container }}", container!="POD", container!=""}[2m])) by (container))
        - label: Requested
          query: sum(kube_pod_container_resource_requests{namespace="<< namespace >>", resource="cpu", pod="<< name >>", container=~"{{ .Container }}"})
        - label: Limit
          query: sum(kube_pod_container_resource_limits{namespace="<< namespace >>", resource="cpu", pod="<< name >>", container=~"{{ .Container }}"})
      - title: Memory Usage
        type: area
        unit: MiB
        queries:
        - label: Current
          query: sum(max(container_memory_working_set_bytes{namespace="<< namespace >>", pod="<< name >>", container=~"{{ .Container }}", container!="POD", container!=""}) by (container)) / 1024 / 1024
        - label: Requested
          query: sum(kube_pod_container_resource_requests{namespace="<< namespace >>", resource="memory", pod="<< name >>", container=~"{{ .Container }}"}) / 1024 / 1024
        - label: Limit
          query: sum(kube_pod_container_resource_limits{namespace="<< namespace >>", resource="memory", pod="<< name >>", container=~"{{ .Container }}"}) / 1024 / 1024
      - title: Network I/O
        type: area
        unit: MiB
        queries:
        - label: Receive
          query: sum(rate(container_network_receive_bytes_total{namespace="<< namespace >>", pod="<< name >>"}[2m])) by (pod) / 1024 / 1024
        - label: Transmit
          query: -sum(rate(container_network_transmit_bytes_total{namespace="<< namespace >>", pod="<< name >>"}[2m])) by (pod) / 1024 / 1024
      - title: Restarts
        type: area
        queries:
        - label: Restarts
          query: max(kube_pod_container_status_restarts_total{namespace="<< namespace >>", pod="<< name >>", container=~"{{ .Container }}"})
```

The following Deployment uses the template from above to display the resource usage of each Pod in a tab named **Resource Usage**. The name and namespace variables are set via JSONPath to the name and namespace of the created Pod.

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: productpage-v1
  namespace: bookinfo
  labels:
    app: productpage
    version: v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: productpage
      version: v1
  template:
    metadata:
      labels:
        app: productpage
        version: v1
      annotations:
        kobs.io/plugins: |
          [
            {
              "name": "Template",
              "displayName": "Resource Usage",
              "template": {
                "name": "prometheus-resource-usage",
                "variables": {
                  "namespace": "<< $.metadata.namespace >>",
                  "name": "<< $.metadata.name >>"
                }
              }
            }
          ]
    spec:
      ...
```
