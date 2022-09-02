# Contributing

- [Feedback, Issues and Questions](#feedback--issues-and-questions)
- [Adding new Features](#adding-new-features)
- [Development](#development)
  - [Repository Structure](#repository-structure)
  - [Prerequisites](#prerequisites)
  - [Backend](#backend)
    - [Plugins](#plugins)
  - [Frontend](#frontend)
    - [Plugins](#plugins-1)
    - [Generate all Assets](#generate-all-assets)
  - [Create and use Plugins](#create-and-use-plugins)
  - [Docker / Kubernetes](#docker---kubernetes)
- [Documentation](#documentation)

Every contribution to kobs is welcome, whether it is reporting a bug, submitting a fix, proposing new features or becoming a maintainer. To make contributing to kubenav as easy as possible you will find more details for the development flow in this documentation.

Please note we have a [Code of Conduct](https://github.com/kobsio/kobs/blob/master/CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Feedback, Issues and Questions

If you encounter any issue or you have an idea to improve, please:

- Search through [existing open and closed GitHub Issues](https://github.com/kobsio/kobs/issues) and [discussions](https://github.com/kobsio/kobs/discussions) for the answer first. If you find a relevant topic, please comment on the issue.
- If none of the issues are relevant, please add an issue to [GitHub issues](https://github.com/kobsio/kobs/issues) or start a new [discussions](https://github.com/kobsio/kobs/discussions). Please use the issue templates and provide any relevant information.

If you encounter a security vulnerability, please do not open an issue and instead send an email to [admin@kobs.io](mailto:admin@kobs.io?subject=[GitHub]%20Security%20Vulnerability).

## Adding new Features

When contributing a complex change to the kobs repository, please discuss the change you wish to make within a Github issue with the owners of this repository before making the change.

## Development

The following section explains various suggestions and procedures to note during development of kobs.

### Repository Structure

Most of the kobs functions are implemented via plugins, which can be found in the `plugins` folder. The other directories are used to implement the core functionality of kobs:

```txt
.
├── Makefile                     # The Makefile is used to build the kobs binary ("make build"), the CRDs ("make generate-crds") and to generate all frontend assets ("make generate-assets")
├── cmd
│   └── kobs                     # The main package for kobs, it is used to implement the hub, satellite and version command
├── deploy                       # The deploy directory contains the Helm charts for the hub and satellite, as well as the Kustomize files and the demo
├── docs                         # The documentation for kobs, which is available via kobs.io
├── pkg
│   ├── app                      # The app server, which is responsible for serving the React UI via the hub
│   ├── hub                      # The hub server
│   │   ├── api                  # The API routes for the hub server
│   │   ├── middleware           # Middleware functions which are only used for the hub (e.g. authentication middleware)
│   │   ├── satellites           # The satellites package is used to interact with the configured satellites from the started hub instance
│   │   ├── store                # The store is used to save the collected resources from the configured satellites in a database
│   │   └── watcher              # The watcher is used to synchronise the resources from all configured satellites with the store on a regular basis
│   ├── kube                     #
│   │   ├── apis                 # The API definition for our Custom Resources
│   │   ├── clients              # The generated Kubernetes clients for our Custom Resource Definitions
│   │   └── clusters             # The clusters package can be used to interact with the Kubernetes API
│   ├── log
│   ├── metrics                  # The metrics server is responsible to serve the Prometheus metrics for the hub and satellite component
│   ├── middleware               # Middleware packages for the hub and satellite (e.g. http logging, tracing, etc.)
│   ├── satellite                # The satellite server
│   │   ├── api                  # The API routes for the satellite server
│   │   ├── middleware           # Middleware function which are only used for the satellite (e.g. token based authentication)
│   │   └── plugins              # The plugins package handles the registration and mounting of the plugin API endpoints
│   ├── tracer
│   └── version
└── plugins                      # The plugins directory contains the React UI and all plugins for kobs
    ├── app                      # The app directory contains our React UI for kobs
    ├── plugin-<PLUGIN-NAME>
    │   ├── cmd                  # Each plugin should contain a cmd directory which contains the entry point for a plugin ("type MountFn func(instances []Instance, clustersClient clusters.Client) (chi.Router, error)")
    │   ├── pkg                  # Each plugin can contain other sub packages which are used by the entry point package
    │   └── src                  # The React UI for each plugin
    │       ├── assets           # Static assets like an icon or css files for the plugin
    │       └── components
    │           ├── instance     # Each plugin must expose a "Instance" module
    │           ├── page         # Each plugin must expose a "Page" module
    │           └── panel        # Each plugin must expose a "Panel" module
    └── shared                   # The shared package contains components and functions which can be used across plugins
```

### Prerequisites

- It is strongly recommended that you use macOS or Linux distributions for development.
- You have Go 1.19.0 or newer installed.
- You have Node.js 16.0.0 or newer installed.
- For the React UI, you will need a working NodeJS environment and the Yarn package manager to compile the Web UI assets.

If you adjust the Custom Resource Definitions for kobs, you must install the Kubernetes [code-generator](https://github.com/kubernetes/code-generator) into your `GOPATH`:

```sh
go install k8s.io/code-generator/...@v0.23.6
go install sigs.k8s.io/controller-tools/...@v0.8.0
```

### Backend

The backend is written in Go and can be build using the following command:

```sh
# The "make generate-crds" command is only needed if you made changes to the Custom Resource Definitions ("pkg/kube/apis" folder)
make generate-crds

make build
```

This will create a binary named `kobs` in the `bin` folder. This binary can be used to start the `satellite` and `hub`:

```sh
./bin/kobs satellite --log.level=debug --satellite.config=deploy/docker/kobs/satellite.yaml --satellite.token=unsecuretoken
./bin/kobs hub --log.level=debug --hub.config=deploy/docker/kobs/hub.yaml --app.assets=""
```

When you run these two services, they will use the follwing ports:

| Port | Description | Command-Line Flag |
| ---- | ----------- | ----------------- |
| `15219` | Serves the React UI. This requires that you have built the React UI once via `yarn build`. If you haven't built the React UI, you can skip serving the fronend by setting `--app.assets=""`. | `--app.address` |
| `15220` | Serves the `hub` API. | `--hub.address` |
| `15221` | Serves the `satellite` API. | `--satellite.address` |

When you are using [VS Code](https://code.visualstudio.com) you can also use the `launch.json` file from the `.vscode` folder for debugging the `hub` and `satellite` server. You can also adjust the log level to `debug` via the `--log.level` flag, for more verbose output during development.

When you are adding a new package and want to output some log line your can use the `github.com/kobsio/kobs/pkg/log` package. The package is a wrapper around `go.uber.org/zap`, which we are using for logging and adds an option to add additional fields to a log line via a `context.Context`.

The Go code is formatted using [`gofmt`](https://golang.org/cmd/gofmt/).

For testing we are using [testify](https://github.com/stretchr/testify) and to generate the mocks we are using [mockery](https://github.com/vektra/mockery). The mocks should be placed in a seperate file within the same package and the file should include a `_mock.go`  prefix. for example if you want to generate the mocks for the `Store` interface in the `pkg/hub/store` package, the following command can be used:

```sh
mockery --name Client --dir pkg/hub/store --inpackage --filename store_mock.go
```

#### Plugins

The backend code for each plugin must expose a `Mount` function with the following type: `type MountFn func(instances []Instance, clustersClient clusters.Client) (chi.Router, error)` and a `PluginType` constant of type `string`.

The `Mount` function and `PluginType` can then be used to register the plugin in the [main.go](./cmd/kobs/main.go) file:

```go
package main

import (
    <PLUGIN-NAME> "github.com/kobsio/kobs/plugins/plugin-<PLUGIN-NAME>/cmd"
)

func main() {
    var pluginMounts map[string]plugin.MountFn
    pluginMounts = make(map[string]plugin.MountFn)

    pluginMounts[<PLUGIN-NAME>.PluginType] = <PLUGIN-NAME>.Mount
}
```

### Frontend

The frontend of kobs is developed using TypeScript and React (via [Create React App](https://github.com/kobsio/create-react-app/tree/add-support-for-module-federation)). We are also using [lerna](https://lerna.js.org) and [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to manage all dependencies.

The frontend lives in the [`plugins/app`](./plugins/app) folder. The shared React components can be found in the [`plugins/shared`](./plugins/shared) folder. To build and start the React UI, you have to build the shared components first. For this the following commands are available:

- `yarn`: Install all dependencies.
- `yarn workspace @kobsio/shared build:shared`: Build the shared components, so that they can be used within the app or a plugin.
- `yarn workspace @kobsio/app build`: Build the React UI.
- `yarn workspace @kobsio/app start`: Start development server for the React UI. The development server is served on port `3000`.

We are using [ESLint](https://eslint.org) and [Prettier](https://prettier.io) for linting and automatic code formation. When you are using [VS Code](https://code.visualstudio.com) you can also use the `launch.json` file from the `.vscode` folder for debugging the React UI.

#### Plugins

The frontend code for all plugins lives in the corresponding plugin directory: `plugins/plugin-<PLUGIN-NAME>`. To build a plugin or to start the development server for a plugin the following two commands can be used:

- `yarn workspace @kobsio/plugin-<PLUGIN-NAME> build` (e.g. `yarn workspace @kobsio/plugin-prometheus build`): Build the React UI and modules for the plugin.
- `yarn workspace @kobsio/plugin-<PLUGIN-NAME> start` (e.g. `yarn workspace @kobsio/plugin-prometheus start`): Start the development server for the plugin. The plugin is then available on port `3001` or can be used within the development server of the React UI (`yarn workspace @kobsio/app start`).

#### Generate all Assets

To generate all frontend assets with the correct directory structure, so that the frontend can be served via the `kobs hub` command on port `15219` the `make generate-assets` command can be used.

This command will build the shared components, the app and all plugins. It will also place all the plugin in the `bin` folder with the following directory structure:

```txt
bin
└── app                            # In the app folder all generated frontend assets can be found
    ├── plugins                    # In the plugins folder all generated frontend assets for all plugins can be found
    │   └── <PLUGIN-NAME>
    │       ├── remoteEntry.js     # The "remoteEntry.js" file is used to expose the modules for all plugins
    │       └── static             # The static css, js and font files for a plugin
    │           ├── css
    │           ├── js
    │           └── media
    └── static                     # The static css, js and font files for our React UI (app)
        ├── css
        ├── js
        └── media
```

The hub can then be started with the `--app.assets=./bin/app` argument to access the frontend via port `15219`:

```sh
./bin/kobs hub --log.level=debug --hub.config=deploy/docker/kobs/hub.yaml --app.assets=./bin/app
```

### Create and use Plugins

If you want to create a new plugin, please read the [Create a Plugin](https://kobs.io/main/contributing/create-a-plugin/) guide from the documentation.

If you created a custom plugin or when you want to use a community plugins, please read the [Use Custom Plugins](https://kobs.io/main/contributing/use-custom-plugins/) guide from the documentation.

### Docker / Kubernetes

To build and run kobs via Docker the following command can be used:

```sh
docker build -f ./cmd/kobs/Dockerfile -t kobsio/kobs:dev .

docker run -it --rm --name kobs-hub -p 15219:15219 -p 15220:15220 -v $(pwd)/deploy/docker/kobs/hub.yaml:/kobs/hub.yaml kobsio/kobs:dev --config=hub.yaml
docker run -it --rm --name kobs-satellite -p 15221:15221 -v $(pwd)/deploy/docker/kobs/satellite.yaml:/kobs/satellite.yaml -v $HOME/.kube/config:/.kube/config kobsio/kobs:dev --config=satellite.yaml
```

You can also use Docker Compose to build and run kobs:

```sh
cd deploy/docker && docker-compose up
```

When you want to run kobs inside your Kubernetes cluster, please checkout the getting started guide at [kobs.io](https://kobs.io/main/getting-started/).

**Using the demo application:** If you want to test your changes against the demo application take a look at [https://kobs.io/main/contributing/development-using-the-demo/](https://kobs.io/main/contributing/development-using-the-demo/).

## Documentation

More information, for example how to use the demo in you development workflow or how to submit a new plugin can be found in the documentation at [https://kobs.io/main/contributing/](https://kobs.io/main/contributing/).
