# Add a Plugin

To add a new plugin to kobs, you have to create a `proto/<PLUGIN-NAME>.proto` file. Our [Makefile](./Makefile) will the handle the code generation for your plugin.

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

import { IPluginProps } from 'utils/plugins';
import PluginDataMissing from 'components/plugins/PluginDataMissing';

const <PLUGIN-NAME>Plugin: React.FunctionComponent<IPluginProps> = ({
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
        type="<PLUGIN-TYPE>"
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
import <PLUGIN-NAME>Preview from 'plugins/<PLUGIN-NAME>/<PLUGIN-NAME>Preview';
import { jsonToProto as <PLUGIN-NAME>JsonToProto } from 'plugins/<PLUGIN-NAME>/helpers';

export const plugins: IPlugins = {
  <PLUGIN-NAME>: {
    jsonToProto: <PLUGIN-NAME>JsonToProto,
    page: <PLUGIN-NAME>Page,
    plugin: <PLUGIN-NAME>Plugin,
    preview: <PLUGIN-NAME>Preview,
  },
};
```

The preview component is optional for every plugin. It is used in the Applications gallery, were your plugin can be used to provide additional information for an Application. You also do not have to specify a `jsonToProto` function and you can use the `jsonToProto` from the `app/src/utils/plugins.tsx` instead. In this case you have to properly check the users input, which can be avoided, by specifying an own `jsonToProto` function.

Thats it, now you can generate the Go and TypeScript code from your `.proto` file and the new Application CRD with the following command:

```sh
make generate
```
