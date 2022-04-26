# Contributing

- [Feedback, Issues and Questions](#feedback--issues-and-questions)
- [Adding new Features](#adding-new-features)
- [Development](#development)
  - [Repository Structure](#repository-structure)
  - [Prerequisites](#prerequisites)
  - [Components](#components)
    - [React UI](#react-ui)
    - [Server](#server)
    - [Plugins](#plugins)
  - [Run kobs](#run-kobs)
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
├── app                         # The React UI, with all first party plugins
│   ├── public                  # Static files for the React UI, like the kobs logo and favicon
│   └── src                     # The source files for the React UI, the index.tsx is used to register all plugins
├── cmd
│   └── kobs                    # The main package for kobs
├── deploy                      # Contains the Kustomize files, the Helm chart, the Docker Compose file and the demo application
├── docs                        # The MkDocs files for the documentation, the build of this folder is deployed to http://kobs.io
├── pkg
│   ├── api                     # The api package contains the HTTP API which is served at 15220
│   │   ├── apis
│   │   │   ├── application     # The Applications Custom Resource Definition
│   │   │   ├── dashboard       # The Dashboards Custom Resource Definition
│   │   │   └── team            # The Teams Custom Resource Definition
│   │   ├── clients             # The generated code of the clients for our Custom Resource Definitions
│   │   ├── clusters            # The clusters package is used to load all clusters from the provided configuration file
│   │   └── plugins             # The plugin package is used to register the plugins at the API server
│   ├── app                     # The app package is used to serve the build of the React UI
│   ├── config
│   ├── metrics
│   └── version
└── plugins                     # The implementation for all first party plugins
    ├── applications
    ├── core
    ├── dashboards
    ├── resources
    ├── teams
    └── ...
```

### Prerequisites

- It is strongly recommended that you use macOS or Linux distributions for development.
- You have Go 1.16.0 or newer installed.
- You have Node.js 14.0.0 or newer installed.
- For the React UI, you will need a working NodeJS environment and the Yarn package manager to compile the Web UI assets.

If you adjust the Custom Resource Definitions for kobs, you must install the Kubernetes [code-generator](https://github.com/kubernetes/code-generator) into your `GOPATH`:

```sh
go install k8s.io/code-generator/...@v0.23.6
go install sigs.k8s.io/controller-tools/...@v0.8.0
```

### Components

kobs consists of three components:

- The React UI, which is the frontend component of kobs.
- The server, which serves the React UI and the API.
- The plugins, which contains the frontend and backend code for several functions of kobs.

#### React UI

The React UI lives in the `app` folder. The following commands are available for development:

- `yarn install`: Installs all dependencies.
- `yarn start`: Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- `yarn build`: Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

We are using [ESLint](https://eslint.org) and [Prettier](https://prettier.io) for linting and automatic code formation. When you are using [VS Code](https://code.visualstudio.com) you can also use the `launch.json` file from the `.vscode` folder for debugging the React UI.

#### Server

The kobs server is written in Go. To build and run the server you can run the following command:

```sh
make build && ./bin/kobs --config=deploy/docker/kobs/config.yaml
```

When you run the kobs binary, it will use the following ports:

| Port | Description | Command-Line Flag |
| ---- | ----------- | ----------------- |
| `15219` | Serves the React UI. This requires that you have built the React UI once via `yarn build`. If you haven't built the React UI, you can skip serving the fronend by setting `--app.assets=""`. | `--app.address` |
| `15220` | Serve the HTTP API. | `--api.address` |
| `15221` | Serves kobs internal metrics. | `--metrics.address` |

When you are using [VS Code](https://code.visualstudio.com) you can also use the `launch.json` file from the `.vscode` folder for debugging the kobs server. You can also adjust the log level to `trace` via the `--log.level` flag, for more useful output during development.

When you are adding a new package and want to output some log line your can use the `github.com/kobsio/kobs/pkg/log` package. The package is a wrapper around `go.uber.org/zap`, which we are using for logging and adds an option to add additional fields to a log line via a `context.Context`.

The Go code is formatted using [`gofmt`](https://golang.org/cmd/gofmt/).

For testing we are using [testify](https://github.com/stretchr/testify) and to generate the mocks we are using [mockery](https://github.com/vektra/mockery). The mocks should be placed in a seperate file within the same package and the file should include a `_mock.go`  prefix. for example if you want to generate the mocks for the `Instance` interface in the Grafana plugin, the following command can be used:

```sh
mockery --name Instance --dir plugins/grafana/pkg/instance --inpackage --filename instance_mock.go
```

#### Plugins

We are using [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to manage the plugins. All first party plugins for kobs are available in the `plugins` directory. They are build when you run `yarn start` or `yarn build`. If you just want to build the plugins you can run `yarn plugin`.

To build / rebuild a single plugin you can run `yarn workspace <plugin-name> plugin` (e.g. `yarn workspace @kobsio/plugin-prometheus plugin`). Each of the plugins has a similar structure, which can be found in the following:

```txt
plugins/prometheus
├── pkg                 # Additional Go packages for the plugin
├── prometheus.go       # The entry point for the backend implementation of the plugin
└── src                 # The TypeScript code for the plugin
    ├── assets          # Static assets like images and CSS files
    ├── components      #
    │   ├── page        # The page implementation for the plugin
    │   ├── panel       # The panel implementation for the plugin
    │   └── preview     # The preview implementation for the plugin
    ├── index.ts        # Export for the plugin, so that it can be added to the app in the app/src/index.tsx file
    └── utils           # Additional functions for the TypeScript code
```

If you want to add a new plugin, please read the [Add a Plugin](https://kobs.io/contributing/add-a-plugin/) guide from the documentation.

### Run kobs

To run kobs you can use the following two commands, which should be run in two separate terminal windows. This will start the a kobs server and it will serve the development version of the React UI, which will be available via [http://localhost:3000](http://localhost:3000):

```sh
yarn start
make build && ./bin/kobs --config=deploy/docker/kobs/config.yaml --app.assets=""
```

If you want to test the production build of kobs, you can build the React UI via `yarn build` and then start the server with the `--development` flag. The `--development` flag will then redirect all the API requests to port `15220` from the frontend which is available at [http://localhost:15222](http://localhost:15222):

```sh
yarn build
make build && ./bin/kobs --config=deploy/docker/kobs/config.yaml --development
```

If you do not have Go and Node.js installed on your system and you want to use Docker instead. You can run kobs via Docker with the following commands:

```sh
# With Docker Compose
cd deploy/docker && docker-compose up

# Without Docker Compose
docker build -f ./cmd/kobs/Dockerfile -t kobsio/kobs:dev .
docker run -it --rm --name kobs -p 15219:15219 -p 15220:15220 -p 15221:15221 -v $(pwd)/deploy/docker/kobs/config.yaml:/kobs/config.yaml -v $HOME/.kube/config:/.kube/config kobsio/kobs:dev --development
```

When you want to run kobs inside your Kubernetes cluster, please checkout the Documentation at [kobs.io](https://kobs.io).

**Using the demo application:** If you want to test your changes against the demo application take a look at [https://kobs.io/installation/demo/#development-using-the-demo](https://kobs.io/installation/demo/#development-using-the-demo).

## Documentation

More information, for example how to use the demo in you development workflow or how to submit a new plugin can be found in the documentation at [https://kobs.io/contributing/getting-started/](https://kobs.io/contributing/getting-started/).
