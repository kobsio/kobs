# TechDocs

The TechDocs plugin allows your engineers to write their documentation in markdown files which live together with their code and display them in kobs.

![TechDocs](assets/techdocs.png)

## Configuration

The following configuration can be used with the TechDocs plugin, to load the TechDocs from the local file system.

```yaml
plugins:
  techdocs:
    - name: techdocs
      displayName: TechDocs
      description: TechDocs allows your engineers to write their documentation in Markdown files which live together with their code.
      provider:
        type: local
        local:
          rootDirectory: ./techdocs
        # type: s3
        # s3:
        #   endpoint:
        #   accessKeyID:
        #   secretAccessKey:
        #   bucket:
        #   useSSL: true
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the TechDocs instance. | Yes |
| displayName | string | Name of the TechDocs instance as it is shown in the UI. | Yes |
| description | string | Description of the TechDocs instance. | No |
| home | boolean | When this is `true` the plugin will be added to the home page. | No |
| provider | [Provider](#provider) | The provider where your TechDocs are saved. | Yes |

### Provider

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | The provider type. Must be `local` or `s3` | Yes |
| local | [Local](#local) | The configuration for the `local` provider type. | No |
| s3 | [S3](#s3) | The configuration for the `s3` provider type. | No |

### Local

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| rootDirectory | string | The path to the directory, which contains all the folders with your TechDocs for your services. | Yes |

### S3

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| endpoint | string | The endpoint for your S3 bucket. | Yes |
| accessKeyID | string | The access key id for your S3 bucket. | Yes |
| secretAccessKey | string | The secret access key for your S3 bucket. | Yes |
| bucket | string | The name of the S3 bucket with your TechDocs. | Yes |
| useSSL | boolean | Use SSL to access the S3 bucket. | Yes |

## Options

The following options can be used for a panel with the TechDocs plugin:

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| type | string | Specify if you want to show a `list` of TechDocs or the table of contents (`toc`) for a specific service. | Yes |
| service | string | The name of the service for which the table of contents should be shown when the type is `toc`. | No |

For example the following dashboard shows all available TechDocs and the table of contents for kobs.

```yaml
---
---
apiVersion: kobs.io/v1
kind: Dashboard
spec:
  rows:
    - size: 3
      panels:
        - title: TechDocs
          colSpan: 6
          plugin:
            name: techdocs
            options:
              type: list
        - title: kobs
          colSpan: 6
          plugin:
            name: techdocs
            options:
              type: toc
              service: kobs
```

## Usage

The TechDocs plugin renders the markdown files for your service. For that you have to provide the files for kobs via S3 or via a file system which kobs can access.

### File Structure

The TechDocs for all of your service must live in their own folder. Lets say we have four services `productpage`, `details`, `ratings` and `reviews`. All of these services have their own documentation, so that the final structure for kobs should look as follows:

```plain
techdocs
├── details
│   └── index.yaml
├── productpage
│   ├── configuration
│   │   ├── addbooks.md
│   │   └── getting-started.md
│   ├── index.md
│   ├── index.yaml
│   └── installation
│       ├── helm.md
│       └── kustomize.md
├── ratings
│   └── index.yaml
└── reviews
    └── index.yaml
```

As you can see each folder must also contain a `index.yaml` file with the following content:

```yaml
# The key should be a unique identifier for all of your TechDocs.
# It must have the same name as the folder, where the TechDocs for the service are stored for kobs.
key: productpage
# The name of your service and a short description of your service.
name: Productpage
description: The productpage for the bookinfo application.
# The first markdown file which should be shown, when a user opens the TechDocs for the service.
home: index.md
# The table of contents for your service, with links to all the markdown files should can be accessed by a user.
toc:
  - Home: index.md
  - Installation:
      - Helm: installation/helm.md
      - Kustomize: installation/kustomize.md
  - Configuration:
      - Getting Started: configuration/getting-started.md
      - Add Books: configuration/addbooks.md
```

### Embed Panels

You can embed each plugin as a panel into your documentation. For that you can use a code block and define `kobs` as language.

For example you can show the success rate of a service within the documentation. In the following we are displaying a panel within a markdown file of the productpage service:

~~~md
# Metrics

The most important metric for the Productpage service is the success rate. The success rate is determined via the `istio_requests_total` metric, which is exported by the Envoy sidecar.

```kobs
title: Current Success Rate
plugin:
  name: prometheus
  options:
    unit: "%"
    queries:
      - query: sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"bookinfo",destination_workload=~"productpage-v1",response_code!~"5.*"}[5m])) / sum(irate(istio_requests_total{reporter="destination",destination_workload_namespace=~"bookinfo",destination_workload=~"productpage-v1"}[5m])) * 100
```
~~~

The complete specifiaction for the code block can be found in the Dashboards documentation under [Panel](../resources/dashboards.md#panel). The `colSpan` and `rowSpan` is not used when the panel is embedded into your documentation. Each panel will be rendered with a width of 100% and a height of 300px.
