# Contributing

- [Feedback, Issues and Questions](#feedback--issues-and-questions)
- [Adding new Features](#adding-new-features)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Components](#components)
    - [React UI](#react-ui)
    - [Server](#server)
    - [Envoy](#envoy)
  - [Run kobs](#run-kobs)
- [Add a new Plugin](#add-a-new-plugin)

Every contribution to kobs is welcome, whether it is reporting a bug, submitting a fix, proposing new features or becoming a maintainer. To make contributing to kubenav as easy as possible you will find more details for the development flow in this documentation.

Please note we have a [Code of Conduct](https://github.com/kobsio/kobs/blob/master/CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Feedback, Issues and Questions

If you encounter any issue or you have an idea to improve, please:

- Search through [existing open and closed GitHub Issues](https://github.com/kobsio/kobs/issues) for the answer first. If you find a relevant topic, please comment on the issue.
- If none of the issues are relevant, please add an issue to [GitHub issues](https://github.com/kobsio/kobs/issues). Please provide any relevant information.

If you encounter a security vulnerability, please do not open an issue and instead send an email to admin@kobs.io.

## Adding new Features

When contributing a complex change to the kobs repository, please discuss the change you wish to make within a Github issue with the owners of this repository before making the change.

## Development

The following section explains various suggestions and procedures to note during development of kobs.

### Prerequisites

- It is strongly recommended that you use macOS or Linux distributions for development.
- You have Go 1.16.0 or newer installed.
- You have Node.js 14.0.0 or newer installed.
- For the React UI, you will need a working NodeJS environment and the Yarn package manager to compile the Web UI assets.

kobs uses protocol buffers. When you modify the `.proto` files, you need the following dependencies to generate the Go and JavaScript code:

- [Protocol Buffers](https://github.com/protocolbuffers/protobuf): Download the latest `protoc` binary from the [releases](https://github.com/protocolbuffers/protobuf/releases)
- [gRPC Web](https://github.com/grpc/grpc-web): The plugin is used to generate the code for the React UI. Download the plugin for your system from the [releases](https://github.com/grpc/grpc-web/releases) page and install it:

```sh
mv ~/Downloads/protoc-gen-grpc-web-1.2.1-darwin-x86_64 /usr/local/bin/protoc-gen-grpc-web
chmod +x /usr/local/bin/protoc-gen-grpc-web
```

- Install the gRPC plugins for Go:

```sh
go get google.golang.org/protobuf/cmd/protoc-gen-go@v1.25.0
go get google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1.0
go get istio.io/tools/cmd/protoc-gen-deepcopy@v0.0.0-20210206003203-61eabd18b4e0
```

- Install the Kubernetes [code-generator](https://github.com/kubernetes/code-generator) into your `GOPATH`:

```sh
go get k8s.io/code-generator@v0.20.2
```

### Components

kobs consists of three components:

- The React UI, which is the frontend component of kobs.
- The server, which serves the React UI and the gRPC server.
- Envoy for gRPC-Web.

#### React UI

The React UI lives in the `app` folder. The following commands are available for development:

- `yarn install`: Installs all dependencies.
- `yarn serve`: Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
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
| `15219` | Serves the React UI and the `/health` endpoint. This requires that you have built the React UI once via `yarn build`. If you havn't built the React UI, you can skip serving the fronend by setting `--app.assets=""`. | `--app.address` |
| `15220` | Provides the gRPC server. | `--api.address` |
| `15221` | Serves kobs internal metrics. | `--metrics.address` |

When you are using [VS Code](https://code.visualstudio.com) you can also use the `launch.json` file from the `.vscode` folder for debugging the kobs server. You can also adjust set the log level to `trace` via the `--log.level` flag, for more useful output during development.

When you add a new package and want to output some log lines make sure that you are not using `logrus` directly. Instead you should add a new `log` variable, which contains the package name:

```go
var (
    log = logrus.WithFields(logrus.Fields{"package": "<PACKAGE-NAME>"})
)
```

The Go code is formatted using [`gofmt`](https://golang.org/cmd/gofmt/).

#### Envoy

Because the API is served via [gRPC](https://grpc.io) and we are using [gRPC-Web](https://grpc.io/docs/platforms/web/) in the React UI, you have to run [Envoy](https://www.envoyproxy.io). The Envoy configuration for development can be found in the [envoy.yaml](./deploy/docker/envoy/envoy.yaml) file. To start Envoy in a Docker container you can use the following command:

```sh
docker run -it --rm --name envoy -p 15222:15222 -v $(pwd)/deploy/docker/envoy/envoy.yaml:/etc/envoy/envoy.yaml:ro envoyproxy/envoy:v1.17.0
```

The Envoy Proxy will accept connection on port `15222` and forwards them to port `15220`. Envoy also serves the React UI from port `15219` via port `15222`.

### Run kobs

There are three options to run kobs for local development. Each of the following commands should be run in a separate terminal window.

The first option can be used to serve the development version of the React UI, which will be available via [http://localhost:3000](http://localhost:3000):

```sh
cd app && yarn start
make build && ./bin/kobs --config=deploy/docker/kobs/config.yaml
docker run -it --rm --name envoy -p 15222:15222 -v $(pwd)/deploy/docker/envoy/envoy.yaml:/etc/envoy/envoy.yaml:ro envoyproxy/envoy:v1.17.0
```

The second option can be used to serve the production build of the React UI, which will be available via [http://localhost:15222](http://localhost:15222):

```sh
cd app && yarn build
make build && ./bin/kobs --config=deploy/docker/kobs/config.yaml
docker run -it --rm --name envoy -p 15222:15222 -v $(pwd)/deploy/docker/envoy/envoy.yaml:/etc/envoy/envoy.yaml:ro envoyproxy/envoy:v1.17.0
```

The third option can be used, when you havn't Go and Node.js installed on your system and you want to use Docker instead. The React UI will be available via [http://localhost:15222](http://localhost:15222):

```sh
# With Docker Compose
cd deploy/docker && docker-compose up

# Without Docker Compose
docker build -f ./cmd/kobs/Dockerfile -t kobsio/kobs:dev .
docker run -it --rm --name kobs -p 15219:15219 -p 15220:15220 -p 15221:15221 -v $(pwd)/config.yaml:/kobs/config.yaml -v $HOME/.kube/config:/.kube/config kobsio/kobs:dev
docker run -it --rm --name envoy -p 15222:15222 -v $(pwd)/deploy/docker/envoy/envoy.yaml:/etc/envoy/envoy.yaml:ro envoyproxy/envoy:v1.17.0
```

When you want to run kobs inside your Kubernetes cluster, please checkout the Documentation at [kobs.io](https://kobs.io).

## Add a new Plugin

To add a new plugin to kobs, you have to create a `proto/<PLUGIN-NAME>.proto`. Our [Makefile](./Makefile) will the handle the code generation for your plugin.

```protobuf
syntax = "proto3";
package plugins.<PLUGIN-NAME>;

option go_package = "github.com/kobsio/kobs/pkg/api/plugins/<PLUGIN-NAME>/proto";
```

To add your plugin to the Application CRD, add a corresponding field to the `Plugin` message format in the `proto/plugins.proto` file:

```protobuf
syntax = "proto3";
package plugins;

option go_package = "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto";

import "<PLUGIN-NAME>.proto";

message Plugin {
  <PLUGIN-NAME>.Spec <PLUGIN-NAME> = 1;
}
```

Besides the protocol buffers definition your also have to create a `pkg/api/plugins/<PLUGIN-NAME>/<PLUGIN-NAME>.go` file, which implements your definition and handles the registration of your plugin. To register your plugin you have to modify the `Register` function in the `pkg/api/plugins/plugins/plugins.go` file:

```go
package plugins

import (
    "github.com/kobsio/kobs/pkg/api/plugins/<PLUGIN-NAME>"
)

func Register(cfg *config.Config, grpcServer *grpc.Server) error {
    <PLUGIN-NAME>Instances, err := <PLUGIN-NAME>.Register(cfg.<PLUGIN-NAME>, grpcServer)
    if err != nil {
        log.WithError(err).WithFields(logrus.Fields{"plugin": "<PLUGIN-NAME>"}).Errorf("Failed to register <PLUGIN-NAME> plugin.")
        return err
    }

    plugins = append(plugins, <PLUGIN-NAME>Instances...)
}
```

The configuration for your plugin must be added to the `Config` struct in the `pkg/config/config.go` file:

```go
package config

import (
    "github.com/kobsio/kobs/pkg/api/plugins/<PLUGIN-NAME>"
)

type Config struct {
    <PLUGIN-NAME> []<PLUGIN-NAME>.Config `yaml:"<PLUGIN-NAME>"`
}
```

Now your plugin is registered at the gRPC server and can be configured via a `config.yaml` file. In the next step you can implement the Reac UI components for your plugin. Your plugin must provide the following two components as entry point: `app/src/plugins/<PLUGIN-NAME>/<PLUGIN-NAME>Page.tsx` and `app/src/plugins/<PLUGIN-NAME>/<PLUGIN-NAME>Plugin.tsx`:

```tsx
import {
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { IPluginPageProps } from 'utils/plugins';

const <PLUGIN-NAME>Page: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {name}
        </Title>
        <p>{description}</p>
      </PageSection>
    </React.Fragment>
  );
};

export default <PLUGIN-NAME>Page;
```

```tsx
import React from 'react';
import ListIcon from '@patternfly/react-icons/dist/js/icons/list-icon';

import { IPluginProps } from 'utils/plugins';
import PluginDataMissing from 'components/plugins/PluginDataMissing';

const <PLUGIN-NAME>Plugin: React.FunctionComponent<IPluginProps> = ({
  isInDrawer,
  name,
  description,
  plugin,
  showDetails,
}: IPluginProps) => {
  if (!plugin.<PLUGIN-NAME>) {
    return (
      <PluginDataMissing
        title="<PLUGIN-NAME> properties are missing"
        description="The <PLUGIN-NAME> properties are missing in your CR for this application. Visit the documentation to learn more on how to use the <PLUGIN-NAME> plugin in an Application CR."
        documentation="https://kobs.io"
        icon={ListIcon}
      />
    );
  }

  return (
    <React.Fragment>
    </React.Fragment>
  );
};

export default <PLUGIN-NAME>Plugin;
```

In the last step you have to register these two React components in the `app/src/utils/plugins.tsx` file:

```tsx
import React from 'react';

import <PLUGIN-NAME>Page from 'plugins/<PLUGIN-NAME>/<PLUGIN-NAME>Page';
import <PLUGIN-NAME>Plugin from 'plugins/<PLUGIN-NAME>/<PLUGIN-NAME>Plugin';

export const plugins: IPlugins = {
  <PLUGIN-NAME>: {
    page: <PLUGIN-NAME>Page,
    plugin: <PLUGIN-NAME>Plugin,
  },
};
```

Thats it, now you can generate the Go and TypeScript code from your `.proto` file and the new Application CRD with the following command:

```sh
make generate
```
