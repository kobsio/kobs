# Using custom Plugins

When you want to use custom plugins, e.g. a [community plugins](../plugins/index.md#community-plugins) or a private plugin, you have to build your own Docker image for kobs. For this we are providing a template repository which can be found at [https://github.com/kobsio/app-template](https://github.com/kobsio/app-template).

To use this template you can use the **Use this template** button from the repository to create your own version of kobs.

## Add a Plugin

To add a plugin to your version of kobs your have to adjust the [`main.go`](https://github.com/kobsio/app-template/blob/main/main.go) and the [`Dockerfile`](https://github.com/kobsio/app-template/blob/main/Dockerfile).

### `main.go`

The `main.go` file is used to register the plugin in the backend code. To do this you just have to import the Go package of the plugin and add it to the `pluginMounts` map. You can also remove once of the plugins which are comming with kobs if you do not need them. In the following example we are adding the `helloworld` plugin from the [kobsio/plugin-template](https://github.com/kobsio/plugin-template) repository and removing the `rss` plugin, because we do not want to use it:

```diff
package main

import (
    "github.com/kobsio/kobs/cmd/kobs/root"
    "github.com/kobsio/kobs/pkg/log"
    "github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

    azure "github.com/kobsio/kobs/plugins/plugin-azure/cmd"
    elasticsearch "github.com/kobsio/kobs/plugins/plugin-elasticsearch/cmd"
    flux "github.com/kobsio/kobs/plugins/plugin-flux/cmd"
    grafana "github.com/kobsio/kobs/plugins/plugin-grafana/cmd"
    harbor "github.com/kobsio/kobs/plugins/plugin-harbor/cmd"
    helm "github.com/kobsio/kobs/plugins/plugin-helm/cmd"
    istio "github.com/kobsio/kobs/plugins/plugin-istio/cmd"
    jaeger "github.com/kobsio/kobs/plugins/plugin-jaeger/cmd"
    kiali "github.com/kobsio/kobs/plugins/plugin-kiali/cmd"
    klogs "github.com/kobsio/kobs/plugins/plugin-klogs/cmd"
    opsgenie "github.com/kobsio/kobs/plugins/plugin-opsgenie/cmd"
    prometheus "github.com/kobsio/kobs/plugins/plugin-prometheus/cmd"
-    rss "github.com/kobsio/kobs/plugins/plugin-rss/cmd"
    sonarqube "github.com/kobsio/kobs/plugins/plugin-sonarqube/cmd"
    sql "github.com/kobsio/kobs/plugins/plugin-sql/cmd"
    techdocs "github.com/kobsio/kobs/plugins/plugin-techdocs/cmd"

+    helloworld "github.com/kobsio/plugin-template/cmd"

    "go.uber.org/zap"
)

func main() {
    var pluginMounts map[string]plugin.MountFn
    pluginMounts = make(map[string]plugin.MountFn)

    pluginMounts[azure.PluginType] = azure.Mount
    pluginMounts[elasticsearch.PluginType] = elasticsearch.Mount
    pluginMounts[flux.PluginType] = flux.Mount
    pluginMounts[grafana.PluginType] = grafana.Mount
    pluginMounts[harbor.PluginType] = harbor.Mount
    pluginMounts[helm.PluginType] = helm.Mount
    pluginMounts[istio.PluginType] = istio.Mount
    pluginMounts[jaeger.PluginType] = jaeger.Mount
    pluginMounts[kiali.PluginType] = kiali.Mount
    pluginMounts[klogs.PluginType] = klogs.Mount
    pluginMounts[opsgenie.PluginType] = opsgenie.Mount
    pluginMounts[prometheus.PluginType] = prometheus.Mount
-    pluginMounts[rss.PluginType] = rss.Mount
    pluginMounts[sonarqube.PluginType] = sonarqube.Mount
    pluginMounts[sql.PluginType] = sql.Mount
    pluginMounts[techdocs.PluginType] = techdocs.Mount

+    pluginMounts[helloworld.PluginType] = helloworld.Mount

    if err := root.Command(pluginMounts).Execute(); err != nil {
        log.Fatal(nil, "Failed to initialize kobs", zap.Error(err))
    }
}
```

When you have adjusted the `main.go` file run `go mod tidy` to add it to your `go.mod` file.

### `Dockerfile`

The `Dockerfile` is used to build your own version of kobs and to copy the frontend files for your plugin. We are using again the `helloworld` plugin from the [kobsio/plugin-template](https://github.com/kobsio/plugin-template) in the following example:

```diff
FROM kobsio/kobs:v0.9.0 as app
+FROM kobsio/plugin:main as plugin-helloworld

FROM golang:1.18.3 as api
WORKDIR /kobs
COPY go.mod go.sum /kobs/
RUN go mod download
COPY . .
RUN export CGO_ENABLED=0 && make build

FROM alpine:3.16.0
RUN apk update && apk add --no-cache ca-certificates
RUN mkdir /kobs
COPY --from=api /kobs/bin/kobs /kobs
COPY --from=app /kobs/app /kobs/app
+COPY --from=plugin-helloworld /kobs/helloworld /kobs/app/plugins/helloworld
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
```

The created Docker image can then be used within the [Helm chart](../getting-started/installation/helm.md) or [Kustomize](../getting-started/installation/kustomize.md) files from the documentation.
