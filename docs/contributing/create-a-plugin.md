# Create a Plugin

In the following you find some instructions and recommendations which will help you to develop your own plugins for kobs.

!!! notes
    Please read the following notes, before you start with the development of your own plugins:

    - **Adding a plugin to the [kobsio/kobs](https://github.com/kobsio/kobs) repository:** When you want to create a plugin, which should be added as official plugin to the kobsio/kobs repository, [create a new issue first](https://github.com/kobsio/kobs/issues). The issue should contain a description for the plugin you want to develop and an explanation why it makes sens to add it as official plugin.
    - **Maintaining a plugin in your own repository:** If you develop a public plugin in your own repository you can use the [kobsio/plugin-template](https://github.com/kobsio/plugin-template). Besides that it would be nice to add a markdown file for your plugin to the `docs/community-plugins` folder. You can also add a [`kobs-plugin`](https://github.com/topics/kobs-plugin) label so that users can find your plugin via GitHub.
    - **Private plugins:** For private plugins you can also use the [kobsio/plugin-template](https://github.com/kobsio/plugin-template).

## Structure

Each plugin contains a backend and a frontend part. The backend part is written in Go and provides the API for the frontend. The frontend part is written in TypeScript and will become part of the React UI of kobs via [Module Federation](https://webpack.js.org/concepts/module-federation/).

```txt
.
├── Dockerfile                       # The Dockerfile which is used to build and distribute the frontend assets for your plugin
├── cmd                              # The entrypoint for the backend code of your plugin
├── go.mod                           # The dependencies for your backend code
├── package.json                     # The dependencies and build instructions for your frontend code
├── pkg                              # Additional packages for your backend code
└── src
    ├── assets
    │   └── icon.png                 # Each plugin should contain an icon, which should be placed in the assets folder
    ├── components
    │   ├── instance
    │   │   └── Instance.tsx         # The Instance module
    │   ├── page
    │   │   └── Page.tsx             # The Page module
    │   └── panel
    │       └── Panel.tsx            # The Panel module
    ├── setupModuleFederation.js     # The setup for Module Federation, so that the plugin can be used within the frontend
    └── utils
        └── constants.ts             # We recommend a constants file with a default description for your plugin
```

### Backend Code

For each plugin you develop your should create a new Go package with the name of your plugin. In our case the package will be named `helloworld` and lives in the `cmd` folder:

```go
package helloworld
```

Each plugin must export a `PluginType` constant, which is the type of the plugin how it can be used in the configuration. The value of the `PluginType` variable is also used as prefix for the http routes, which are exposed by the plugin.

```go
const PluginType = "helloworld"
```

Finally each plugin must implement a `Mount` function, which receives the configured plugin instances (`plugin.Instance`) and the cluster client (`clusters.Client`) as argument. It must return a `chi.Router` and an `error`:

```go
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
    router := Router{
        chi.NewRouter(),
    }

    return router, nil
}
```

A complete example can be found in the following file [https://github.com/kobsio/plugin-template/blob/main/cmd/helloworld.go](https://github.com/kobsio/plugin-template/blob/main/cmd/helloworld.go).

### Frontend Code

The frontend code for plugins uses our fork of [Create React App](https://github.com/kobsio/create-react-app/tree/add-support-for-module-federation) to support Module Federation. Each plugin must export three modules: `Instance`, `Page` and `Panel`. These modules are configured in the `setupModuleFederation.js` file.

The `Instance` module is used to display a card on the plugins page. The component receives the properties defined in the `IPluginInstance` interface from the `@kobsio/shared`:

```tsx
export interface IPluginInstance {
  id: string;
  satellite: string;
  type: string;
  name: string;
  description?: string;
  options?: IPluginInstanceOptions;
  updatedAt: number;
}

export interface IPluginInstanceOptions {
  [key: string]: any;
}
```

```tsx
import { IPluginInstance, PluginInstance } from '@kobsio/shared';

import { defaultDescription } from '../../utils/constants';
import icon from '../../assets/icon.png';

const Instance: FunctionComponent<IPluginInstance> = ({ satellite, name, type, description }) => {
  return (
    <PluginInstance
      satellite={satellite}
      name={name}
      type={type}
      description={description || defaultDescription}
      icon={icon}
    />
  );
};

export default Instance;
```

The `Page` module is used to display a dedicated page for a plugin, when a user selects the plugin instance on the plugins page. The component receives the plugin `instance` as property.

```tsx
export interface IPluginPageProps {
  instance: IPluginInstance;
}
```

To have a unified look across all plugins, we recommend to use a `PageHeaderSection` and `PageContentSection` component.

```tsx
import { Card, CardBody } from '@patternfly/react-core';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { defaultDescription } from '../../utils/constants';

const Page: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={undefined}>
        <Card isCompact={true}>
          <CardBody>{JSON.stringify(instance)}</CardBody>
        </Card>
      </PageContentSection>
    </Fragment>
  );
};

export default Page;
```

The `Panel` module is used to display a plugin within a dashboard. The component receives the properties defined in the `IPluginPanelProps` interface from the `@kobsio/shared` package.

```tsx
export interface IPluginPanelProps {
  title: string;
  description?: string;
  options?: any;
  instance: IPluginInstance;
  times?: ITimes;
  setDetails?: (details: ReactNode) => void;
}
```

You can create a custom interface which extends the `IPluginPanelProps` interface, so that you can define the options for your plugin. Please always validate the options passed to your plugin, since we can not validate them with the Custom Resource Definition.

```tsx
import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';

interface IHelloWorldPluginPanelProps extends IPluginPanelProps {
  options?: any;
}

const Panel: FunctionComponent<IHelloWorldPluginPanelProps> = ({ title, description, options, instance, times, setDetails }) => {
  if (options) {
    return (
      <PluginPanel title={title} description={description}>
        <div>
          <div>{JSON.stringify(options)}</div>
          <div>{JSON.stringify(instance)}</div>
          <div>{JSON.stringify(times)}</div>
          <div>{JSON.stringify(setDetails)}</div>
        </div>
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for HelloWorld panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from HelloWorld."
      documentation="https://kobs.io/main/community-plugins/helloworld"
    />
  );
};

export default Panel;
```

A complete example can be found in the [kobsio/plugin-template](https://github.com/kobsio/plugin-template) repository within the following files:

- [https://github.com/kobsio/plugin-template/blob/main/src/setupModuleFederation.js](https://github.com/kobsio/plugin-template/blob/main/src/setupModuleFederation.js)
- [https://github.com/kobsio/plugin-template/blob/main/src/components/instance/Instance.tsx](https://github.com/kobsio/plugin-template/blob/main/src/components/instance/Instance.tsx)
- [https://github.com/kobsio/plugin-template/blob/main/src/components/page/Page.tsx](https://github.com/kobsio/plugin-template/blob/main/src/components/page/Page.tsx)
- [https://github.com/kobsio/plugin-template/blob/main/src/components/panel/Panel.tsx](https://github.com/kobsio/plugin-template/blob/main/src/components/panel/Panel.tsx)

## Use your Plugin

To use your created plugin you can use the [kobsio/app-template](https://github.com/kobsio/app-template) repository. More information can be found in the [Use Custom Plugins](./use-custom-plugins.md) documentation.
