# Using the kobsio/app

The [kobsio/app](https://github.com/kobsio/app) can be used to build your own version of kobs. This is required if you want to use one of the [community plugins](../plugins/getting-started.md#community-plugins) or if you want to build your own private plugins for kobs.

To use the kobsio/app repository you can use the **Use this template** button from the repository to create your own version of kobs.

## Add a new Plugin

To add a new plugin you have to adjust two files: The `app/src/index.tsx` file for the React UI of the plugin and the `cmd/kobs/plugins/plugins.go` file to register the API routes for your plugin.

To add the React UI for the plugin you have to import `IPluginComponents` object from the Node module:

```diff
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import { App } from '@kobsio/plugin-core';
import resourcesPlugin from '@kobsio/plugin-resources';
import helloWorldPlugin from './plugins/helloworld';
+import myNewPlugin  from  'my-new-plugin';

ReactDOM.render(
  <React.StrictMode>
    <App plugins={{
      ...resourcesPlugin,
+      ...myNewPlugin,
    }} />
  </React.StrictMode>,
  document.getElementById('root')
);
```

To register the API routes for the plugin you have to add the `Config` for the plugin to the plugins configuration and you have to `Register` the chi router for the plugin:

```diff
package plugins

import (
        "net/http"

        "github.com/kobsio/kobs/pkg/api/clusters"
        "github.com/kobsio/kobs/pkg/api/plugins/plugin"

        "github.com/go-chi/chi/v5"
        "github.com/go-chi/render"

        // Import all plugins, which should be used with the kobs instance. By default this are all first party plugins from
        // the plugins folder.
        "github.com/kobsio/app/pkg/plugins/helloworld"
+        "github.com/my-new-plugin/my-new-plugin"
        "github.com/kobsio/kobs/plugins/resources"
)

// Config holds the configuration for all plugins. We have to add the configuration for all the imported plugins.
type Config struct {
        Resources     resources.Config     `yaml:"resources"`
        HelloWorld    helloworld.Config    `yaml:"helloworld"`
+        MyNewPlugin      mynewplugin.Config      `yaml:"myNewPlugin"`
}

// Router implements the router for the plugins package. This only registeres one route which is used to return all the
// configured plugins.
type Router struct {
        *chi.Mux
        plugins *plugin.Plugins
}

// getPlugins returns all registered plugin instances.
func (router *Router) getPlugins(w http.ResponseWriter, r *http.Request) {
        render.JSON(w, r, router.plugins)
}

// Register is used to register all api routes for plugins.
func Register(clusters *clusters.Clusters, config Config) chi.Router {
        router := Router{
                chi.NewRouter(),
                &plugin.Plugins{},
        }

        router.Get("/", router.getPlugins)

        // Register all plugins
        router.Mount(resources.Route, resources.Register(clusters, router.plugins, config.Resources))
        router.Mount(helloworld.Route, helloworld.Register(clusters, router.plugins, config.HelloWorld))
+        router.Mount(mynewplugin.Route, mynewplugin.Register(clusters, router.plugins, config.MyNewPlugin))

        return router
}
```

## Build

To build your own version of kobs you have to build the React you first. For that switch into the `app` folder and run `yarn build`:

```sh
cd app
yarn build
```

Then you can go back to the root folder of the repository and build the Go application:

```sh
make build
```

The above command puts the binary into a folder called `bin`. To start kobs you can use the following command:

```sh
./bin/kobs --config=config.yaml --development
```

To build the Docker image for kobs you can use the Dockerfile from the `cmd/kobs` folder:

```sh
docker build -f ./cmd/kobs/Dockerfile -t kobsio/kobs:dev .
docker run -it --rm --name kobs -p 15219:15219 -p 15220:15220 -p 15221:15221 -v $(pwd)/config.yaml:/kobs/config.yaml -v $HOME/.kube/config:/.kube/config kobsio/kobs:dev --development
```

## Develop a private Plugin

If you want to develop your own private plugins within your version of the [kobsio/app](https://github.com/kobsio/app) repository, we recommend that you create a new folder for each plugin. The frontend code for your plugin should go into the `app/src/plugins` folder and the backend code into the `pkg/plugins` folder.

To get a better idea for the structure of your plugin you can take a look at the `helloworld` plugin in the `app/src/plugins/helloworld` and `pkg/plugins/helloworld` folders.

More information on the development of a plugin can be found in the documentation: [Add a Plugin](./add-a-plugin.md).
